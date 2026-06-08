import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { javaApi } from "../services/api";
import type { AlertaDetalhado, NivelAlerta } from "../types";
import { AlertaBadge, StatusBadge, LoadingSpinner } from "../components/Ui";

export default function Alertas() {
  const { showModal } = useAppContext();
  const [alertas, setAlertas] = useState<AlertaDetalhado[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<NivelAlerta | "TODOS">("TODOS");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [resolvendo, setResolvendo] = useState<number | null>(null);

  useEffect(() => {
    javaApi.getAlertas().then((a) => {
      setAlertas(a);
      setLoading(false);
    });
  }, []);

  const filtrados =
    filtro === "TODOS" ? alertas : alertas.filter((a) => a.ds_nivel === filtro);
  const count = (n: string) =>
    n === "TODOS"
      ? alertas.length
      : alertas.filter((a) => a.ds_nivel === n).length;

  // PUT /alertas/{id}/resolver
  const handleResolver = async (id: number, nmRegiao: string) => {
    setResolvendo(id);
    try {
      await javaApi.resolverAlerta(id);
      setAlertas((prev) =>
        prev.map((a) => (a.id_alerta === id ? { ...a, fl_resolvido: "S" } : a)),
      );
      showModal({
        tipo: "sucesso",
        titulo: "Alerta resolvido",
        mensagem: `Alerta de ${nmRegiao} marcado como resolvido.`,
      });
    } catch {
      showModal({
        tipo: "erro",
        titulo: "Erro",
        mensagem: "Não foi possível resolver o alerta. Tente novamente.",
      });
    } finally {
      setResolvendo(null);
    }
  };

  if (loading)
    return (
      <div className="pt-14">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-lg font-semibold text-text mb-1">Alertas</h1>
        <p className="text-sm text-muted mb-7">
          {alertas.filter((a) => a.fl_resolvido === "N").length} ativos
          {" · "}
          {alertas.filter((a) => a.fl_resolvido === "S").length} resolvidos
        </p>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["TODOS", "CRITICO", "ALTO", "MEDIO", "BAIXO"] as const).map(
            (n) => (
              <button
                key={n}
                onClick={() => setFiltro(n)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors font-medium ${
                  filtro === n
                    ? "border-accent/40 text-accent bg-accent-bg"
                    : "border-border text-muted hover:text-text bg-surface"
                }`}
              >
                {n} <span className="opacity-50 font-normal">{count(n)}</span>
              </button>
            ),
          )}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">
            Nenhum alerta encontrado.
          </div>
        )}

        <div className="space-y-2">
          {filtrados.map((a) => (
            <div
              key={a.id_alerta}
              className={`bg-surface border rounded-xl overflow-hidden transition-colors ${
                a.ds_nivel === "CRITICO" && a.fl_resolvido === "N"
                  ? "border-red-200"
                  : "border-border hover:border-border2"
              }`}
            >
              {/* Header do card */}
              <div
                className="p-4 cursor-pointer"
                onClick={() =>
                  setExpanded(expanded === a.id_alerta ? null : a.id_alerta)
                }
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <AlertaBadge nivel={a.ds_nivel} />
                      <span className="text-sm font-semibold text-text">
                        {a.regiao.nm_regiao}
                      </span>
                      <span className="text-xs text-muted">
                        {a.regiao.ds_estado}
                      </span>
                      {a.fl_resolvido === "S" && (
                        <span className="text-xs bg-green-50 text-accent border border-accent/25 px-1.5 py-0.5 rounded-md font-medium">
                          Resolvido
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {a.ds_mensagem}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs text-dim">{a.dt_alerta}</span>
                    <StatusBadge status={a.previsao.ds_status_vegetacao} />
                  </div>
                </div>
                {a.ds_nivel === "CRITICO" && a.fl_resolvido === "N" && (
                  <div className="mt-3 pt-2.5 border-t border-red-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-red-600 font-medium">
                      Ação imediata recomendada
                    </span>
                  </div>
                )}
              </div>

              {/* Expandido */}
              {expanded === a.id_alerta && (
                <div className="border-t border-border px-4 py-4 bg-surface2 animate-slide-up space-y-4">
                  {/* Risco hídrico */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted">Risco hídrico</span>
                    <span
                      className={`font-mono font-semibold ${a.previsao.nr_risco_hidrico > 70 ? "text-red-700" : "text-text"}`}
                    >
                      {a.previsao.nr_risco_hidrico.toFixed(1)}/100
                    </span>
                  </div>

                  {/* Histórico de ações */}
                  {a.historico.length > 0 && (
                    <div>
                      <p className="text-xs text-muted mb-2 font-medium">
                        Histórico de ações
                      </p>
                      <div className="space-y-1.5">
                        {a.historico.map((h) => (
                          <div
                            key={h.id_historico}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="font-medium px-2 py-0.5 rounded-md border bg-green-50 text-accent border-accent/30 shrink-0">
                              {h.ds_acao}
                            </span>
                            <span className="text-muted flex-1">
                              {h.ds_observacao}
                            </span>
                            <span className="text-dim font-mono shrink-0">
                              {h.dt_acao?.split("T")[1]?.slice(0, 5)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      to={`/regioes/${a.id_regiao}`}
                      className="text-xs text-accent border border-accent/30 bg-accent-bg px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors font-medium"
                    >
                      Ver região →
                    </Link>

                    {/* PUT /alertas/{id}/resolver */}
                    {a.fl_resolvido === "N" && (
                      <button
                        disabled={resolvendo === a.id_alerta}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolver(a.id_alerta, a.regiao.nm_regiao);
                        }}
                        className="text-xs text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resolvendo === a.id_alerta
                          ? "Resolvendo…"
                          : "✓ Marcar como resolvido"}
                      </button>
                    )}

                    {a.ds_nivel === "CRITICO" && a.fl_resolvido === "N" && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            showModal({
                              tipo: "erro",
                              titulo: `Alerta crítico — ${a.regiao.nm_regiao}`,
                              mensagem: a.ds_mensagem,
                            });
                          }}
                          className="text-xs text-red-700 border border-red-200 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                          Detalhar
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`ALERTA CRITICO AgroSat\nRegiao: ${a.regiao.nm_regiao} (${a.regiao.ds_estado})\nRisco hidrico: ${a.previsao.nr_risco_hidrico.toFixed(1)}%\n${a.ds_mensagem}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium"
                        >
                          WhatsApp
                        </a>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
