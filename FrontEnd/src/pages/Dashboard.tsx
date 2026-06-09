import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { javaApi, flaskApi } from "../services/api";
import type { RegiaoComPrevisao, StatusVegetacao } from "../types";
import {
  AlertaBadge,
  RiskBar,
  StatusBadge,
  LoadingSpinner,
} from "../components/Ui";
import { BRAZIL_PATHS } from "../data/brazilMap";

function latLonToSvg(lat: number, lon: number): [number, number] {
  const LON_MIN = -73.98,
    LON_MAX = -28.84,
    LAT_MIN = -33.75,
    LAT_MAX = 5.27,
    W = 320,
    H = 280,
    PAD = 6;
  return [
    PAD + ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (W - 2 * PAD),
    PAD + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (H - 2 * PAD),
  ];
}

function BrazilMap({ regioes }: { regioes: RegiaoComPrevisao[] }) {
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(
    null,
  );
  return (
    <div className="bg-dashboard relative">
      <svg
        viewBox="0 0 320 280"
        className="w-full max-h-64"
        style={{ overflow: "visible" }}
      >
        {BRAZIL_PATHS.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#D4EAD8"
            stroke="#AECFB4"
            strokeWidth="0.5"
          />
        ))}
        {regioes.map((r) => {
          const [x, y] = latLonToSvg(r.nr_latitude, r.nr_longitude);
          const c =
            r.previsao.ds_status_vegetacao === "CRITICO"
              ? "#B83232"
              : r.previsao.ds_status_vegetacao === "EM_ESTRESSE"
                ? "#C07020"
                : "#2E7D4F";
          return (
            <g
              key={r.id_regiao}
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTip({
                  x,
                  y,
                  text: `${r.nm_regiao} — ${r.previsao.nr_risco_hidrico.toFixed(0)}%`,
                })
              }
              onMouseLeave={() => setTip(null)}
            >
              <circle cx={x} cy={y} r="9" fill={c} opacity="0.15" />
              <circle cx={x} cy={y} r="4" fill={c} opacity="0.9" />
            </g>
          );
        })}
        {tip && (
          <g>
            <rect
              x={Math.min(tip.x - 2, 220)}
              y={tip.y - 22}
              width={tip.text.length * 5.8 + 10}
              height="16"
              rx="3"
              fill="#1C1C1A"
              opacity="0.85"
            />
            <text
              x={Math.min(tip.x + 3, 225)}
              y={tip.y - 11}
              fontSize="8"
              fill="white"
              fontFamily="Arial,sans-serif"
            >
              {tip.text}
            </text>
          </g>
        )}
      </svg>
      <div className="flex items-center gap-4 mt-2 justify-center">
        {(
          [
            ["#2E7D4F", "Saudável"],
            ["#C07020", "Em estresse"],
            ["#B83232", "Crítico"],
          ] as const
        ).map(([c, l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-xs text-muted">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 10;

export default function Dashboard() {
  const { estatisticas, showModal } = useAppContext();
  const [regioes, setRegioes] = useState<RegiaoComPrevisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [filtroStatus, setFiltroStatus] = useState<StatusVegetacao | "TODOS">(
    "TODOS",
  );
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBioma, setFiltroBioma] = useState("");
  const [ordem, setOrdem] = useState<"risco" | "ndvi" | "nome">("risco");

  useEffect(() => {
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      setLoading(false);
    });
  }, []);

  const estados = [...new Set(regioes.map((r) => r.ds_estado))].sort();
  const biomas = [
    ...new Set(regioes.map((r) => r.ds_bioma).filter(Boolean)),
  ].sort();

  const filtradas = regioes
    .filter(
      (r) =>
        filtroStatus === "TODOS" ||
        r.previsao.ds_status_vegetacao === filtroStatus,
    )
    .filter((r) => !filtroEstado || r.ds_estado === filtroEstado)
    .filter((r) => !filtroBioma || r.ds_bioma === filtroBioma)
    .sort((a, b) =>
      ordem === "risco"
        ? b.previsao.nr_risco_hidrico - a.previsao.nr_risco_hidrico
        : ordem === "ndvi"
          ? a.leitura.nr_ndvi - b.leitura.nr_ndvi
          : a.nm_regiao.localeCompare(b.nm_regiao),
    );

  const totalPages = Math.ceil(filtradas.length / PAGE_SIZE);
  const pagina = filtradas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const limparFiltros = () => {
    setFiltroStatus("TODOS");
    setFiltroEstado("");
    setFiltroBioma("");
    setPage(0);
  };
  const temFiltro = filtroStatus !== "TODOS" || filtroEstado || filtroBioma;

  const handleMonitorar = async (r: RegiaoComPrevisao) => {
    showModal({
      tipo: "info",
      titulo: `Coletar dados para ${r.nm_regiao}?`,
      mensagem: `Vai acionar a coleta automática via NASA POWER e Open-Meteo, executar o modelo IA e salvar a previsão no Oracle. Pode levar até 60 segundos.`,
      onConfirm: async () => {
        try {
          // POST /leituras/automatico/{id} → coleta NASA + Meteo + IA e salva no Oracle
          // POST /leituras/automatico/{id} via flaskApi.monitorar
          await flaskApi.monitorar(r.id_regiao);
          showModal({
            tipo: "sucesso",
            titulo: "Leitura registrada",
            mensagem: `Dados coletados e previsão gerada para ${r.nm_regiao}. Atualize a página para ver os novos dados.`,
          });
          const regs = await javaApi.getRegioes();
          setRegioes(regs);
        } catch {
          showModal({
            tipo: "erro",
            titulo: "Erro",
            mensagem:
              "Falha na coleta. Verifique se o Render está online em global-solution-2026.onrender.com/health",
          });
        }
      },
    });
  };

  if (loading)
    return (
      <div className="bg-dashboard pt-14 min-h-screen">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="bg-dashboard pt-14 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-text">Dashboard</h1>
            <p className="text-sm text-muted">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() =>
              showModal({
                tipo: "info",
                titulo: "Dados em tempo real",
                mensagem:
                  "Dados consumidos da API Java (Quarkus) hospedada no Render, conectada ao Oracle FIAP. Endpoint: global-solution-2026.onrender.com",
              })
            }
            className="text-xs border border-accent/30 text-accent bg-accent-bg px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors font-medium"
          >
            Live
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Regiões",
              value: estatisticas.total_regioes,
              cls: "stat-card-green",
              mono: false,
            },
            {
              label: "Alertas ativos",
              value: estatisticas.alertas_ativos,
              cls: "stat-card-yellow",
              mono: false,
            },
            {
              label: "NDVI médio",
              value: estatisticas.media_ndvi.toFixed(3),
              cls: "stat-card-green",
              mono: true,
            },
            {
              label: "Críticas",
              value: estatisticas.regioes_criticas,
              cls: "stat-card-red",
              mono: false,
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-surface border border-border rounded-xl p-4 text-center ${s.cls}`}
            >
              <div
                className={`text-2xl font-semibold text-text mb-0.5 ${s.mono ? "font-mono" : ""}`}
              >
                {s.value}
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Mapa + Risco */}
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-4">
              Mapa de risco — {regioes.length} regiões
            </p>
            <BrazilMap regioes={regioes} />
          </div>
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-4">
              Risco hídrico — maiores valores
            </p>
            <div className="space-y-3">
              {[...regioes]
                .sort(
                  (a, b) =>
                    b.previsao.nr_risco_hidrico - a.previsao.nr_risco_hidrico,
                )
                .slice(0, 6)
                .map((r) => (
                  <div key={r.id_regiao} className="flex items-center gap-3">
                    <div className="w-28 shrink-0">
                      <p className="text-xs font-medium text-text truncate">
                        {r.nm_regiao}
                      </p>
                      <p className="text-[10px] text-muted">{r.ds_estado}</p>
                    </div>
                    <div className="flex-1">
                      <RiskBar value={r.previsao.nr_risco_hidrico} />
                    </div>
                    <span className="text-xs font-mono text-muted w-10 text-right">
                      {r.previsao.nr_risco_hidrico.toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-surface border border-border rounded-xl p-4 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted shrink-0">
              Filtrar:
            </span>

            {/* Status */}
            <div className="flex gap-1.5 flex-wrap">
              {(["TODOS", "SAUDAVEL", "EM_ESTRESSE", "CRITICO"] as const).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setFiltroStatus(s);
                      setPage(0);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${filtroStatus === s ? "border-accent/40 text-accent bg-accent-bg" : "border-border text-muted hover:text-text"}`}
                  >
                    {s === "TODOS"
                      ? "Todos os status"
                      : s === "EM_ESTRESSE"
                        ? "Em estresse"
                        : s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ),
              )}
            </div>

            {/* Estado */}
            <select
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setPage(0);
              }}
              className="text-xs border border-border rounded-lg px-2.5 py-1 bg-surface text-muted outline-none focus:border-accent"
            >
              <option value="">Todos os estados</option>
              {estados.map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>

            {/* Bioma */}
            <select
              value={filtroBioma}
              onChange={(e) => {
                setFiltroBioma(e.target.value);
                setPage(0);
              }}
              className="text-xs border border-border rounded-lg px-2.5 py-1 bg-surface text-muted outline-none focus:border-accent"
            >
              <option value="">Todos os biomas</option>
              {biomas.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>

            {/* Ordem */}
            <select
              value={ordem}
              onChange={(e) =>
                setOrdem(e.target.value as "risco" | "ndvi" | "nome")
              }
              className="text-xs border border-border rounded-lg px-2.5 py-1 bg-surface text-muted outline-none focus:border-accent"
            >
              <option value="risco">Ordenar: maior risco</option>
              <option value="ndvi">Ordenar: menor NDVI</option>
              <option value="nome">Ordenar: nome A-Z</option>
            </select>

            {temFiltro && (
              <button
                onClick={limparFiltros}
                className="text-xs text-muted hover:text-text transition-colors ml-auto"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista paginada */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-surface2 flex items-center justify-between">
            <p className="text-xs font-medium text-muted">
              {filtradas.length} região{filtradas.length !== 1 ? "s" : ""}{" "}
              encontrada{filtradas.length !== 1 ? "s" : ""}
              {temFiltro && (
                <span className="text-accent ml-1">(filtrado)</span>
              )}
            </p>
            <p className="text-xs text-dim">
              Página {page + 1} de {totalPages || 1}
            </p>
          </div>

          {pagina.length === 0 ? (
            <p className="text-sm text-muted text-center py-10">
              Nenhuma região encontrada com esses filtros.
            </p>
          ) : (
            <>
              {/* Cabeçalho da tabela */}
              <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-2 border-b border-border bg-surface2 text-xs text-muted font-medium">
                <span>Região</span>
                <span>Bioma</span>
                <span>NDVI</span>
                <span>Risco</span>
                <span>Status</span>
                <span></span>
              </div>

              <div className="divide-y divide-border">
                {pagina.map((r) => (
                  <div
                    key={r.id_regiao}
                    className="px-5 py-3 hover:bg-surface2 transition-colors"
                  >
                    <div className="grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center">
                      <div>
                        <p className="text-sm font-medium text-text">
                          {r.nm_regiao}
                        </p>
                        <p className="text-xs text-muted">
                          {r.ds_estado} · {r.leitura.nr_temperatura.toFixed(1)}
                          °C · {r.leitura.nr_dias_sem_chuva}d s/chuva
                        </p>
                      </div>
                      <span className="text-xs text-muted hidden sm:block">
                        {r.ds_bioma || "—"}
                      </span>
                      <span
                        className="text-xs font-mono font-medium hidden sm:block"
                        style={{
                          color:
                            r.leitura.nr_ndvi < 0.3
                              ? "#B83232"
                              : r.leitura.nr_ndvi < 0.5
                                ? "#C07020"
                                : "#2E7D4F",
                        }}
                      >
                        {r.leitura.nr_ndvi.toFixed(3)}
                      </span>
                      <div className="hidden sm:block">
                        <RiskBar value={r.previsao.nr_risco_hidrico} />
                      </div>
                      <div className="hidden sm:block">
                        <StatusBadge status={r.previsao.ds_status_vegetacao} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/regioes/${r.id_regiao}`}
                          className="text-xs text-accent hover:underline font-medium whitespace-nowrap"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                    {/* Mobile: dados extras */}
                    <div className="sm:hidden flex items-center gap-3 mt-2">
                      <RiskBar value={r.previsao.nr_risco_hidrico} />
                      <StatusBadge status={r.previsao.ds_status_vegetacao} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 px-5 py-4 border-t border-border">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:bg-surface2 disabled:opacity-30 transition-colors text-sm"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i).map((i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                        page === i
                          ? "bg-accent text-white border-0"
                          : "border border-border text-muted hover:bg-surface2"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((p) => p + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted hover:bg-surface2 disabled:opacity-30 transition-colors text-sm"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
