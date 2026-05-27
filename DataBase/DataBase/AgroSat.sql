-- Grupo AgroSat
/*

Gustavo Rodrigues Siciliano: RM568419
Gustavo de Jesus Silva: RM567926
Samuel Keniti Kina de Lima: RM567614

*/
-- Removendo Tabelas --
-- DROP TABLES
DROP TABLE TB_HISTORICO_ALERTA 
    CASCADE CONSTRAINTS;
DROP TABLE TB_ALERTA 
    CASCADE CONSTRAINTS;
DROP TABLE TB_PREVISAO 
    CASCADE CONSTRAINTS;
DROP TABLE TB_LEITURA_SATELITAL 
    CASCADE CONSTRAINTS;
DROP TABLE TB_REGIAO_USUARIO 
    CASCADE CONSTRAINTS;
DROP TABLE TB_USUARIO 
    CASCADE CONSTRAINTS;
DROP TABLE TB_REGIAO 
    CASCADE CONSTRAINTS;
DROP TABLE TB_FONTE_SATELITAL 
    CASCADE CONSTRAINTS;

-- Criando as Tabelas --
-- TB_FONTE_SATELITAL
CREATE TABLE TB_FONTE_SATELITAL(
    id_fonte NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nm_fonte VARCHAR2(100) NOT NULL,
    ds_url VARCHAR2(255) NOT NULL,
    ds_tipo_dado VARCHAR2(50) NOT NULL,
    ds_descricao VARCHAR2(255),
    dt_cadastro DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT uq_nm_fonte UNIQUE(nm_fonte),
    CONSTRAINT ck_tipo_dado CHECK(ds_tipo_dado IN ('NDVI','CLIMA','QUEIMADA','DESMATAMENTO','SOLO','RADIACAO'))
);

