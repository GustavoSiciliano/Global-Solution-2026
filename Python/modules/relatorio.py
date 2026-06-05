import json
import os
from datetime import datetime
from database.connection import get_connection

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
HISTORICO_JSON = os.path.join(DATA_DIR, "historico.json")
LOG_TXT = os.path.join(DATA_DIR, "log.txt")

def garantir_pasta_data():
    os.makedirs(DATA_DIR, exist_ok=True)

def registrar_log(operacao, detalhe=""):
    
    # Grava entrada no log .txt
    garantir_pasta_data()
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    linha = f"[{timestamp}] {operacao}"
    if detalhe:
        linha += f" | {detalhe}"
    try:
        with open(LOG_TXT, "a", encoding="utf-8") as f:
            f.write(linha + "\n")
    except Exception:
        pass

def exportar_historico_json():
    print("\n" + "=" * 45)
    print(" EXPORTAR HISTORICO (.json)")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT r.nm_regiao, r.ds_estado, r.ds_bioma,
                   l.nr_ndvi, l.nr_temperatura, l.nr_precipitacao,
                   l.nr_umidade, l.nr_dias_sem_chuva,
                   p.ds_status_vegetacao, p.nr_risco_hidrico, p.dt_previsao
            FROM TB_PREVISAO p
            JOIN TB_LEITURA_SATELITAL l ON p.id_leitura = l.id_leitura
            JOIN TB_REGIAO r ON l.id_regiao = r.id_regiao
            ORDER BY p.dt_previsao DESC
            FETCH FIRST 50 ROWS ONLY
        """)
        dados = cursor.fetchall()

        if not dados:
            print("Nenhum dado disponivel para exportar.")
            return

        historico = []
        for d in dados:
            historico.append({
                "regiao": d[0],
                "estado": d[1],
                "bioma": d[2],
                "ndvi": float(d[3]) if d[3] is not None else None,
                "temperatura": float(d[4]) if d[4] is not None else None,
                "precipitacao": float(d[5]) if d[5] is not None else None,
                "umidade": float(d[6]) if d[6] is not None else None,
                "dias_sem_chuva": int(d[7]) if d[7] is not None else None,
                "status_vegetacao": d[8],
                "risco_hidrico": float(d[9]) if d[9] is not None else None,
                "data_previsao": str(d[10])[:10] if d[10] else None
            })

        garantir_pasta_data()
        with open(HISTORICO_JSON, "w", encoding="utf-8") as f:
            json.dump(historico, f, indent=4, ensure_ascii=False)

        print(f"\n {len(historico)} registros exportados para:")
        print(f"{HISTORICO_JSON}")
        registrar_log("EXPORTAR_JSON", f"{len(historico)} registros")

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

def visualizar_historico_json():
    print("\n" + "=" * 45)
    print(" HISTORICO SALVO")
    print("=" * 45)
    garantir_pasta_data()
    if not os.path.exists(HISTORICO_JSON):
        print("historico.json nao encontrado. Exporte primeiro.")
        return

    try:
        with open(HISTORICO_JSON, "r", encoding="utf-8") as f:
            historico = json.load(f)

        if not isinstance(historico, list):
            print("ERRO: formato do arquivo invalido.")
            return

        if not historico:
            print("Historico vazio.")
            return

        print(f"\n Total: {len(historico)} registros\n")
        print(f"{'Regiao':<22} {'UF':<5} {'Status':<14} {'Risco':<10} Data")
        print("  " + "-" * 62)
        for h in historico[:15]:
            risco = h.get("risco_hidrico")
            risco_str = f"{risco:.1f}%" if risco is not None else "N/A"
            print(f"{str(h.get('regiao') or 'N/A'):<22} {str(h.get('estado') or 'N/A'):<5} "
                  f"{str(h.get('status_vegetacao') or 'N/A'):<14} {risco_str:<10} "
                  f"{h.get('data_previsao') or 'N/A'}")

        if len(historico) > 15:
            print(f"\n  ... e mais {len(historico) - 15} registros")

    except json.JSONDecodeError:
        print("ERRO: historico.json corrompido.")
    except Exception as e:
        print(f"\nERRO: {e}")

def exportar_log_txt():
    print("\n" + "=" * 45)
    print(" EXPORTAR LOG DE ALERTAS (.txt)")
    print("=" * 45)
    garantir_pasta_data()
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.id_alerta, a.ds_nivel, r.nm_regiao,
                   a.ds_mensagem, a.fl_resolvido, a.dt_alerta
            FROM TB_ALERTA a
            JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
            ORDER BY a.dt_alerta DESC
            FETCH FIRST 30 ROWS ONLY
        """)
        alertas = cursor.fetchall()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(LOG_TXT, "a", encoding="utf-8") as f:
            f.write(f"\n{'=' * 60}\n")
            f.write(f"RELATORIO DE ALERTAS - {timestamp}\n")
            f.write(f"{'=' * 60}\n")
            if alertas:
                for a in alertas:
                    status = "RESOLVIDO" if a[4] == 'S' else "PENDENTE"
                    data = str(a[5])[:10] if a[5] else "N/A"
                    f.write(f"[{data}] ID:{a[0]} | {a[1]} | {a[2]} | {status}\n")
                    f.write(f"  {(a[3] or '')[:100]}\n")
            else:
                f.write("Nenhum alerta registrado.\n")
            f.write(f"{'=' * 60}\n")

        total = len(alertas) if alertas else 0
        print(f"\n  {total} alertas exportados para:")
        print(f"  {LOG_TXT}")
        registrar_log("EXPORTAR_LOG_TXT", f"{total} alertas")

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

