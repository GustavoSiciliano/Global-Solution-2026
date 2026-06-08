import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

// ─── STRIPE ──────────────────────────────────────────────────────────────────
// Para ativar pagamentos reais:
// 1. Crie conta em https://stripe.com (gratuito)
// 2. Crie os produtos/preços no Dashboard do Stripe
// 3. Instale: npm install @stripe/stripe-js
// 4. Substitua os Price IDs abaixo pelos seus
// 5. Adicione VITE_STRIPE_PUBLIC_KEY no .env
//
// Exemplo de redirect para Checkout:
// const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
// await stripe.redirectToCheckout({ lineItems: [{ price: PRICE_ID, quantity: 1 }], mode: 'subscription', successUrl: '...', cancelUrl: '...' })
// ─────────────────────────────────────────────────────────────────────────────

interface Plano {
  id: string;
  nome: string;
  preco: number;
  periodo: string;
  desconto?: string;
  propriedades: string;
  hectares: string;
  alertas: string;
  api: boolean;
  sla: string;
  suporte: string;
  destaque: boolean;
  cor: string;
}

const planos: Plano[] = [
  {
    id: "entry",
    nome: "Entry",
    preco: 97,
    periodo: "mês",
    propriedades: "1 propriedade",
    hectares: "até 500 ha",
    alertas: "E-mail",
    api: false,
    sla: "Uptime 99,5%",
    suporte: "Chat",
    destaque: false,
    cor: "border-border",
  },
  {
    id: "pro",
    nome: "Pro",
    preco: 247,
    periodo: "mês",
    desconto: "Mais popular",
    propriedades: "5 propriedades",
    hectares: "até 5.000 ha",
    alertas: "E-mail + SMS",
    api: true,
    sla: "Uptime 99,9%",
    suporte: "Chat + Telefone",
    destaque: true,
    cor: "border-accent",
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    preco: 697,
    periodo: "mês",
    propriedades: "Ilimitado",
    hectares: "Ilimitado",
    alertas: "E-mail + SMS + Push",
    api: true,
    sla: "Uptime 99,99% · SLA 24/7",
    suporte: "Dedicado",
    destaque: false,
    cor: "border-border",
  },
];

const features = [
  {
    label: "Regiões monitoradas",
    entry: "1",
    pro: "5",
    enterprise: "Ilimitado",
  },
  {
    label: "Área máxima",
    entry: "500 ha",
    pro: "5.000 ha",
    enterprise: "Ilimitado",
  },
  { label: "Atualização NDVI", entry: "24h", pro: "12h", enterprise: "6h" },
  {
    label: "Alertas automáticos",
    entry: "E-mail",
    pro: "E-mail + SMS",
    enterprise: "E-mail + SMS + Push",
  },
  {
    label: "Antecedência previsão",
    entry: "3 dias",
    pro: "7 dias",
    enterprise: "14 dias",
  },
  { label: "Acesso à API REST", entry: "✗", pro: "✓", enterprise: "✓" },
  {
    label: "Uptime garantido",
    entry: "99,5%",
    pro: "99,9%",
    enterprise: "99,99%",
  },
  {
    label: "Suporte",
    entry: "Chat",
    pro: "Chat + Tel.",
    enterprise: "Dedicado",
  },
  { label: "Relatórios PDF/Excel", entry: "✗", pro: "✓", enterprise: "✓" },
  { label: "Comparativo de regiões", entry: "✗", pro: "✓", enterprise: "✓" },
  {
    label: "Histórico de dados",
    entry: "1 ano",
    pro: "3 anos",
    enterprise: "5 anos",
  },
];

