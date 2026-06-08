import { useState } from "react";
import { flaskApi } from "../services/api";
import { StatusBadge } from "../components/Ui";
import type { StatusVegetacao } from "../types";

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

const presets = [
  {
    label: "Região Saudável",
    desc: "Cerrado com boa cobertura",
    vals: {
      ndvi: "0.72",
      temperatura: "28",
      precipitacao: "12",
      umidade: "65",
      dias_sem_chuva: "3",
      radiacao_solar: "21",
    },
  },
  {
    label: "Em Estresse",
    desc: "Semiárido em alerta",
    vals: {
      ndvi: "0.38",
      temperatura: "34",
      precipitacao: "2",
      umidade: "38",
      dias_sem_chuva: "18",
      radiacao_solar: "26",
    },
  },
  {
    label: "Situação Crítica",
    desc: "Seca severa",
    vals: {
      ndvi: "0.14",
      temperatura: "38",
      precipitacao: "0",
      umidade: "22",
      dias_sem_chuva: "45",
      radiacao_solar: "30",
    },
  },
];

const campos = [
  {
    key: "ndvi",
    label: "NDVI",
    min: 0,
    max: 1,
    step: 0.01,
    unit: "",
    hint: "0 = sem vegetação · 1 = vegetação densa",
  },
  {
    key: "temperatura",
    label: "Temperatura",
    min: 10,
    max: 45,
    step: 0.1,
    unit: "°C",
    hint: "Temperatura do ar em superfície",
  },
  {
    key: "precipitacao",
    label: "Precipitação",
    min: 0,
    max: 100,
    step: 0.1,
    unit: "mm",
    hint: "Precipitação nas últimas 24h",
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
    hint: "Dias consecutivos sem precipitação",
  },
  {
    key: "radiacao_solar",
    label: "Radiação solar",
    min: 0,
    max: 35,
    step: 0.1,
    unit: "kWh/m²",
    hint: "Radiação solar diária média",
  },
];

