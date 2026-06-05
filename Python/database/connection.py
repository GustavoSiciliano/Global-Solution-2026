import oracledb

DB_USER = "RM568419"
DB_PASS = "250204"
DB_DSN = "oracle.fiap.com.br:1521/orcl"

def get_connection():
    try:
        return oracledb.connect(user=DB_USER, password=DB_PASS, dsn=DB_DSN)
    except oracledb.DatabaseError as e:
        raise Exception(f"Erro Oracle: {e}")

def testar_conexao():
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
