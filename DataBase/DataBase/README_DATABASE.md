# 🗄️ AgroSat — Building Relational Database

> Banco de dados relacional Oracle desenvolvido para sustentar a solução AgroSat na Global Solution 2026/1 — FIAP.

---

## 📋 Sobre

Este repositório contém toda a implementação do banco de dados relacional do **AgroSat**, plataforma de monitoramento agrícola via satélite. O banco armazena dados coletados de APIs espaciais da NASA, previsões geradas por modelos de Machine Learning, alertas automáticos e o histórico de ações dos usuários.

---

## 🗃️ Estrutura do Banco

O banco é composto por **8 tabelas** que cobrem toda a cadeia de dados do sistema:

```
TB_FONTE_SATELITAL      → APIs e fontes de dados espaciais
TB_REGIAO               → Regiões agrícolas monitoradas
TB_USUARIO              → Produtores, gestores e admins
TB_REGIAO_USUARIO       → Vínculo N:N entre usuário e região
TB_LEITURA_SATELITAL    → Dados brutos coletados (NDVI, clima)
TB_PREVISAO             → Resultados dos modelos de ML
TB_ALERTA               → Alertas gerados por risco elevado
TB_HISTORICO_ALERTA     → Histórico de ações sobre alertas
```

---

## 🔗 Relacionamentos

| De | Para | Tipo |
|----|------|------|
| TB_FONTE_SATELITAL | TB_LEITURA_SATELITAL | 1:N |
| TB_REGIAO | TB_LEITURA_SATELITAL | 1:N |
| TB_LEITURA_SATELITAL | TB_PREVISAO | 1:N |
| TB_PREVISAO | TB_ALERTA | 1:N |
| TB_REGIAO | TB_ALERTA | 1:N |
| TB_ALERTA | TB_HISTORICO_ALERTA | 1:N |
| TB_USUARIO | TB_HISTORICO_ALERTA | 1:N |
| TB_REGIAO + TB_USUARIO | TB_REGIAO_USUARIO | N:N |

---

## ✅ Requisitos Atendidos

| Requisito | Status |
|-----------|--------|
| Mínimo 6 tabelas | ✅ 8 tabelas |
| 2 relacionamentos 1:N | ✅ 7 relacionamentos 1:N |
| 1 relacionamento N:N com tabela associativa | ✅ TB_REGIAO_USUARIO |
| Chaves primárias e estrangeiras | ✅ Todas as tabelas |
| Restrições NOT NULL, UNIQUE, CHECK | ✅ Implementadas |
| Mínimo 50 registros de teste | ✅ 57 registros |
| 10 consultas SQL | ✅ Implementadas |
| 5 relatórios com JOIN | ✅ Implementados |

---

## 📁 Arquivos

```
database/
└── agrosat_ddl.sql   → DROP TABLE + DDL + DML + Consultas + JOINs
```

---

## ⚙️ Como Executar

### Pré-requisito
- Oracle Database 21c ou superior
- Oracle SQL Developer

### Passos
```sql
-- 1. Abra o SQL Developer e conecte ao banco
-- 2. Abra o arquivo agrosat_ddl.sql
-- 3. Execute o script completo (F5 ou Ctrl+Enter)
```

O script executa na seguinte ordem:
1. `DROP TABLE` — remove tabelas existentes com CASCADE CONSTRAINTS
2. `CREATE TABLE` — cria todas as 8 tabelas com constraints
3. `INSERT` — insere 57 registros de teste
4. `COMMIT` — confirma os dados
5. Consultas SQL e relatórios JOIN

---

## 📊 Dados de Teste Inseridos

| Tabela | Registros |
|--------|-----------|
| TB_FONTE_SATELITAL | 6 |
| TB_REGIAO | 10 |
| TB_USUARIO | 5 |
| TB_REGIAO_USUARIO | 8 |
| TB_LEITURA_SATELITAL | 10 |
| TB_PREVISAO | 10 |
| TB_ALERTA | 7 |
| TB_HISTORICO_ALERTA | 7 |
| **Total** | **57** |

---

## 🔍 Consultas SQL Implementadas

| # | Descrição |
|---|-----------|
| 1 | Listagem de regiões ordenadas por estado |
| 2 | Regiões com risco hídrico acima de 50% |
| 3 | Média de NDVI por estado com COUNT |
| 4 | Total de alertas por nível com GROUP BY |
| 5 | Regiões com vegetação em estado crítico |
| 6 | Maior, menor e média de temperatura (MAX, MIN, AVG) |
| 7 | Usuários e total de regiões monitoradas |
| 8 | Alertas não resolvidos com filtro WHERE |
| 9 | Soma de precipitação por região com SUM |
| 10 | Regiões sem alertas críticos com subquery |

---

## 📋 Relatórios com JOIN

| # | Tipo | Descrição |
|---|------|-----------|
| 1 | INNER JOIN | Leituras com previsões completas ordenadas por risco |
| 2 | INNER JOIN | Alertas com dados completos da região e previsão |
| 3 | LEFT JOIN diferença | Regiões sem leituras satelitais |
| 4 | LEFT JOIN diferença | Usuários sem regiões vinculadas |
| 5 | RIGHT JOIN diferença | Alertas sem histórico de ação |

---

## 🛰️ Fontes Satelitais Cadastradas

| Fonte | Tipo de Dado |
|-------|-------------|
| NASA FIRMS | Focos de calor e queimadas |
| NASA EarthData | Índice NDVI |
| NASA POWER | Temperatura e radiação solar |
| Open-Meteo | Precipitação e umidade |
| INPE TerraBrasilis | Desmatamento e uso do solo |
| Copernicus ESA | Dados climáticos e de solo |

---

## 👥 Integrantes

| Nome | RM | Turma |
|------|----|-------|
| **Gustavo Rodrigues Siciliano** | RM568419 | 1TDS — Agosto |
| **Gustavo de Jesus Silva** | RM567926 | 1TDS — Agosto |
| **Samuel Keniti Kina de Lima** | RM567614 | 1TDS — Agosto |

---

<p align="center">
  Global Solution 2026/1 — <strong>FIAP</strong> · Building Relational Database
</p>
