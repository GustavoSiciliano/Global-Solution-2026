"""
Passo 3 do pipeline ML — Predição.
Carrega os .pickle gerados por classificacao.py e regressao.py
e expõe funções para o app.py consumir.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import pandas as pd
from config.settings import PICKLES_DIR

clf = joblib.load(os.path.join(PICKLES_DIR, 'modelo_classificacao.pickle'))
reg = joblib.load(os.path.join(PICKLES_DIR, 'modelo_regressao.pickle'))
le = joblib.load(os.path.join(PICKLES_DIR, 'label_encoder.pickle'))

FEATURES = ['ndvi', 'temperatura', 'precipitacao', 'umidade', 'dias_sem_chuva', 'radiacao_solar']

MODELOS = {
    'classificacao': 'Classifica status da vegetacao: SAUDAVEL, EM_ESTRESSE ou CRITICO',
    'regressao': 'Preve percentual de risco hidrico de 0 a 100%'
}


def _montar_entrada(dados):
    # Converte dict para DataFrame com as features corretas
    return pd.DataFrame([{f: float(dados[f]) for f in FEATURES}])


def classificar(dados):
    # Executa classificação de vegetação
    entrada = _montar_entrada(dados)
    pred = clf.predict(entrada)
    proba = clf.predict_proba(entrada)
    label = le.inverse_transform(pred)[0]
    return {
        'status_vegetacao': label,
        'confianca': round(float(max(proba[0])), 4)
    }


def regredir(dados):
    # Executa regressão de risco hídrico
    entrada = _montar_entrada(dados)
    risco = round(float(reg.predict(entrada)[0]), 2)
    risco = max(0.0, min(100.0, risco))
    if risco >= 70:
        nivel = 'CRITICO'
    elif risco >= 40:
        nivel = 'ALTO'
    elif risco >= 20:
        nivel = 'MEDIO'
    else:
        nivel = 'BAIXO'
    return {'risco_hidrico': risco, 'nivel_alerta': nivel}


def predicao_completa(dados):
    # Executa classificação e regressão juntas
    classif = classificar(dados)
    risco = regredir(dados)
    return {
        'status_vegetacao': classif['status_vegetacao'],
        'confianca': classif['confianca'],
        'risco_hidrico': risco['risco_hidrico'],
        'nivel_alerta': risco['nivel_alerta']
    }


def validar_payload(data):
    # Valida se todos os campos obrigatórios estão presentes
    faltando = [f for f in FEATURES if f not in data]
    if faltando:
        return False, f"Campos ausentes: {faltando}"
    try:
        for f in FEATURES:
            float(data[f])
    except (ValueError, TypeError):
        return False, "Todos os campos devem ser numéricos"
    return True, None


if __name__ == '__main__':
    # Teste com região crítica (Rondonópolis/MT)
    amostra = {
        'ndvi': 0.21,
        'temperatura': 35.8,
        'precipitacao': 0.0,
        'umidade': 28.0,
        'dias_sem_chuva': 30,
        'radiacao_solar': 26.1
    }
    print("Testando preditor com região crítica...")
    print(f"Entrada: {amostra}")
    resultado = predicao_completa(amostra)
    print(f"Resultado: {resultado}")