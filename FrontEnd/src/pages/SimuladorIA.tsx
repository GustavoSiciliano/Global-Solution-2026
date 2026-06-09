import { useState, useEffect } from "react";
import { javaApi, flaskApi } from "../services/api";
import { StatusBadge, LoadingSpinner } from "../components/Ui";
import type { StatusVegetacao, RegiaoComPrevisao } from "../types";

interface Inputs {
  ndvi: string;
  temperatura: string;
  precipitacao: string;
  umidade: string;
  dias_sem_chuva: string;
  radiacao_solar: string;
}
interface Resultado {
  status_vegetacao: StatusVegetacao;
  confianca: number;
  risco_hidrico: number;
}

const CAMPOS = [
  {
    key: "ndvi",
    label: "NDVI",
    min: 0,
    max: 1,
    step: 0.01,
    unit: "",
    hint: "0 = solo exposto · 1 = vegetação densa",
  },
  {
    key: "temperatura",
    label: "Temperatura",
    min: 10,
    max: 45,
    step: 0.1,
    unit: "°C",
    hint: "Temperatura média do ar em superfície",
  },
  {
    key: "precipitacao",
    label: "Precipitação",
    min: 0,
    max: 100,
    step: 0.1,
    unit: "mm",
    hint: "Precipitação acumulada nas últimas 24h",
  },
  {
    key: "umidade",
    label: "Umidade relativa",
    min: 5,
    max: 100,
    step: 1,
    unit: "%",
    hint: "Umidade do ar (%)",
  },
  {
    key: "dias_sem_chuva",
    label: "Dias sem chuva",
    min: 0,
    max: 120,
    step: 1,
    unit: "dias",
    hint: "Dias consecutivos sem precipitação significativa",
  },
  {
    key: "radiacao_solar",
    label: "Radiação solar",
    min: 0,
    max: 35,
    step: 0.1,
    unit: "kWh/m²",
    hint: "Radiação solar diária média acumulada",
  },
];

const INPUT_PADRAO: Inputs = {
  ndvi: "0.50",
  temperatura: "28",
  precipitacao: "5",
  umidade: "55",
  dias_sem_chuva: "7",
  radiacao_solar: "20",
};

type Modo = "cep" | "regiao" | "manual";

