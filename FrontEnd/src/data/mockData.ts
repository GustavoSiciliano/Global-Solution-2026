import type {
  FonteSatelital,
  Regiao,
  Usuario,
  LeituraSatelital,
  Previsao,
  Alerta,
  HistoricoAlerta,
  RegiaoComPrevisao,
  AlertaDetalhado,
  EstatisticasDashboard,
  Integrante,
} from "../types";

// ─── TB_FONTE_SATELITAL ───────────────────────────────────────────────────────
export const mockFontes: FonteSatelital[] = [
  {
    id_fonte: 1,
    nm_fonte: "NASA FIRMS",
    ds_url: "https://firms.modaps.eosdis.nasa.gov/api",
    ds_tipo_dado: "QUEIMADA",
    ds_descricao: "Focos de calor e queimadas em tempo real",
    dt_cadastro: "2026-01-10",
  },
  {
    id_fonte: 2,
    nm_fonte: "NASA EarthData",
    ds_url: "https://earthdata.nasa.gov",
    ds_tipo_dado: "NDVI",
    ds_descricao: "Imagens satelitais e índice NDVI",
    dt_cadastro: "2026-01-10",
  },
  {
    id_fonte: 3,
    nm_fonte: "NASA POWER",
    ds_url: "https://power.larc.nasa.gov/api",
    ds_tipo_dado: "RADIACAO",
    ds_descricao: "Temperatura e radiação solar",
    dt_cadastro: "2026-01-10",
  },
  {
    id_fonte: 4,
    nm_fonte: "Open-Meteo",
    ds_url: "https://api.open-meteo.com",
    ds_tipo_dado: "CLIMA",
    ds_descricao: "Precipitação e umidade gratuita",
    dt_cadastro: "2026-01-10",
  },
  {
    id_fonte: 5,
    nm_fonte: "INPE TerraBrasilis",
    ds_url: "https://terrabrasilis.dpi.inpe.br",
    ds_tipo_dado: "DESMATAMENTO",
    ds_descricao: "Desmatamento e uso do solo",
    dt_cadastro: "2026-01-10",
  },
  {
    id_fonte: 6,
    nm_fonte: "Copernicus ESA",
    ds_url: "https://land.copernicus.eu",
    ds_tipo_dado: "SOLO",
    ds_descricao: "Dados climáticos e de solo",
    dt_cadastro: "2026-01-10",
  },
];

// ─── TB_REGIAO ────────────────────────────────────────────────────────────────
export const mockRegioes: Regiao[] = [
  {
    id_regiao: 1,
    nm_regiao: "Sorriso",
    ds_estado: "MT",
    nr_latitude: -12.5442,
    nr_longitude: -55.7214,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 2,
    nm_regiao: "Lucas do Rio Verde",
    ds_estado: "MT",
    nr_latitude: -13.0569,
    nr_longitude: -55.9131,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 3,
    nm_regiao: "Rondonópolis",
    ds_estado: "MT",
    nr_latitude: -16.47,
    nr_longitude: -54.6358,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 4,
    nm_regiao: "Barreiras",
    ds_estado: "BA",
    nr_latitude: -12.1521,
    nr_longitude: -44.9937,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 5,
    nm_regiao: "Rio Verde",
    ds_estado: "GO",
    nr_latitude: -17.7969,
    nr_longitude: -50.9278,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 6,
    nm_regiao: "Cascavel",
    ds_estado: "PR",
    nr_latitude: -24.9578,
    nr_longitude: -53.4595,
    ds_bioma: "Mata Atlântica",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 7,
    nm_regiao: "Passo Fundo",
    ds_estado: "RS",
    nr_latitude: -28.2622,
    nr_longitude: -52.4083,
    ds_bioma: "Pampa",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 8,
    nm_regiao: "Uberlândia",
    ds_estado: "MG",
    nr_latitude: -18.9113,
    nr_longitude: -48.2622,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 9,
    nm_regiao: "Palmas",
    ds_estado: "TO",
    nr_latitude: -10.2128,
    nr_longitude: -48.3603,
    ds_bioma: "Cerrado",
    dt_cadastro: "2026-01-15",
  },
  {
    id_regiao: 10,
    nm_regiao: "Santarém",
    ds_estado: "PA",
    nr_latitude: -2.4426,
    nr_longitude: -54.7082,
    ds_bioma: "Amazônia",
    dt_cadastro: "2026-01-15",
  },
];

