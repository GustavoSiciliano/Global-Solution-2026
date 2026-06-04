# AgroSat — Artificial Intelligence & Chatbot
### Global Solution 2026/1 — FIAP | Análise e Desenvolvimento de Sistemas

**GitHub:** https://github.com/GustavoSiciliano/Global-Solution-2026

---

## Integrantes

| Nome | RM | Turma |
|------|----|-------|
| Gustavo Rodrigues Siciliano | RM568419 | 1TDS Agosto |
| Gustavo de Jesus Silva | RM567926 | 1TDS Agosto |
| Samuel Keniti Kina de Lima | RM567614 | 1TDS Agosto |

---

## Sobre o Projeto

O AgroSat utiliza dados reais de satélites da NASA para monitorar a saúde da vegetação agrícola brasileira e prever riscos de seca. A camada de IA processa os dados coletados das APIs espaciais e gera previsões via Machine Learning.

---

## Modelos de Machine Learning

### Modelo 1 — Classificação de Vegetação
- **Algoritmo:** Random Forest Classifier
- **Entrada:** ndvi, temperatura, precipitacao, umidade, dias_sem_chuva, radiacao_solar
- **Saída:** `SAUDAVEL` | `EM_ESTRESSE` | `CRITICO`
- **Métricas:** Accuracy, F1-Score, Precision, Recall
- **Arquivo:** `pickles/modelo_classificacao.pickle`

### Modelo 2 — Regressão de Risco Hídrico
- **Algoritmo:** Random Forest Regressor
- **Entrada:** ndvi, temperatura, precipitacao, umidade, dias_sem_chuva, radiacao_solar
- **Saída:** Percentual de risco hídrico de 0% a 100%
- **Métricas:** MAE, RMSE, R²
- **Arquivo:** `pickles/modelo_regressao.pickle`

---

## Dataset

- **Arquivo:** `data/agrosat_dataset.csv`
- **Registros:** 300
- **Regiões:** 10 regiões agrícolas brasileiras
- **Distribuição:** SAUDAVEL (110) | EM_ESTRESSE (99) | CRITICO (91)
- **Colunas:** regiao, ndvi, temperatura, precipitacao, umidade, dias_sem_chuva, radiacao_solar, status_vegetacao, risco_hidrico

---

## APIs Espaciais Utilizadas

| API | Dado coletado |
|-----|--------------|
| NASA POWER | temperatura, radiacao_solar |
| NASA FIRMS | focos_calor |
| Open-Meteo | precipitacao, umidade, dias_sem_chuva |
| INPE TerraBrasilis | areas_desmatamento |
| NASA EarthData | ndvi (estimado por bioma) |
| Copernicus ESA | dados climáticos e de solo |

---

## Estrutura do Projeto

```
IA/
├── app.py                        API Flask principal
├── requirements.txt
├── render.yaml                   Config deploy Render
├── .env.example                  Modelo de variáveis de ambiente
├── integrantes.txt
├── README.md
├── config/
│   ├── settings.py               Variáveis de ambiente e URLs
│   └── database.py               Conexão Oracle e queries
├── coleta/
│   └── coletor.py                Coleta unificada de todas as APIs
├── modelos/
│   ├── classificacao.py          Treina Random Forest Classifier
│   ├── regressao.py              Treina Random Forest Regressor
│   └── preditor.py               Carrega pickles e executa predições
├── data/
│   └── agrosat_dataset.csv
├── notebooks/
│   ├── notebook_classificacao.ipynb
│   └── notebook_regressao.ipynb
└── pickles/
    ├── modelo_classificacao.pickle
    ├── modelo_regressao.pickle
    └── label_encoder.pickle
```

---

## Como Executar

### Instalação
```bash
pip install -r requirements.txt
cp .env.example .env
```

### Pipeline de execução
```bash
# Passo 1 — Treinar modelo de classificação
python modelos/classificacao.py

# Passo 2 — Treinar modelo de regressão
python modelos/regressao.py

# Passo 3 — Subir a API localmente
python app.py

# Passo 4 — Deploy no Render
gunicorn app:app
```

---

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/health` | Status da API e Oracle |
| GET | `/modelos` | Lista modelos disponíveis |
| GET | `/regioes` | Lista regiões do Oracle |
| GET | `/alertas` | Alertas ativos |
| GET | `/regioes/<id>/previsoes` | Histórico de previsões |
| POST | `/predict/<modelo>` | Predição genérica |
| POST | `/predict/completo` | Classificação + regressão juntas |
| POST | `/regioes/<id>/monitorar` | Coleta APIs + ML + salva Oracle |

### Exemplo de request
```json
POST /predict/completo
Content-Type: application/json

{
  "ndvi": 0.21,
  "temperatura": 35.8,
  "precipitacao": 0.0,
  "umidade": 28.0,
  "dias_sem_chuva": 30,
  "radiacao_solar": 26.1
}
```

### Exemplo de response
```json
{
  "status_vegetacao": "CRITICO",
  "confianca": 1.0,
  "risco_hidrico": 79.12,
  "nivel_alerta": "CRITICO"
}
```

---

## Variáveis de Ambiente

```
PORT=5000
DEBUG=False
SECRET_KEY=sua_chave_aqui
DB_USER=RM568419
DB_PASS=sua_senha
DB_HOST=oracle.fiap.com.br
DB_PORT=1521
DB_NAME=orcl
NASA_FIRMS_KEY=DEMO_KEY
```

---

## ODS Atendidos

- **ODS 2** — Fome Zero e Agricultura Sustentável
- **ODS 13** — Ação Contra a Mudança Global do Clima
- **ODS 9** — Indústria, Inovação e Infraestrutura
