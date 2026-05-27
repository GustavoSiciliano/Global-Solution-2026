# 🛰️ AgroSat — Monitoramento e Risco Agrícola via Satélite

> Plataforma web inteligente que utiliza dados reais de satélites da NASA para monitorar a saúde da vegetação agrícola brasileira e prever riscos de seca em regiões produtoras.

---

## 📋 Sobre o Projeto

O **AgroSat** é a solução desenvolvida para a **Global Solution 2026/1 da FIAP**, com o tema **"O Espaço é a Nova Fronteira — A Economia Espacial"**.

O agronegócio brasileiro representa cerca de 30% do PIB nacional, porém produtores rurais ainda enfrentam grandes perdas por falta de informação antecipada sobre a saúde de suas lavouras. O AgroSat resolve isso utilizando dados satelitais reais para monitorar o índice **NDVI** (Normalized Difference Vegetation Index) e prever riscos hídricos com antecedência, permitindo decisões preventivas antes que os danos ocorram.

---

## 🌍 Conexão com os ODS da ONU

| ODS | Descrição |
|-----|-----------|
| 🌾 **ODS 2** | Fome Zero e Agricultura Sustentável |
| 🌡️ **ODS 13** | Ação Contra a Mudança Global do Clima |
| 🏗️ **ODS 9** | Indústria, Inovação e Infraestrutura |

---

## 🚀 Funcionalidades

- 📡 **Monitoramento de Vegetação** — Coleta e exibe o índice NDVI em tempo real por região agrícola
- 💧 **Previsão de Risco Hídrico** — Modelo de ML prevê percentual de risco de seca (0% a 100%)
- 🔴 **Alertas Automáticos** — Emite alertas por nível (BAIXO, MÉDIO, ALTO, CRÍTICO) quando o risco ultrapassa limites
- 📊 **Dashboard Interativo** — Mapa do Brasil com regiões coloridas por nível de risco e gráficos temporais
- 📋 **Histórico de Ações** — Registro de todas as ações dos usuários sobre os alertas recebidos

---

## 🛰️ APIs Espaciais Utilizadas

| API | Fornecedor | Dado |
|-----|-----------|------|
| **NASA EarthData** | NASA | Índice NDVI e imagens satelitais |
| **NASA FIRMS** | NASA | Focos de calor e queimadas |
| **NASA POWER** | NASA | Temperatura e radiação solar |
| **Open-Meteo** | Open-Meteo | Precipitação e umidade (gratuita) |
| **INPE TerraBrasilis** | INPE | Desmatamento e uso do solo |
| **Copernicus ESA** | ESA | Dados climáticos e de solo |

---

## 🏗️ Arquitetura do Sistema

```
NASA / ESA / INPE APIs
         ↓
   Python (coleta + ML)
         ↓
   Oracle Database
         ↓
   Java Quarkus (API REST)
         ↓
   React + TypeScript (Dashboard)
```

---

## 🛠️ Tecnologias Utilizadas