-- TB_REGIAO
CREATE TABLE TB_REGIAO(
    id_regiao NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nm_regiao VARCHAR2(100) NOT NULL,
    ds_estado VARCHAR2(2) NOT NULL,
    nr_latitude NUMBER(10,6) NOT NULL,
    nr_longitude NUMBER(10,6) NOT NULL,
    ds_bioma VARCHAR2(50),
    dt_cadastro DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT uq_nm_regiao UNIQUE(nm_regiao),
    CONSTRAINT ck_estado CHECK(ds_estado IN ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'))
);

-- TB_USUARIO
CREATE TABLE TB_USUARIO(
    id_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nm_usuario VARCHAR2(100) NOT NULL,
    ds_email VARCHAR2(150) NOT NULL,
    ds_senha VARCHAR2(255) NOT NULL,
    ds_perfil VARCHAR2(20) DEFAULT 'PRODUTOR' NOT NULL,
    dt_cadastro DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT uq_email UNIQUE(ds_email),
    CONSTRAINT ck_perfil CHECK(ds_perfil IN ('ADMIN','PRODUTOR','GESTOR'))
);

-- TB_REGIAO_USUARIO
CREATE TABLE TB_REGIAO_USUARIO(
    id_regiao_usuario NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_regiao NUMBER NOT NULL,
    id_usuario NUMBER NOT NULL,
    dt_vinculo DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_ru_regiao FOREIGN KEY(id_regiao) REFERENCES TB_REGIAO(id_regiao),
    CONSTRAINT fk_ru_usuario FOREIGN KEY(id_usuario) REFERENCES TB_USUARIO(id_usuario),
    CONSTRAINT uq_regiao_usuario UNIQUE(id_regiao, id_usuario)
);

-- TB_LEITURA_SATELITAL
CREATE TABLE TB_LEITURA_SATELITAL(
    id_leitura NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_regiao NUMBER NOT NULL,
    id_fonte NUMBER NOT NULL,
    nr_ndvi NUMBER(5,4),
    nr_temperatura NUMBER(5,2),
    nr_precipitacao NUMBER(8,2),
    nr_umidade NUMBER(5,2),
    nr_dias_sem_chuva NUMBER(3),
    nr_radiacao_solar NUMBER(8,2),
    dt_leitura DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_leitura_regiao FOREIGN KEY(id_regiao) REFERENCES TB_REGIAO(id_regiao),
    CONSTRAINT fk_leitura_fonte FOREIGN KEY(id_fonte) REFERENCES TB_FONTE_SATELITAL(id_fonte),
    CONSTRAINT ck_ndvi CHECK(nr_ndvi BETWEEN -1 AND 1),
    CONSTRAINT ck_umidade CHECK(nr_umidade BETWEEN 0 AND 100),
    CONSTRAINT ck_dias_sem_chuva CHECK(nr_dias_sem_chuva >= 0)
);

-- TB_PREVISAO
CREATE TABLE TB_PREVISAO(
    id_previsao NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_leitura NUMBER NOT NULL,
    ds_status_vegetacao VARCHAR2(20) NOT NULL,
    nr_risco_hidrico NUMBER(5,2) NOT NULL,
    ds_modelo_usado VARCHAR2(50) NOT NULL,
    dt_previsao DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_prev_leitura FOREIGN KEY(id_leitura) REFERENCES TB_LEITURA_SATELITAL(id_leitura),
    CONSTRAINT ck_status_veg CHECK(ds_status_vegetacao IN ('SAUDAVEL','EM_ESTRESSE','CRITICO')),
    CONSTRAINT ck_risco_hidrico CHECK(nr_risco_hidrico BETWEEN 0 AND 100)
);

-- TB_ALERTA
CREATE TABLE TB_ALERTA(
    id_alerta NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_previsao NUMBER NOT NULL,
    id_regiao NUMBER NOT NULL,
    ds_nivel VARCHAR2(20) NOT NULL,
    ds_mensagem VARCHAR2(500) NOT NULL,
    fl_resolvido CHAR(1) DEFAULT 'N' NOT NULL,
    dt_alerta DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_alerta_previsao FOREIGN KEY(id_previsao) REFERENCES TB_PREVISAO(id_previsao),
    CONSTRAINT fk_alerta_regiao FOREIGN KEY(id_regiao) REFERENCES TB_REGIAO(id_regiao),
    CONSTRAINT ck_nivel_alerta CHECK(ds_nivel IN ('BAIXO','MEDIO','ALTO','CRITICO')),
    CONSTRAINT ck_fl_resolvido CHECK(fl_resolvido IN ('S','N'))
);

-- TB_HISTORICO_ALERTA
CREATE TABLE TB_HISTORICO_ALERTA(
    id_historico NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_alerta NUMBER NOT NULL,
    id_usuario NUMBER NOT NULL,
    ds_acao VARCHAR2(100) NOT NULL,
    ds_observacao VARCHAR2(500),
    dt_acao DATE DEFAULT SYSDATE NOT NULL,
    CONSTRAINT fk_hist_alerta FOREIGN KEY(id_alerta) REFERENCES TB_ALERTA(id_alerta),
    CONSTRAINT fk_hist_usuario FOREIGN KEY(id_usuario) REFERENCES TB_USUARIO(id_usuario),
    CONSTRAINT ck_acao CHECK(ds_acao IN ('VISUALIZADO','RECONHECIDO','RESOLVIDO','IGNORADO'))
);

-- Inserindo Dados na Tabela
-- TB_FONTE_SATELITAL (6 registros)
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('NASA FIRMS','https://firms.modaps.eosdis.nasa.gov/api','QUEIMADA','Focos de calor e queimadas em tempo real');
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('NASA EarthData','https://earthdata.nasa.gov','NDVI','Imagens satelitais e índice NDVI');
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('NASA POWER','https://power.larc.nasa.gov/api','RADIACAO','Temperatura e radiação solar');
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('Open-Meteo','https://api.open-meteo.com','CLIMA','Precipitação e umidade gratuita');
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('INPE TerraBrasilis','https://terrabrasilis.dpi.inpe.br','DESMATAMENTO','Desmatamento e uso do solo');
INSERT INTO TB_FONTE_SATELITAL(nm_fonte, ds_url, ds_tipo_dado, ds_descricao) VALUES('Copernicus ESA','https://land.copernicus.eu','SOLO','Dados climáticos e de solo');

-- TB_REGIAO (10 registros)
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Sorriso','MT',-12.5442,-55.7214,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Lucas do Rio Verde','MT',-13.0569,-55.9131,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Rondonópolis','MT',-16.4700,-54.6358,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Barreiras','BA',-12.1521,-44.9937,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Rio Verde','GO',-17.7969,-50.9278,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Cascavel','PR',-24.9578,-53.4595,'Mata Atlântica');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Passo Fundo','RS',-28.2622,-52.4083,'Pampa');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Uberlândia','MG',-18.9113,-48.2622,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Palmas','TO',-10.2128,-48.3603,'Cerrado');
INSERT INTO TB_REGIAO(nm_regiao, ds_estado, nr_latitude, nr_longitude, ds_bioma) VALUES('Santarém','PA',-2.4426,-54.7082,'Amazônia');

