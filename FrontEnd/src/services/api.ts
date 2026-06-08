import type {
  RegiaoComPrevisao,
  AlertaDetalhado,
  Previsao,
  EstatisticasDashboard,
  Regiao,
  LeituraSatelital,
  Alerta,
  Usuario,
  FonteSatelital,
} from "../types";
import {
  mockRegioesComPrevisao,
  mockAlertasDetalhados,
  mockPrevisoes,
  mockEstatisticas,
  mockFontes,
} from "../data/mockData";

const JAVA =
  import.meta.env.VITE_JAVA_API_URL ||
  "https://global-solution-2026.onrender.com";
const FLASK =
  import.meta.env.VITE_FLASK_API_URL || "https://gs-ia.onrender.com";

// ── Mappers camelCase (Jackson/Java) → snake_case (TypeScript) ──────────────
function mapRegiao(r: any): Regiao {
  return {
    id_regiao: r.idRegiao ?? r.id_regiao,
    nm_regiao: r.nmRegiao ?? r.nm_regiao ?? "",
    ds_estado: r.dsEstado ?? r.ds_estado ?? "",
    nr_latitude: r.nrLatitude ?? r.nr_latitude ?? 0,
    nr_longitude: r.nrLongitude ?? r.nr_longitude ?? 0,
    ds_bioma: r.dsBioma ?? r.ds_bioma ?? "",
    dt_cadastro: r.dtCadastro ?? r.dt_cadastro ?? "",
  };
}
function mapLeitura(l: any): LeituraSatelital {
  return {
    id_leitura: l.idLeitura ?? l.id_leitura,
    id_regiao: l.idRegiao ?? l.id_regiao,
    id_fonte: l.idFonte ?? l.id_fonte ?? 2,
    nr_ndvi: l.nrNdvi ?? l.nr_ndvi ?? 0,
    nr_temperatura: l.nrTemperatura ?? l.nr_temperatura ?? 0,
    nr_precipitacao: l.nrPrecipitacao ?? l.nr_precipitacao ?? 0,
    nr_umidade: l.nrUmidade ?? l.nr_umidade ?? 50,
    nr_dias_sem_chuva: l.nrDiasSemChuva ?? l.nr_dias_sem_chuva ?? 0,
    nr_radiacao_solar: l.nrRadiacaoSolar ?? l.nr_radiacao_solar ?? 20,
    dt_leitura: l.dtLeitura ?? l.dt_leitura ?? "",
  };
}
function mapPrevisao(p: any): Previsao {
  return {
    id_previsao: p.idPrevisao ?? p.id_previsao,
    id_leitura: p.idLeitura ?? p.id_leitura,
    ds_status_vegetacao:
      p.dsStatusVegetacao ?? p.ds_status_vegetacao ?? "SAUDAVEL",
    nr_risco_hidrico: p.nrRiscoHidrico ?? p.nr_risco_hidrico ?? 0,
    ds_modelo_usado: p.dsModeloUsado ?? p.ds_modelo_usado ?? "RandomForest_v1",
    dt_previsao: p.dtPrevisao ?? p.dt_previsao ?? "",
  };
}
function mapAlerta(a: any): Alerta {
  return {
    id_alerta: a.idAlerta ?? a.id_alerta,
    id_previsao: a.idPrevisao ?? a.id_previsao ?? 0,
    id_regiao: a.idRegiao ?? a.id_regiao,
    ds_nivel: a.dsNivel ?? a.ds_nivel ?? "BAIXO",
    ds_mensagem: a.dsMensagem ?? a.ds_mensagem ?? "",
    fl_resolvido: a.flResolvido ?? a.fl_resolvido ?? "N",
    dt_alerta: a.dtAlerta ?? a.dt_alerta ?? "",
  };
}
function mapUsuario(u: any): Usuario {
  return {
    id_usuario: u.idUsuario ?? u.id_usuario,
    nm_usuario: u.nmUsuario ?? u.nm_usuario ?? "",
    ds_email: u.dsEmail ?? u.ds_email ?? "",
    ds_perfil: u.dsPerfil ?? u.ds_perfil ?? "PRODUTOR",
    dt_cadastro: u.dtCadastro ?? u.dt_cadastro ?? "",
  };
}
function mapFonte(f: any): FonteSatelital {
  return {
    id_fonte: f.idFonte ?? f.id_fonte,
    nm_fonte: f.nmFonte ?? f.nm_fonte ?? "",
    ds_url: f.dsUrl ?? f.ds_url ?? "",
    ds_tipo_dado: f.dsTipoDado ?? f.ds_tipo_dado ?? "NDVI",
    ds_descricao: f.dsDescricao ?? f.ds_descricao ?? "",
    dt_cadastro: f.dtCadastro ?? f.dt_cadastro ?? "",
  };
}