export default function SimuladorIA() {
  const [inputs, setInputs] = useState<Inputs>(presets[0].vals);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<(Inputs & Resultado)[]>([]);

  const aplicarPreset = (vals: Inputs) => {
    setInputs(vals);
    setResultado(null);
  };

  const handleChange = (key: string, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
    setResultado(null);
  };

  const simular = async () => {
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
      const r = { ...veg, risco_hidrico: risco.risco_hidrico };
      setResultado(r);
      setHistorico((prev) => [{ ...inputs, ...r }, ...prev].slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const ndviVal = parseFloat(inputs.ndvi) || 0;
  const ndviColor =
    ndviVal >= 0.6 ? "#2E7D4F" : ndviVal >= 0.3 ? "#C07020" : "#B83232";

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-text">Simulador de IA</h1>
          <p className="text-sm text-muted mt-0.5">
            Insira dados satelitais e veja a previsão do modelo{" "}
            <span className="font-mono text-xs text-accent">
              RandomForestClassifier_v1
            </span>{" "}
            em tempo real.
          </p>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2 mb-6">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => aplicarPreset(p.vals)}
              className="text-xs border border-border bg-surface px-3 py-2 rounded-lg hover:border-accent/40 hover:bg-accent-bg transition-colors text-left"
            >
              <span className="font-medium text-text block">{p.label}</span>
              <span className="text-muted">{p.desc}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-4">
              Parâmetros de entrada
            </p>
            <div className="space-y-4">
              {campos.map((c) => (
                <div key={c.key}>
                  <div className="flex justify-between mb-1">
                    <label className="text-xs font-medium text-text">
                      {c.label}
                    </label>
                    <span className="text-xs font-mono text-accent font-semibold">
                      {inputs[c.key as keyof Inputs]} {c.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={c.min}
                    max={c.max}
                    step={c.step}
                    value={inputs[c.key as keyof Inputs]}
                    onChange={(e) => handleChange(c.key, e.target.value)}
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                  <p className="text-[10px] text-dim mt-0.5">{c.hint}</p>
                </div>
              ))}
            </div>

            <button
              onClick={simular}
              disabled={loading}
              className="mt-5 w-full bg-accent hover:bg-accent-hi text-white font-medium text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Processando...
                </>
              ) : (
                "🤖 Executar modelo de IA"
              )}
            </button>
          </div>

          {/* Resultado */}
          <div className="space-y-4">
            {/* NDVI visual */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-xs text-muted mb-3">
                Saúde da vegetação — NDVI
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg viewBox="0 0 80 80">
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke="#E2E2DD"
                      strokeWidth="8"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="32"
                      fill="none"
                      stroke={ndviColor}
                      strokeWidth="8"
                      strokeDasharray={`${ndviVal * 201} 201`}
                      strokeLinecap="round"
                      transform="rotate(-90 40 40)"
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                    <text
                      x="40"
                      y="44"
                      textAnchor="middle"
                      fontSize="13"
                      fontWeight="600"
                      fill={ndviColor}
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {ndviVal.toFixed(2)}
                    </text>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-text">
                    {ndviVal >= 0.6
                      ? "Vegetação Saudável"
                      : ndviVal >= 0.3
                        ? "Em Estresse"
                        : "Estado Crítico"}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {ndviVal >= 0.6
                      ? "Cobertura vegetal densa e ativa"
                      : ndviVal >= 0.3
                        ? "Sinais de estresse hídrico"
                        : "Vegetação severamente comprometida"}
                  </p>
                </div>
              </div>
            </div>

            {/* Resultado do modelo */}
            {!resultado && !loading && (
              <div className="bg-surface border border-dashed border-border rounded-xl p-8 text-center">
                <p className="text-4xl mb-2">🛰</p>
                <p className="text-sm text-muted">
                  Configure os parâmetros e execute o modelo para ver a previsão
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-surface border border-border rounded-xl p-8 text-center">
                <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-muted">
                  Executando RandomForestClassifier...
                </p>
              </div>
            )}

            {resultado && !loading && (
              <div className="bg-surface border border-accent/30 rounded-xl p-5 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-text">
                    Resultado do modelo
                  </p>
                  <span className="text-[10px] font-mono text-accent bg-accent-bg border border-accent/20 px-2 py-0.5 rounded">
                    RandomForest v1
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted mb-1.5">
                      Status da vegetação
                    </p>
                    <StatusBadge status={resultado.status_vegetacao} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className="text-xs text-muted">Risco hídrico</p>
                      <span
                        className={`text-xs font-mono font-bold ${resultado.risco_hidrico > 70 ? "text-red-700" : resultado.risco_hidrico > 40 ? "text-yellow-700" : "text-accent"}`}
                      >
                        {resultado.risco_hidrico.toFixed(1)}/100
                      </span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${resultado.risco_hidrico}%`,
                          background:
                            resultado.risco_hidrico > 70
                              ? "#B83232"
                              : resultado.risco_hidrico > 40
                                ? "#C07020"
                                : "#2E7D4F",
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-xs text-muted">Confiança do modelo</p>
                      <span className="text-xs font-mono text-text">
                        {(resultado.confianca * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${resultado.confianca * 100}%` }}
                      />
                    </div>
                  </div>
                  <div
                    className={`mt-2 p-3 rounded-lg text-xs leading-relaxed ${
                      resultado.status_vegetacao === "CRITICO"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : resultado.status_vegetacao === "EM_ESTRESSE"
                          ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                          : "bg-green-50 text-accent border border-accent/20"
                    }`}
                  >
                    {resultado.status_vegetacao === "CRITICO" &&
                      "⚠ Situação crítica. Risco hídrico severo. Irrigação emergencial e acionamento da defesa civil são recomendados."}
                    {resultado.status_vegetacao === "EM_ESTRESSE" &&
                      "⚡ Vegetação em estresse. Monitoramento intensivo recomendado nos próximos 7 dias. Avaliar irrigação preventiva."}
                    {resultado.status_vegetacao === "SAUDAVEL" &&
                      "✓ Vegetação saudável. Condições favoráveis. Manter monitoramento regular semanal."}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Histórico */}
        {historico.length > 0 && (
          <div className="mt-6 bg-surface border border-border rounded-xl">
            <div className="px-5 py-4 border-b border-border">
              <p className="text-sm font-semibold text-text">
                Histórico de simulações
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-surface2">
                    {[
                      "NDVI",
                      "Temp.",
                      "Dias s/ chuva",
                      "Status",
                      "Risco",
                      "Confiança",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2.5 px-4 text-xs text-muted font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historico.map((h, i) => (
                    <tr
                      key={i}
                      className="border-b border-border hover:bg-surface2 transition-colors"
                    >
                      <td className="py-2 px-4 font-mono text-sm text-text">
                        {h.ndvi}
                      </td>
                      <td className="py-2 px-4 font-mono text-sm text-muted">
                        {h.temperatura}°C
                      </td>
                      <td className="py-2 px-4 font-mono text-sm text-muted">
                        {h.dias_sem_chuva}d
                      </td>
                      <td className="py-2 px-4">
                        <StatusBadge status={h.status_vegetacao} />
                      </td>
                      <td
                        className={`py-2 px-4 font-mono text-sm font-semibold ${h.risco_hidrico > 70 ? "text-red-700" : "text-accent"}`}
                      >
                        {h.risco_hidrico.toFixed(1)}
                      </td>
                      <td className="py-2 px-4 font-mono text-sm text-muted">
                        {(h.confianca * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