-- TB_USUARIO (5 registros)
INSERT INTO TB_USUARIO(nm_usuario, ds_email, ds_senha, ds_perfil) VALUES('Admin AgroSat','admin@agrosat.com.br','hash_admin_123','ADMIN');
INSERT INTO TB_USUARIO(nm_usuario, ds_email, ds_senha, ds_perfil) VALUES('João Silva','joao@fazendasilva.com.br','hash_joao_123','PRODUTOR');
INSERT INTO TB_USUARIO(nm_usuario, ds_email, ds_senha, ds_perfil) VALUES('Maria Souza','maria@agrosouza.com.br','hash_maria_123','PRODUTOR');
INSERT INTO TB_USUARIO(nm_usuario, ds_email, ds_senha, ds_perfil) VALUES('Carlos Gestor','carlos@gestaoagro.com.br','hash_carlos_123','GESTOR');
INSERT INTO TB_USUARIO(nm_usuario, ds_email, ds_senha, ds_perfil) VALUES('Ana Produtora','ana@fazendaana.com.br','hash_ana_123','PRODUTOR');

-- TB_REGIAO_USUARIO (8 registros)
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(1,2);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(2,2);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(3,3);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(4,3);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(5,4);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(6,4);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(7,5);
INSERT INTO TB_REGIAO_USUARIO(id_regiao, id_usuario) VALUES(8,5);

-- TB_LEITURA_SATELITAL (10 registros)
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(1,2,0.72,28.5,12.3,65.0,3,21.4);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(2,2,0.45,32.1,0.0,42.0,15,24.8);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(3,2,0.21,35.8,0.0,28.0,30,26.1);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(4,2,0.68,27.3,18.5,72.0,1,19.2);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(5,2,0.55,30.2,5.2,55.0,7,22.7);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(6,4,0.78,22.1,35.0,80.0,0,15.3);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(7,4,0.82,20.5,42.0,85.0,0,14.1);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(8,2,0.38,33.4,0.0,35.0,22,25.5);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(9,3,0.61,29.8,8.7,60.0,5,23.1);
INSERT INTO TB_LEITURA_SATELITAL(id_regiao, id_fonte, nr_ndvi, nr_temperatura, nr_precipitacao, nr_umidade, nr_dias_sem_chuva, nr_radiacao_solar) VALUES(10,5,0.75,26.4,22.1,75.0,2,18.9);

