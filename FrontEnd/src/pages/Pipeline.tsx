import { useState } from "react";

type StepData = {
  id: number;
  icon: string;
  label: string;
  title: string;
  desc: string;
  color: string;
  tc: string;
  dot: string;
  fontes?: string[];
  etapas?: string[];
  modelos?: { nome: string; saida: string; acc: string }[];
  endpoints?: string[];
  tabelas?: string[];
  features?: string[];
  clientes?: string[];
};

const steps: StepData[] = [
  {
    id: 1,
    icon: "🛰",
    label: "Satélites",
    title: "Coleta de Dados Espaciais",
    desc: "Dados coletados diariamente de 6 fontes satelitais diferentes. Cada fonte contribui com um tipo de dado específico para o pipeline.",
    fontes: [
      "NASA FIRMS — Focos de calor",
      "NASA EarthData — NDVI/Imagens",
      "NASA POWER — Radiação solar",
      "Open-Meteo — Clima",
      "INPE TerraBrasilis — Desmatamento",
      "Copernicus ESA — Solo",
    ],
    color: "bg-blue-50 border-blue-200",
    tc: "text-blue-700",
    dot: "bg-blue-500",
  },
  {
    id: 2,
    icon: "🐍",
    label: "Python",
    title: "Processamento & ETL",
    desc: "Script Python CLI processa os dados brutos, calcula índices derivados e persiste no banco Oracle.",
    etapas: [
      "Normalização e limpeza dos dados",
      "Cálculo do NDVI via fórmula (NIR-RED)/(NIR+RED)",
      "Validação de coordenadas geográficas",
      "INSERT no Oracle — TB_LEITURA_SATELITAL",
    ],
    color: "bg-yellow-50 border-yellow-200",
    tc: "text-yellow-800",
    dot: "bg-yellow-500",
  },
  {
    id: 3,
    icon: "🤖",
    label: "ML Model",
    title: "Modelos de Machine Learning",
    desc: "Dois modelos RandomForest executam inferência sobre os dados processados.",
    modelos: [
      {
        nome: "Classificador",
        saida: "SAUDAVEL / EM_ESTRESSE / CRITICO",
        acc: "91.2%",
      },
      { nome: "Regressor", saida: "Risco hídrico 0–100", acc: "RMSE 0.12" },
    ],
    color: "bg-purple-50 border-purple-200",
    tc: "text-purple-700",
    dot: "bg-purple-500",
  },
  {
    id: 4,
    icon: "🗄",
    label: "Oracle DB",
    title: "Persistência no Banco",
    desc: "Resultados armazenados nas tabelas relacionais. Alertas automáticos são gerados quando risco hídrico ≥ 40%.",
    tabelas: [
      "TB_PREVISAO — resultado do ML",
      "TB_ALERTA — alertas gerados",
      "TB_HISTORICO_ALERTA — rastreabilidade",
    ],
    color: "bg-orange-50 border-orange-200",
    tc: "text-orange-700",
    dot: "bg-orange-500",
  },
  {
    id: 5,
    icon: "☕",
    label: "Java API",
    title: "API REST — Quarkus",
    desc: "API Java expõe os dados via REST com CRUD completo. Frontend e terceiros consomem via HTTP.",
    endpoints: [
      "GET /regioes — lista regiões",
      "GET /alertas — alertas ativos",
      "GET /previsoes/regiao/{id} — previsões",
      "POST /regioes/buscar-por-cidade — cadastra região",
    ],
    color: "bg-red-50 border-red-200",
    tc: "text-red-700",
    dot: "bg-red-500",
  },
  {
    id: 6,
    icon: "⚛",
    label: "React",
    title: "Dashboard — Frontend",
    desc: "SPA React + TypeScript consome a API Java e a Flask API, exibindo dados em tempo real.",
    features: [
      "Mapa do Brasil com pontos de risco",
      "Gráficos de NDVI e risco hídrico",
      "Simulador interativo de IA",
      "Alertas em tempo real",
    ],
    color: "bg-cyan-50 border-cyan-200",
    tc: "text-cyan-700",
    dot: "bg-cyan-500",
  },
];

