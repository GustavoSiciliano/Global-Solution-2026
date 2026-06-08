import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

export default function Home() {
  const { estatisticas } = useAppContext();

  return (
    <div className="min-h-screen">
      {/* Hero — gradiente verde + orbital */}
      <section className="hero-gradient flex flex-col items-center justify-center min-h-screen px-5 text-center relative overflow-hidden">
        {/* Rings decorativos */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[420, 300, 200].map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-accent/10"
              style={{ width: s, height: s }}
            />
          ))}
          <div className="absolute w-52 h-52 animate-spin-slow">
            <div className="w-2 h-2 rounded-full bg-accent/40 absolute top-0 left-1/2 -translate-x-1/2" />
          </div>
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white border border-accent/20 text-accent text-xs font-medium px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Global Solution 2026/1 · FIAP · A Economia Espacial
          </div>

          <img src="/logo.png" alt="AgroSat" className="h-14 mx-auto mb-5" />

          <p className="text-muted text-lg leading-relaxed mb-10 max-w-md mx-auto">
            Monitoramento agrícola via satélite com inteligência artificial para
            produtores rurais brasileiros.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              to="/dashboard"
              className="px-6 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hi transition-colors shadow-sm"
            >
              Acessar dashboard
            </Link>
            <Link
              to="/clima"
              className="px-6 py-2.5 bg-white text-accent border border-accent/30 rounded-lg text-sm font-medium hover:bg-accent-bg transition-colors"
            >
              Clima em tempo real
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-dim">
          <span className="text-xs">Role para baixo</span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* Stats — fundo branco com borda colorida */}
      <section className="bg-surface border-y border-border py-10">
        <div className="max-w-4xl mx-auto px-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              label: "Regiões monitoradas",
              value: estatisticas.total_regioes,
              cls: "stat-card-green",
            },
            {
              label: "Alertas ativos",
              value: estatisticas.alertas_ativos,
              cls: "stat-card-yellow",
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
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`bg-surface border border-border rounded-xl p-5 text-center ${s.cls}`}
            >
              <div className="font-mono text-3xl font-semibold text-text mb-1">
                {s.value}
              </div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-5 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-xl font-semibold text-text mb-2">
            Tecnologia espacial para o campo
          </h2>
          <p className="text-muted text-sm">
            Três pilares que tornam o AgroSat único no mercado
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: "🛰",
              title: "Dados Satelitais",
              desc: "Integração com NASA FIRMS, EarthData, POWER, INPE TerraBrasilis, Copernicus ESA e Open-Meteo para coleta contínua.",
              link: "/sobre",
            },
            {
              icon: "🤖",
              title: "Inteligência Artificial",
              desc: "Dois modelos RandomForest: classificação de vegetação e previsão de risco hídrico com até 7 dias de antecedência.",
              link: "/dashboard",
            },
            {
              icon: "⚡",
              title: "Alertas Automáticos",
              desc: "Quatro níveis de criticidade com acionamento imediato quando limiares de risco são ultrapassados.",
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
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          {[
            {
              icon: "🧪",
              title: "Simulador de IA",
              desc: "Teste o modelo com seus próprios dados e veja a previsão em tempo real.",
              link: "/simulador",
            },
            {
              icon: "🔄",
              title: "Pipeline de Dados",
              desc: "Veja o fluxo completo desde a coleta satelital até o dashboard interativo.",
              link: "/pipeline",
            },
            {
              icon: "📊",
              title: "Comparativo de Regiões",
              desc: "Compare até 3 regiões lado a lado com gráficos sobrepostos.",
              link: "/comparativo",
            },
          ].map((f) => (
            <Link
              to={f.link}
              key={f.title}
              className="bg-surface2 border border-border rounded-xl p-5 hover:border-accent/30 transition-all group block"
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="text-sm font-semibold text-text mb-1 group-hover:text-accent transition-colors">
                {f.title}
              </h3>
              <p className="text-xs text-muted leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA strip verde */}
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
            email/SMS e API aberta.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
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
          <div className="mt-8">
            <Link
              to="/planos"
              className="inline-block text-sm font-medium bg-accent text-white px-8 py-2.5 rounded-lg hover:bg-accent-hi transition-colors"
            >
              Ver planos e preços
            </Link>
          </div>
        </div>
      </section>

      {/* ODS */}
      <section className="py-14 px-5 bg-surface border-t border-border">
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
