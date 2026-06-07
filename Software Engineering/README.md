# AgroSat — Software Engineering and Business Model

> Global Solution 2026/1 — FIAP — Análise e Desenvolvimento de Sistemas

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
- **Deploy API IA:** https://gs-ia.onrender.com
- **Trello:** https://share.google/GgeFrRvZeReVVURDa
- **Pitch:** *(link do YouTube após gravação)*

---

## Sobre o Documento

Este documento cobre todos os requisitos da disciplina de Software Engineering and Business Model, estruturado em:

1. Plano de Negócio
2. Proposta Financeira
3. UX e Heurísticas de Nielsen
4. SLA
5. Documentação de Requisitos
6. Diagramas (Atividades e Casos de Uso)
7. Pitch

---

## 1. Plano de Negócio

**Empresa:** AgroSat Tecnologia Ltda.
**Produto:** AgroSat — Monitoramento e Risco Agrícola via Satélite
**Segmento:** AgTech Espacial
**Modelo:** SaaS — Software as a Service
**Público-alvo:** Pequenos e médios produtores rurais brasileiros

### Problema

O agronegócio brasileiro perde mais de R$34 bilhões por ano com eventos de seca (CNA, 2024). O pequeno produtor não tem acesso a ferramentas de monitoramento — as soluções internacionais como a Climate Corporation cobram acima de USD 150/mês.

### Solução

Plataforma web que usa dados reais de satélites da NASA e do INPE para monitorar a saúde da vegetação e prever riscos hídricos com 7 dias de antecedência, a partir de R$97/mês.

### Concorrentes

| Concorrente | Limitação |
|-------------|-----------|
| Climate Corporation | USD 150+/mês, sem foco no Brasil |
| Aegro | Sem predição satelital por ML |
| Klimbers | Foco climático, sem NDVI/ML |
| John Deere Ops Center | Exclusivo para clientes John Deere |

### Vantagens Competitivas

- Dados espaciais gratuitos da NASA e INPE — custo de aquisição zero
- Dois modelos de ML: classificação e previsão de risco hídrico
- Cobertura completa do Brasil com atualização diária
- Arquitetura moderna full stack integrada
- Preço acessível a partir de R$97/mês
- Alinhado aos ODS 2, 9 e 13 da ONU

---

## 2. Proposta Financeira

### Planos

| Plano | Preço/mês | Propriedades | Alertas | API | Suporte |
|-------|-----------|-------------|---------|-----|---------|
| Entry | R$ 97,00 | 1 (até 500 ha) | E-mail | Não | Chat |
| Pro | R$ 247,00 | 5 (até 5.000 ha) | E-mail + SMS | Sim | Chat + Tel |
| Enterprise | R$ 697,00 | Ilimitadas | E-mail, SMS, Push | Sim + SLA | 24/7 dedicado |

### Custos Mensais (base 1.000 usuários)

| Item | Custo/mês |
|------|-----------|
| Infraestrutura em nuvem | R$ 8.500 |
| Equipe técnica (3 devs + 1 ML) | R$ 32.000 |
| Comercial e marketing | R$ 12.000 |
| Demais custos operacionais | R$ 12.500 |
| **Total operacional** | **R$ 65.000** |

### Breakeven

O ponto de equilíbrio é atingido com **845 usuários ativos**, quando a receita mensal alcança R$65.000.

---

## 3. UX e Heurísticas de Nielsen

| # | Heurística | Aplicação no AgroSat |
|---|-----------|---------------------|
| H1 | Visibilidade do status | Dashboard com mapa de risco, KPIs e badges coloridos em tempo real |
| H3 | Controle e liberdade | Filtros por nível de alerta e ações reversíveis |
| H4 | Consistência e padrões | Navbar fixa com layout padronizado em todas as páginas |
| H6 | Reconhecimento em vez de lembrança | Presets no Simulador IA com hints por campo |

---

## 4. SLA

| Indicador | Entry | Pro | Enterprise |
|-----------|-------|-----|-----------|
| Uptime mensal | 99,5% | 99,9% | 99,95% |
| Latência p50 | < 500ms | < 300ms | < 200ms |
| Atualização NDVI | 24h | 12h | 6h |
| Atendimento P1 | 8h | 4h | 1h |

---

## 5. Requisitos

### Funcionais (RF)

| ID | Requisito |
|----|-----------|
| RF01 | Cadastrar regiões agrícolas com coordenadas |
| RF02 | Coletar NDVI via NASA MODIS diariamente |
| RF03 | Classificar estado da vegetação por ML |
| RF04 | Prever risco hídrico com 7 dias de antecedência |
| RF05 | Dashboard interativo com mapa do Brasil |
| RF06 | Alertas automáticos por e-mail e SMS |
| RF07 | API REST com CRUD completo |
| RF08 | Autenticação JWT com perfis de usuário |

### Não Funcionais (RNF)

| ID | Requisito | Critério |
|----|-----------|---------|
| RNF01 | Desempenho | Carregamento < 3s em 4G |
| RNF02 | Disponibilidade | Uptime mínimo 99,9% |
| RNF03 | Segurança | TLS 1.3 + AES-256 |
| RNF05 | Privacidade | Conformidade com LGPD |

---

## 6. Diagramas

Os diagramas de Atividades e Casos de Uso foram desenvolvidos no ASTAH e estão incluídos no documento PDF de entrega.

---

## 7. Pitch

Vídeo de até 3 minutos publicado no YouTube apresentando o problema, a solução, a tecnologia e o impacto nos ODS 2, 9 e 13.

**Link:** *(inserir após gravação)*

---

## ODS

| ODS | Alinhamento |
|-----|-------------|
| ODS 2 — Fome Zero | Reduz perdas agrícolas com monitoramento preventivo |
| ODS 9 — Inovação | Tecnologia espacial acessível para o campo brasileiro |
| ODS 13 — Ação Climática | Adaptação a eventos climáticos extremos via IA |