// ─── TB_USUARIO ───────────────────────────────────────────────────────────────
export const mockUsuarios: Usuario[] = [
  {
    id_usuario: 1,
    nm_usuario: "Admin AgroSat",
    ds_email: "admin@agrosat.com.br",
    ds_perfil: "ADMIN",
    dt_cadastro: "2026-01-01",
  },
  {
    id_usuario: 2,
    nm_usuario: "João Silva",
    ds_email: "joao@fazendasilva.com.br",
    ds_perfil: "PRODUTOR",
    dt_cadastro: "2026-01-20",
  },
  {
    id_usuario: 3,
    nm_usuario: "Maria Souza",
    ds_email: "maria@agrosouza.com.br",
    ds_perfil: "PRODUTOR",
    dt_cadastro: "2026-01-22",
  },
  {
    id_usuario: 4,
    nm_usuario: "Carlos Gestor",
    ds_email: "carlos@gestaoagro.com.br",
    ds_perfil: "GESTOR",
    dt_cadastro: "2026-01-25",
  },
  {
    id_usuario: 5,
    nm_usuario: "Ana Produtora",
    ds_email: "ana@fazendaana.com.br",
    ds_perfil: "PRODUTOR",
    dt_cadastro: "2026-02-01",
  },
];

// ─── TB_LEITURA_SATELITAL ─────────────────────────────────────────────────────
export const mockLeituras: LeituraSatelital[] = [
  {
    id_leitura: 1,
    id_regiao: 1,
    id_fonte: 2,
    nr_ndvi: 0.72,
    nr_temperatura: 28.5,
    nr_precipitacao: 12.3,
    nr_umidade: 65.0,
    nr_dias_sem_chuva: 3,
    nr_radiacao_solar: 21.4,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 2,
    id_regiao: 2,
    id_fonte: 2,
    nr_ndvi: 0.45,
    nr_temperatura: 32.1,
    nr_precipitacao: 0.0,
    nr_umidade: 42.0,
    nr_dias_sem_chuva: 15,
    nr_radiacao_solar: 24.8,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 3,
    id_regiao: 3,
    id_fonte: 2,
    nr_ndvi: 0.21,
    nr_temperatura: 35.8,
    nr_precipitacao: 0.0,
    nr_umidade: 28.0,
    nr_dias_sem_chuva: 30,
    nr_radiacao_solar: 26.1,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 4,
    id_regiao: 4,
    id_fonte: 2,
    nr_ndvi: 0.68,
    nr_temperatura: 27.3,
    nr_precipitacao: 18.5,
    nr_umidade: 72.0,
    nr_dias_sem_chuva: 1,
    nr_radiacao_solar: 19.2,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 5,
    id_regiao: 5,
    id_fonte: 2,
    nr_ndvi: 0.55,
    nr_temperatura: 30.2,
    nr_precipitacao: 5.2,
    nr_umidade: 55.0,
    nr_dias_sem_chuva: 7,
    nr_radiacao_solar: 22.7,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 6,
    id_regiao: 6,
    id_fonte: 4,
    nr_ndvi: 0.78,
    nr_temperatura: 22.1,
    nr_precipitacao: 35.0,
    nr_umidade: 80.0,
    nr_dias_sem_chuva: 0,
    nr_radiacao_solar: 15.3,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 7,
    id_regiao: 7,
    id_fonte: 4,
    nr_ndvi: 0.82,
    nr_temperatura: 20.5,
    nr_precipitacao: 42.0,
    nr_umidade: 85.0,
    nr_dias_sem_chuva: 0,
    nr_radiacao_solar: 14.1,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 8,
    id_regiao: 8,
    id_fonte: 2,
    nr_ndvi: 0.38,
    nr_temperatura: 33.4,
    nr_precipitacao: 0.0,
    nr_umidade: 35.0,
    nr_dias_sem_chuva: 22,
    nr_radiacao_solar: 25.5,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 9,
    id_regiao: 9,
    id_fonte: 3,
    nr_ndvi: 0.61,
    nr_temperatura: 29.8,
    nr_precipitacao: 8.7,
    nr_umidade: 60.0,
    nr_dias_sem_chuva: 5,
    nr_radiacao_solar: 23.1,
    dt_leitura: "2026-06-01",
  },
  {
    id_leitura: 10,
    id_regiao: 10,
    id_fonte: 5,
    nr_ndvi: 0.75,
    nr_temperatura: 26.4,
    nr_precipitacao: 22.1,
    nr_umidade: 75.0,
    nr_dias_sem_chuva: 2,
    nr_radiacao_solar: 18.9,
    dt_leitura: "2026-06-01",
  },
];