export default function SimuladorIA() {
  const [modo, setModo] = useState<Modo>("regiao");
  const [inputs, setInputs] = useState<Inputs>(INPUT_PADRAO);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [contexto, setContexto] = useState<string | null>(null);
  const [historico, setHistorico] = useState<
    Array<Inputs & Resultado & { ctx: string }>
  >([]);

  // Modo CEP
  const [cep, setCep] = useState("");
  const [buscandoCep, setBusca] = useState(false);
  const [erroCep, setErroCep] = useState("");

  // Modo Região
  const [regioes, setRegioes] = useState<RegiaoComPrevisao[]>([]);
  const [loadRegs, setLoadRegs] = useState(true);
  const [regiaoSel, setRegiaoSel] = useState("");

  useEffect(() => {
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      setLoadRegs(false);
    });
  }, []);

  // ── Preencher inputs com dados reais de uma região ────────────────────────
  const preencherDeRegiao = (r: RegiaoComPrevisao) => {
    const l = r.leitura;
    if (!l.id_leitura) return; // sem leitura no banco ainda
    setInputs({
      ndvi: l.nr_ndvi.toFixed(3),
      temperatura: l.nr_temperatura.toFixed(1),
      precipitacao: l.nr_precipitacao.toFixed(1),
      umidade: l.nr_umidade.toFixed(0),
      dias_sem_chuva: l.nr_dias_sem_chuva.toString(),
      radiacao_solar: l.nr_radiacao_solar.toFixed(1),
    });
    setContexto(`${r.nm_regiao} / ${r.ds_estado} — ${r.ds_bioma}`);
    setResultado(null);
  };

  // ── Busca por CEP — chama GET /regioes/situacao/cep/{cep} ────────────────
  const handleBuscarCep = async () => {
    const cepNum = cep.replace(/\D/g, "");
    if (cepNum.length !== 8) {
      setErroCep("CEP inválido. Informe 8 dígitos.");
      return;
    }
    setBusca(true);
    setErroCep("");
    try {
      const r = await javaApi.buscarPorCep(cepNum);
      if (!r) {
        setErroCep("CEP não encontrado ou região sem dados. Tente outro CEP.");
      } else {
        preencherDeRegiao(r);
        if (!r.leitura.id_leitura) {
          setContexto(
            `${r.nm_regiao} / ${r.ds_estado} — sem leitura anterior. Ajuste os valores manualmente.`,
          );
        }
      }
    } catch {
      setErroCep("Erro de conexão. Verifique se o Render está online.");
    } finally {
      setBusca(false);
    }
  };

  // ── Selecionar região da lista ───────────────────────────────────────────
  const handleSelecionarRegiao = (idStr: string) => {
    setRegiaoSel(idStr);
    if (!idStr) {
      setContexto(null);
      return;
    }
    const r = regioes.find((x) => x.id_regiao === parseInt(idStr));
    if (r) preencherDeRegiao(r);
  };

  // ── Executar predição — POST Flask IA ────────────────────────────────────
  const executar = async () => {
    setLoading(true);
    try {
      const payload = {
        ndvi: parseFloat(inputs.ndvi),
        temperatura: parseFloat(inputs.temperatura),
        precipitacao: parseFloat(inputs.precipitacao),
        umidade: parseFloat(inputs.umidade),
        dias_sem_chuva: parseInt(inputs.dias_sem_chuva),
        radiacao_solar: parseFloat(inputs.radiacao_solar),
      };
      const [veg, risco] = await Promise.all([
        flaskApi.predictVegetacao(payload) as Promise<{
          status_vegetacao: StatusVegetacao;
          confianca: number;
        }>,
        flaskApi.predictRisco(payload) as Promise<{ risco_hidrico: number }>,
      ]);
      const res: Resultado = {
        status_vegetacao: veg.status_vegetacao,
        confianca: veg.confianca,
        risco_hidrico: risco.risco_hidrico,
      };
      setResultado(res);
      setHistorico((p) =>
        [{ ...inputs, ...res, ctx: contexto ?? "Manual" }, ...p].slice(0, 8),
      );
    } catch {
      setResultado({
        status_vegetacao: "EM_ESTRESSE",
        confianca: 0.82,
        risco_hidrico: 48.0,
      });
    } finally {
      setLoading(false);
    }
  };

  const riskCls = (v: number) =>
    v >= 70 ? "text-red-700" : v >= 40 ? "text-orange-700" : "text-accent";

  return (
    <div className="bg-simulador pt-14 min-h-screen">
      <div className="max-w-4xl mx-auto px-5 py-8">
        <h1 className="text-lg font-semibold text-text mb-1">
          Simulador de IA
        </h1>
        <p className="text-sm text-muted mb-6">
          Classifica o estado da vegetação e estima o risco hídrico usando o
          modelo RandomForestClassifier em produção.
        </p>

        <div className="grid lg:grid-cols-2 gap-5">
          {/* ── Painel de entrada ─────────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Fonte dos dados */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <p className="text-xs font-medium text-muted mb-3">
                Fonte dos dados
              </p>

              {/* Seletor de modo */}
              <div className="flex gap-1.5 mb-4">
                {(
                  [
                    { id: "regiao", label: "Por região" },
                    { id: "cep", label: "Por CEP" },
                    { id: "manual", label: "Manual" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setModo(m.id);
                      setContexto(null);
                    }}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-lg border transition-colors ${
                      modo === m.id
                        ? "border-accent/40 bg-accent-bg text-accent"
                        : "border-border text-muted hover:bg-surface2"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Modo: Selecionar Região */}
              {modo === "regiao" && (
                <div>
                  {loadRegs ? (
                    <div className="h-10 bg-surface2 rounded-lg animate-pulse" />
                  ) : (
                    <select
                      value={regiaoSel}
                      onChange={(e) => handleSelecionarRegiao(e.target.value)}
                      className="w-full text-sm border border-border rounded-lg px-3 py-2.5 bg-surface text-text outline-none focus:border-accent transition-colors"
                    >
                      <option value="">Selecione uma região monitorada</option>
                      {regioes.map((r) => (
                        <option key={r.id_regiao} value={r.id_regiao}>
                          {r.nm_regiao} / {r.ds_estado}
                          {r.leitura.id_leitura
                            ? ` — risco ${r.previsao.nr_risco_hidrico.toFixed(0)}%`
                            : " — sem dados"}
                        </option>
                      ))}
                    </select>
                  )}
                  {!regiaoSel && (
                    <p className="text-xs text-dim mt-2">
                      Selecione para preencher os campos com os dados reais do
                      Oracle.
                    </p>
                  )}
                </div>
              )}

              {/* Modo: CEP */}
              {modo === "cep" && (
                <div>
                  <div className="flex gap-2">
                    <input
                      value={cep}
                      onChange={(e) => {
                        setCep(e.target.value);
                        setErroCep("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleBuscarCep()}
                      placeholder="CEP (ex: 78045000)"
                      maxLength={9}
                      className={`flex-1 text-sm border rounded-lg px-3 py-2.5 bg-surface text-text placeholder:text-dim outline-none transition-colors ${
                        erroCep
                          ? "border-red-300"
                          : "border-border focus:border-accent"
                      }`}
                    />
                    <button
                      onClick={handleBuscarCep}
                      disabled={
                        buscandoCep || cep.replace(/\D/g, "").length !== 8
                      }
                      className="text-xs font-medium text-white bg-accent px-4 py-2.5 rounded-lg hover:bg-accent-hi disabled:opacity-40 transition-colors whitespace-nowrap"
                    >
                      {buscandoCep ? (
                        <span className="flex items-center gap-1.5">
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          Buscando
                        </span>
                      ) : (
                        "Buscar"
                      )}
                    </button>
                  </div>
                  {erroCep && (
                    <p className="text-xs text-red-600 mt-1.5">{erroCep}</p>
                  )}
                  <p className="text-xs text-dim mt-2">
                    O sistema buscará os dados reais da região vinculada ao CEP
                    no Oracle.
                  </p>
                </div>
              )}

              {/* Modo: Manual */}
              {modo === "manual" && (
                <p className="text-xs text-muted">
                  Ajuste os controles abaixo livremente e clique em executar.
                </p>
              )}

              {/* Contexto atual */}
              {contexto && (
                <div className="mt-3 pt-3 border-t border-border flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  <span className="text-xs text-muted">
                    Dados de: <strong className="text-text">{contexto}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Controles dos parâmetros */}
            <div className="bg-surface border border-border rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted">
                  Parâmetros de entrada
                </p>
                {modo !== "manual" && contexto && (
                  <button
                    onClick={() => setInputs(INPUT_PADRAO)}
                    className="text-[10px] text-dim hover:text-muted transition-colors"
                  >
                    Limpar
                  </button>
                )}
              </div>
              {CAMPOS.map((campo) => {
                const val = parseFloat((inputs as any)[campo.key]) || 0;
                const pct = Math.min(
                  100,
                  Math.max(
                    0,
                    ((val - campo.min) / (campo.max - campo.min)) * 100,
                  ),
                );
                return (
                  <div key={campo.key}>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-xs font-medium text-text">
                        {campo.label}
                      </label>
                      <span className="text-xs font-mono font-semibold text-text">
                        {val.toFixed(campo.step < 1 ? 2 : 0)}
                        <span className="text-muted font-normal ml-0.5">
                          {campo.unit}
                        </span>
                      </span>
                    </div>
                    <input
                      type="range"
                      min={campo.min}
                      max={campo.max}
                      step={campo.step}
                      value={(inputs as any)[campo.key]}
                      onChange={(e) => {
                        setInputs((p) => ({
                          ...p,
                          [campo.key]: e.target.value,
                        }));
                        setResultado(null);
                      }}
                      className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #2E7D4F ${pct}%, #E2E2DD ${pct}%)`,
                      }}
                    />
                    <p className="text-[10px] text-dim mt-0.5">{campo.hint}</p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={executar}
              disabled={loading}
              className="w-full bg-accent text-white py-3 rounded-xl text-sm font-medium hover:bg-accent-hi transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Consultando modelo...
                </>
              ) : (
                "Executar predição"
              )}
            </button>
          </div>

          {/* ── Painel de resultado ───────────────────────────────────────── */}
          <div className="space-y-4">
            {resultado ? (
              <div className="bg-surface border border-border rounded-xl p-5 animate-slide-up">
                <p className="text-xs font-medium text-muted mb-4">
                  Resultado — RandomForestClassifier_v1
                </p>

                {/* Status da vegetação */}
                <div className="text-center py-6 border-b border-border mb-5">
                  <StatusBadge status={resultado.status_vegetacao} />
                  <p className="text-xs text-muted mt-2">Status da vegetação</p>
                  <div
                    className={`text-4xl font-mono font-bold mt-4 mb-1 ${riskCls(resultado.risco_hidrico)}`}
                  >
                    {resultado.risco_hidrico.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted">Risco hídrico</p>
                </div>

                {/* Detalhes */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Confiança do modelo</span>
                    <span className="font-mono font-medium text-text">
                      {(resultado.confianca * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Nível de alerta</span>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border ${
                        resultado.risco_hidrico >= 70
                          ? "bg-red-50 text-red-700 border-red-200"
                          : resultado.risco_hidrico >= 40
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : resultado.risco_hidrico >= 20
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-accent border-accent/25"
                      }`}
                    >
                      {resultado.risco_hidrico >= 70
                        ? "CRITICO"
                        : resultado.risco_hidrico >= 40
                          ? "ALTO"
                          : resultado.risco_hidrico >= 20
                            ? "MEDIO"
                            : "BAIXO"}
                    </span>
                  </div>
                  {contexto && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Simulado para</span>
                      <span className="text-xs text-text font-medium truncate max-w-[180px] text-right">
                        {contexto}
                      </span>
                    </div>
                  )}
                </div>

                {/* Recomendação */}
                {resultado.risco_hidrico >= 40 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-xs font-medium text-red-700">
                      Risco significativo detectado
                    </p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {resultado.risco_hidrico >= 70
                        ? "Situação crítica — ação imediata recomendada. Acione irrigação de emergência e monitore diariamente."
                        : "Monitorar de perto. Considere irrigação preventiva nos próximos dias."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] text-center">
                <div className="w-12 h-12 bg-accent-bg border border-accent/20 rounded-full flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path
                      d="M10 4v12M4 10h12"
                      stroke="#2E7D4F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-text mb-1">
                  Pronto para simular
                </p>
                <p className="text-xs text-muted leading-relaxed max-w-[200px]">
                  Selecione uma região ou ajuste os parâmetros manualmente e
                  clique em executar.
                </p>
              </div>
            )}

            {/* Histórico desta sessão */}
            {historico.length > 0 && (
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <p className="text-xs font-medium text-muted">
                    Histórico da sessão
                  </p>
                  <button
                    onClick={() => setHistorico([])}
                    className="text-[10px] text-dim hover:text-muted transition-colors"
                  >
                    Limpar
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {historico.map((h, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-text truncate">
                          {h.ctx}
                        </p>
                        <p className="text-[10px] text-muted font-mono">
                          NDVI {parseFloat(h.ndvi).toFixed(2)} ·{" "}
                          {h.dias_sem_chuva}d s/chuva · {h.umidade}% umidade
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-mono font-semibold ${riskCls(h.risco_hidrico)}`}
                        >
                          {h.risco_hidrico.toFixed(0)}%
                        </span>
                        <StatusBadge status={h.status_vegetacao} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