// ── HTTP helpers ─────────────────────────────────────────────────────────────
const hdrs = { "Content-Type": "application/json" };

async function javaGet(path: string): Promise<any> {
  const r = await fetch(`${JAVA}${path}`);
  if (!r.ok) throw new Error(`${r.status} ${path}`);
  return r.json();
}
async function javaPost(path: string, body: unknown = {}): Promise<any> {
  const r = await fetch(`${JAVA}${path}`, {
    method: "POST",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${r.status} ${path}`);
  return r.json();
}
async function javaPut(path: string, body: unknown = {}): Promise<any> {
  const r = await fetch(`${JAVA}${path}`, {
    method: "PUT",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT ${r.status} ${path}`);
  return r.json();
}
async function javaDelete(path: string): Promise<void> {
  await fetch(`${JAVA}${path}`, { method: "DELETE" });
}
async function flaskPost(path: string, body: unknown): Promise<any> {
  const r = await fetch(`${FLASK}${path}`, {
    method: "POST",
    headers: hdrs,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Flask ${r.status}`);
  return r.json();
}

// Fonte padrão para quando a leitura não tiver fonte mapeada
const fontePadrao: FonteSatelital = mockFontes[1] ?? {
  id_fonte: 2,
  nm_fonte: "NASA POWER",
  ds_url: "https://power.larc.nasa.gov/api",
  ds_tipo_dado: "RADIACAO",
  ds_descricao: "Temperatura e radiação solar",
  dt_cadastro: "",
};
const prevPadrao: Previsao = {
  id_previsao: 0,
  id_leitura: 0,
  ds_status_vegetacao: "SAUDAVEL",
  nr_risco_hidrico: 0,
  ds_modelo_usado: "RandomForest_v1",
  dt_previsao: "",
};

// ── Java API ──────────────────────────────────────────────────────────────────
export const javaApi = {
  // GET /regioes + leituras + previsoes + fontes → RegiaoComPrevisao[]
  getRegioes: async (): Promise<RegiaoComPrevisao[]> => {
    try {
      const [regRaw, leitRaw, prevRaw, fontesRaw] = await Promise.all([
        javaGet("/regioes"),
        javaGet("/leituras"),
        javaGet("/previsoes"),
        javaGet("/fontes"),
      ]);
      const leituras = ((leitRaw as any[]) ?? []).map(mapLeitura);
      const previsoes = ((prevRaw as any[]) ?? []).map(mapPrevisao);
      const fontes = ((fontesRaw as any[]) ?? []).map(mapFonte);

      return ((regRaw as any[]) ?? []).map((r: any): RegiaoComPrevisao => {
        const reg = mapRegiao(r);
        const leitura =
          leituras.find((l) => l.id_regiao === reg.id_regiao) ??
          mockRegioesComPrevisao[0].leitura;
        const previsao =
          previsoes.find((p) => p.id_leitura === leitura.id_leitura) ??
          prevPadrao;
        const fonte =
          fontes.find((f) => f.id_fonte === leitura.id_fonte) ?? fontePadrao;
        return { ...reg, leitura, previsao, fonte };
      });
    } catch {
      return mockRegioesComPrevisao;
    }
  },

  // GET /regioes/{id} + leituras + previsoes + fontes
  getRegiao: async (id: number): Promise<RegiaoComPrevisao> => {
    try {
      const [r, leitRaw, prevRaw, fontesRaw] = await Promise.all([
        javaGet(`/regioes/${id}`),
        javaGet(`/leituras/regiao/${id}`),
        javaGet(`/previsoes/regiao/${id}`),
        javaGet("/fontes"),
      ]);
      const leituras = ((leitRaw as any[]) ?? []).map(mapLeitura);
      const previsoes = ((prevRaw as any[]) ?? []).map(mapPrevisao);
      const fontes = ((fontesRaw as any[]) ?? []).map(mapFonte);
      const leitura = leituras[0] ?? mockRegioesComPrevisao[0].leitura;
      const previsao = previsoes[0] ?? prevPadrao;
      const fonte =
        fontes.find((f) => f.id_fonte === leitura.id_fonte) ?? fontePadrao;
      return { ...mapRegiao(r), leitura, previsao, fonte };
    } catch {
      return (
        mockRegioesComPrevisao.find((r) => r.id_regiao === id) ??
        mockRegioesComPrevisao[0]
      );
    }
  },

  // POST /regioes/buscar-por-cidade — coordenadas e bioma automáticos
  criarRegiao: async (nmCidade: string, dsEstado: string): Promise<Regiao> =>
    mapRegiao(
      await javaPost("/regioes/buscar-por-cidade", { nmCidade, dsEstado }),
    ),

  deletarRegiao: async (id: number): Promise<void> =>
    javaDelete(`/regioes/${id}`),

  // GET /alertas + previsoes → AlertaDetalhado[]
  getAlertas: async (): Promise<AlertaDetalhado[]> => {
    try {
      const [alertRaw, prevRaw] = await Promise.all([
        javaGet("/alertas"),
        javaGet("/previsoes"),
      ]);
      const previsoes = ((prevRaw as any[]) ?? []).map(mapPrevisao);
      return ((alertRaw as any[]) ?? []).map((a: any): AlertaDetalhado => {
        const alerta = mapAlerta(a);
        const previsao =
          previsoes.find((p) => p.id_previsao === alerta.id_previsao) ??
          prevPadrao;
        const regiao: Regiao = {
          id_regiao: alerta.id_regiao,
          nm_regiao: a.nmRegiao ?? a.nm_regiao ?? "",
          ds_estado: a.dsEstado ?? a.ds_estado ?? "",
          nr_latitude: 0,
          nr_longitude: 0,
          ds_bioma: "",
          dt_cadastro: "",
        };
        return { ...alerta, regiao, previsao, historico: [] };
      });
    } catch {
      return mockAlertasDetalhados;
    }
  },

  // PUT /alertas/{id}/resolver
  resolverAlerta: async (id: number): Promise<void> => {
    await javaPut(`/alertas/${id}/resolver`);
  },

  getPrevisoes: async (id: number): Promise<Previsao[]> => {
    try {
      return ((await javaGet(`/previsoes/regiao/${id}`)) as any[]).map(
        mapPrevisao,
      );
    } catch {
      return mockPrevisoes.filter(
        (p) =>
          mockRegioesComPrevisao.find((r) => r.id_regiao === id)?.leitura
            .id_leitura === p.id_leitura,
      );
    }
  },

  deletarLeitura: async (id: number): Promise<void> =>
    javaDelete(`/leituras/${id}`),

  // Estatísticas calculadas localmente (Java não tem esse endpoint)
  getEstatisticas: async (): Promise<EstatisticasDashboard> => {
    try {
      const [regRaw, alertRaw, leitRaw, prevRaw] = await Promise.all([
        javaGet("/regioes"),
        javaGet("/alertas/pendentes"),
        javaGet("/leituras"),
        javaGet("/previsoes"),
      ]);
      const leituras = ((leitRaw as any[]) ?? []).map(mapLeitura);
      const previsoes = ((prevRaw as any[]) ?? []).map(mapPrevisao);
      const regioes = ((regRaw as any[]) ?? []).map(mapRegiao);

      const leiU = regioes
        .map((r) => leituras.find((l) => l.id_regiao === r.id_regiao))
        .filter(Boolean) as LeituraSatelital[];
      const prevU = leiU
        .map((l) => previsoes.find((p) => p.id_leitura === l.id_leitura))
        .filter(Boolean) as Previsao[];

      const temps = leiU.map((l) => l.nr_temperatura).filter((t) => t > 0);
      const ndvis = leiU.map((l) => l.nr_ndvi).filter((n) => n > 0);
      const criticas = prevU.filter(
        (p) => p.ds_status_vegetacao === "CRITICO" || p.nr_risco_hidrico >= 70,
      ).length;

      return {
        total_regioes: regioes.length,
        alertas_ativos: ((alertRaw as any[]) ?? []).length,
        media_ndvi: ndvis.length
          ? +(ndvis.reduce((s, v) => s + v, 0) / ndvis.length).toFixed(3)
          : 0,
        regioes_criticas: criticas,
        maior_temp: temps.length ? +Math.max(...temps).toFixed(1) : 0,
        menor_temp: temps.length ? +Math.min(...temps).toFixed(1) : 0,
        media_temp: temps.length
          ? +(temps.reduce((s, v) => s + v, 0) / temps.length).toFixed(1)
          : 0,
      };
    } catch {
      return mockEstatisticas;
    }
  },

  // Usuários CRUD
  getUsuarios: async (): Promise<Usuario[]> => {
    try {
      return ((await javaGet("/usuarios")) as any[]).map(mapUsuario);
    } catch {
      return [];
    }
  },
  criarUsuario: async (u: {
    nmUsuario: string;
    dsEmail: string;
    dsSenha: string;
    dsPerfil: string;
  }): Promise<Usuario> => mapUsuario(await javaPost("/usuarios", u)),
  atualizarUsuario: async (
    id: number,
    u: { nmUsuario: string; dsEmail: string; dsPerfil: string },
  ): Promise<Usuario> => mapUsuario(await javaPut(`/usuarios/${id}`, u)),
  deletarUsuario: async (id: number): Promise<void> =>
    javaDelete(`/usuarios/${id}`),

  // Fontes Satelitais
  getFontes: async (): Promise<FonteSatelital[]> => {
    try {
      return ((await javaGet("/fontes")) as any[]).map(mapFonte);
    } catch {
      return mockFontes;
    }
  },

  // Regiões × Usuários
  getVinculosPorUsuario: async (idUsuario: number) => {
    try {
      return (await javaGet(`/regioes-usuarios/usuario/${idUsuario}`)) ?? [];
    } catch {
      return [];
    }
  },
  vincular: async (idRegiao: number, idUsuario: number) =>
    javaPost("/regioes-usuarios", { idRegiao, idUsuario }),
  desvincular: async (id: number): Promise<void> =>
    javaDelete(`/regioes-usuarios/${id}`),
};

// ── Flask IA ──────────────────────────────────────────────────────────────────
export const flaskApi = {
  health: () =>
    fetch(`${FLASK}/health`)
      .then((r) => r.json())
      .catch(() => ({ status: "offline" })),

  predictVegetacao: (d: object) =>
    flaskPost("/predict/completo", d).catch(() => ({
      status_vegetacao: "SAUDAVEL",
      confianca: 0.94,
      risco_hidrico: 18.5,
    })),

  predictRisco: (d: object) =>
    flaskPost("/predict/completo", d).catch(() => ({ risco_hidrico: 18.5 })),

  // Aciona coleta automática via Java API
  monitorar: (id: number) =>
    javaPost(`/leituras/automatico/${id}`).catch(() => ({
      message: "Coleta iniciada",
    })),

  getPrevisoes: (id: number) => javaApi.getPrevisoes(id),
  getAlertas: () => javaApi.getAlertas(),
};

// ── Health check e keep-alive ─────────────────────────────────────────────────
export async function checkJavaHealth(): Promise<boolean> {
  try {
    const h = await fetch(`${JAVA}/health`).then((r) => r.json());
    return h?.status === "ok";
  } catch {
    return false;
  }
}

// Ping a cada 14 minutos para evitar hibernação do Render
export function startKeepAlive(): () => void {
  const id = setInterval(
    () => {
      fetch(`${JAVA}/health`).catch(() => {});
      fetch(`${FLASK}/health`).catch(() => {});
    },
    14 * 60 * 1000,
  );
  return () => clearInterval(id);
}
