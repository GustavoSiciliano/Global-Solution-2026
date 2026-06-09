import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { javaApi } from "../services/api";
import type { AlertaDetalhado, NivelAlerta } from "../types";
import { AlertaBadge, StatusBadge, LoadingSpinner } from "../components/Ui";

const ACOES = ["VISUALIZADO", "RECONHECIDO", "RESOLVIDO", "IGNORADO"] as const;
type Acao = (typeof ACOES)[number];

const acao_cor: Record<Acao, string> = {
  VISUALIZADO: "bg-blue-50 text-blue-700 border-blue-200",
  RECONHECIDO: "bg-yellow-50 text-yellow-700 border-yellow-200",
  RESOLVIDO: "bg-green-50 text-accent border-accent/25",
  IGNORADO: "bg-surface2 text-muted border-border",
};

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

  // PUT /alertas/{id}/resolver + POST /alertas/historico (TB_HISTORICO_ALERTA)
  const handleResolver = async (id: number, nmRegiao: string) => {
    setResolvendo(id);
    try {
      await javaApi.resolverAlerta(id);
      // Registra no TB_HISTORICO_ALERTA — ds_acao='RESOLVIDO'
      await javaApi.registrarHistorico(
        id,
        1,
        "RESOLVIDO",
        `Alerta de ${nmRegiao} resolvido pelo operador`,
      );
      setAlertas((prev) =>
        prev.map((a) => (a.id_alerta === id ? { ...a, fl_resolvido: "S" } : a)),
      );
      showModal({
        tipo: "sucesso",
        titulo: "Alerta resolvido",
        mensagem: `Alerta de ${nmRegiao} marcado como resolvido e registrado no histórico.`,
      });
    } catch {
      showModal({
        tipo: "erro",
        titulo: "Erro",
        mensagem: "Não foi possível resolver o alerta.",
      });
    } finally {
      setResolvendo(null);
    }
  };

  if (loading)
    return (
      <div className="bg-alertas pt-14 min-h-screen">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="bg-alertas pt-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <h1 className="text-lg font-semibold text-text mb-1">Alertas</h1>
        <p className="text-sm text-muted mb-7">
          {alertas.filter((a) => a.fl_resolvido === "N").length} pendentes
          {" · "}
          {alertas.filter((a) => a.fl_resolvido === "S").length} resolvidos
          {" · "}
          {alertas.length} total
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
                {n}{" "}
                <span className="opacity-50 font-normal ml-1">{count(n)}</span>
              </button>
            ),
          )}
        </div>

        {filtrados.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">
            Nenhum alerta {filtro !== "TODOS" ? `com nível ${filtro}` : ""}{" "}
            encontrado.
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
              {/* Header */}
              <div
                className="p-4 cursor-pointer select-none"
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
                    <span className="text-xs text-dim font-mono">
                      {a.dt_alerta}
                    </span>
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

              {/* Detalhes expandidos */}
              {expanded === a.id_alerta && (
                <div className="border-t border-border px-4 py-4 bg-surface2 animate-slide-up space-y-4">
                  {/* Dados da previsão */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-surface border border-border rounded-lg p-3">
                      <p className="text-xs text-muted mb-0.5">Risco hídrico</p>
                      <p
                        className={`text-sm font-mono font-semibold ${a.previsao.nr_risco_hidrico > 70 ? "text-red-700" : a.previsao.nr_risco_hidrico > 40 ? "text-orange-700" : "text-text"}`}
                      >
                        {a.previsao.nr_risco_hidrico.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-3">
                      <p className="text-xs text-muted mb-0.5">Modelo</p>
                      <p className="text-xs font-mono text-text">
                        {a.previsao.ds_modelo_usado}
                      </p>
                    </div>
                    <div className="bg-surface border border-border rounded-lg p-3">
                      <p className="text-xs text-muted mb-0.5">Status</p>
                      <StatusBadge status={a.previsao.ds_status_vegetacao} />
                    </div>
                  </div>

                  {/* Histórico de ações — TB_HISTORICO_ALERTA */}
                  <div>
                    <p className="text-xs font-medium text-muted mb-2">
                      Histórico de ações
                      {a.historico.length > 0 && (
                        <span className="ml-1 text-accent">
                          ({a.historico.length})
                        </span>
                      )}
                    </p>
                    {a.historico.length === 0 ? (
                      <p className="text-xs text-dim italic">
                        Nenhuma ação registrada ainda.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {a.historico.map((h) => (
                          <div
                            key={h.id_historico}
                            className="flex items-start gap-2"
                          >
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border shrink-0 ${acao_cor[h.ds_acao as Acao]}`}
                            >
                              {h.ds_acao}
                            </span>
                            <span className="text-xs text-muted flex-1">
                              {h.ds_observacao}
                            </span>
                            <span className="text-[10px] text-dim font-mono shrink-0">
                              {h.dt_acao}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Ações disponíveis */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Link
                      to={`/regioes/${a.id_regiao}`}
                      className="text-xs text-accent border border-accent/30 bg-accent-bg px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors font-medium"
                    >
                      Ver região
                    </Link>

                    {/* PUT /alertas/{id}/resolver + POST /alertas/historico */}
                    {a.fl_resolvido === "N" && (
                      <button
                        disabled={resolvendo === a.id_alerta}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolver(a.id_alerta, a.regiao.nm_regiao);
                        }}
                        className="text-xs text-accent border border-accent/30 bg-accent-bg px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {resolvendo === a.id_alerta
                          ? "Salvando..."
                          : "Marcar como resolvido"}
                      </button>
                    )}

                    {a.ds_nivel === "CRITICO" && a.fl_resolvido === "N" && (
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `ALERTA CRITICO — AgroSat\nRegiao: ${a.regiao.nm_regiao} (${a.regiao.ds_estado})\nRisco hidrico: ${a.previsao.nr_risco_hidrico.toFixed(1)}%\n${a.ds_mensagem}`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-green-700 border border-green-200 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors font-medium"
                      >
                        WhatsApp
                      </a>
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
