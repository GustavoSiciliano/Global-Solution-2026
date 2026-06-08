# 🛰 AgroSat — Monitoramento e Risco Agrícola via Satélite

> React + Vite + TypeScript · Global Solution 2026/1 · FIAP

## 📋 Descrição

Plataforma SPA de monitoramento agrícola que integra dados satelitais reais da NASA POWER, INPE e Open-Meteo com modelos de Machine Learning (Random Forest) para monitoramento de risco hídrico e saúde da vegetação em regiões agrícolas brasileiras.

---

## 🧰 Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| Roteamento | React Router DOM 7 (rotas estáticas + dinâmica `/regioes/:id`) |
| Estilização | Tailwind CSS 3 |
| Acessibilidade | VLibras |
| Backend Java | Java 21 + Quarkus 3.8.4 (Render) |
| IA / ML | Python 3 + Flask + scikit-learn (Render) |
| Banco de Dados | Oracle SQL (FIAP) |
| Deploy Frontend | Vercel |
| Email | EmailJS |

---

## 📁 Estrutura de Pastas

```
src/
├── components/    Navbar, Footer, Modal, Ui, VLibras, NotifDropdown
├── context/       AppContext · NotifContext
├── data/          mockData.ts (fallback) · brazilMap.ts
├── pages/         15 páginas:
│                  Home, Dashboard, RegiaoDetalhe (/regioes/:id),
│                  Alertas, Clima, SimuladorIA, Comparativo, Queimadas,
│                  Pipeline, Planos, Gerenciar, Sobre, FAQ, Contato, Integrantes
├── services/      api.ts (Java + Flask) · openMeteo.ts · firmsApi.ts
└── types/         index.ts — interfaces + union types + intersection types
```

---

## 🗄 Tabelas Oracle cobertas

| Tabela | Página |
|--------|--------|
| TB_REGIAO | Dashboard, RegiaoDetalhe, Gerenciar |
| TB_LEITURA_SATELITAL | RegiaoDetalhe (monitorar) |
| TB_PREVISAO | RegiaoDetalhe (histórico IA) |
| TB_ALERTA | Alertas (resolver) |
| TB_HISTORICO_ALERTA | Alertas (expandido) |
| TB_USUARIO | Gerenciar (CRUD completo) |
| TB_FONTE_SATELITAL | Gerenciar (listagem) |
| TB_REGIAO_USUARIO | Gerenciar (vínculos) |

---

## 👥 Autores e Créditos

| Nome | RM | Turma | GitHub | LinkedIn |
|------|----|-------|--------|----------|
| Gustavo Rodrigues Siciliano | RM568419 | 1TDS Agosto | [GitHub](https://github.com/GustavoSiciliano) | [LinkedIn](https://linkedin.com/in/gustavo-siciliano) |
| Gustavo de Jesus Silva | RM567926 | 1TDS Agosto | [GitHub](https://github.com/gustavo-jesus-silva) | [LinkedIn](https://linkedin.com/in/gustavo-jesus-silva) |
| Samuel Keniti Kina de Lima | RM567614 | 1TDS Agosto | [GitHub](https://github.com/samuel-keniti) | [LinkedIn](https://linkedin.com/in/samuel-keniti) |

---

## 🚀 Como Usar

### Instalação local

```bash
git clone https://github.com/GustavoSiciliano/Global-Solution-2026
cd Global-Solution-2026/FrontEnd
npm install
npm run dev
```

### Variáveis de ambiente (`.env`)

```
VITE_JAVA_API_URL=https://global-solution-2026.onrender.com
VITE_FLASK_API_URL=https://gs-ia.onrender.com
```

### Deploy na Vercel

```bash
npm run build
# ou conectar o repositório diretamente na Vercel
# Root: FrontEnd | Build: npx vite build | Output: dist
```

---

## 🔗 Links

| Recurso | URL |
|---------|-----|
| Repositório GitHub | https://github.com/GustavoSiciliano/Global-Solution-2026 |
| Vídeo YouTube | https://youtu.be/tiokmaJ4eYg |
| Deploy Vercel | https://agrosat.vercel.app |
| API Java (Render) | https://global-solution-2026.onrender.com |
| API Flask IA (Render) | https://gs-ia.onrender.com |
| Health Check | https://global-solution-2026.onrender.com/health |

---

## 📞 Contato

Issues no GitHub ou LinkedIn dos integrantes acima.

*FIAP · Global Solution 2026/1 · A Economia Espacial*
