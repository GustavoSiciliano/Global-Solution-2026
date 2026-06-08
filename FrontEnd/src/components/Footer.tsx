import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 bg-surface">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col md:flex-row gap-8 justify-between mb-8">
          <div>
            <img src="/logo.png" alt="AgroSat" className="h-8 mb-3" />
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Monitoramento agrícola via satélite para produtores rurais
              brasileiros.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-4">
            <div>
              <p className="text-xs font-semibold text-text mb-2">Plataforma</p>
              {[
                ["/", "Início"],
                ["/dashboard", "Dashboard"],
                ["/alertas", "Alertas"],
                ["/clima", "Clima em tempo real"],
                ["/queimadas", "Focos de calor"],
              ].map(([to, l]) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-sm text-muted hover:text-accent transition-colors mb-1"
                >
                  {l}
                </Link>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-text mb-2">
                Ferramentas
              </p>
              {[
                ["/planos", "Planos e Preços"],
                ["/simulador", "Simulador IA"],
                ["/pipeline", "Pipeline de dados"],
                ["/comparativo", "Comparativo"],
              ].map(([to, l]) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-sm text-muted hover:text-accent transition-colors mb-1"
                >
                  {l}
                </Link>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-text mb-2">Empresa</p>
              {[
                ["/sobre", "Sobre"],
                ["/faq", "FAQ"],
                ["/contato", "Contato"],
                ["/integrantes", "Equipe"],
                ["/gerenciar", "Gerenciar"],
              ].map(([to, l]) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-sm text-muted hover:text-accent transition-colors mb-1"
                >
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border gap-3">
          <span className="text-xs text-dim">
            © 2026 AgroSat Tecnologia Espacial Ltda. — CNPJ 00.000.001/0001-99
          </span>
          <span className="text-xs text-dim">
            FIAP · Global Solution 2026/1 · A Economia Espacial
          </span>
        </div>
      </div>
    </footer>
  );
}