export default function Pipeline() {
  const [active, setActive] = useState(0);
  const s = steps[active];

  return (
    <div className="bg-pipeline pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-lg font-semibold text-text">Pipeline de Dados</h1>
          <p className="text-sm text-muted mt-0.5">
            Fluxo completo desde a coleta satelital até o dashboard — clique em
            cada etapa.
          </p>
        </div>

        {/* Flow visual */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 gap-1">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setActive(i)}
                className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border transition-all ${
                  active === i
                    ? `${step.color} border-2 shadow-sm`
                    : "bg-surface border-border hover:bg-surface2"
                }`}
              >
                <span className="text-xl">{step.icon}</span>
                <span
                  className={`text-xs font-medium ${active === i ? step.tc : "text-muted"}`}
                >
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <svg
                  width="48"
                  height="28"
                  viewBox="0 0 48 28"
                  fill="none"
                  className="shrink-0 mx-1"
                >
                  <path
                    d="M0 14h36M28 5l9 9-9 9"
                    stroke="#2E7D4F"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.5"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Detail card */}
        <div className={`border-2 rounded-xl p-6 animate-fade-in ${s.color}`}>
          <div className="flex items-start gap-4">
            <span className="text-4xl">{s.icon}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded-full border ${s.color} ${s.tc}`}
                >
                  Etapa {s.id} de {steps.length}
                </span>
              </div>
              <h2 className={`text-base font-semibold mb-2 ${s.tc}`}>
                {s.title}
              </h2>
              <p className="text-sm text-muted mb-4 leading-relaxed">
                {s.desc}
              </p>

              {!!s.fontes && !!s.fontes && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {(s.fontes ?? []).map((f: string) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-xs text-text"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}
                      />
                      {f}
                    </div>
                  ))}
                </div>
              )}
              {!!s.etapas && (
                <ol className="space-y-1.5">
                  {(s.etapas ?? []).map((e: any, i: number) => (
                    <li
                      key={e}
                      className="flex items-center gap-2 text-xs text-text"
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${s.dot}`}
                      >
                        {i + 1}
                      </span>
                      {e}
                    </li>
                  ))}
                </ol>
              )}
              {!!s.modelos && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {(s.modelos ?? []).map((m) => (
                    <div
                      key={m.nome}
                      className={`border ${s.color} rounded-lg p-3 bg-white/60`}
                    >
                      <p className={`text-xs font-semibold ${s.tc}`}>
                        {m.nome}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Saída: {m.saida}
                      </p>
                      <p className="text-xs text-muted">
                        Acurácia:{" "}
                        <span className="font-mono font-bold">{m.acc}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {!!s.tabelas && (
                <div className="space-y-1.5">
                  {(s.tabelas ?? []).map((t: string) => (
                    <div
                      key={t}
                      className="flex items-center gap-2 text-xs text-text"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}
                      />
                      <span className="font-mono">{t}</span>
                    </div>
                  ))}
                </div>
              )}
              {!!s.endpoints && (
                <div className="space-y-1.5">
                  {(s.endpoints ?? []).map((e: string) => (
                    <div key={e} className="flex items-center gap-2 text-xs">
                      <span className={`font-mono font-bold ${s.tc}`}>
                        {e.split(" — ")[0]}
                      </span>
                      <span className="text-muted">— {e.split(" — ")[1]}</span>
                    </div>
                  ))}
                </div>
              )}
              {!!s.features && (
                <div className="grid sm:grid-cols-2 gap-2">
                  {(s.features ?? []).map((f: string) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-xs text-text"
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`}
                      />
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          {[
            {
              label: "Fontes de dados",
              value: "6",
              sub: "APIs espaciais integradas",
            },
            {
              label: "Atualização",
              value: "24h",
              sub: "Ciclo completo do pipeline",
            },
            {
              label: "Precisão ML",
              value: "91%",
              sub: "Classificador de vegetação",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-xl p-4 text-center stat-card-green"
            >
              <div className="font-mono text-2xl text-text mb-0.5">
                {s.value}
              </div>
              <div className="text-xs font-medium text-text">{s.label}</div>
              <div className="text-xs text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
