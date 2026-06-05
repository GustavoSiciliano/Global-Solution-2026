from database.connection import get_connection


def listar_alertas_pendentes():
    print("\n" + "=" * 45)
    print(" ALERTAS PENDENTES")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.id_alerta, a.ds_nivel, r.nm_regiao, r.ds_estado,
                   a.ds_mensagem, a.dt_alerta
            FROM TB_ALERTA a
            JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
            WHERE a.fl_resolvido = 'N'
            ORDER BY
                CASE a.ds_nivel
                    WHEN 'CRITICO' THEN 1
                    WHEN 'ALTO' THEN 2
                    WHEN 'MEDIO' THEN 3
                    WHEN 'BAIXO' THEN 4
                END,
                a.dt_alerta DESC
        """)
        alertas = cursor.fetchall()

        if not alertas:
            print("Nenhum alerta pendente.")
            return []

        print(f"\n{'ID':<6} {'Nivel':<10} {'Regiao':<22} {'UF':<5} Data")
        print(" " + "-" * 55)
        for a in alertas:
            data = str(a[5])[:10] if a[5] else "N/A"
            mensagem = (a[4] or "")[:65]
            print(f"{a[0]:<6} {a[1]:<10} {a[2]:<22} {a[3]:<5} {data}")
            print(f"{mensagem}\n")

        print(f"  Total: {len(alertas)} alerta(s) pendente(s)")
        return alertas

    except Exception as e:
        print(f"\nERRO: {e}")
        return []
    finally:
        if conn:
            try:
                if cursor:
                    cursor.close()
                conn.close()
            except Exception:
                pass

def resolver_alerta():
    print("\n" + "=" * 45)
    print(" RESOLVER ALERTA")
    print("=" * 45)
    alertas = listar_alertas_pendentes()
    if not alertas:
        return

    conn = None
    cursor = None
    try:
        id_alerta = int(input("\nID do alerta: ").strip())
        if id_alerta not in [a[0] for a in alertas]:
            print(f"ERRO: ID {id_alerta} nao encontrado nos alertas pendentes.")
            return

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE TB_ALERTA SET fl_resolvido = 'S' WHERE id_alerta = :1",
            (id_alerta,)
        )
        if cursor.rowcount == 0:
            print(f"ERRO: alerta {id_alerta} nao encontrado.")
        else:
            conn.commit()
            print(f"\nOK: alerta {id_alerta} marcado como resolvido.")

    except ValueError:
        print("\nERRO: ID invalido.")
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

def historico_alertas():
    print("\n" + "=" * 45)
    print(" HISTORICO DE ALERTAS")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.id_alerta, a.ds_nivel, r.nm_regiao, a.fl_resolvido, a.dt_alerta
            FROM TB_ALERTA a
            JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
            ORDER BY a.dt_alerta DESC
            FETCH FIRST 20 ROWS ONLY
        """)
        alertas = cursor.fetchall()

        if not alertas:
            print("Nenhum alerta registrado.")
            return

        print(f"\n{'ID':<6} {'Nivel':<10} {'Regiao':<22} {'Status':<12} Data")
        print(" " + "-" * 60)
        for a in alertas:
            status = "Resolvido" if a[3] == 'S' else "Pendente"
            data = str(a[4])[:10] if a[4] else "N/A"
            print(f"{a[0]:<6} {a[1]:<10} {a[2]:<22} {status:<12} {data}")

        resolvidos = sum(1 for a in alertas if a[3] == 'S')
        print(f"\nTotal: {len(alertas)} | Resolvidos: {resolvidos} | Pendentes: {len(alertas) - resolvidos}")

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

def estatisticas_alertas():
    print("\n" + "=" * 45)
    print("ESTATISTICAS DE ALERTAS")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT ds_nivel,
                   COUNT(*) AS total,
                   SUM(CASE WHEN fl_resolvido = 'S' THEN 1 ELSE 0 END) AS resolvidos
            FROM TB_ALERTA
            GROUP BY ds_nivel
            ORDER BY CASE ds_nivel
                WHEN 'CRITICO' THEN 1
                WHEN 'ALTO' THEN 2
                WHEN 'MEDIO' THEN 3
                WHEN 'BAIXO' THEN 4
                ELSE 5
            END
        """)
        stats = cursor.fetchall()

        if not stats:
            print("Nenhum dado disponivel.")
            return

        print(f"\n  {'Nivel':<12} {'Total':<10} {'Resolvidos':<12} Pendentes")
        print("  " + "-" * 45)
        for s in stats:
            print(f"  {s[0]:<12} {s[1]:<10} {s[2]:<12} {s[1] - s[2]}")

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

def menu_alertas():
    while True:
        print("\n" + "=" * 45)
        print("ALERTAS")
        print("=" * 45)
        print("1. Listar alertas pendentes")
        print("2. Resolver alerta")
        print("3. Historico de alertas")
        print("4. Estatisticas")
        print("0. Voltar")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            listar_alertas_pendentes()
        elif opcao == "2":
            resolver_alerta()
        elif opcao == "3":
            historico_alertas()
        elif opcao == "4":
            estatisticas_alertas()
        elif opcao == "0":
            break
        else:
            print("Opcao invalida.")
