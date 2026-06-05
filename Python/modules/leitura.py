import requests
import random
from datetime import datetime, timedelta
from database.connection import get_connection
from modules.regiao import listar_regioes

FLASK_URL = "https://gs-ia.onrender.com"
NASA_POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"

NDVI_POR_BIOMA = {
    "Cerrado": (0.35, 0.70),
    "Amazonia": (0.65, 0.90),
    "Mata Atlantica": (0.55, 0.80),
    "Pampa": (0.45, 0.75),
    "Caatinga": (0.15, 0.50),
    "Pantanal": (0.50, 0.80),
}

def _validar_id_regiao(regioes, id_regiao):
    return any(r[0] == id_regiao for r in regioes)

def _buscar_dados_regiao(id_regiao):
    
    # Retorna lat, lon e bioma da regiao no Oracle
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "SELECT nr_latitude, nr_longitude, ds_bioma FROM TB_REGIAO WHERE id_regiao = :1",
            (id_regiao,)
        )
        row = cursor.fetchone()
        return row if row else (None, None, None)
    except Exception:
        return None, None, None
    finally:
        if conn:
            try:
                if cursor:
                    cursor.close()
                conn.close()
            except Exception:
                pass

def _coletar_nasa_power(latitude, longitude):
    
    # Temperatura e radiacao solar via NASA POWER (media 7 dias)
    try:
        fim = datetime.now()
        inicio = fim - timedelta(days=7)
        params = {
            "parameters": "T2M,ALLSKY_SFC_SW_DWN",
            "community": "AG",
            "longitude": longitude,
            "latitude": latitude,
            "start": inicio.strftime("%Y%m%d"),
            "end": fim.strftime("%Y%m%d"),
            "format": "JSON"
        }
        resp = requests.get(NASA_POWER_URL, params=params, timeout=15)
        if resp.status_code == 200:
            param = resp.json().get("properties", {}).get("parameter", {})
            temps = [v for v in param.get("T2M", {}).values() if v and v > -900]
            rads = [v for v in param.get("ALLSKY_SFC_SW_DWN", {}).values() if v and v > -900]
            temperatura = round(sum(temps) / len(temps), 2) if temps else None
            radiacao = round(sum(rads) / len(rads), 2) if rads else None
            return temperatura, radiacao
        return None, None
    except Exception:
        return None, None


def _coletar_open_meteo(latitude, longitude):
    
    # Precipitacao, umidade e dias sem chuva via Open-Meteo (30 dias)
    try:
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "daily": "precipitation_sum,relative_humidity_2m_max",
            "timezone": "America/Sao_Paulo",
            "past_days": 30,
            "forecast_days": 1
        }
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=15)
        if resp.status_code == 200:
            daily = resp.json().get("daily", {})
            precip = [p for p in daily.get("precipitation_sum", []) if p is not None]
            umid = [u for u in daily.get("relative_humidity_2m_max", []) if u is not None]
            dias_sem_chuva = sum(1 for p in reversed(precip) if p < 0.1)
            precip_media = round(sum(precip) / len(precip), 2) if precip else None
            umid_media = round(sum(umid) / len(umid), 2) if umid else None
            return precip_media, umid_media, dias_sem_chuva
        return None, None, None
    except Exception:
        return None, None, None


def _estimar_ndvi(bioma):
    
    # NDVI estimado por faixa do bioma
    faixa = NDVI_POR_BIOMA.get(bioma, (0.20, 0.85))
    return round(random.uniform(faixa[0], faixa[1]), 4)


def coletar_dados_satelitais(latitude, longitude, bioma):
    
    # Orquestra coleta automatica de dados para uma coordenada
    print("\nColetando dados satelitais...")

    temperatura, radiacao_solar = _coletar_nasa_power(latitude, longitude)
    if temperatura is not None:
        print(f"NASA POWER: {temperatura}C / {radiacao_solar} kWh/m2")
    else:
        temperatura, radiacao_solar = 28.0, 20.0
        print("NASA POWER: indisponivel, usando fallback")

    precipitacao, umidade, dias_sem_chuva = _coletar_open_meteo(latitude, longitude)
    if precipitacao is not None:
        print(f"Open-Meteo: {precipitacao}mm / {umidade}% umid / {dias_sem_chuva}d sem chuva")
    else:
        precipitacao, umidade, dias_sem_chuva = 0.0, 50.0, 0
        print("Open-Meteo: indisponivel, usando fallback")

    ndvi = _estimar_ndvi(bioma)
    print(f"  NDVI ({bioma:<12}): {ndvi}")

    return {
        "ndvi": ndvi,
        "temperatura": temperatura,
        "precipitacao": precipitacao,
        "umidade": umidade,
        "dias_sem_chuva": dias_sem_chuva,
        "radiacao_solar": radiacao_solar
    }


