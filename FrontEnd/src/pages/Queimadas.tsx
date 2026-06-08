import { useState, useEffect } from "react";
import {
  fetchFocos,
  calcStats,
  type FocoCalor,
  type FirmsStats,
} from "../services/firmsApi";
import { BRAZIL_PATHS } from "../data/brazilMap";
import { LoadingSpinner } from "../components/Ui";

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

const confiancaCfg = {
  high: {
    label: "Alta",
    cls: "bg-red-50 text-red-700 border-red-200",
    dot: "#DC2626",
  },
  nominal: {
    label: "Média",
    cls: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "#EA580C",
  },
  low: {
    label: "Baixa",
    cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
    dot: "#CA8A04",
  },
};

const frpNivel = (frp: number) =>
  frp > 150
    ? { label: "Extremo", c: "#7F1D1D" }
    : frp > 100
      ? { label: "Intenso", c: "#B91C1C" }
      : frp > 50
        ? { label: "Moderado", c: "#EA580C" }
        : { label: "Baixo", c: "#CA8A04" };

export default function Queimadas() {
  const [focos, setFocos] = useState<FocoCalor[]>([]);
  const [stats, setStats] = useState<FirmsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    foco: FocoCalor;
  } | null>(null);
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [filtroBioma, setFiltroBioma] = useState("TODOS");
  const [filtroConf, setFiltroConf] = useState("TODOS");
  const [atualizadoEm, setAtualizadoEm] = useState("");

  const carregar = async () => {
    setLoading(true);
    const data = await fetchFocos();
    setFocos(data);
    setStats(calcStats(data));
    setAtualizadoEm(new Date().toLocaleString("pt-BR"));
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = focos
    .filter((f) => filtroEstado === "TODOS" || f.estado === filtroEstado)
    .filter((f) => filtroBioma === "TODOS" || f.bioma === filtroBioma)
    .filter((f) => filtroConf === "TODOS" || f.confianca === filtroConf);

  const estados = [
    "TODOS",
    ...Array.from(new Set(focos.map((f) => f.estado))).sort(),
  ];
  const biomas = [
    "TODOS",
    ...Array.from(new Set(focos.map((f) => f.bioma))).sort(),
  ];

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-text">Focos de Calor</h1>
            <p className="text-sm text-muted mt-0.5">
              Monitoramento via{" "}
              <a
                href="https://firms.modaps.eosdis.nasa.gov"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                NASA FIRMS
              </a>{" "}
              — VIIRS Suomi-NPP · Brasil
            </p>
            {atualizadoEm && (
              <p className="text-xs text-dim mt-0.5">
                Atualizado às {atualizadoEm}
              </p>
            )}
          </div>
          <button
            onClick={carregar}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-accent border border-accent/30 bg-accent-bg px-4 py-2 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={loading ? "animate-spin" : ""}
            >
              <path
                d="M13 7A6 6 0 1 1 7 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M13 1v6h-6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Atualizar
          </button>
        </div>

        {loading && <LoadingSpinner />}

        {!loading && stats && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                {
                  label: "Focos detectados",
                  value: stats.total,
                  cls: "stat-card-red",
                },
                {
                  label: "Alta confiança",
                  value: stats.alta_confianca,
                  cls: "stat-card-red",
                  warn: true,
                },
                {
                  label: "FRP médio (MW)",
                  value: stats.frp_medio,
                  cls: "stat-card-yellow",
                },
                {
                  label: "Estados afetados",
                  value: stats.estados.length,
                  cls: "stat-card-blue",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`bg-surface border border-border rounded-xl p-4 ${s.cls}`}
                >
                  <div
                    className={`font-mono text-2xl mb-0.5 ${s.warn ? "text-red-700" : "text-text"}`}
                  >
                    {s.value}
                  </div>
                  <div className="text-xs text-muted">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Mapa */}
              <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-5">
                <p className="text-sm font-medium text-text mb-4">
                  Mapa de focos — {filtrados.length} detectados
                </p>
                <div className="relative">
                  <svg
                    viewBox="0 0 320 280"
                    className="w-full max-h-64"
                    style={{ overflow: "visible" }}
                  >
                    {/* Estados */}
                    {BRAZIL_PATHS.map((d, i) => (
                      <path
                        key={i}
                        d={d}
                        fill="#FEF3C7"
                        stroke="#FDE68A"
                        strokeWidth="0.5"
                      />
                    ))}
                    {/* Focos */}
                    {filtrados.map((f, i) => {
                      const [x, y] = latLonToSvg(f.lat, f.lon);
                      const color = confiancaCfg[f.confianca].dot;
                      const r = Math.min(3 + f.frp / 60, 7);
                      return (
                        <g
                          key={i}
                          style={{ cursor: "pointer" }}
                          onMouseEnter={() => setTooltip({ x, y, foco: f })}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <circle
                            cx={x}
                            cy={y}
                            r={r + 3}
                            fill={color}
                            opacity="0.15"
                          />
                          <circle
                            cx={x}
                            cy={y}
                            r={r}
                            fill={color}
                            opacity="0.85"
                          />
                        </g>
                      );
                    })}
                    {/* Tooltip */}
                    {tooltip &&
                      (() => {
                        const tx = Math.min(tooltip.x + 5, 220);
                        const ty = tooltip.y - 26;
                        const w = 110;
                        return (
                          <g>
                            <rect
                              x={tx}
                              y={ty}
                              width={w}
                              height={22}
                              rx="3"
                              fill="#1C1C1A"
                              opacity="0.88"
                            />
                            <text
                              x={tx + 5}
                              y={ty + 9}
                              fontSize="7"
                              fill="white"
                              fontFamily="Inter"
                            >
                              {tooltip.foco.municipio} — {tooltip.foco.estado}
                            </text>
                            <text
                              x={tx + 5}
                              y={ty + 18}
                              fontSize="7"
                              fill="#FCA5A5"
                              fontFamily="Inter"
                            >
                              FRP: {tooltip.foco.frp} MW ·{" "}
                              {tooltip.foco.confianca}
                            </text>
                          </g>
                        );
                      })()}
                  </svg>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-border">
                  {Object.entries(confiancaCfg).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: v.dot }}
                      />
                      <span className="text-xs text-muted">
                        Confiança {v.label}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-muted ml-2">
                    ● tamanho = intensidade (FRP)
                  </div>
                </div>
              </div>

              {/* Stats laterais */}
              <div className="space-y-4">
                <div className="bg-surface border border-border rounded-xl p-5">
                  <p className="text-sm font-medium text-text mb-3">
                    Por estado
                  </p>
                  <div className="space-y-2">
                    {stats.estados.map((e) => (
                      <div key={e.estado} className="flex items-center gap-2">
                        <span className="text-xs text-muted w-8 font-mono">
                          {e.estado}
                        </span>
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-500 rounded-full"
                            style={{
                              width: `${(e.count / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted w-4">
                          {e.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-surface border border-border rounded-xl p-5">
                  <p className="text-sm font-medium text-text mb-3">
                    Por bioma
                  </p>
                  <div className="space-y-2">
                    {stats.biomas.map((b) => (
                      <div key={b.bioma} className="flex items-center gap-2">
                        <span className="text-xs text-muted flex-1">
                          {b.bioma}
                        </span>
                        <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{
                              width: `${(b.count / stats.total) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-muted w-4">
                          {b.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 mb-1">
                    🔥 FRP — Fire Radiative Power
                  </p>
                  <p className="text-xs text-red-600 leading-relaxed">
                    Mede a energia liberada pelo fogo em megawatts. Acima de 100
                    MW indica incêndio de grande porte com risco elevado de
                    propagação.
                  </p>
                </div>
              </div>
            </div>

            {/* Filtros + tabela */}
            <div className="bg-surface border border-border rounded-xl">
              <div className="px-5 py-4 border-b border-border space-y-3">
                <p className="text-sm font-semibold text-text">
                  Focos detectados{" "}
                  <span className="text-xs font-normal text-muted">
                    ({filtrados.length})
                  </span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {/* Filtro estado */}
                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-muted outline-none focus:border-accent"
                  >
                    {estados.map((e) => (
                      <option key={e} value={e}>
                        {e === "TODOS" ? "Todos os estados" : e}
                      </option>
                    ))}
                  </select>
                  {/* Filtro bioma */}
                  <select
                    value={filtroBioma}
                    onChange={(e) => setFiltroBioma(e.target.value)}
                    className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-muted outline-none focus:border-accent"
                  >
                    {biomas.map((b) => (
                      <option key={b} value={b}>
                        {b === "TODOS" ? "Todos os biomas" : b}
                      </option>
                    ))}
                  </select>
                  {/* Filtro confiança */}
                  <select
                    value={filtroConf}
                    onChange={(e) => setFiltroConf(e.target.value)}
                    className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-muted outline-none focus:border-accent"
                  >
                    <option value="TODOS">Toda confiança</option>
                    <option value="high">Alta</option>
                    <option value="nominal">Média</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface2">
                      {[
                        "Município",
                        "Estado",
                        "Bioma",
                        "FRP (MW)",
                        "Intensidade",
                        "Confiança",
                        "Data",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-3 px-4 text-xs text-muted font-medium whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados
                      .sort((a, b) => b.frp - a.frp)
                      .map((f, i) => {
                        const nivel = frpNivel(f.frp);
                        const conf = confiancaCfg[f.confianca];
                        return (
                          <tr
                            key={i}
                            className="border-b border-border hover:bg-surface2 transition-colors"
                          >
                            <td className="py-2.5 px-4 text-sm font-medium text-text">
                              {f.municipio}
                            </td>
                            <td className="py-2.5 px-4 text-xs font-mono text-muted">
                              {f.estado}
                            </td>
                            <td className="py-2.5 px-4 text-xs text-muted">
                              {f.bioma}
                            </td>
                            <td
                              className="py-2.5 px-4 font-mono text-sm font-semibold"
                              style={{ color: nivel.c }}
                            >
                              {f.frp.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-md"
                                style={{
                                  background: nivel.c + "18",
                                  color: nivel.c,
                                  border: `1px solid ${nivel.c}30`,
                                }}
                              >
                                {nivel.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-4">
                              <span
                                className={`text-xs font-medium px-2 py-0.5 rounded-md border ${conf.cls}`}
                              >
                                {conf.label}
                              </span>
                            </td>
                            <td className="py-2.5 px-4 text-xs font-mono text-muted">
                              {f.data}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-border">
                <p className="text-xs text-dim">
                  Fonte:{" "}
                  <a
                    href="https://firms.modaps.eosdis.nasa.gov"
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    NASA FIRMS
                  </a>{" "}
                  · VIIRS Suomi-NPP · Resolução 375m · Dados simulados para
                  demonstração
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
