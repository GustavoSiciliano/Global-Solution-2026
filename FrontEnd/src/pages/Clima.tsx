import { useState, useEffect } from "react";
import {
  fetchClimaTodasRegioes,
  type OpenMeteoData,
} from "../services/openMeteo";
import { javaApi } from "../services/api";
import type { Regiao } from "../types";
import { LoadingSpinner } from "../components/Ui";

function ClimaBadge({
  valor,
  tipo,
}: {
  valor: number;
  tipo: "temp" | "chuva" | "umidade" | "vento";
}) {
  let color = "text-text";
  if (tipo === "temp")
    color =
      valor > 33 ? "text-red-700" : valor < 20 ? "text-blue-600" : "text-text";
  if (tipo === "chuva")
    color =
      valor === 0
        ? "text-orange-700"
        : valor > 20
          ? "text-blue-600"
          : "text-text";
  if (tipo === "umidade")
    color =
      valor < 30 ? "text-red-700" : valor > 80 ? "text-blue-600" : "text-text";
  return (
    <span className={`font-mono text-sm font-medium ${color}`}>{valor}</span>
  );
}

export default function Clima() {
  const [dados, setDados] = useState<OpenMeteoData[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizadoEm, setAtualizadoEm] = useState("");
  const [page, setPage] = useState(0);
  const [filtroBioma, setFiltroBioma] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const PAGE_SIZE = 10;

  const carregar = async (regsParam?: Regiao[]) => {
    setLoading(true);
    setErro(null);
    try {
      // Busca regiões da API Java se ainda não foram carregadas
      const regsBase = regsParam ?? regioes;
      const regsParaUsar =
        regsBase.length > 0
          ? regsBase
          : await javaApi.getRegioes().then((r) => {
              setRegioes(r);
              return r;
            });

      const resultado = await fetchClimaTodasRegioes(regsParaUsar);
      setDados(resultado);
      setAtualizadoEm(new Date().toLocaleString("pt-BR"));
    } catch {
      setErro(
        "Não foi possível conectar à API de clima. Verifique sua conexão.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carrega regiões da API Java e em seguida busca o clima de cada uma
    javaApi.getRegioes().then((regs) => {
      setRegioes(regs);
      carregar(regs);
    });
  }, []);

  const estados = [...new Set(regioes.map((r) => r.ds_estado))].sort();
  const biomas = [
    ...new Set(regioes.map((r) => r.ds_bioma).filter(Boolean)),
  ].sort();
  const dadosFiltrados = dados
    .filter(
      (d) =>
        !filtroEstado ||
        regioes.find((r) => r.id_regiao === d.regiao_id)?.ds_estado ===
          filtroEstado,
    )
    .filter(
      (d) =>
        !filtroBioma ||
        regioes.find((r) => r.id_regiao === d.regiao_id)?.ds_bioma ===
          filtroBioma,
    );
  const totalPages = Math.ceil(dadosFiltrados.length / PAGE_SIZE);
  const dadosPagina = dadosFiltrados.slice(
    page * PAGE_SIZE,
    (page + 1) * PAGE_SIZE,
  );

  const maiorTemp = dados.length
    ? Math.max(...dados.map((d) => d.temperatura))
    : 0;
  const menorTemp = dados.length
    ? Math.min(...dados.map((d) => d.temperatura))
    : 0;
  const menorChuva = dados.length
    ? dados.filter((d) => d.precipitacao === 0).length
    : 0;
  const mediaUmi = dados.length
    ? Math.round(dados.reduce((s, d) => s + d.umidade, 0) / dados.length)
    : 0;

  return (
    <div className="bg-clima pt-14 min-h-screen">
      <div className="max-w-6xl mx-auto px-5 py-8">
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-semibold text-text">
              Clima em tempo real
            </h1>
            <p className="text-sm text-muted mt-0.5">
              Dados ao vivo das {regioes.length || "—"} regiões monitoradas via{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Open-Meteo API
              </a>
            </p>
            {atualizadoEm && (
              <p className="text-xs text-dim mt-1">
                Atualizado às {atualizadoEm}
              </p>
            )}
          </div>
          <button
            onClick={() => carregar()}
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

        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 flex items-start gap-3">
            <span className="text-red-600 text-lg">⚠</span>
            <div>
              <p className="text-sm font-medium text-red-700">
                Erro ao carregar dados
              </p>
              <p className="text-sm text-red-600 mt-0.5">{erro}</p>
            </div>
          </div>
        )}

        {!loading && dados.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {[
                {
                  label: "Temp. máxima",
                  value: `${maiorTemp}°C`,
                  sub: "no momento",
                  cls: "stat-card-red",
                },
                {
                  label: "Temp. mínima",
                  value: `${menorTemp}°C`,
                  sub: "no momento",
                  cls: "stat-card-blue",
                },
                {
                  label: "Sem chuva",
                  value: menorChuva,
                  sub: "regiões agora",
                  cls: "stat-card-yellow",
                },
                {
                  label: "Umidade média",
                  value: `${mediaUmi}%`,
                  sub: "das regiões",
                  cls: "stat-card-green",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className={`bg-surface border border-border rounded-xl p-4 ${s.cls}`}
                >
                  <div className="font-mono text-2xl text-text mb-0.5">
                    {s.value}
                  </div>
                  <div className="text-xs font-medium text-text">{s.label}</div>
                  <div className="text-xs text-muted">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div className="bg-surface border border-border rounded-xl p-4 mb-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-muted">Filtrar:</span>
                <select
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setPage(0);
                  }}
                  className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-muted outline-none focus:border-accent"
                >
                  <option value="">Todos os estados</option>
                  {estados.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <select
                  value={filtroBioma}
                  onChange={(e) => {
                    setFiltroBioma(e.target.value);
                    setPage(0);
                  }}
                  className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-surface text-muted outline-none focus:border-accent"
                >
                  <option value="">Todos os biomas</option>
                  {biomas.map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
                {(filtroEstado || filtroBioma) && (
                  <button
                    onClick={() => {
                      setFiltroEstado("");
                      setFiltroBioma("");
                      setPage(0);
                    }}
                    className="text-xs text-muted hover:text-text transition-colors ml-auto"
                  >
                    Limpar
                  </button>
                )}
                <span className="text-xs text-dim ml-auto">
                  {dadosFiltrados.length} de {dados.length} regiões
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {dadosPagina.map((d) => {
                const regiao = regioes.find((r) => r.id_regiao === d.regiao_id);
                const alertaSeca = d.precipitacao === 0 && d.umidade < 40;
                return (
                  <div
                    key={d.regiao_id}
                    className={`bg-surface border rounded-xl p-5 hover:border-border2 transition-colors ${
                      alertaSeca ? "border-orange-200" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {d.nm_regiao}
                        </p>
                        <p className="text-xs text-muted">
                          {regiao?.ds_estado ?? "—"} · {regiao?.ds_bioma ?? "—"}
                        </p>
                      </div>
                      {alertaSeca && (
                        <span className="text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md font-medium">
                          Seco
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                      <div>
                        <p className="text-xs text-muted mb-0.5">Temperatura</p>
                        <div className="flex items-baseline gap-1">
                          <ClimaBadge valor={d.temperatura} tipo="temp" />
                          <span className="text-xs text-dim">°C</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-0.5">Umidade</p>
                        <div className="flex items-baseline gap-1">
                          <ClimaBadge valor={d.umidade} tipo="umidade" />
                          <span className="text-xs text-dim">%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-0.5">
                          Precipitação
                        </p>
                        <div className="flex items-baseline gap-1">
                          <ClimaBadge valor={d.precipitacao} tipo="chuva" />
                          <span className="text-xs text-dim">mm</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted mb-0.5">Vento</p>
                        <div className="flex items-baseline gap-1">
                          <ClimaBadge valor={d.velocidade_vento} tipo="vento" />
                          <span className="text-xs text-dim">km/h</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted">
                          Chuva (7 dias)
                        </span>
                        <span
                          className={`text-xs font-mono font-medium ${d.chuva_7dias < 10 ? "text-orange-700" : "text-accent"}`}
                        >
                          {d.chuva_7dias} mm
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${d.chuva_7dias < 10 ? "bg-orange-400" : "bg-accent"}`}
                          style={{
                            width: `${Math.min((d.chuva_7dias / 100) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted">Radiação solar</span>
                      <span className="text-xs font-mono text-muted">
                        {d.radiacao_solar} W/m²
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-6">
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
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors ${page === i ? "bg-accent text-white" : "border border-border text-muted hover:bg-surface2"}`}
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
            <div className="bg-surface border border-border rounded-xl">
              <div className="px-5 py-4 border-b border-border">
                <p className="text-sm font-semibold text-text">
                  Comparativo entre regiões
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Ordenado por temperatura (maior para menor)
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface2">
                      {[
                        "Região",
                        "UF",
                        "Temp.",
                        "Umidade",
                        "Precipitação",
                        "Vento",
                        "Chuva 7d",
                        "Radiação",
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
                    {[...dadosFiltrados]
                      .sort((a, b) => b.temperatura - a.temperatura)
                      .map((d) => {
                        const reg = regioes.find(
                          (r) => r.id_regiao === d.regiao_id,
                        );
                        return (
                          <tr
                            key={d.regiao_id}
                            className="border-b border-border hover:bg-surface2 transition-colors"
                          >
                            <td className="py-2.5 px-4 text-sm text-text font-medium">
                              {d.nm_regiao}
                            </td>
                            <td className="py-2.5 px-4 text-xs font-mono text-muted">
                              {reg?.ds_estado ?? "—"}
                            </td>
                            <td
                              className={`py-2.5 px-4 text-sm font-mono font-medium ${d.temperatura > 33 ? "text-red-700" : "text-text"}`}
                            >
                              {d.temperatura}°C
                            </td>
                            <td
                              className={`py-2.5 px-4 text-sm font-mono ${d.umidade < 30 ? "text-red-700" : "text-muted"}`}
                            >
                              {d.umidade}%
                            </td>
                            <td
                              className={`py-2.5 px-4 text-sm font-mono ${d.precipitacao === 0 ? "text-orange-700" : "text-muted"}`}
                            >
                              {d.precipitacao} mm
                            </td>
                            <td className="py-2.5 px-4 text-sm font-mono text-muted">
                              {d.velocidade_vento} km/h
                            </td>
                            <td
                              className={`py-2.5 px-4 text-sm font-mono font-medium ${d.chuva_7dias < 10 ? "text-orange-700" : "text-accent"}`}
                            >
                              {d.chuva_7dias} mm
                            </td>
                            <td className="py-2.5 px-4 text-xs font-mono text-muted">
                              {d.radiacao_solar} W/m²
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs text-dim text-center mt-4">
              Dados fornecidos por{" "}
              <a
                href="https://open-meteo.com"
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                Open-Meteo
              </a>{" "}
              — API gratuita e sem autenticação
            </p>
          </>
        )}
      </div>
    </div>
  );
}