def chamar_modelo_ia(dados):
    
    # POST /predict/completo no Render
    try:
        print("\nConsultando modelo de IA...")
        resp = requests.post(f"{FLASK_URL}/predict/completo", json=dados, timeout=60)
        if resp.status_code == 200:
            return resp.json()
        print(f"  ERRO: Render retornou status {resp.status_code}")
        return None
    except requests.exceptions.Timeout:
        print("  AVISO: Render em hibernacao, aguarde...")
        return None
    except requests.exceptions.ConnectionError:
        print("  ERRO: sem conexao com o Render.")
        return None
    except Exception as e:
        print(f"  ERRO: {e}")
        return None

def registrar_leitura():
    print("\n" + "=" * 45)
    print("REGISTRAR LEITURA SATELITAL")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        regioes = listar_regioes()
        if not regioes:
            return

        id_regiao = int(input("\nID da regiao: ").strip())
        if not _validar_id_regiao(regioes, id_regiao):
            print(f"ERRO: ID {id_regiao} nao encontrado.")
            return

        latitude, longitude, bioma = _buscar_dados_regiao(id_regiao)
        if not latitude or not longitude:
            print("ERRO: coordenadas nao encontradas para essa regiao.")
            return

        dados = coletar_dados_satelitais(latitude, longitude, bioma or "default")

        print("\nDados coletados:")
        print(f"NDVI: {dados['ndvi']}")
        print(f"Temperatura: {dados['temperatura']} C")
        print(f"Precipitacao: {dados['precipitacao']} mm")
        print(f"Umidade: {dados['umidade']} %")
        print(f"Dias sem chuva: {dados['dias_sem_chuva']}")
        print(f"Radiacao solar: {dados['radiacao_solar']} kWh/m2")

        if input("\nSalvar leitura? (s/n): ").strip().lower() != 's':
            print("Operacao cancelada.")
            return

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_LEITURA_SATELITAL
                (id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao,
                 nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar, dt_leitura)
            VALUES (:1, 2, :2, :3, :4, :5, :6, :7, SYSDATE)
        """, (id_regiao, dados["ndvi"], dados["temperatura"], dados["precipitacao"],
              dados["umidade"], dados["dias_sem_chuva"], dados["radiacao_solar"]))
        conn.commit()

        cursor.execute(
            "SELECT MAX(id_leitura) FROM TB_LEITURA_SATELITAL WHERE id_regiao = :1",
            (id_regiao,)
        )
        row = cursor.fetchone()
        id_leitura = row[0] if row and row[0] else None
        if not id_leitura:
            print("ERRO: nao foi possivel recuperar o ID da leitura.")
            return

        print(f"\n  Leitura salva (ID: {id_leitura})")
        cursor.close()
        conn.close()
        conn = None
        cursor = None

        resultado = chamar_modelo_ia(dados)
        if not resultado:
            print("  AVISO: IA indisponivel. Leitura salva sem previsao.")
            return

        status = resultado.get("status_vegetacao", "N/A")
        risco = float(resultado.get("risco_hidrico") or 0)
        nivel = resultado.get("nivel_alerta", "N/A")
        confianca = float(resultado.get("confianca") or 0)

        print("\nResultado do modelo de IA:")
        print(f"Status: {status}")
        print(f"Confianca: {confianca * 100:.1f}%")
        print(f"Risco: {risco:.1f}%")
        print(f"Nivel: {nivel}")

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_PREVISAO
                (id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado, dt_previsao)
            VALUES (:1, :2, :3, 'RandomForest_v1', SYSDATE)
        """, (id_leitura, status, risco))
        conn.commit()

        cursor.execute("SELECT MAX(id_previsao) FROM TB_PREVISAO")
        row = cursor.fetchone()
        id_previsao = row[0] if row and row[0] else None
        if id_previsao:
            print(f"Previsao salva (ID: {id_previsao})")

        if id_previsao and risco >= 40:
            mensagem = (
                f"Regiao {id_regiao}: risco {nivel}! "
                f"NDVI={dados['ndvi']}, Risco={risco:.1f}%, "
                f"Dias sem chuva={dados['dias_sem_chuva']}"
            )
            cursor.execute("""
                INSERT INTO TB_ALERTA
                    (id_previsao, id_regiao, ds_nivel, ds_mensagem, fl_resolvido, dt_alerta)
                VALUES (:1, :2, :3, :4, 'N', SYSDATE)
            """, (id_previsao, id_regiao, nivel, mensagem))
            conn.commit()
            print(f"\n  ALERTA {nivel} gerado automaticamente!")

    except ValueError:
        print("\nERRO: valor invalido.")
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"\nERRO: {e}")
    finally:
        if conn:
            try:
                if cursor:
                    cursor.close()
                conn.close()
            except Exception:
                pass