def visualizar_log():
    print("\n" + "=" * 45)
    print(" LOG DE OPERACOES")
    print("=" * 45)
    garantir_pasta_data()
    if not os.path.exists(LOG_TXT):
        print("Nenhum log registrado ainda.")
        return

    try:
        with open(LOG_TXT, "r", encoding="utf-8") as f:
            linhas = f.readlines()

        if not linhas:
            print("Log vazio.")
            return

        ultimas = linhas[-30:]
        print(f"\n  Ultimas {len(ultimas)} linhas:\n")
        for linha in ultimas:
            print("  " + linha, end="")

    except Exception as e:
        print(f"\nERRO: {e}")

def estatisticas_gerais():
    print("\n" + "=" * 45)
    print(" ESTATISTICAS GERAIS")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM TB_REGIAO")
        total_regioes = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM TB_LEITURA_SATELITAL")
        total_leituras = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM TB_PREVISAO")
        total_previsoes = cursor.fetchone()[0] or 0

        cursor.execute("SELECT COUNT(*) FROM TB_ALERTA WHERE fl_resolvido = 'N'")
        alertas_pendentes = cursor.fetchone()[0] or 0

        cursor.execute("SELECT AVG(nr_risco_hidrico) FROM TB_PREVISAO")
        row = cursor.fetchone()
        risco_medio = row[0] if row and row[0] is not None else None

        cursor.execute("""
            SELECT ds_status_vegetacao, COUNT(*)
            FROM TB_PREVISAO
            GROUP BY ds_status_vegetacao
        """)
        status_counts = cursor.fetchall()

        risco_str = f"{risco_medio:.1f}%" if risco_medio is not None else "N/A"

        print(f"\nRegioes monitoradas: {total_regioes}")
        print(f"Leituras satelitais: {total_leituras}")
        print(f"Previsoes geradas: {total_previsoes}")
        print(f"Alertas pendentes: {alertas_pendentes}")
        print(f"Risco medio atual: {risco_str}")

        if status_counts:
            print(f"\n  Status da vegetacao:")
            for s in status_counts:
                print(f"    {str(s[0]):<16} : {s[1]} registros")

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

def menu_relatorios():
    while True:
        print("\n" + "=" * 45)
        print("RELATORIOS")
        print("=" * 45)
        print("1. Exportar historico (.json)")
        print("2. Visualizar historico salvo")
        print("3. Exportar log de alertas (.txt)")
        print("4. Visualizar log")
        print("5. Estatisticas gerais")
        print("0. Voltar")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            exportar_historico_json()
        elif opcao == "2":
            visualizar_historico_json()
        elif opcao == "3":
            exportar_log_txt()
        elif opcao == "4":
            visualizar_log()
        elif opcao == "5":
            estatisticas_gerais()
        elif opcao == "0":
            break
        else:
            print("Opcao invalida.")