// ─── TB_PREVISAO ──────────────────────────────────────────────────────────────
export const mockPrevisoes: Previsao[] = [
  {
    id_previsao: 1,
    id_leitura: 1,
    ds_status_vegetacao: "SAUDAVEL",
    nr_risco_hidrico: 18.5,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 2,
    id_leitura: 2,
    ds_status_vegetacao: "EM_ESTRESSE",
    nr_risco_hidrico: 55.2,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 3,
    id_leitura: 3,
    ds_status_vegetacao: "CRITICO",
    nr_risco_hidrico: 88.7,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 4,
    id_leitura: 4,
    ds_status_vegetacao: "SAUDAVEL",
    nr_risco_hidrico: 12.3,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 5,
    id_leitura: 5,
    ds_status_vegetacao: "EM_ESTRESSE",
    nr_risco_hidrico: 42.8,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 6,
    id_leitura: 6,
    ds_status_vegetacao: "SAUDAVEL",
    nr_risco_hidrico: 8.1,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 7,
    id_leitura: 7,
    ds_status_vegetacao: "SAUDAVEL",
    nr_risco_hidrico: 5.4,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 8,
    id_leitura: 8,
    ds_status_vegetacao: "CRITICO",
    nr_risco_hidrico: 79.3,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 9,
    id_leitura: 9,
    ds_status_vegetacao: "EM_ESTRESSE",
    nr_risco_hidrico: 38.6,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
  {
    id_previsao: 10,
    id_leitura: 10,
    ds_status_vegetacao: "SAUDAVEL",
    nr_risco_hidrico: 22.1,
    ds_modelo_usado: "RandomForestClassifier_v1",
    dt_previsao: "2026-06-01",
  },
];

// ─── TB_ALERTA ────────────────────────────────────────────────────────────────
export const mockAlertas: Alerta[] = [
  {
    id_alerta: 1,
    id_previsao: 3,
    id_regiao: 3,
    ds_nivel: "CRITICO",
    ds_mensagem:
      "Região em estado crítico! NDVI 0.21, 30 dias sem chuva. Risco hídrico 88.7%.",
    fl_resolvido: "N",
    dt_alerta: "2026-06-01",
  },
  {
    id_alerta: 2,
    id_previsao: 8,
    id_regiao: 8,
    ds_nivel: "ALTO",
    ds_mensagem:
      "Risco hídrico elevado em Uberlândia. NDVI 0.38, 22 dias sem chuva.",
    fl_resolvido: "N",
    dt_alerta: "2026-06-01",
  },
  {
    id_alerta: 3,
    id_previsao: 2,
    id_regiao: 2,
    ds_nivel: "MEDIO",
    ds_mensagem:
      "Vegetação em estresse em Lucas do Rio Verde. Monitorar nos próximos dias.",
    fl_resolvido: "N",
    dt_alerta: "2026-06-01",
  },
  {
    id_alerta: 4,
    id_previsao: 5,
    id_regiao: 5,
    ds_nivel: "MEDIO",
    ds_mensagem:
      "Risco moderado em Rio Verde. Precipitação abaixo do esperado.",
    fl_resolvido: "S",
    dt_alerta: "2026-05-31",
  },
  {
    id_alerta: 5,
    id_previsao: 9,
    id_regiao: 9,
    ds_nivel: "MEDIO",
    ds_mensagem:
      "Estresse hídrico identificado em Palmas. Atenção recomendada.",
    fl_resolvido: "N",
    dt_alerta: "2026-05-31",
  },
  {
    id_alerta: 6,
    id_previsao: 1,
    id_regiao: 1,
    ds_nivel: "BAIXO",
    ds_mensagem: "Monitoramento normal em Sorriso. Condições favoráveis.",
    fl_resolvido: "N",
    dt_alerta: "2026-05-30",
  },
  {
    id_alerta: 7,
    id_previsao: 10,
    id_regiao: 10,
    ds_nivel: "BAIXO",
    ds_mensagem:
      "Santarém com boa cobertura vegetal. Sem riscos identificados.",
    fl_resolvido: "N",
    dt_alerta: "2026-05-30",
  },
];

// ─── TB_HISTORICO_ALERTA ──────────────────────────────────────────────────────
export const mockHistorico: HistoricoAlerta[] = [
  {
    id_historico: 1,
    id_alerta: 1,
    id_usuario: 2,
    ds_acao: "VISUALIZADO",
    ds_observacao: "Alerta visualizado pelo produtor responsável",
    dt_acao: "2026-06-01T09:10:00",
  },
  {
    id_historico: 2,
    id_alerta: 1,
    id_usuario: 4,
    ds_acao: "RECONHECIDO",
    ds_observacao: "Gestor reconheceu situação crítica em Rondonópolis",
    dt_acao: "2026-06-01T10:30:00",
  },
  {
    id_historico: 3,
    id_alerta: 2,
    id_usuario: 3,
    ds_acao: "VISUALIZADO",
    ds_observacao: "Produtora visualizou alerta de Uberlândia",
    dt_acao: "2026-06-01T11:00:00",
  },
  {
    id_historico: 4,
    id_alerta: 3,
    id_usuario: 2,
    ds_acao: "RECONHECIDO",
    ds_observacao: "Estresse identificado em Lucas do Rio Verde",
    dt_acao: "2026-06-01T11:45:00",
  },
  {
    id_historico: 5,
    id_alerta: 4,
    id_usuario: 4,
    ds_acao: "RESOLVIDO",
    ds_observacao: "Irrigação iniciada na região de Rio Verde",
    dt_acao: "2026-06-01T13:00:00",
  },
  {
    id_historico: 6,
    id_alerta: 5,
    id_usuario: 5,
    ds_acao: "VISUALIZADO",
    ds_observacao: "Alerta de Palmas visualizado",
    dt_acao: "2026-06-01T14:20:00",
  },
  {
    id_historico: 7,
    id_alerta: 6,
    id_usuario: 2,
    ds_acao: "IGNORADO",
    ds_observacao: "Nível baixo, sem necessidade de ação imediata",
    dt_acao: "2026-06-01T15:00:00",
  },
];

// ─── VIEWS COMPOSTAS ──────────────────────────────────────────────────────────
// Equivalente ao SELECT com JOIN do banco
export const mockRegioesComPrevisao: RegiaoComPrevisao[] = mockRegioes.map(
  (r) => {
    const leitura = mockLeituras.find((l) => l.id_regiao === r.id_regiao)!;
    const previsao = mockPrevisoes.find(
      (p) => p.id_leitura === leitura.id_leitura,
    )!;
    const fonte = mockFontes.find((f) => f.id_fonte === leitura.id_fonte)!;
    return { ...r, leitura, previsao, fonte };
  },
);

export const mockAlertasDetalhados: AlertaDetalhado[] = mockAlertas.map((a) => {
  const regiao = mockRegioes.find((r) => r.id_regiao === a.id_regiao)!;
  const previsao = mockPrevisoes.find((p) => p.id_previsao === a.id_previsao)!;
  const historico = mockHistorico.filter((h) => h.id_alerta === a.id_alerta);
  return { ...a, regiao, previsao, historico };
});

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────
// Espelha os SELECT de relatório do SQL
export const mockEstatisticas: EstatisticasDashboard = {
  total_regioes: mockRegioes.length,
  alertas_ativos: mockAlertas.filter((a) => a.fl_resolvido === "N").length,
  media_ndvi: parseFloat(
    (
      mockLeituras.reduce((s, l) => s + l.nr_ndvi, 0) / mockLeituras.length
    ).toFixed(4),
  ),
  regioes_criticas: mockPrevisoes.filter(
    (p) => p.ds_status_vegetacao === "CRITICO",
  ).length,
  maior_temp: Math.max(...mockLeituras.map((l) => l.nr_temperatura)),
  menor_temp: Math.min(...mockLeituras.map((l) => l.nr_temperatura)),
  media_temp: parseFloat(
    (
      mockLeituras.reduce((s, l) => s + l.nr_temperatura, 0) /
      mockLeituras.length
    ).toFixed(2),
  ),
};

// ─── INTEGRANTES ──────────────────────────────────────────────────────────────
export const mockIntegrantes: Integrante[] = [
  {
    nome: "Gustavo Rodrigues Siciliano",
    rm: "RM568419",
    turma: "1TDS Agosto / 1TDSPS",
    foto: "/foto-siciliano.jpg",
    github: "https://github.com/GustavoSiciliano",
    linkedin: "https://www.linkedin.com/in/gustavo-rodrigues-siciliano",
    papel: "Full-Stack Developer",
  },
  {
    nome: "Gustavo de Jesus Silva",
    rm: "RM567926",
    turma: "1TDS Agosto / 1TDSPS",
    foto: "/foto-gustavo-jesus.jpg",
    github: "https://github.com/GustavoJesusSilva",
    linkedin: "https://www.linkedin.com/in/gustavo-de-jesus-silva",
    papel: "Backend & Database",
  },
  {
    nome: "Samuel Keniti Kina de Lima",
    rm: "RM567614",
    turma: "1TDS Agosto / 1TDSPS",
    foto: "/foto-samuel.jpg",
    github: "https://github.com/SamuelKeniti",
    linkedin: "https://www.linkedin.com/in/samuel-keniti-kina-de-lima",
    papel: "AI & ML Engineer",
  },
];

// ─── FAQ ──────────────────────────────────────────────────────────────────────
export const faqData = [
  {
    q: "O que é o AgroSat?",
    a: "Plataforma web que utiliza dados reais de satélites NASA (FIRMS, EarthData, POWER), INPE TerraBrasilis, Copernicus ESA e Open-Meteo para monitorar a saúde da vegetação agrícola brasileira e prever riscos de seca.",
  },
  {
    q: "Como o índice NDVI é calculado?",
    a: "O NDVI (Normalized Difference Vegetation Index) é calculado a partir de imagens multiespectrais via NASA EarthData usando a fórmula (NIR − RED) / (NIR + RED). Valores acima de 0.6 indicam vegetação saudável; abaixo de 0.3 indicam estresse severo.",
  },
  {
    q: "Quais modelos de IA são usados?",
    a: "Dois modelos RandomForestClassifier: um de classificação que identifica o estado da vegetação (SAUDAVEL / EM_ESTRESSE / CRITICO) e um de regressão que prevê o nível de risco hídrico de 0 a 100 com até 7 dias de antecedência.",
  },
  {
    q: "Com que frequência os dados são atualizados?",
    a: "Os dados satelitais são coletados e processados diariamente. Cada leitura gera uma nova entrada em TB_LEITURA_SATELITAL, que aciona o pipeline de ML e atualiza TB_PREVISAO e TB_ALERTA automaticamente.",
  },
  {
    q: "O que fazer ao receber um alerta CRÍTICO?",
    a: "Alertas críticos indicam risco hídrico acima de 80% e vegetação em estado CRITICO. Alertas são gerados automaticamente quando o risco ≥ 40%. Para CRITICO, recomendamos acionar irrigação de emergência imediatamente. O histórico de ações fica registrado em TB_HISTORICO_ALERTA.",
  },
  {
    q: "Quais os planos disponíveis?",
    a: "Entry (R$ 97/mês — 1 propriedade até 500 ha), Pro (R$ 247/mês — 5 propriedades) e Enterprise (R$ 697/mês — ilimitado com SLA 24/7). Breakeven estimado em 845 assinantes.",
  },
];