def listar_leituras():
    print("\n" + "=" * 45)
    print("LEITURAS SATELITAIS")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        regioes = listar_regioes()
        if not regioes:
            return

        id_regiao = int(input("\nID da regiao (0 para todas): ").strip())

        conn = get_connection()
        cursor = conn.cursor()

        if id_regiao == 0:
            cursor.execute("""
                SELECT l.id_leitura, r.nm_regiao, l.nr_ndvi, l.nr_temperatura,
                       l.nr_precipitacao, l.nr_umidade, l.nr_dias_sem_chuva, l.dt_leitura
                FROM TB_LEITURA_SATELITAL l
                JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
                ORDER BY l.dt_leitura DESC
                FETCH FIRST 20 ROWS ONLY
            """)
        else:
            if not _validar_id_regiao(regioes, id_regiao):
                print(f"ERRO: ID {id_regiao} nao encontrado.")
                return
            cursor.execute("""
                SELECT l.id_leitura, r.nm_regiao, l.nr_ndvi, l.nr_temperatura,
                       l.nr_precipitacao, l.nr_umidade, l.nr_dias_sem_chuva, l.dt_leitura
                FROM TB_LEITURA_SATELITAL l
                JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
                WHERE l.id_regiao = :1
                ORDER BY l.dt_leitura DESC
                FETCH FIRST 10 ROWS ONLY
            """, (id_regiao,))

        leituras = cursor.fetchall()

        if not leituras:
            print("Nenhuma leitura encontrada.")
            return

        print(f"\n  {'ID':<5} {'Regiao':<20} {'NDVI':<7} {'Temp':<7} {'Prec':<7} {'Umid':<7} {'DiaSC':<7} Data")
        print("  " + "-" * 72)
        for l in leituras:
            data = str(l[7])[:10] if l[7] else "N/A"
            ndvi = f"{l[2]:.3f}" if l[2] is not None else "N/A"
            temp = f"{l[3]:.1f}" if l[3] is not None else "N/A"
            prec = f"{l[4]:.1f}" if l[4] is not None else "N/A"
            umid = f"{l[5]:.1f}" if l[5] is not None else "N/A"
            dias = str(l[6]) if l[6] is not None else "N/A"
            print(f"{l[0]:<5} {l[1]:<20} {ndvi:<7} {temp:<7} {prec:<7} {umid:<7} {dias:<7} {data}")

    except ValueError:
        print("\nERRO: ID invalido.")
    except Exception as e:
        print(f"\nERRO: {e}")
    finally:
        if conn:
            try:
                if cursor:
                    cursor.close()
                conn.close()
            except Exception:
                pass

def menu_leituras():
    while True:
        print("\n" + "=" * 45)
        print("LEITURAS SATELITAIS")
        print("=" * 45)
        print("1. Registrar leitura (automatico)")
        print("2. Listar leituras")
        print("0. Voltar")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            registrar_leitura()
        elif opcao == "2":
            listar_leituras()
        elif opcao == "0":
            break
        else:
            print("Opcao invalida.")
