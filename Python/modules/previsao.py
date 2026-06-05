import requests
from database.connection import get_connection
from modules.regiao import listar_regioes
from modules.leitura import coletar_dados_satelitais, _buscar_dados_regiao, _validar_id_regiao

FLASK_URL = "https://gs-ia.onrender.com"


def listar_previsoes():
    print("\n" + "=" * 45)
    print(" PREVISOES POR REGIAO")
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

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.id_previsao, p.ds_status_vegetacao, p.nr_risco_hidrico,
                   p.ds_modelo_usado, p.dt_previsao, l.nr_ndvi, l.nr_temperatura
            FROM TB_PREVISAO p
            JOIN TB_LEITURA_SATELITAL l ON p.id_leitura = l.id_leitura
            WHERE l.id_regiao = :1
            ORDER BY p.dt_previsao DESC
            FETCH FIRST 10 ROWS ONLY
        """, (id_regiao,))
        previsoes = cursor.fetchall()

        if not previsoes:
            print("Nenhuma previsao encontrada para esta regiao.")
            return

        print(f"\n{'ID':<6} {'Status':<14} {'Risco':<8} {'NDVI':<8} {'Temp':<7} Data")
        print("  " + "-" * 55)
        for p in previsoes:
            data = str(p[4])[:10] if p[4] else "N/A"
            risco = f"{p[2]:.1f}%" if p[2] is not None else "N/A"
            ndvi = f"{p[5]:.3f}" if p[5] is not None else "N/A"
            temp = f"{p[6]:.1f}" if p[6] is not None else "N/A"
            print(f"  {p[0]:<6} {p[1]:<14} {risco:<8} {ndvi:<8} {temp:<7} {data}")

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


def simular_previsao():
    
    # Coleta dados automaticamente e simula sem salvar no banco
    print("\n" + "=" * 45)
    print(" SIMULAR PREVISAO DE IA")
    print("=" * 45)
    try:
        regioes = listar_regioes()
        if not regioes:
            return

        id_regiao = int(input("\nID da regiao para simulacao: ").strip())
        if not _validar_id_regiao(regioes, id_regiao):
            print(f"ERRO: ID {id_regiao} nao encontrado.")
            return

        latitude, longitude, bioma = _buscar_dados_regiao(id_regiao)
        if not latitude or not longitude:
            print("ERRO: coordenadas nao encontradas para essa regiao.")
            return

        dados = coletar_dados_satelitais(latitude, longitude, bioma or "default")

        print("\n  Consultando Render...")
        resp = requests.post(f"{FLASK_URL}/predict/completo", json=dados, timeout=60)
        if resp.status_code != 200:
            print(f"ERRO: Render retornou status {resp.status_code}")
            return

        r = resp.json()
        confianca = float(r.get("confianca") or 0)
        risco = float(r.get("risco_hidrico") or 0)

        print("\nResultado da simulacao:")
        print(f"Status: {r.get('status_vegetacao', 'N/A')}")
        print(f"Confianca: {confianca * 100:.1f}%")
        print(f"Risco: {risco:.1f}%")
        print(f"Nivel: {r.get('nivel_alerta', 'N/A')}")
        print("(nao salvo no banco)")

    except requests.exceptions.Timeout:
        print("AVISO: Render em hibernacao. Tente novamente.")
    except requests.exceptions.ConnectionError:
        print("ERRO: sem conexao com o Render.")
    except ValueError:
        print("\nERRO: ID invalido.")
    except Exception as e:
        print(f"\nERRO: {e}")

def ver_risco_atual():
    
    # Risco hidrico mais recente de cada regiao
    print("\n" + "=" * 45)
    print("RISCO HIDRICO ATUAL")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.nm_regiao, r.ds_estado, p.ds_status_vegetacao,
                   p.nr_risco_hidrico, p.dt_previsao
            FROM TB_PREVISAO p
            JOIN TB_LEITURA_SATELITAL l ON p.id_leitura = l.id_leitura
            JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
            WHERE p.dt_previsao = (
                SELECT MAX(p2.dt_previsao)
                FROM TB_PREVISAO p2
                JOIN TB_LEITURA_SATELITAL l2 ON p2.id_leitura = l2.id_leitura
                WHERE l2.id_regiao = l.id_regiao
            )
            ORDER BY p.nr_risco_hidrico DESC
        """)
        dados = cursor.fetchall()

        if not dados:
            print("Nenhuma previsao disponivel.")
            return

        print(f"\n{'Regiao':<22} {'UF':<5} {'Status':<14} {'Risco':<10} Data")
        print("  " + "-" * 60)
        for d in dados:
            risco = f"{d[3]:.1f}%" if d[3] is not None else "N/A"
            data = str(d[4])[:10] if d[4] else "N/A"
            tag = " [!]" if d[3] and d[3] >= 70 else ""
            print(f"{d[0]:<22} {d[1]:<5} {d[2]:<14} {risco:<10} {data}{tag}")

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

def menu_previsoes():
    while True:
        print("\n" + "=" * 45)
        print("PREVISOES")
        print("=" * 45)
        print("1. Listar previsoes por regiao")
        print("2. Simular previsao (automatico)")
        print("3. Ver risco atual por regiao")
        print("0. Voltar")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            listar_previsoes()
        elif opcao == "2":
            simular_previsao()
        elif opcao == "3":
            ver_risco_atual()
        elif opcao == "0":
            break
        else:
            print("Opcao invalida.")
