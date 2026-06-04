import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import oracledb
from config.settings import DB_USER, DB_PASS, DB_DSN


def get_connection():
    
    # Retorna conexão com Oracle FIAP
    try:
        return oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN)
    except oracledb.DatabaseError as e:
        raise Exception(f"Erro Oracle: {e}")


def testar_conexao():
    
    # Testa conectividade com o banco
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 'OK' FROM DUAL")
        resultado = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return True, resultado
    except Exception as e:
        return False, str(e)


def salvar_leitura(id_regiao, id_fonte, ndvi, temperatura, precipitacao, umidade, dias_sem_chuva, radiacao_solar):
    
    # Insere leitura satelital na TB_LEITURA_SATELITAL
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_LEITURA_SATELITAL
                (id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao,
                 nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar, dt_leitura)
            VALUES (:1, :2, :3, :4, :5, :6, :7, :8, SYSDATE)
        """, (id_regiao, id_fonte, ndvi, temperatura, precipitacao, umidade, dias_sem_chuva, radiacao_solar))
        conn.commit()
        cursor.execute("SELECT MAX(id_leitura) FROM TB_LEITURA_SATELITAL WHERE id_regiao = :1", (id_regiao,))
        return cursor.fetchone()[0]
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erro ao salvar leitura: {e}")
    finally:
        cursor.close()
        conn.close()


def salvar_previsao(id_leitura, status_vegetacao, risco_hidrico, modelo_usado):
    
    # Insere previsão ML na TB_PREVISAO
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_PREVISAO
                (id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado, dt_previsao)
            VALUES (:1, :2, :3, :4, SYSDATE)
        """, (id_leitura, status_vegetacao, risco_hidrico, modelo_usado))
        conn.commit()
        cursor.execute("SELECT MAX(id_previsao) FROM TB_PREVISAO")
        return cursor.fetchone()[0]
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erro ao salvar previsão: {e}")
    finally:
        cursor.close()
        conn.close()


def salvar_alerta(id_previsao, id_regiao, nivel, mensagem):
    
    # Insere alerta automático na TB_ALERTA quando risco >= 40
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_ALERTA
                (id_previsao, id_regiao, ds_nivel, ds_mensagem, fl_resolvido, dt_alerta)
            VALUES (:1, :2, :3, :4, 'N', SYSDATE)
        """, (id_previsao, id_regiao, nivel, mensagem))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        raise Exception(f"Erro ao salvar alerta: {e}")
    finally:
        cursor.close()
        conn.close()


def buscar_regioes():
    
    # Lista todas as regiões cadastradas
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id_regiao, nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma FROM TB_REGIAO ORDER BY nm_regiao")
        colunas = [col[0].lower() for col in cursor.description]
        return [dict(zip(colunas, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise Exception(f"Erro ao buscar regiões: {e}")
    finally:
        cursor.close()
        conn.close()


def buscar_previsoes_por_regiao(id_regiao):
    
    # Busca últimas 10 previsões de uma região
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.id_previsao, p.ds_status_vegetacao, p.nr_risco_hidrico,
                   p.ds_modelo_usado, p.dt_previsao,
                   l.nr_ndvi, l.nr_temperatura, l.nr_precipitacao, l.nr_umidade
            FROM TB_PREVISAO p
            JOIN TB_LEITURA_SATELITAL l ON p.id_leitura = l.id_leitura
            WHERE l.id_regiao = :1
            ORDER BY p.dt_previsao DESC
            FETCH FIRST 10 ROWS ONLY
        """, (id_regiao,))
        colunas = [col[0].lower() for col in cursor.description]
        return [dict(zip(colunas, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise Exception(f"Erro ao buscar previsões: {e}")
    finally:
        cursor.close()
        conn.close()


def buscar_alertas_ativos():
    
    # Lista alertas com fl_resolvido = N
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.id_alerta, a.ds_nivel, a.ds_mensagem, a.dt_alerta,
                   r.nm_regiao, r.ds_estado
            FROM TB_ALERTA a
            JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
            WHERE a.fl_resolvido = 'N'
            ORDER BY a.dt_alerta DESC
        """)
        colunas = [col[0].lower() for col in cursor.description]
        return [dict(zip(colunas, row)) for row in cursor.fetchall()]
    except Exception as e:
        raise Exception(f"Erro ao buscar alertas: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    
    # Testa conexão com Oracle FIAP
    print("Testando conexão Oracle...")
    ok, msg = testar_conexao()
    if ok:
        print(f"Conexão OK: {msg}")
        print("\nBuscando regiões cadastradas...")
        try:
            regioes = buscar_regioes()
            print(f"Total de regiões: {len(regioes)}")
            for r in regioes:
                print(f"  {r['id_regiao']} — {r['nm_regiao']} / {r['ds_estado']}")
        except Exception as e:
            print(f"Erro ao buscar regiões: {e}")
    else:
        print(f"Erro na conexão: {msg}")