### Backend & IA
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Quarkus](https://img.shields.io/badge/Quarkus-4695EB?style=for-the-badge&logo=quarkus&logoColor=white)

### Banco de Dados
![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🤖 Modelos de Machine Learning

### Modelo 1 — Classificação de Vegetação
- **Algoritmo:** Random Forest Classifier
- **Entrada:** NDVI, temperatura, precipitação
- **Saída:** `SAUDAVEL` | `EM_ESTRESSE` | `CRITICO`
- **Métricas:** Accuracy, F1-Score, Precision, Recall

### Modelo 2 — Regressão de Risco Hídrico
- **Algoritmo:** Random Forest Regressor
- **Entrada:** NDVI, temperatura, dias sem chuva, umidade
- **Saída:** Percentual de risco hídrico (0% a 100%)
- **Métricas:** MAE, RMSE, R²

---

## 🗄️ Banco de Dados Oracle

O banco é composto por **8 tabelas** que armazenam toda a cadeia de dados do sistema:

```
TB_FONTE_SATELITAL
TB_REGIAO
TB_USUARIO
TB_REGIAO_USUARIO  ← tabela associativa N:N
TB_LEITURA_SATELITAL
TB_PREVISAO
TB_ALERTA
TB_HISTORICO_ALERTA
```

---

## 📁 Estrutura de Pastas

```
agrosat/
├── python/
│   ├── coleta/
│   │   └── nasa_api.py          # Coleta dados das APIs
│   ├── ml/
│   │   ├── notebook.ipynb       # Pipeline completo de ML
│   │   ├── modelo_classificacao.pickle
│   │   └── modelo_regressao.pickle
│   ├── api/
│   │   └── app.py               # API Flask com endpoints
│   └── dataset/
│       └── agrosat_dataset.csv
├── java/
│   └── agrosat-api/             # API REST com Quarkus
│       ├── src/main/java/
│       │   ├── entity/
│       │   ├── dao/
│       │   ├── bo/
│       │   └── resource/
│       └── pom.xml
├── frontend/
│   └── agrosat-web/             # React + Vite + TypeScript
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── services/
│       │   └── types/
│       ├── package.json
│       └── README.md
├── database/
│   └── agrosat_ddl.sql          # Script completo Oracle
└── README.md
```

---

## ⚙️ Como Usar

### Pré-requisitos
- Python 3.10+
- Java JDK 17+
- Node.js 18+
- Oracle Database 21c

### Executar a API Python (Flask)
```bash
cd python/api
pip install -r requirements.txt
python app.py
```

### Executar a API Java (Quarkus)
```bash
cd java/agrosat-api
./mvnw quarkus:dev
```

### Executar o Frontend (React)
```bash
cd frontend/agrosat-web
npm install
npm run dev
```

### Banco de Dados Oracle
```sql
-- Execute no SQL Developer
@database/agrosat_ddl.sql
```

---

## 🔌 Endpoints da API Flask (IA)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/health` | Status da API |
| `POST` | `/predict/vegetacao` | Classifica status da vegetação |
| `POST` | `/predict/risco` | Prevê percentual de risco hídrico |

**Exemplo de request:**
```json
POST /predict/vegetacao
{
  "ndvi": 0.21,
  "temperatura": 35.8,
  "precipitacao": 0.0
}
```

**Exemplo de response:**
```json
{
  "status_vegetacao": "CRITICO",
  "confianca": 0.94
}
```

---

## 🔌 Endpoints da API Java (Quarkus)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/regioes` | Lista todas as regiões |
| `GET` | `/api/regioes/{id}` | Dados de uma região |
| `GET` | `/api/alertas` | Lista alertas ativos |
| `GET` | `/api/previsoes/{id}` | Previsão de uma região |
| `POST` | `/api/regioes` | Cadastra nova região |
| `PUT` | `/api/alertas/{id}` | Atualiza status do alerta |
| `DELETE` | `/api/regioes/{id}` | Remove região |

---

## 🌐 Links do Projeto

| Item | Link |
|------|------|
| 🔗 Repositório GitHub | `em breve` |
| 🚀 Deploy Frontend (Vercel) | `em breve` |
| ⚙️ Deploy Backend (Render) | `em breve` |
| 🎬 Vídeo Pitch (YouTube) | `em breve` |
| 🎥 Vídeo Demonstração (YouTube) | `em breve` |

---

## 👥 Integrantes

| Nome | RM | Turma |
|------|----|-------|
| **Gustavo Rodrigues Siciliano** | RM568419 | 1TDS — Agosto |
| **Gustavo de Jesus Silva** | RM567926 | 1TDS — Agosto |
| **Samuel Keniti Kina de Lima** | RM567614 | 1TDS — Agosto |

---

## 📚 Disciplinas Envolvidas

| Disciplina | Entrega |
|------------|---------|
| AI & Chatbot | 2 modelos ML + API Flask |
| Building Relational Database | Banco Oracle completo |
| Computational Thinking Using Python | Sistema com menus + Oracle |
| Domain Driven Design Using Java | API REST Quarkus + deploy |
| Front-End Design Engineering | React + Vite + TS + Vercel |
| Software Engineering & Business Model | Plano de negócio + pitch |

---

## 📅 Cronograma

| Data | Evento |
|------|--------|
| 25/05/2026 | Live de abertura |
| 09/06/2026 | Entrega no portal FIAP (até 23h55) |
| 10/06 a 16/06/2026 | Apresentação presencial |

---

## 📞 Contato

Para dúvidas sobre o projeto, entre em contato pelo GitHub de cada integrante ou pelo portal da FIAP.

---

<p align="center">
  Desenvolvido com 🛰️ para a <strong>Global Solution 2026/1 — FIAP</strong>
</p>
