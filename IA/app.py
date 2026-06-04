"""
AgroSat - API Flask Principal
1. python modelos/classificacao.py
2. python modelos/regressao.py
3. python app.py
4. gunicorn app:app (Render)
"""
from flask import Flask, request, jsonify
from config.settings import PORT, DEBUG, SECRET_KEY
from config.database import (
    testar_conexao, salvar_leitura, salvar_previsao,
    salvar_alerta, buscar_regioes,
    buscar_previsoes_por_regiao, buscar_alertas_ativos
)
from modelos.preditor import classificar, regredir, predicao_completa, validar_payload, MODELOS, FEATURES
from coleta.coletor import coletar_todos

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY


@app.route('/health', methods=['GET'])
def health():
    
    # Status da API e conectividade com Oracle
    ok, msg = testar_conexao()
    return jsonify({
        'status': 'online',
        'projeto': 'AgroSat',
        'banco_oracle': 'conectado' if ok else f'erro: {msg}',
        'modelos': list(MODELOS.keys()),
        'versao': '1.0.0'
    }), 200


@app.route('/modelos', methods=['GET'])
def listar_modelos():
    
    # Lista modelos disponíveis e suas rotas
    return jsonify({
        'modelos': [
            {'nome': nome, 'rota': f'/predict/{nome}', 'descricao': desc}
            for nome, desc in MODELOS.items()
        ]
    }), 200


@app.route('/predict/<modelo>', methods=['POST'])
def predict(modelo):
    
    # Endpoint genérico — aceita classificacao ou regressao
    if modelo not in MODELOS:
        return jsonify({'erro': f"Modelo '{modelo}' nao encontrado.", 'disponiveis': list(MODELOS.keys())}), 404
    data = request.get_json()
    if not data:
        return jsonify({'erro': 'Body JSON obrigatorio'}), 400
    valido, msg = validar_payload(data)
    if not valido:
        return jsonify({'erro': msg}), 400
    try:
        resultado = classificar(data) if modelo == 'classificacao' else regredir(data)
        resultado['modelo'] = modelo
        resultado['entrada'] = {f: float(data[f]) for f in FEATURES}
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/predict/completo', methods=['POST'])
def predict_completo():
    
    # Classificação + regressão em uma única chamada
    data = request.get_json()
    if not data:
        return jsonify({'erro': 'Body JSON obrigatorio'}), 400
    valido, msg = validar_payload(data)
    if not valido:
        return jsonify({'erro': msg}), 400
    try:
        resultado = predicao_completa(data)
        resultado['entrada'] = {f: float(data[f]) for f in FEATURES}
        return jsonify(resultado), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/regioes', methods=['GET'])
def listar_regioes():
    
    # Lista regiões monitoradas do Oracle
    try:
        regioes = buscar_regioes()
        return jsonify({'regioes': regioes, 'total': len(regioes)}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/regioes/<int:id_regiao>/monitorar', methods=['POST'])
def monitorar_regiao(id_regiao):
    
    # Coleta APIs + predição ML + salva Oracle + gera alerta
    try:
        data = request.get_json() or {}
        latitude = float(data.get('latitude', -15.0))
        longitude = float(data.get('longitude', -55.0))
        bioma = data.get('bioma', 'default')
        id_fonte = int(data.get('id_fonte', 2))

        dados = coletar_todos(latitude, longitude, bioma)
        resultado = predicao_completa(dados)

        id_leitura = salvar_leitura(
            id_regiao, id_fonte,
            dados['ndvi'], dados['temperatura'],
            dados['precipitacao'], dados['umidade'],
            dados['dias_sem_chuva'], dados['radiacao_solar']
        )

        id_previsao = salvar_previsao(
            id_leitura,
            resultado['status_vegetacao'],
            resultado['risco_hidrico'],
            'RandomForest_v1'
        )

        if resultado['risco_hidrico'] >= 40:
            mensagem = (
                f"Regiao {id_regiao} com risco {resultado['nivel_alerta']}! "
                f"NDVI={dados['ndvi']}, Risco={resultado['risco_hidrico']}%, "
                f"Dias sem chuva={dados['dias_sem_chuva']}"
            )
            salvar_alerta(id_previsao, id_regiao, resultado['nivel_alerta'], mensagem)

        return jsonify({
            'id_regiao': id_regiao,
            'dados_coletados': dados,
            'previsao': resultado,
            'salvo_oracle': True
        }), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/regioes/<int:id_regiao>/previsoes', methods=['GET'])
def previsoes_regiao(id_regiao):
    
    # Histórico de previsões de uma região
    try:
        previsoes = buscar_previsoes_por_regiao(id_regiao)
        return jsonify({'id_regiao': id_regiao, 'previsoes': previsoes}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


@app.route('/alertas', methods=['GET'])
def alertas_ativos():
    
    # Alertas não resolvidos
    try:
        alertas = buscar_alertas_ativos()
        return jsonify({'alertas': alertas, 'total': len(alertas)}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=PORT, debug=DEBUG)