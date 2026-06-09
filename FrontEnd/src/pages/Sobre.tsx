import { useState, useEffect } from "react";
import { javaApi } from "../services/api";
import type { FonteSatelital, Regiao } from "../types";
import { LoadingSpinner } from "../components/Ui";
import { mockFontes, mockRegioes } from "../data/mockData";

const tipoCfg: Record<string, { label: string; cls: string }> = {
  NDVI: { label: "NDVI", cls: "bg-accent-bg text-accent border-accent/25" },
  CLIMA: { label: "Clima", cls: "bg-blue-50 text-blue-700 border-blue-200" },
  QUEIMADA: { label: "Queimada", cls: "bg-red-50 text-red-700 border-red-200" },
  DESMATAMENTO: {
    label: "Desmatamento",
    cls: "bg-orange-50 text-orange-700 border-orange-200",
  },
  SOLO: { label: "Solo", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  RADIACAO: {
    label: "Radiação",
    cls: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
};

export default function Sobre() {
  const [fontes, setFontes] = useState<FonteSatelital[]>(mockFontes);
  const [regioes, setRegioes] = useState<Regiao[]>(mockRegioes);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([javaApi.getFontes(), javaApi.getRegioes()]).then(
      ([fRes, rRes]) => {
        if (fRes.status === "fulfilled" && fRes.value.length > 0)
          setFontes(fRes.value);
        if (rRes.status === "fulfilled" && rRes.value.length > 0)
          setRegioes(rRes.value);
        setLoading(false);
      },
    );
  }, []);

  // Contagem de regiões por bioma
  const biomaMap: Record<string, number> = {};
  regioes.forEach((r) => {
    biomaMap[r.ds_bioma] = (biomaMap[r.ds_bioma] ?? 0) + 1;
  });
  const biomasOrdenados = Object.entries(biomaMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-sobre pt-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-lg font-semibold text-text mb-2">
          Sobre o AgroSat
        </h1>
        <p className="text-sm text-muted mb-10 leading-relaxed">
          Plataforma de monitoramento agrícola que combina dados satelitais
          reais com inteligência artificial para análise de risco em tempo real
          nas regiões produtoras brasileiras.
        </p>

        <div className="space-y-4">
          {/* Fontes de dados — vindas da API Java (TB_FONTE_SATELITAL) */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text">
                Fontes de dados espaciais
              </p>
              {loading && <LoadingSpinner />}
            </div>
            <div className="space-y-3">
              {fontes.map((f) => {
                const cfg = tipoCfg[f.ds_tipo_dado] ?? {
                  label: f.ds_tipo_dado,
                  cls: "bg-surface2 text-muted border-border",
                };
                return (
                  <div key={f.id_fonte} className="flex items-start gap-3">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 ${cfg.cls}`}
                    >
                      {cfg.label}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-text">
                        {f.nm_fonte}
                      </p>
                      <p className="text-xs text-muted">{f.ds_descricao}</p>
                    </div>
                    {f.ds_url && (
                      <a
                        href={f.ds_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-accent hover:underline shrink-0 font-medium"
                      >
                        ↗
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Problema */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-3">
              O problema que resolvemos
            </p>
            <p className="text-sm text-muted leading-relaxed">
              O Brasil perde bilhões anualmente com secas e estiagens não
              previstas. Mais de 5,3 milhões de produtores rurais tomam decisões
              baseadas em intuição, sem acesso a dados satelitais. O AgroSat
              muda isso com planos a partir de R$ 97/mês.
            </p>
          </div>

          {/* Arquitetura */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-4">
              Arquitetura do sistema
            </p>
            <div className="space-y-3">
              {[
                {
                  layer: "Coleta",
                  tech: "Python CLI — APIs NASA/INPE, processamento NDVI, treinamento RandomForest",
                  host: "Automático",
                },
                {
                  layer: "Banco",
                  tech: "Oracle SQL — 8 tabelas: regiões, leituras, previsões, alertas e usuários",
                  host: "FIAP",
                },
                {
                  layer: "API",
                  tech: "Java 21 + Quarkus — 39 endpoints REST, CRUD completo, CORS",
                  host: "Render",
                },
                {
                  layer: "IA",
                  tech: "Python Flask + scikit-learn — RandomForest, /predict/completo",
                  host: "Render",
                },
                {
                  layer: "Frontend",
                  tech: "React 19 + TypeScript + Tailwind CSS — SPA responsivo",
                  host: "Vercel",
                },
              ].map((a) => (
                <div
                  key={a.layer}
                  className="flex items-start gap-4 py-2 border-b border-border last:border-0"
                >
                  <span className="text-xs font-medium text-accent bg-accent-bg border border-accent/20 px-2 py-1 rounded-md w-16 text-center shrink-0">
                    {a.layer}
                  </span>
                  <span className="text-sm text-muted flex-1">{a.tech}</span>
                  <span className="text-xs text-dim shrink-0">{a.host}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cobertura geográfica — dados reais do Oracle */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-semibold text-text">
                Cobertura geográfica
              </p>
              <span className="text-xs text-muted font-mono">
                {regioes.length} regiões monitoradas
              </span>
            </div>
            {biomasOrdenados.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {biomasOrdenados.map(([bioma, n]) => (
                  <div
                    key={bioma}
                    className="bg-surface2 border border-border rounded-lg px-3 py-2.5 text-center"
                  >
                    <div className="font-mono text-lg font-semibold text-text">
                      {n}
                    </div>
                    <div className="text-xs text-muted leading-tight">
                      {bioma}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted text-center py-4">
                Nenhuma região cadastrada.
              </p>
            )}
          </div>

          {/* Links */}
          <div className="bg-surface border border-border rounded-xl p-5">
            <p className="text-sm font-semibold text-text mb-4">
              Links do projeto
            </p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {[
                {
                  label: "GitHub",
                  href: "https://github.com/GustavoSiciliano/Global-Solution-2026",
                },
                {
                  label: "API Java",
                  href: "https://global-solution-2026.onrender.com/health",
                },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-center text-xs font-medium text-accent border border-accent/30 bg-accent-bg py-2 rounded-lg hover:bg-accent/10 transition-colors"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
            <a
              href="https://share.google/GgeFrRvZeReVVURDa"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full text-sm font-medium text-accent border border-accent/30 bg-accent-bg py-2.5 rounded-lg hover:bg-accent/10 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect
                  x="3"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="#2E7D4F"
                  strokeWidth="1.5"
                />
                <rect
                  x="14"
                  y="3"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="#2E7D4F"
                  strokeWidth="1.5"
                />
                <rect
                  x="3"
                  y="14"
                  width="7"
                  height="7"
                  rx="1"
                  stroke="#2E7D4F"
                  strokeWidth="1.5"
                />
                <path
                  d="M14 17.5h7M17.5 14v7"
                  stroke="#2E7D4F"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Trello — Gestão do Projeto ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
