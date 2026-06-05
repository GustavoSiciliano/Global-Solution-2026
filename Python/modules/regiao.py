import requests
from database.connection import get_connection

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
INPE_URL = "https://terrabrasilis.dpi.inpe.br/geoserver/ows"

ESTADOS_VALIDOS = {
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
}

def buscar_coordenadas(nome, estado):
    
    # Busca lat/lon via Nominatim
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={"q": f"{nome},{estado},Brasil", "format": "json", "limit": 1},
            headers={"User-Agent": "AgroSat/1.0"},
            timeout=10
        )
        if resp.status_code == 200:
            dados = resp.json()
            if dados:
                return float(dados[0]["lat"]), float(dados[0]["lon"])
        return None, None
    except Exception:
        return None, None

def buscar_bioma(latitude, longitude):
    
    # Consulta bioma via INPE TerraBrasilis
    try:
        raio = 0.1
        bbox = f"{longitude - raio},{latitude - raio},{longitude + raio},{latitude + raio}"
        params = {
            "service": "WFS",
            "version": "2.0.0",
            "request": "GetFeature",
            "typeName": "terrabrasilis:brasil_biomas",
            "outputFormat": "application/json",
            "bbox": bbox,
            "count": 1
        }
        resp = requests.get(INPE_URL, params=params, timeout=10)
        if resp.status_code == 200:
            features = resp.json().get("features", [])
            if features:
                props = features[0].get("properties", {})
                return props.get("bioma") or props.get("nome") or props.get("name")
        return None
    except Exception:
        return None

def cadastrar_regiao():
    print("\n" + "=" * 45)
    print("CADASTRAR REGIAO")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        nome = input("Cidade: ").strip()
        if not nome:
            print("ERRO: nome nao pode ser vazio.")
            return

        estado = input("Estado (sigla): ").strip().upper()
        if estado not in ESTADOS_VALIDOS:
            print(f"ERRO: estado '{estado}' invalido.")
            return

        print("\nBuscando coordenadas via Nominatim...")
        latitude, longitude = buscar_coordenadas(nome, estado)

        if latitude and longitude:
            print(f"Lat/Lon: {latitude:.4f} / {longitude:.4f}")
        else:
            print("Nao encontrado. Informe manualmente:")
            try:
                latitude = float(input("  Latitude: "))
                longitude = float(input("  Longitude: "))
            except ValueError:
                print("ERRO: coordenadas invalidas.")
                return

        if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
            print("ERRO: coordenadas fora do intervalo valido.")
            return

        print("Buscando bioma via INPE...")
        bioma = buscar_bioma(latitude, longitude)
        if bioma:
            print(f"Bioma: {bioma}")
        else:
            print("Nao identificado. Informe manualmente:")
            bioma = input("Bioma: ").strip() or "Nao identificado"

        print("\nResumo:")
        print(f"Cidade: {nome}")
        print(f"Estado: {estado}")
        print(f"Lat/Lon: {latitude:.4f} / {longitude:.4f}")
        print(f"Bioma: {bioma}")

        if input("\nSalvar? (s/n): ").strip().lower() != 's':
            print("Operacao cancelada.")
            return

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO TB_REGIAO (nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma, dt_cadastro)
            VALUES (:1, :2, :3, :4, :5, SYSDATE)
        """, (nome, estado, latitude, longitude, bioma))
        conn.commit()
        print(f"\nOK: '{nome}' cadastrada com sucesso.")

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

def listar_regioes():
    print("\n" + "=" * 45)
    print(" REGIOES CADASTRADAS")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_regiao, nm_regiao, ds_estado, ds_bioma, nr_latitude, nr_longitude
            FROM TB_REGIAO
            ORDER BY nm_regiao
        """)
        regioes = cursor.fetchall()

        if not regioes:
            print("Nenhuma regiao cadastrada.")
            return []

        print(f"\n{'ID':<5} {'Regiao':<22} {'UF':<5} {'Bioma':<18} {'Lat':<10} Lon")
        print("  " + "-" * 68)
        for r in regioes:
            lat = f"{r[4]:.4f}" if r[4] is not None else "N/A"
            lon = f"{r[5]:.4f}" if r[5] is not None else "N/A"
            print(f"{r[0]:<5} {r[1]:<22} {r[2]:<5} {str(r[3]):<18} {lat:<10} {lon}")

        print(f"\nTotal: {len(regioes)} regiao(oes)")
        return regioes

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

def buscar_regiao_por_estado():
    print("\n" + "=" * 45)
    print(" BUSCAR POR ESTADO")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        estado = input("Estado (sigla): ").strip().upper()
        if estado not in ESTADOS_VALIDOS:
            print(f"ERRO: estado '{estado}' invalido.")
            return

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id_regiao, nm_regiao, ds_estado, ds_bioma
            FROM TB_REGIAO
            WHERE ds_estado = :1
            ORDER BY nm_regiao
        """, (estado,))
        regioes = cursor.fetchall()

        if not regioes:
            print(f"Nenhuma regiao encontrada para {estado}.")
            return

        print(f"\n{'ID':<5} {'Regiao':<22} {'UF':<5} Bioma")
        print("  " + "-" * 55)
        for r in regioes:
            print(f"{r[0]:<5} {r[1]:<22} {r[2]:<5} {r[3]}")

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


def deletar_regiao():
    print("\n" + "=" * 45)
    print(" DELETAR REGIAO")
    print("=" * 45)
    conn = None
    cursor = None
    try:
        regioes = listar_regioes()
        if not regioes:
            return

        id_regiao = int(input("\nID a deletar: ").strip())
        if id_regiao not in [r[0] for r in regioes]:
            print(f"ERRO: ID {id_regiao} nao encontrado.")
            return

        if input(f"Confirma exclusao do ID {id_regiao}? (s/n): ").strip().lower() != 's':
            print("Operacao cancelada.")
            return

        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM TB_REGIAO WHERE id_regiao = :1", (id_regiao,))
        if cursor.rowcount == 0:
            print(f"ERRO: ID {id_regiao} nao encontrado.")
        else:
            conn.commit()
            print(f"OK: regiao {id_regiao} removida.")

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

def menu_regioes():
    while True:
        print("\n" + "=" * 45)
        print("REGIOES")
        print("=" * 45)
        print("1. Cadastrar regiao")
        print("2. Listar regioes")
        print("3. Buscar por estado")
        print("4. Deletar regiao")
        print("0. Voltar")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            cadastrar_regiao()
        elif opcao == "2":
            listar_regioes()
        elif opcao == "3":
            buscar_regiao_por_estado()
        elif opcao == "4":
            deletar_regiao()
        elif opcao == "0":
            break
        else:
            print("Opcao invalida.")
