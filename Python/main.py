"""
AgroSat - Sistema de Monitoramento Agricola via Satelite
Computational Thinking Using Python - Global Solution 2026/1 - FIAP

Integrantes:
  Gustavo Rodrigues Siciliano - RM568419
  Gustavo de Jesus Silva - RM567926
  Samuel Keniti Kina de Lima - RM567614

Como usar:
  1. pip install oracledb requests
  2. python main.py
"""

import requests
from database.connection import testar_conexao
from modules.regiao import menu_regioes
from modules.leitura import menu_leituras
from modules.previsao import menu_previsoes
from modules.alerta import menu_alertas
from modules.relatorio import menu_relatorios, registrar_log

def cabecalho():
    print("\n" + "=" * 45)
    print("  AGROSAT - MONITORAMENTO AGRICOLA")
    print("  Satelite + IA + Oracle FIAP")
    print("=" * 45)

def verificar_conexoes():
    print("\nVerificando conexoes...\n")

    ok, msg = testar_conexao()
    if ok:
        print("[OK] Oracle FIAP conectado")
    else:
        print(f"[ERRO] Oracle FIAP: {msg}")

    try:
        resp = requests.get("https://gs-ia.onrender.com/health", timeout=10)
        if resp.status_code == 200:
            print("[OK] Render (IA) online")
        else:
            print(f"  [AVISO] Render retornou status {resp.status_code}")
    except requests.exceptions.Timeout:
        print("[AVISO] Render hibernando")
    except requests.exceptions.ConnectionError:
        print("[AVISO] Render sem conexao")
    except Exception as e:
        print(f"[AVISO] Render: {e}")

    print()

def main():
    cabecalho()
    verificar_conexoes()
    registrar_log("SISTEMA_INICIADO")

    while True:
        print("=" * 45)
        print("MENU PRINCIPAL")
        print("=" * 45)
        print("1. Regioes")
        print("2. Leituras Satelitais")
        print("3. Previsoes")
        print("4. Alertas")
        print("5. Relatorios")
        print("0. Sair")
        opcao = input("\nEscolha: ").strip()

        if opcao == "1":
            menu_regioes()
        elif opcao == "2":
            menu_leituras()
        elif opcao == "3":
            menu_previsoes()
        elif opcao == "4":
            menu_alertas()
        elif opcao == "5":
            menu_relatorios()
        elif opcao == "0":
            registrar_log("SISTEMA_ENCERRADO")
            print("\nSistema encerrado.")
            break
        else:
            print("Opcao invalida.")

if __name__ == "__main__":
    main()
