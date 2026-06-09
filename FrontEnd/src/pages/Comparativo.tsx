//Comparativo
import { useState, useEffect } from "react";
import { javaApi } from "../services/api";
import type { RegiaoComPrevisao } from "../types";
import { StatusBadge, LoadingSpinner } from "../components/Ui";

export default function Comparativo() {
  const [regioes, setRegioes] = useState<RegiaoComPrevisao[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionadas, setSelecionadas] = useState<number[]>([]);

  useEffect(() => {
    javaApi.getRegioes().then((r) => {
      setRegioes(r);
      // Pré-selecionar as 3 mais críticas
      const sorted = [...r].sort(
        (a, b) => b.previsao.nr_risco_hidrico - a.previsao.nr_risco_hidrico,
      );
      setSelecionadas(sorted.slice(0, 3).map((r) => r.id_regiao));
      setLoading(false);
    });
  }, []);

  const toggle = (id: number) => {
    setSelecionadas((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev,
    );
  };

  const sels = regioes.filter((r) => selecionadas.includes(r.id_regiao));

  const colors = ["#2E7D4F", "#2563EB", "#C07020"];

  if (loading)
    return (
      <div className="bg-comparativo pt-14">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="bg-comparativo pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="mb-6">
          <h1 className="text-lg font-semibold text-text">
            Comparativo de Regiões
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Selecione até 3 regiões para comparar lado a lado.
          </p>
        </div>

        {/* Seleção */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-6">
          <p className="text-xs font-medium text-muted mb-3">
            Selecionar regiões ({selecionadas.length}/3)
          </p>
          <div className="flex flex-wrap gap-2">
            {regioes.map((r) => {
              const sel = selecionadas.includes(r.id_regiao);
              const idx = selecionadas.indexOf(r.id_regiao);
              return (
                <button
                  key={r.id_regiao}
                  onClick={() => toggle(r.id_regiao)}
                  disabled={!sel && selecionadas.length >= 3}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    sel
                      ? "text-white border-transparent"
                      : "bg-surface border-border text-muted hover:border-border2 disabled:opacity-40"
                  }`}
                  style={sel ? { background: colors[idx] } : {}}
                >
                  {r.nm_regiao} — {r.ds_estado}
                </button>
              );
            })}
          </div>
        </div>

        {sels.length === 0 && (
          <div className="text-center py-16 text-muted text-sm">
            Selecione ao menos uma região para comparar.
          </div>
        )}

        {sels.length > 0 && (
          <>
            {/* Cards lado a lado */}
            <div
              className={`grid gap-4 mb-6 ${sels.length === 1 ? "grid-cols-1 max-w-sm" : sels.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
            >
              {sels.map((r, i) => (
                <div
                  key={r.id_regiao}
                  className="bg-surface border-2 rounded-xl p-5"
                  style={{ borderColor: colors[i] + "60" }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: colors[i] }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-text">
                        {r.nm_regiao}
                      </p>
                      <p className="text-xs text-muted">
                        {r.ds_estado} · {r.ds_bioma}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        label: "NDVI",
                        val: r.leitura.nr_ndvi.toFixed(2),
                        warn: r.leitura.nr_ndvi < 0.3,
                      },
                      {
                        label: "Temperatura",
                        val: `${r.leitura.nr_temperatura}°C`,
                        warn: r.leitura.nr_temperatura > 33,
                      },
                      {
                        label: "Precipitação",
                        val: `${r.leitura.nr_precipitacao} mm`,
                        warn: r.leitura.nr_precipitacao < 5,
                      },
                      {
                        label: "Umidade",
                        val: `${r.leitura.nr_umidade}%`,
                        warn: r.leitura.nr_umidade < 30,
                      },
                      {
                        label: "Dias s/ chuva",
                        val: `${r.leitura.nr_dias_sem_chuva}d`,
                        warn: r.leitura.nr_dias_sem_chuva > 20,
                      },
                    ].map((m) => (
                      <div
                        key={m.label}
                        className="flex justify-between items-center"
                      >
                        <span className="text-xs text-muted">{m.label}</span>
                        <span
                          className={`text-xs font-mono font-semibold ${m.warn ? "text-red-700" : "text-text"}`}
                        >
                          {m.val}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-muted">
                          Risco hídrico
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${r.previsao.nr_risco_hidrico > 70 ? "text-red-700" : "text-text"}`}
                        >
                          {r.previsao.nr_risco_hidrico.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.previsao.nr_risco_hidrico}%`,
                            background: colors[i],
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-muted">Status</span>
                      <StatusBadge status={r.previsao.ds_status_vegetacao} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gráfico comparativo — Risco hídrico */}
            <div className="bg-surface border border-border rounded-xl p-5 mb-4">
              <p className="text-sm font-semibold text-text mb-4">
                Risco hídrico comparado
              </p>
              <div className="space-y-3">
                {sels.map((r, i) => (
                  <div key={r.id_regiao} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-28 truncate">
                      {r.nm_regiao}
                    </span>
                    <div className="flex-1 h-4 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full flex items-center pl-2 text-white text-[10px] font-mono transition-all duration-700"
                        style={{
                          width: `${r.previsao.nr_risco_hidrico}%`,
                          background: colors[i],
                          minWidth: "2rem",
                        }}
                      >
                        {r.previsao.nr_risco_hidrico.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico NDVI sobrepostos */}
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                NDVI das regiões selecionadas
              </p>
              <p className="text-xs text-muted mb-4">
                Valores atuais — comparação visual
              </p>
              <div className="flex items-end gap-4 h-32">
                {sels.map((r, i) => {
                  const h = Math.max(r.leitura.nr_ndvi * 100, 4);
                  return (
                    <div
                      key={r.id_regiao}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <span
                        className="text-xs font-mono font-bold"
                        style={{ color: colors[i] }}
                      >
                        {r.leitura.nr_ndvi.toFixed(2)}
                      </span>
                      <div
                        className="w-full rounded-t-lg transition-all duration-700"
                        style={{
                          height: `${h}%`,
                          background: colors[i],
                          opacity: 0.85,
                        }}
                      />
                      <span className="text-[10px] text-muted text-center leading-tight">
                        {r.nm_regiao}
                      </span>
                    </div>
                  );
                })}
                {/* Linhas de referência */}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-dim">
                <span>NDVI &gt; 0.6 = saudável</span>
                <span>0.3–0.6 = estresse</span>
                <span>&lt; 0.3 = crítico</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
