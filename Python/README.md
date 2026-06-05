# AgroSat — Sistema de Monitoramento Agrícola via Satélite

> Computational Thinking Using Python — Global Solution 2026/1 — FIAP

Sistema CLI em Python que coleta dados reais de APIs espaciais, persiste no Oracle e consulta modelos de Machine Learning para classificar a saúde da vegetação e prever riscos hídricos em regiões agrícolas brasileiras.

---

## Integrantes

| Nome | RM |
|------|----|
| Gustavo Rodrigues Siciliano | RM568419 |
| Gustavo de Jesus Silva | RM567926 |
| Samuel Keniti Kina de Lima | RM567614 |

---

## Links

- **GitHub:** https://github.com/GustavoSiciliano/Global-Solution-2026
- **API de IA (Render):** https://gs-ia.onrender.com

---

## Pré-requisitos

- Python 3.10+
- Acesso à rede para as APIs externas
- Acesso ao Oracle FIAP (`oracle.fiap.com.br:1521/orcl`)

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/GustavoSiciliano/Global-Solution-2026

# Acesse a pasta do projeto Python
cd Global-Solution-2026/Python

# Instale as dependências
pip install -r requirements.txt
```

`requirements.txt`:
```
oracledb>=2.1.0
requests==2.31.0
```

---

## Como executar

```bash
python main.py
```

Ao iniciar, o sistema verifica automaticamente a conexão com o Oracle e o status da API no Render.

---

## Estrutura do projeto

```
Python/
├── main.py                  # Ponto de entrada e menu principal
├── requirements.txt
├── scripts_oracle.txt       # DDL das tabelas Oracle
├── database/
│   └── connection.py        # Conexão Oracle via oracledb
├── modules/
│   ├── regiao.py            # Funcionalidade 1 — Regiões
│   ├── leitura.py           # Funcionalidade 2 — Leituras Satelitais
│   ├── previsao.py          # Funcionalidade 3 — Previsões
│   ├── alerta.py            # Funcionalidade 4 — Alertas
│   └── relatorio.py         # Funcionalidade 5 — Relatórios
└── data/
    ├── historico.json       # Gerado automaticamente
    └── log.txt              # Gerado automaticamente
```

---

## Funcionalidades

### 1. Regiões
- Cadastro com busca automática de coordenadas via **Nominatim (OpenStreetMap)**
- Identificação automática de bioma via **INPE TerraBrasilis**
- Fallback manual se as APIs estiverem indisponíveis
- Listagem, busca por estado (UF) e exclusão com validação de ID

### 2. Leituras Satelitais
- Coleta automática de temperatura e radiação solar via **NASA POWER**
- Coleta automática de precipitação, umidade e dias sem chuva via **Open-Meteo**
- NDVI estimado por faixa do bioma da região
- Envio automático para o modelo de IA no Render após coleta
- Geração automática de alerta se risco hídrico >= 40%

### 3. Previsões
- Listagem de previsões por região
- Simulação automática com coleta de dados via APIs sem salvar no banco
- Visão geral do risco hídrico atual de todas as regiões

### 4. Alertas
- Listagem ordenada por criticidade (CRITICO > ALTO > MEDIO > BAIXO)
- Resolução com validação de ID
- Histórico completo e estatísticas por nível

### 5. Relatórios
- Exportação do histórico de previsões em `.json`
- Exportação de log de alertas em `.txt`
- Visualização dos arquivos salvos no terminal
- Estatísticas gerais do sistema

---

## APIs utilizadas

| API | URL | Dados coletados |
|-----|-----|-----------------|
| Nominatim (OSM) | nominatim.openstreetmap.org | Latitude e longitude por cidade |
| INPE TerraBrasilis | terrabrasilis.dpi.inpe.br | Bioma por coordenadas |
| NASA POWER | power.larc.nasa.gov | Temperatura e radiação solar (média 7 dias) |
| Open-Meteo | api.open-meteo.com | Precipitação, umidade, dias sem chuva (30 dias) |
| Render Flask IA | gs-ia.onrender.com | Status vegetação, risco hídrico e nível de alerta |

---

## Banco de dados Oracle

```
Host : oracle.fiap.com.br
Porta: 1521
SID  : orcl
User : RM568419
Pass : 250204
```

As tabelas já estão criadas. O arquivo `scripts_oracle.txt` contém o DDL completo caso precise recriar.

**Tabelas utilizadas:**

```
TB_FONTE_SATELITAL     — fontes de dados satelitais
TB_REGIAO              — regiões agricolas monitoradas
TB_USUARIO             — usuarios do sistema
TB_REGIAO_USUARIO      — vinculo N:N regioes x usuarios
TB_LEITURA_SATELITAL   — leituras coletadas pelas APIs
TB_PREVISAO            — resultados do modelo de IA
TB_ALERTA              — alertas gerados automaticamente
TB_HISTORICO_ALERTA    — historico de acoes sobre alertas
```

---

## Aviso — Render pode hibernar

A API de IA está hospedada no plano gratuito do Render, que hiberna após 15 minutos de inatividade. A primeira requisição pode demorar entre 30 e 60 segundos.

O sistema exibirá:
```
AVISO: Render em hibernacao, aguarde...
```

Para verificar se está ativo antes de executar:
```bash
curl https://gs-ia.onrender.com/health
# resposta esperada: {"status": "ok"}
```

---

## Fluxo de uma leitura

```
Selecionar região
      |
Buscar lat/lon/bioma no Oracle
      |
NASA POWER  --> temperatura, radiacao_solar
Open-Meteo  --> precipitacao, umidade, dias_sem_chuva
NDVI        --> estimado pelo bioma
      |
Confirmação
      |
INSERT TB_LEITURA_SATELITAL
      |
POST /predict/completo (Render)
      |
INSERT TB_PREVISAO
      |
risco >= 40% --> INSERT TB_ALERTA
```

---

## Padrões de código

- `conn = None` e `cursor = None` antes de todo `try`, com `finally` seguro
- Sem emojis — prefixos `OK:`, `ERRO:`, `AVISO:`
- Sem espaços de alinhamento em atribuições
- Validações de entrada antes de qualquer operação no banco
- `rollback` explícito no `except` em toda operação de escrita
- Comentários diretos e enxutos
