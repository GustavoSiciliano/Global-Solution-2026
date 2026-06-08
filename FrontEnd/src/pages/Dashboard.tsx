import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { javaApi } from "../services/api";
import type { RegiaoComPrevisao } from "../types";
import { AlertaBadge, RiskBar, LoadingSpinner } from "../components/Ui";
import { BRAZIL_PATHS } from "../data/brazilMap";

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values),
    min = Math.min(...values),
    range = max - min || 1;
  const w = 160,
    h = 36;
  const pts = values
    .map(
      (v, i) =>
        `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`,
    )
    .join(" ");
  const c = values[values.length - 1] > 70 ? "#B83232" : "#2E7D4F";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={c}
        strokeWidth="1.5"
        opacity="0.7"
      />
    </svg>
  );
}

// Converte lat/lon para coordenadas SVG (mesma projeção do GeoJSON)
function latLonToSvg(lat: number, lon: number): [number, number] {
  const LON_MIN = -73.98,
    LON_MAX = -28.84;
  const LAT_MIN = -33.75,
    LAT_MAX = 5.27;
  const W = 320,
    H = 280,
    PAD = 6;
  const x = PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (W - 2 * PAD);
  const y = PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * PAD);
  return [x, y];
}

function BrazilMap({ regioes }: { regioes: RegiaoComPrevisao[] }) {
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 320 280"
        className="w-full max-h-64"
        style={{ overflow: "visible" }}
      >
        {/* Estados do Brasil */}
        {BRAZIL_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#D4EAD8"
            stroke="#AECFB4"
            strokeWidth="0.5"
          />
        ))}

        {/* Dots das regiões monitoradas */}
        {regioes.map((r) => {
          const [x, y] = latLonToSvg(r.nr_latitude, r.nr_longitude);
          const status = r.previsao.ds_status_vegetacao;
          const c =
            status === "CRITICO"
              ? "#B83232"
              : status === "EM_ESTRESSE"
                ? "#C07020"
                : "#2E7D4F";
          return (
            <g
              key={r.id_regiao}
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({
                  x,
                  y,
                  text: `${r.nm_regiao} — ${r.previsao.nr_risco_hidrico.toFixed(0)}%`,
                })
              }
              onMouseLeave={() => setTooltip(null)}
            >
              <circle cx={x} cy={y} r="9" fill={c} opacity="0.15" />
              <circle cx={x} cy={y} r="4" fill={c} opacity="0.9" />
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="none"
                stroke={c}
                strokeWidth="1"
                opacity="0.4"
              />
            </g>
          );
        })}

        {/* Tooltip */}
        {tooltip && (
          <g>
            <rect
              x={Math.min(tooltip.x - 2, 220)}
              y={tooltip.y - 22}
              width={tooltip.text.length * 5.8 + 10}
              height="16"
              rx="3"
              fill="#1C1C1A"
              opacity="0.85"
            />
            <text
              x={Math.min(tooltip.x + 3, 225)}
              y={tooltip.y - 11}
              fontSize="8"
              fill="white"
              fontFamily="Inter, sans-serif"
            >
              {tooltip.text}
            </text>
          </g>
        )}
      </svg>

      <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border">
        {[
          ["Saudável", "#2E7D4F"],
          ["Em estresse", "#C07020"],
          ["Crítico", "#B83232"],
        ].map(([l, c]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-muted">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { estatisticas, showModal } = useAppContext();
  const [regioes, setRegioes] = useState<RegiaoComPrevisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("TODOS");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<{ col: string; asc: boolean }>({
    col: "risco",
    asc: false,
  });

  useEffect(() => {
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      setLoading(false);
    });
  }, []);

  const filtradas = regioes
    .filter(
      (r) => filtro === "TODOS" || r.previsao.ds_status_vegetacao === filtro,
    )
    .filter(
      (r) =>
        !busca ||
        r.nm_regiao.toLowerCase().includes(busca.toLowerCase()) ||
        r.ds_estado.toLowerCase().includes(busca.toLowerCase()),
    )
    .sort((a, b) => {
      const mult = ordenacao.asc ? 1 : -1;
      if (ordenacao.col === "risco")
        return (
          mult * (a.previsao.nr_risco_hidrico - b.previsao.nr_risco_hidrico)
        );
      if (ordenacao.col === "ndvi")
        return mult * (a.leitura.nr_ndvi - b.leitura.nr_ndvi);
      if (ordenacao.col === "regiao")
        return mult * a.nm_regiao.localeCompare(b.nm_regiao);
      if (ordenacao.col === "dias")
        return (
          mult * (a.leitura.nr_dias_sem_chuva - b.leitura.nr_dias_sem_chuva)
        );
      return 0;
    });

  const exportCSV = () => {
    const header =
      "Região,UF,Bioma,NDVI,Temperatura,Precipitação,Dias s/ Chuva,Risco Hídrico,Status";
    const rows = filtradas.map((r) =>
      [
        r.nm_regiao,
        r.ds_estado,
        r.ds_bioma,
        r.leitura.nr_ndvi,
        r.leitura.nr_temperatura,
        r.leitura.nr_precipitacao,
        r.leitura.nr_dias_sem_chuva,
        r.previsao.nr_risco_hidrico.toFixed(1),
        r.previsao.ds_status_vegetacao,
      ].join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agrosat_regioes.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const sortBy = (col: string) =>
    setOrdenacao((prev) => ({
      col,
      asc: prev.col === col ? !prev.asc : false,
    }));

  const riskHistory = [12.3, 22.1, 38.6, 42.8, 55.2, 79.3, 88.7];

  if (loading)
    return (
      <div className="pt-14">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-text">Dashboard</h1>
            <p className="text-xs text-muted mt-0.5">
              {new Date().toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() =>
              showModal({
                tipo: "info",
                titulo: "Sobre os dados",
                mensagem:
                  "Dados consumidos em tempo real da API Java (Quarkus) e Flask IA hospedadas no Render, integradas ao Oracle FIAP. Endereço: global-solution-2026.onrender.com",
              })
            }
            className="text-xs text-muted border border-border px-3 py-1.5 rounded-lg hover:text-text transition-colors bg-surface"
          >
            Live
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {[
            {
              label: "Regiões",
              value: estatisticas.total_regioes,
              cls: "stat-card-green",
            },
            {
              label: "Alertas ativos",
              value: estatisticas.alertas_ativos,
              cls: "stat-card-yellow",
              warn: true,
            },
            {
              label: "NDVI médio",
              value: estatisticas.media_ndvi.toFixed(3),
              cls: "stat-card-green",
            },
            {
              label: "Regiões críticas",
              value: estatisticas.regioes_criticas,
              cls: "stat-card-red",
              warn: true,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-surface border border-border rounded-xl p-4 ${s.cls}`}
            >
              <div
                className={`font-mono text-2xl mb-0.5 ${s.warn && +s.value > 0 ? "text-red-700" : "text-text"}`}
              >
                {s.value}
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Temp strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              label: "Temperatura máxima",
              value: `${estatisticas.maior_temp}°C`,
              c: "text-red-700",
            },
            {
              label: "Temperatura média",
              value: `${estatisticas.media_temp}°C`,
              c: "text-text",
            },
            {
              label: "Temperatura mínima",
              value: `${estatisticas.menor_temp}°C`,
              c: "text-blue-700",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center justify-between"
            >
              <span className="text-xs text-muted">{s.label}</span>
              <span className={`font-mono text-sm font-semibold ${s.c}`}>
                {s.value}
              </span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          {/* Mapa real do Brasil */}
          <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-medium text-text mb-4">
              Mapa de risco — {regioes.length} regiões
            </p>
            <BrazilMap regioes={regioes} />
          </div>

          {/* Risco hídrico */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col">
            <p className="text-sm font-medium text-text mb-0.5">
              Risco hídrico
            </p>
            <p className="text-xs text-muted mb-4">
              Evolução — maior para menor
            </p>
            <Sparkline values={riskHistory} />
            <div className="flex justify-between mt-1 mb-4 text-xs font-mono">
              <span className="text-accent">5,4%</span>
              <span className="text-red-700">88,7%</span>
            </div>
            <div className="space-y-2.5 border-t border-border pt-4 mt-auto">
              {regioes
                .sort(
                  (a, b) =>
                    b.previsao.nr_risco_hidrico - a.previsao.nr_risco_hidrico,
                )
                .slice(0, 4)
                .map((r) => {
                  const v = r.previsao.nr_risco_hidrico;
                  const c = v > 70 ? "#B83232" : v > 40 ? "#C07020" : "#2E7D4F";
                  return (
                    <div key={r.id_regiao} className="flex items-center gap-2">
                      <span className="text-xs text-muted truncate w-24">
                        {r.nm_regiao}
                      </span>
                      <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${v}%`, background: c }}
                        />
                      </div>
                      <span className="text-xs font-mono text-muted w-9 text-right">
                        {v.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-surface border border-border rounded-xl">
          <div className="px-5 py-4 border-b border-border space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text">
                Regiões monitoradas{" "}
                <span className="text-xs font-normal text-muted">
                  ({filtradas.length})
                </span>
              </p>
              <button
                onClick={exportCSV}
                className="self-start text-xs text-muted border border-border px-3 py-1.5 rounded-lg hover:text-accent hover:border-accent/30 transition-colors bg-surface flex items-center gap-1.5"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1v7M3 5l3 3 3-3M2 10h8"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                Exportar CSV
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar região ou estado..."
                className="flex-1 text-xs border border-border rounded-lg px-3 py-1.5 bg-surface text-text placeholder-dim outline-none focus:border-accent transition-colors"
              />
              <div className="flex gap-1.5 flex-wrap">
                {["TODOS", "SAUDAVEL", "EM_ESTRESSE", "CRITICO"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFiltro(f)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      filtro === f
                        ? "border-accent/40 text-accent bg-accent-bg font-medium"
                        : "border-border text-muted hover:text-text bg-surface"
                    }`}
                  >
                    {f === "EM_ESTRESSE" ? "ESTRESSE" : f}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  {[
                    { label: "Região", col: "regiao" },
                    { label: "UF", col: "" },
                    { label: "Bioma", col: "" },
                    { label: "NDVI", col: "ndvi" },
                    { label: "Dias s/ chuva", col: "dias" },
                    { label: "Risco hídrico", col: "risco" },
                    { label: "Status", col: "" },
                    { label: "", col: "" },
                  ].map((h) => (
                    <th
                      key={h.label}
                      onClick={h.col ? () => sortBy(h.col) : undefined}
                      className={`text-left py-3 px-4 text-xs text-muted font-medium whitespace-nowrap ${h.col ? "cursor-pointer hover:text-text select-none" : ""}`}
                    >
                      {h.label}
                      {h.col && ordenacao.col === h.col && (
                        <span className="ml-1">
                          {ordenacao.asc ? "↑" : "↓"}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtradas.map((r) => (
                  <tr
                    key={r.id_regiao}
                    className="border-b border-border hover:bg-surface2 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-sm font-medium text-text">
                      {r.nm_regiao}
                    </td>
                    <td className="py-2.5 px-4 text-xs font-mono text-muted">
                      {r.ds_estado}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-muted">
                      {r.ds_bioma}
                    </td>
                    <td
                      className={`py-2.5 px-4 font-mono text-sm font-semibold ${
                        r.leitura.nr_ndvi >= 0.6
                          ? "text-accent"
                          : r.leitura.nr_ndvi >= 0.3
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {r.leitura.nr_ndvi.toFixed(2)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-sm font-mono ${r.leitura.nr_dias_sem_chuva > 20 ? "text-red-700 font-semibold" : "text-muted"}`}
                    >
                      {r.leitura.nr_dias_sem_chuva}d
                    </td>
                    <td className="py-2.5 px-4 w-28">
                      <RiskBar
                        value={r.previsao.nr_risco_hidrico / 100}
                        label=""
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <AlertaBadge
                        nivel={
                          r.previsao.ds_status_vegetacao === "CRITICO"
                            ? "CRITICO"
                            : r.previsao.ds_status_vegetacao === "EM_ESTRESSE"
                              ? r.previsao.nr_risco_hidrico > 60
                                ? "ALTO"
                                : "MEDIO"
                              : "BAIXO"
                        }
                      />
                    </td>
                    <td className="py-2.5 px-4">
                      <Link
                        to={`/regioes/${r.id_regiao}`}
                        className="text-xs text-accent hover:underline font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
