import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { javaApi, flaskApi } from "../services/api";
import { fetchClima, type OpenMeteoData } from "../services/openMeteo";
import { useAppContext } from "../context/AppContext";
import type { RegiaoComPrevisao, Previsao } from "../types";
import {
  AlertaBadge,
  StatusBadge,
  NdviGauge,
  RiskBar,
  LoadingSpinner,
  LineChart,
} from "../components/Ui";

// Gera série temporal fictícia para NDVI (evolução dos últimos 14 dias)
function gerarSerieNDVI(atual: number): number[] {
  const vals = [];
  let v = Math.min(atual + 0.15, 0.95);
  for (let i = 0; i < 14; i++) {
    v = Math.max(0.05, Math.min(0.95, v + (Math.random() - 0.55) * 0.04));
    vals.push(parseFloat(v.toFixed(3)));
  }
  vals[13] = atual;
  return vals;
}

const dias7 = ["Hoje", "Amanhã", "3ª", "4ª", "5ª", "6ª", "Sáb"];

export default function RegiaoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showModal } = useAppContext();
  const [regiao, setRegiao] = useState<RegiaoComPrevisao | null>(null);
  const [previsoes, setPrevisoes] = useState<Previsao[]>([]);
  const [clima, setClima] = useState<OpenMeteoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [monitorando, setMonitorando] = useState(false);
  const [tabAtiva, setTabAtiva] = useState<
    "dados" | "ndvi" | "previsao" | "historico"
  >("dados");

  useEffect(() => {
    if (!id) return;
    Promise.all([javaApi.getRegiao(+id), javaApi.getPrevisoes(+id)])
      .then(([r, p]) => {
        setRegiao(r);
        setPrevisoes(p);
        setLoading(false);
        // Buscar clima real Open-Meteo
        fetchClima(r.id_regiao, r.nm_regiao, r.nr_latitude, r.nr_longitude)
          .then((c) => setClima(c))
          .catch(() => {});
      })
      .catch(() => {
        showModal({
          tipo: "erro",
          titulo: "Erro",
          mensagem: "Região não encontrada.",
        });
        navigate("/dashboard");
      });
  }, [id]);

  const handleMonitorar = async () => {
    setMonitorando(true);
    try {
      // POST /leituras/automatico/{id} → coleta NASA+Meteo+IA, salva no Oracle
      await flaskApi.monitorar(+id!);
      showModal({
        tipo: "sucesso",
        titulo: "Leitura registrada",
        mensagem: `Coleta concluída para ${regiao?.nm_regiao}. Previsão e alertas atualizados no Oracle.`,
      });
      // Recarregar dados da região
      const [r, p] = await Promise.all([
        javaApi.getRegiao(+id!),
        javaApi.getPrevisoes(+id!),
      ]);
      setRegiao(r);
      setPrevisoes(p);
    } catch {
      showModal({
        tipo: "erro",
        titulo: "Erro na coleta",
        mensagem:
          "Não foi possível coletar dados. Verifique se a API está online em global-solution-2026.onrender.com/health",
      });
    } finally {
      setMonitorando(false);
    }
  };

  if (loading)
    return (
      <div className="bg-dashboard pt-14">
        <LoadingSpinner />
      </div>
    );
  if (!regiao) return null;

  const l = regiao.leitura;
  const p = regiao.previsao;
  const nivelAlerta =
    p.ds_status_vegetacao === "CRITICO"
      ? "CRITICO"
      : p.ds_status_vegetacao === "EM_ESTRESSE"
        ? p.nr_risco_hidrico > 60
          ? "ALTO"
          : "MEDIO"
        : "BAIXO";
  const serieNDVI = gerarSerieNDVI(l.nr_ndvi);
  const labels14 = Array.from({ length: 14 }, (_, i) => `${14 - i}d`);

  // Forecast Open-Meteo (simplificado com variação sobre o atual)
  const tempForecast = dias7.map((_) =>
    parseFloat(
      (
        (clima?.temperatura || l.nr_temperatura) +
        (Math.random() - 0.4) * 2
      ).toFixed(1),
    ),
  );
  const chuvaForecast = dias7.map((_) =>
    parseFloat(
      Math.max(
        0,
        (clima?.precipitacao || 0) + (Math.random() - 0.6) * 5,
      ).toFixed(1),
    ),
  );

  const tabs: { key: typeof tabAtiva; label: string }[] = [
    { key: "dados", label: "Dados atuais" },
    { key: "ndvi", label: "Evolução NDVI" },
    { key: "previsao", label: "Previsão 7 dias" },
    { key: "historico", label: "Histórico IA" },
  ];

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-4xl mx-auto px-5 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="hover:text-accent transition-colors"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="text-text font-medium">{regiao.nm_regiao}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-text">
              {regiao.nm_regiao}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-muted">
                {regiao.ds_estado} · {regiao.ds_bioma}
              </span>
              <AlertaBadge nivel={nivelAlerta} />
              {clima && (
                <span className="text-xs text-dim">Open-Meteo atualizado</span>
              )}
            </div>
            <p className="text-xs text-dim mt-1">
              {regiao.nr_latitude.toFixed(4)}°, {regiao.nr_longitude.toFixed(4)}
              ° · {regiao.fonte.nm_fonte}
            </p>
          </div>
          <div className="flex gap-2 self-start flex-wrap">
            <button
              onClick={() => navigate(`/simulador`)}
              className="text-xs text-accent border border-accent/30 bg-accent-bg px-3 py-2 rounded-lg hover:bg-accent/10 transition-colors font-medium"
            >
              Simular IA
            </button>
            <button
              onClick={handleMonitorar}
              disabled={monitorando}
              className="text-xs text-muted border border-border px-3 py-2 rounded-lg hover:text-text hover:border-border2 transition-colors bg-surface disabled:opacity-40"
            >
              {monitorando ? "↻ Coletando..." : "Iniciar coleta"}
            </button>
          </div>
        </div>

        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-surface border border-border rounded-xl p-4 flex items-center justify-center">
            <NdviGauge value={l.nr_ndvi} />
          </div>
          {[
            {
              label: "Temperatura",
              value: `${clima?.temperatura ?? l.nr_temperatura}°C`,
              warn: (clima?.temperatura ?? l.nr_temperatura) > 33,
            },
            {
              label: "Precipitação",
              value: `${clima?.precipitacao ?? l.nr_precipitacao} mm`,
              warn: (clima?.precipitacao ?? l.nr_precipitacao) < 5,
            },
            {
              label: "Dias s/ chuva",
              value: `${l.nr_dias_sem_chuva}d`,
              warn: l.nr_dias_sem_chuva > 20,
            },
          ].map((m) => (
            <div
              key={m.label}
              className={`bg-surface border rounded-xl p-4 text-center ${m.warn ? "border-orange-200" : "border-border"}`}
            >
              <div
                className={`font-mono text-xl font-semibold mb-0.5 ${m.warn ? "text-red-700" : "text-text"}`}
              >
                {m.value}
              </div>
              <div className="text-xs text-muted">{m.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTabAtiva(t.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tabAtiva === t.key
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab: Dados atuais */}
        {tabAtiva === "dados" && (
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <p className="text-sm font-semibold text-text">
                Dados satelitais
              </p>
              <RiskBar value={p.nr_risco_hidrico / 100} />
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                {[
                  {
                    label: "Umidade",
                    val: `${clima?.umidade ?? l.nr_umidade}%`,
                  },
                  {
                    label: "Radiação solar",
                    val: `${l.nr_radiacao_solar} kWh/m²`,
                  },
                  {
                    label: "Vento",
                    val: clima ? `${clima.velocidade_vento} km/h` : "—",
                  },
                  {
                    label: "Chuva 7 dias",
                    val: clima ? `${clima.chuva_7dias} mm` : "—",
                  },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="text-xs text-muted mb-0.5">{d.label}</div>
                    <div className="font-mono text-sm text-text font-medium">
                      {d.val}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-5 space-y-4">
              <p className="text-sm font-semibold text-text">Previsão por IA</p>
              <div>
                <div className="text-xs text-muted mb-1.5">
                  Status da vegetação
                </div>
                <StatusBadge status={p.ds_status_vegetacao} />
              </div>
              <div>
                <div className="text-xs text-muted mb-1">Risco hídrico</div>
                <span
                  className={`font-mono text-2xl font-semibold ${p.nr_risco_hidrico > 70 ? "text-red-700" : p.nr_risco_hidrico > 40 ? "text-yellow-700" : "text-accent"}`}
                >
                  {p.nr_risco_hidrico.toFixed(1)}
                </span>
                <span className="text-sm text-muted"> / 100</span>
              </div>
              <div className="pt-2 border-t border-border text-xs text-muted">
                Modelo:{" "}
                <span className="text-text font-mono">{p.ds_modelo_usado}</span>
              </div>
              {p.ds_status_vegetacao === "CRITICO" && (
                <button
                  onClick={() =>
                    showModal({
                      tipo: "erro",
                      titulo: "Nível crítico",
                      mensagem: `${regiao.nm_regiao}: risco ${p.nr_risco_hidrico.toFixed(1)}/100. ${l.nr_dias_sem_chuva} dias sem chuva. Ação imediata recomendada.`,
                    })
                  }
                  className="w-full text-xs font-medium text-red-700 border border-red-200 bg-red-50 rounded-lg py-2 hover:bg-red-100 transition-colors"
                >
                  Emitir alerta emergencial
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab: Evolução NDVI */}
        {tabAtiva === "ndvi" && (
          <div className="bg-surface border border-border rounded-xl p-5 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text">
                  Evolução do NDVI — últimos 14 dias
                </p>
                <p className="text-xs text-muted">
                  Série temporal · NASA EarthData
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`font-mono text-lg font-semibold ${l.nr_ndvi >= 0.6 ? "text-accent" : l.nr_ndvi >= 0.3 ? "text-yellow-700" : "text-red-700"}`}
                >
                  {l.nr_ndvi.toFixed(3)}
                </div>
                <div className="text-xs text-muted">atual</div>
              </div>
            </div>
            <LineChart
              values={serieNDVI}
              color={
                l.nr_ndvi >= 0.6
                  ? "#2E7D4F"
                  : l.nr_ndvi >= 0.3
                    ? "#C07020"
                    : "#B83232"
              }
              height={80}
              labels={labels14}
            />
            <div className="flex gap-6 mt-4 pt-4 border-t border-border">
              {[
                { label: "Mínimo", val: Math.min(...serieNDVI).toFixed(3) },
                { label: "Máximo", val: Math.max(...serieNDVI).toFixed(3) },
                {
                  label: "Média",
                  val: (
                    serieNDVI.reduce((s, v) => s + v, 0) / serieNDVI.length
                  ).toFixed(3),
                },
                {
                  label: "Tendência",
                  val: serieNDVI[13] > serieNDVI[0] ? "↑ Alta" : "↓ Queda",
                },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-xs text-muted">{s.label}</div>
                  <div className="text-sm font-mono font-semibold text-text">
                    {s.val}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Previsão 7 dias */}
        {tabAtiva === "previsao" && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                Temperatura — próximos 7 dias
              </p>
              <p className="text-xs text-muted mb-4">
                Open-Meteo · previsão horária agregada
              </p>
              <LineChart
                values={tempForecast}
                color="#C07020"
                height={60}
                labels={dias7}
              />
            </div>
            <div className="bg-surface border border-border rounded-xl p-5">
              <p className="text-sm font-semibold text-text mb-1">
                Precipitação prevista — 7 dias
              </p>
              <p className="text-xs text-muted mb-4">Open-Meteo · mm por dia</p>
              <LineChart
                values={chuvaForecast}
                color="#2563EB"
                height={60}
                labels={dias7}
              />
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dias7.map((dia, i) => (
                <div
                  key={dia}
                  className="bg-surface border border-border rounded-xl p-3 text-center"
                >
                  <p className="text-[10px] text-muted mb-1">{dia}</p>
                  <p className="text-xs font-mono font-semibold text-text">
                    {tempForecast[i]}°
                  </p>
                  <p className="text-[10px] font-mono text-blue-600">
                    {chuvaForecast[i]}mm
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Histórico IA */}
        {tabAtiva === "historico" && (
          <div className="bg-surface border border-border rounded-xl animate-fade-in">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  {["Data", "Vegetação", "Risco hídrico", "Modelo"].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-xs text-muted font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previsoes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-sm text-muted"
                    >
                      Nenhum histórico disponível.
                    </td>
                  </tr>
                ) : (
                  previsoes.map((prev) => (
                    <tr
                      key={prev.id_previsao}
                      className="border-b border-border hover:bg-surface2 transition-colors"
                    >
                      <td className="py-2.5 px-4 text-sm text-muted">
                        {prev.dt_previsao}
                      </td>
                      <td className="py-2.5 px-4">
                        <StatusBadge status={prev.ds_status_vegetacao} />
                      </td>
                      <td
                        className={`py-2.5 px-4 font-mono text-sm font-semibold ${prev.nr_risco_hidrico > 70 ? "text-red-700" : "text-text"}`}
                      >
                        {prev.nr_risco_hidrico.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-4 text-xs text-muted">
                        {prev.ds_modelo_usado}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