export default function Planos() {
  const { showModal } = useAppContext();
  const [periodo, setPeriodo] = useState<"mensal" | "anual">("mensal");
  const [selecionado, setSelecionado] = useState<string | null>(null);

  const preco = (p: Plano) =>
    periodo === "anual"
      ? Math.round(p.preco * 10) // 2 meses grátis no anual
      : p.preco;

  const handleAssinar = (plano: Plano) => {
    setSelecionado(plano.id);
    showModal({
      tipo: "info",
      titulo: `Plano ${plano.nome} selecionado`,
      mensagem:
        `Para ativar o plano ${plano.nome} (R$ ${preco(plano)}/${periodo === "anual" ? "ano" : "mês"}), ` +
        `entre em contato com nossa equipe pelo formulário de contato ou pelo LinkedIn. ` +
        `Iremos configurar seu acesso em até 24h.`,
    });
  };

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-5xl mx-auto px-5 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-semibold text-text mb-3">
            Planos e Preços
          </h1>
          <p className="text-muted text-sm max-w-md mx-auto mb-6 leading-relaxed">
            Tecnologia satelital para produtores de todos os portes. Cancele
            quando quiser.
          </p>

          {/* Toggle mensal/anual */}
          <div className="inline-flex items-center gap-1 bg-surface2 border border-border rounded-lg p-1">
            <button
              onClick={() => setPeriodo("mensal")}
              className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors ${
                periodo === "mensal"
                  ? "bg-surface text-text shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriodo("anual")}
              className={`text-sm px-4 py-1.5 rounded-md font-medium transition-colors flex items-center gap-2 ${
                periodo === "anual"
                  ? "bg-surface text-text shadow-sm"
                  : "text-muted hover:text-text"
              }`}
            >
              Anual
              <span className="text-xs bg-accent text-white px-1.5 py-0.5 rounded font-medium">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {planos.map((p) => (
            <div
              key={p.id}
              className={`bg-surface border-2 rounded-xl p-6 flex flex-col relative ${
                p.destaque ? "border-accent shadow-lg shadow-accent/10" : p.cor
              }`}
            >
              {p.desconto && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {p.desconto}
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p
                  className={`text-sm font-semibold mb-1 ${p.destaque ? "text-accent" : "text-text"}`}
                >
                  {p.nome}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-text">
                    R$ {preco(p)}
                  </span>
                  <span className="text-sm text-muted">
                    /{periodo === "anual" ? "ano" : "mês"}
                  </span>
                </div>
                {periodo === "anual" && (
                  <p className="text-xs text-accent mt-0.5">
                    = R$ {Math.round(preco(p) / 12)}/mês · 2 meses grátis
                  </p>
                )}
              </div>

              <div className="space-y-2.5 mb-6 flex-1">
                {[
                  { label: p.propriedades },
                  { label: p.hectares },
                  { label: `Alertas: ${p.alertas}` },
                  {
                    label: p.api ? "API REST incluída" : "Sem acesso à API",
                    dim: !p.api,
                  },
                  { label: p.sla },
                  { label: `Suporte: ${p.suporte}` },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.dim ? "bg-border" : p.destaque ? "bg-accent" : "bg-text"}`}
                    />
                    <span
                      className={`text-xs ${item.dim ? "text-dim line-through" : "text-muted"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAssinar(p)}
                className={`w-full text-sm font-medium py-2.5 rounded-lg transition-colors ${
                  p.destaque
                    ? "bg-accent hover:bg-accent-hi text-white"
                    : "border border-border hover:border-accent/40 hover:bg-accent-bg text-text"
                }`}
              >
                {selecionado === p.id ? "✓ Selecionado" : `Assinar ${p.nome}`}
              </button>
            </div>
          ))}
        </div>

        {/* Tabela comparativa */}
        <div className="bg-surface border border-border rounded-xl mb-8">
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm font-semibold text-text">
              Comparativo completo
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-surface2">
                  <th className="text-left py-3 px-5 text-xs text-muted font-medium w-48">
                    Recurso
                  </th>
                  {planos.map((p) => (
                    <th
                      key={p.id}
                      className={`text-center py-3 px-4 text-xs font-semibold ${p.destaque ? "text-accent" : "text-text"}`}
                    >
                      {p.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr
                    key={i}
                    className={`border-b border-border ${i % 2 === 0 ? "" : "bg-surface2/50"}`}
                  >
                    <td className="py-2.5 px-5 text-xs text-muted">
                      {f.label}
                    </td>
                    {[f.entry, f.pro, f.enterprise].map((val, j) => (
                      <td
                        key={j}
                        className={`py-2.5 px-4 text-center text-xs font-medium ${
                          val === "✓"
                            ? "text-accent"
                            : val === "✗"
                              ? "text-dim"
                              : planos[j].destaque
                                ? "text-text"
                                : "text-muted"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ preços */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {[
            {
              q: "Posso cancelar a qualquer momento?",
              a: "Sim. Sem multa ou fidelidade. O acesso continua até o fim do período pago.",
            },
            {
              q: "Há teste gratuito?",
              a: "Sim, 30 dias grátis com acesso completo ao plano Entry. Sem cartão de crédito.",
            },
            {
              q: "Como funciona o faturamento?",
              a: "Cobrança automática mensal ou anual via cartão de crédito ou boleto bancário.",
            },
            {
              q: "Posso fazer upgrade do plano?",
              a: "Sim, a qualquer momento. O valor já pago é descontado proporcionalmente.",
            },
          ].map((item) => (
            <div
              key={item.q}
              className="bg-surface border border-border rounded-xl p-4"
            >
              <p className="text-xs font-semibold text-text mb-1">{item.q}</p>
              <p className="text-xs text-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="section-dark rounded-xl p-8 text-center">
          <p
            className="text-lg font-semibold mb-2"
            style={{ color: "#E8F2EB" }}
          >
            Dúvidas sobre qual plano escolher?
          </p>
          <p className="text-sm mb-6" style={{ color: "#A8C8B0" }}>
            Nossa equipe ajuda você a escolher o plano ideal para o tamanho da
            sua operação.
          </p>
          <Link
            to="/contato"
            className="inline-block bg-accent hover:bg-accent-hi text-white font-medium text-sm px-8 py-2.5 rounded-lg transition-colors"
          >
            Fale com a equipe
          </Link>
        </div>
      </div>
    </div>
  );
}
