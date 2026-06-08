# AgroSat — API REST Java

> Domain Driven Design Using Java — Global Solution 2026/1 — FIAP

API RESTful desenvolvida com Quarkus 3.8.4 e Java 21, responsável por toda a camada de backend do AgroSat. Integrada ao Oracle FIAP, a APIs satelitais reais (NASA POWER, Open-Meteo, INPE) e ao modelo de Machine Learning hospedado no Render.

---

## Integrantes

| Nome | RM |
|------|----|
| Gustavo Rodrigues Siciliano | RM568419 |
| Gustavo de Jesus Silva | RM567926 |
| Samuel Keniti Kina de Lima | RM567614 |

---

## Links

- **Deploy:** https://global-solution-2026.onrender.com
- **Health Check:** https://global-solution-2026.onrender.com/health
- **GitHub:** https://github.com/GustavoSiciliano/Global-Solution-2026
- **API Flask IA:** https://gs-ia.onrender.com

---

## Pré-requisitos

- Java 21+
- Maven 3.9+
- Acesso à rede FIAP (Oracle)

---

## Como executar

```bash
# Clone o repositório
git clone https://github.com/GustavoSiciliano/Global-Solution-2026

# Acesse a pasta Java
cd Global-Solution-2026/Java

# Inicie o servidor
mvn quarkus:dev
```

A API sobe em `http://localhost:8080`. Acesse `/health` para confirmar que o Oracle está conectado.

---

## Rodar o MainTeste (terminal interativo)

```bash
# Compile
mvn compile

# Testar no Render (produção)
java -cp target/classes AgroSat.Teste.MainTeste https://global-solution-2026.onrender.com

# Testar local
java -cp target/classes AgroSat.Teste.MainTeste http://localhost:8080
```

O MainTeste é um menu interativo no terminal com CRUD completo de todas as entidades.

---

## Estrutura do projeto

```
Java/
├── Dockerfile
├── render.yaml
├── pom.xml
└── src/main/java/AgroSat/
    ├── vo/          Value Objects — getters/setters das 10 entidades do banco
    ├── conexao/     Oracle (ConexaoBanco) + APIs externas (ViaCEP, Nominatim, INPE, NASA, Open-Meteo)
    ├── dao/         Data Access Objects — queries SQL (8 DAOs, um por tabela)
    ├── bo/          Business Objects — regras de negócio e validações (8 BOs)
    ├── render/      RenderIA — cliente HTTP para o modelo Flask IA no Render
    ├── api/         Endpoints REST JAX-RS (8 classes)
    ├── excecao/     Tratamento de erros com resposta JSON padronizada
    └── Teste/       MainTeste.java — cliente de teste interativo
```

---

## Banco de dados Oracle

```
Host  : oracle.fiap.com.br
Porta : 1521
SID   : orcl
User  : RM568419
Pass  : 250204
```

**Tabelas cobertas:**

```
TB_FONTE_SATELITAL     fontes de dados satelitais
TB_REGIAO              regioes agricolas monitoradas
TB_USUARIO             usuarios do sistema
TB_REGIAO_USUARIO      vinculo N:N regioes x usuarios
TB_LEITURA_SATELITAL   leituras coletadas pelas APIs
TB_PREVISAO            resultados do modelo de IA
TB_ALERTA              alertas gerados automaticamente
TB_HISTORICO_ALERTA    historico de acoes sobre alertas
```

---

## APIs integradas

| API | Finalidade |
|-----|-----------|
| ViaCEP | CEP → cidade e estado |
| Nominatim (OSM) | Cidade/estado → latitude e longitude |
| INPE TerraBrasilis | Coordenadas → bioma |
| NASA POWER | Temperatura e radiação solar (média 7 dias) |
| Open-Meteo | Precipitação, umidade e dias sem chuva (30 dias) |
| Render Flask IA | Classificação da vegetação e risco hídrico |

---

## Fluxo automático de uma leitura

```
Usuário informa o ID da região
        |
NASA POWER  → temperatura, radiacao_solar
Open-Meteo  → precipitacao, umidade, dias_sem_chuva
NDVI        → estimado pelo bioma da região
        |
INSERT TB_LEITURA_SATELITAL (Oracle)
        |
POST /predict/completo (Render Flask IA)
        |
INSERT TB_PREVISAO (Oracle)
        |
risco >= 40% → INSERT TB_ALERTA (Oracle)
```

---

## Principais endpoints

| Verbo | Endpoint | Descrição |
|-------|----------|-----------|
| GET | /health | Status da API e Oracle |
| GET | /regioes | Listar todas as regiões |
| GET | /regioes/situacao/cep/{cep} | Busca por CEP com dados agrícolas |
| POST | /regioes/buscar-por-cidade | Cadastrar com coords automáticas |
| POST | /leituras/automatico/{idRegiao} | Coletar NASA+Meteo+IA e salvar |
| GET | /alertas/pendentes | Alertas não resolvidos |
| PUT | /alertas/{id}/resolver | Marcar alerta como resolvido |
| GET | /previsoes/regiao/{idRegiao} | Previsões de uma região |

A API expõe **39 endpoints** no total cobrindo todas as entidades.

---

## Deploy no Render

O projeto usa Dockerfile multistage. Para fazer o deploy:

1. Subir o código no GitHub
2. Acessar render.com → New → Web Service
3. Selecionar o repositório
4. Configurar: **Runtime: Docker** | **Root Directory: Java**
5. Clicar em Deploy

O Render injeta a variável `PORT` automaticamente via `${PORT:8080}` no `application.properties`.

---

## Aviso — Render hiberna

O plano gratuito do Render hiberna após 15 minutos de inatividade. A primeira requisição após inatividade pode demorar 30 a 60 segundos.

Verifique antes de usar:
```bash
curl https://global-solution-2026.onrender.com/health
# resposta esperada: {"status":"ok","oracle":"conectado"}
```

---

## Padrões de código

- `conn.setAutoCommit(false)` antes de toda operação de escrita
- `rollback` explícito no catch em todos os DAOs
- `finally` com fechamento seguro de `ResultSet`, `PreparedStatement` e `Connection`
- Exceções customizadas (`Excecao`) retornam JSON `{"erro":"msg","status":404}`
- Sem `@ConfigProperty` — credenciais como `static final` nas classes de conexão
- CORS liberado via `/.*/` para o frontend React
