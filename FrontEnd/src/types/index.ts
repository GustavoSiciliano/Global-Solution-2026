// Tabelas do banco Oracle — AgroSat

export interface FonteSatelital {
  id_fonte: number;
  nm_fonte: string;
  ds_url: string;
  ds_tipo_dado:
    | "NDVI"
    | "CLIMA"
    | "QUEIMADA"
    | "DESMATAMENTO"
    | "SOLO"
    | "RADIACAO";
  ds_descricao: string;
  dt_cadastro: string;
}

export interface Regiao {
  id_regiao: number;
  nm_regiao: string;
  ds_estado: string;
  nr_latitude: number;
  nr_longitude: number;
  ds_bioma: string;
  dt_cadastro: string;
}

export interface Usuario {
  id_usuario: number;
  nm_usuario: string;
  ds_email: string;
  ds_perfil: "ADMIN" | "PRODUTOR" | "GESTOR";
  dt_cadastro: string;
}

export interface LeituraSatelital {
  id_leitura: number;
  id_regiao: number;
  id_fonte: number;
  nr_ndvi: number;
  nr_temperatura: number;
  nr_precipitacao: number;
  nr_umidade: number;
  nr_dias_sem_chuva: number;
  nr_radiacao_solar: number;
  dt_leitura: string;
}

export interface Previsao {
  id_previsao: number;
  id_leitura: number;
  ds_status_vegetacao: StatusVegetacao;
  nr_risco_hidrico: number;
  ds_modelo_usado: string;
  dt_previsao: string;
}

export interface Alerta {
  id_alerta: number;
  id_previsao: number;
  id_regiao: number;
  ds_nivel: NivelAlerta;
  ds_mensagem: string;
  fl_resolvido: "S" | "N";
  dt_alerta: string;
}

export interface HistoricoAlerta {
  id_historico: number;
  id_alerta: number;
  id_usuario: number;
  ds_acao: "VISUALIZADO" | "RECONHECIDO" | "RESOLVIDO" | "IGNORADO";
  ds_observacao: string;
  dt_acao: string;
}

// Union Types
export type NivelAlerta = "BAIXO" | "MEDIO" | "ALTO" | "CRITICO";
export type StatusVegetacao = "SAUDAVEL" | "EM_ESTRESSE" | "CRITICO";
export type ApiStatus = "online" | "offline" | "loading";
export type TipoDado =
  | "NDVI"
  | "CLIMA"
  | "QUEIMADA"
  | "DESMATAMENTO"
  | "SOLO"
  | "RADIACAO";

// Intersection Types — views compostas
export type RegiaoComPrevisao = Regiao & {
  leitura: LeituraSatelital;
  previsao: Previsao;
  fonte: FonteSatelital;
};

export type AlertaDetalhado = Alerta & {
  regiao: Regiao;
  previsao: Previsao;
  historico: HistoricoAlerta[];
};

export interface EstatisticasDashboard {
  total_regioes: number;
  alertas_ativos: number;
  media_ndvi: number;
  regioes_criticas: number;
  maior_temp: number;
  menor_temp: number;
  media_temp: number;
}

export interface Integrante {
  nome: string;
  rm: string;
  turma: string;
  foto: string;
  github: string;
  linkedin: string;
  papel: string;
}
