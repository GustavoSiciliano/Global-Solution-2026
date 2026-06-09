import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Home() {
  const { estatisticas } = useAppContext();

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Hero escuro — espaço + planície ───────────── */}
      <section className="hero-space hero-stars hero-field flex flex-col items-center justify-center min-h-screen px-5 text-center relative overflow-hidden">
        {/* Anéis orbitais */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          {[500, 360, 240].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{ width: s, height: s }}
            />
          ))}
          {/* Satélite girando no anel de 240px */}
          <div
            className="absolute animate-spin-slow"
            style={{ width: 240, height: 240 }}
          >
            <div className="w-2 h-2 rounded-full bg-accent/70 absolute top-0 left-1/2 -translate-x-1/2 shadow-lg shadow-accent/40" />
          </div>
          {/* Ponto girando no anel de 360px */}
          <div
            className="absolute"
            style={{
              width: 360,
              height: 360,
              animation: "spin 22s linear infinite reverse",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="relative z-10 max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 backdrop-blur-sm text-white/70 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Global Solution 2026/1 · FIAP · A Economia Espacial
          </div>

          <img
            src="/logo.png"
            alt="AgroSat"
            className="h-12 mx-auto mb-5 brightness-0 invert"
          />

          <h1 className="text-3xl sm:text-4xl font-semibold text-white mb-4 leading-tight">
            Do satélite
            <br />
            <span style={{ color: "#6EBF8B" }}>para o campo</span>
          </h1>

          <p
            className="text-base leading-relaxed mb-10 max-w-md mx-auto"
            style={{ color: "#9ABFA8" }}
          >
            Monitoramento agrícola em tempo real com dados da NASA, INPE e
            modelos de IA para antecipar riscos hídricos e proteger sua safra.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hi transition-colors shadow-lg shadow-accent/20"
            >
              Acessar dashboard
            </Link>
            <Link
              to="/simulador"
              className="px-6 py-2.5 border border-white/20 bg-white/5 backdrop-blur-sm text-white/80 rounded-lg text-sm font-medium hover:bg-white/10 hover:text-white transition-colors"
            >
              Testar o modelo IA
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10"
          style={{ color: "#4A7A5A" }}
        >
          <span className="text-xs">Rolar</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* ── Stats em tempo real ───────────────────────── */}
      <section className="bg-surface border-y border-border py-10 relative z-10">
        <div className="max-w-4xl mx-auto px-5">
          <p className="text-xs text-center text-muted font-medium uppercase tracking-widest mb-7">
            Dados em tempo real · Oracle FIAP
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Regiões monitoradas",
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
                label: "Regiões críticas",
                value: estatisticas.regioes_criticas,
                cls: "stat-card-red",
                mono: false,
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`bg-surface border border-border rounded-xl p-5 text-center ${s.cls}`}
              >
                <div
                  className={`text-3xl font-semibold text-text mb-1 ${s.mono ? "font-mono" : ""}`}
                >
                  {s.value}
                </div>
                <div className="text-xs text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="py-20 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xl font-semibold text-text mb-2">
            Tecnologia espacial para o campo
          </h2>
          <p className="text-sm text-muted">
            Três pilares que tornam o AgroSat único no mercado
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-5">
          {[
            {
              icon: "🛰",
              title: "Dados Satelitais",
              desc: "NASA FIRMS, EarthData, POWER, INPE TerraBrasilis e Open-Meteo para coleta contínua de dados espaciais reais.",
              link: "/sobre",
            },
            {
              icon: "🤖",
              title: "Inteligência Artificial",
              desc: "Dois modelos RandomForest em produção: classificação de vegetação e previsão de risco hídrico com até 7 dias de antecedência.",
              link: "/simulador",
            },
            {
              icon: "⚡",
              title: "Alertas Automáticos",
              desc: "Quatro níveis de criticidade — BAIXO, MÉDIO, ALTO e CRÍTICO — com acionamento imediato quando o risco hídrico ultrapassa 40%.",
              link: "/alertas",
            },
          ].map((f) => (
            <Link
              to={f.link}
              key={f.title}
              className="bg-surface border border-border rounded-xl p-6 hover:border-accent/40 hover:shadow-sm transition-all group block"
            >
              <span className="text-3xl mb-4 block">{f.icon}</span>
              <h3 className="text-sm font-semibold text-text mb-2 group-hover:text-accent transition-colors">
                {f.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { title: "Clima em Tempo Real", link: "/clima" },
            { title: "Comparativo", link: "/comparativo" },
            { title: "Queimadas", link: "/queimadas" },
            { title: "Pipeline de Dados", link: "/pipeline" },
          ].map((f) => (
            <Link
              to={f.link}
              key={f.title}
              className="bg-surface2 border border-border rounded-xl p-4 hover:border-accent/30 transition-all group flex items-center justify-between"
            >
              <span className="text-sm font-medium text-text group-hover:text-accent transition-colors">
                {f.title}
              </span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                className="text-dim group-hover:text-accent transition-colors shrink-0"
              >
                <path
                  d="M2 6h8M6 2l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Fluxo visual ─────────────────────────────── */}
      <section className="py-16 px-5 bg-surface border-y border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-medium text-muted uppercase tracking-widest text-center mb-10">
            Como funciona
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                n: "01",
                title: "Cadastro",
                desc: "Informe a cidade e estado — coordenadas e bioma são obtidos automaticamente.",
              },
              {
                n: "02",
                title: "Coleta",
                desc: "NASA POWER e Open-Meteo fornecem temperatura, chuva e radiação solar.",
              },
              {
                n: "03",
                title: "Predição",
                desc: "O modelo RandomForest classifica a vegetação e estima o risco hídrico.",
              },
              {
                n: "04",
                title: "Alerta",
                desc: "Se o risco ultrapassar 40%, um alerta é gerado automaticamente no Oracle.",
              },
            ].map((s, i) => (
              <div key={s.n} className="relative">
                <div className="bg-accent-bg border border-accent/20 rounded-xl p-5">
                  <div className="font-mono text-xs text-accent/60 mb-2">
                    {s.n}
                  </div>
                  <h4 className="text-sm font-semibold text-text mb-1">
                    {s.title}
                  </h4>
                  <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 text-accent/40 text-lg z-10">
                    ›
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA dark ─────────────────────────────────── */}
      <section className="section-dark py-14 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-xl font-semibold mb-3"
            style={{ color: "#E8F2EB" }}
          >
            Menos de R$ 97/mês para proteger sua safra
          </h2>
          <p
            className="text-sm mb-8 leading-relaxed"
            style={{ color: "#A8C8B0" }}
          >
            Planos a partir do Entry até o Enterprise — com SLA, alertas por
            e-mail e WhatsApp e API aberta.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { plano: "Entry", preco: "R$ 97", sub: "1 propriedade · 500 ha" },
              {
                plano: "Pro",
                preco: "R$ 247",
                sub: "5 propriedades · 5.000 ha",
              },
              {
                plano: "Enterprise",
                preco: "R$ 697",
                sub: "Ilimitado · SLA 24/7",
              },
            ].map((p) => (
              <div
                key={p.plano}
                className="bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-center min-w-[130px]"
              >
                <div
                  className="text-xs font-medium mb-1"
                  style={{ color: "#6EBF8B" }}
                >
                  {p.plano}
                </div>
                <div
                  className="font-mono text-xl font-semibold"
                  style={{ color: "#E8F2EB" }}
                >
                  {p.preco}
                </div>
                <div className="text-xs mt-1" style={{ color: "#7A9E85" }}>
                  {p.sub}
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/planos"
            className="inline-block text-sm font-medium bg-accent text-white px-8 py-2.5 rounded-lg hover:bg-accent-hi transition-colors"
          >
            Ver planos e preços
          </Link>
        </div>
      </section>

      {/* ── ODS ──────────────────────────────────────── */}
      <section className="py-12 px-5 bg-surface border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium text-muted uppercase tracking-widest mb-6">
            Alinhamento ODS — ONU
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { n: 2, label: "Fome Zero", cor: "#4A9E6A" },
              { n: 9, label: "Inovação", cor: "#E87020" },
              { n: 13, label: "Ação Climática", cor: "#3E8E3E" },
            ].map((o) => (
              <div
                key={o.n}
                className="flex items-center gap-3 bg-surface border border-border rounded-xl px-5 py-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: o.cor }}
                >
                  {o.n}
                </div>
                <div className="text-left">
                  <div className="text-xs font-medium text-text">ODS {o.n}</div>
                  <div className="text-xs text-muted">{o.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