-- TB_PREVISAO (10 registros)
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(1,'SAUDAVEL',18.5,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(2,'EM_ESTRESSE',55.2,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(3,'CRITICO',88.7,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(4,'SAUDAVEL',12.3,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(5,'EM_ESTRESSE',42.8,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(6,'SAUDAVEL',8.1,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(7,'SAUDAVEL',5.4,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(8,'CRITICO',79.3,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(9,'EM_ESTRESSE',38.6,'RandomForestClassifier_v1');
INSERT INTO TB_PREVISAO(id_leitura, ds_status_vegetacao, nr_risco_hidrico, ds_modelo_usado) VALUES(10,'SAUDAVEL',22.1,'RandomForestClassifier_v1');

-- TB_ALERTA (7 registros)
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(3,3,'CRITICO','Região em estado crítico! NDVI 0.21, 30 dias sem chuva. Risco hídrico 88.7%.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(8,8,'ALTO','Risco hídrico elevado em Uberlândia. NDVI 0.38, 22 dias sem chuva.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(2,2,'MEDIO','Vegetação em estresse em Lucas do Rio Verde. Monitorar nos próximos dias.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(5,5,'MEDIO','Risco moderado em Rio Verde. Precipitação abaixo do esperado.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(9,9,'MEDIO','Estresse hídrico identificado em Palmas. Atenção recomendada.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(1,1,'BAIXO','Monitoramento normal em Sorriso. Condições favoráveis.');
INSERT INTO TB_ALERTA(id_previsao, id_regiao, ds_nivel, ds_mensagem) VALUES(10,10,'BAIXO','Santarém com boa cobertura vegetal. Sem riscos identificados.');

-- TB_HISTORICO_ALERTA (7 registros)
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(1,2,'VISUALIZADO','Alerta visualizado pelo produtor responsável');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(1,4,'RECONHECIDO','Gestor reconheceu situação crítica em Rondonópolis');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(2,3,'VISUALIZADO','Produtora visualizou alerta de Uberlândia');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(3,2,'RECONHECIDO','Estresse identificado em Lucas do Rio Verde');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(4,4,'RESOLVIDO','Irrigação iniciada na região de Rio Verde');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(5,5,'VISUALIZADO','Alerta de Palmas visualizado');
INSERT INTO TB_HISTORICO_ALERTA(id_alerta, id_usuario, ds_acao, ds_observacao) VALUES(6,2,'IGNORADO','Nível baixo, sem necessidade de ação imediata');

COMMIT;

--Criando os Relátorios --
SELECT r.nm_regiao, r.ds_estado, r.ds_bioma FROM TB_REGIAO r ORDER BY r.ds_estado;

SELECT r.nm_regiao, p.nr_risco_hidrico, p.ds_status_vegetacao
FROM TB_REGIAO r
JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
JOIN TB_PREVISAO p ON l.id_leitura = p.id_leitura
WHERE p.nr_risco_hidrico > 50
ORDER BY p.nr_risco_hidrico DESC;

SELECT r.ds_estado, ROUND(AVG(l.nr_ndvi),4) AS media_ndvi, COUNT(*) AS total_leituras
FROM TB_REGIAO r
JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
GROUP BY r.ds_estado
ORDER BY media_ndvi;

SELECT ds_nivel, COUNT(*) AS total_alertas
FROM TB_ALERTA
GROUP BY ds_nivel
ORDER BY total_alertas DESC;

SELECT r.nm_regiao, r.ds_estado, l.nr_ndvi, l.nr_dias_sem_chuva, p.nr_risco_hidrico
FROM TB_REGIAO r
JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
JOIN TB_PREVISAO p ON l.id_leitura = p.id_leitura
WHERE p.ds_status_vegetacao = 'CRITICO'
ORDER BY p.nr_risco_hidrico DESC;

SELECT MAX(nr_temperatura) AS maior_temp, MIN(nr_temperatura) AS menor_temp, ROUND(AVG(nr_temperatura),2) AS media_temp
FROM TB_LEITURA_SATELITAL;

SELECT u.nm_usuario, u.ds_perfil, COUNT(ru.id_regiao) AS total_regioes
FROM TB_USUARIO u
JOIN TB_REGIAO_USUARIO ru ON u.id_usuario = ru.id_usuario
GROUP BY u.nm_usuario, u.ds_perfil
ORDER BY total_regioes DESC;

SELECT a.ds_nivel, r.nm_regiao, a.ds_mensagem, a.dt_alerta
FROM TB_ALERTA a
JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
WHERE a.fl_resolvido = 'N'
ORDER BY a.dt_alerta DESC;

SELECT r.nm_regiao, SUM(l.nr_precipitacao) AS total_precipitacao, ROUND(AVG(l.nr_umidade),2) AS media_umidade
FROM TB_REGIAO r
JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
GROUP BY r.nm_regiao
ORDER BY total_precipitacao;

SELECT r.nm_regiao, r.ds_estado
FROM TB_REGIAO r
WHERE r.id_regiao NOT IN (
    SELECT DISTINCT id_regiao FROM TB_ALERTA WHERE ds_nivel = 'CRITICO'
)
ORDER BY r.ds_estado;

SELECT r.nm_regiao, r.ds_estado, l.nr_ndvi, l.nr_temperatura, l.nr_dias_sem_chuva, p.ds_status_vegetacao, p.nr_risco_hidrico
FROM TB_REGIAO r
INNER JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
INNER JOIN TB_PREVISAO p ON l.id_leitura = p.id_leitura
ORDER BY p.nr_risco_hidrico DESC;

SELECT r.nm_regiao, a.ds_nivel, a.ds_mensagem, p.ds_status_vegetacao, p.nr_risco_hidrico, a.fl_resolvido
FROM TB_ALERTA a
INNER JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
INNER JOIN TB_PREVISAO p ON a.id_previsao = p.id_previsao
ORDER BY a.ds_nivel;

SELECT r.nm_regiao, r.ds_estado, r.ds_bioma
FROM TB_REGIAO r
LEFT JOIN TB_LEITURA_SATELITAL l ON r.id_regiao = l.id_regiao
WHERE l.id_leitura IS NULL;

SELECT u.nm_usuario, u.ds_email, u.ds_perfil
FROM TB_USUARIO u
LEFT JOIN TB_REGIAO_USUARIO ru ON u.id_usuario = ru.id_usuario
WHERE ru.id_regiao_usuario IS NULL;

SELECT a.id_alerta, a.ds_nivel, a.ds_mensagem, r.nm_regiao
FROM TB_HISTORICO_ALERTA h
RIGHT JOIN TB_ALERTA a ON h.id_alerta = a.id_alerta
INNER JOIN TB_REGIAO r ON a.id_regiao = r.id_regiao
WHERE h.id_historico IS NULL;