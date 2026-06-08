import { useState } from "react";
import emailjs from "@emailjs/browser";
import { useAppContext } from "../context/AppContext";
import { mockIntegrantes } from "../data/mockData";

const EMAILJS_SERVICE_ID = "service_ru4mhfn";
const EMAILJS_TEMPLATE_ID = "template_3fxuwml";
const EMAILJS_PUBLIC_KEY = "hwYtO1LbFM7Ln6U8q";
// WhatsApp: link direto para o número de suporte (substitua pelo número real)
const WHATSAPP_NUMBER = "5511999999999";

interface Form {
  nome: string;
  email: string;
  empresa: string;
  assunto: string;
  mensagem: string;
}

const assuntos = [
  "Informações sobre os planos",
  "Demonstração do produto",
  "Suporte técnico",
  "Parcerias e integrações",
  "Imprensa",
  "Outro",
];

export default function Contato() {
  const { showModal } = useAppContext();
  const [form, setForm] = useState<Form>({
    nome: "",
    email: "",
    empresa: "",
    assunto: "",
    mensagem: "",
  });
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [enviando, setEnviando] = useState(false);

  const set =
    (k: keyof Form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = (): boolean => {
    const e: Partial<Form> = {};
    if (!form.nome.trim()) e.nome = "Informe seu nome";
    if (!form.email.trim()) e.email = "Informe seu e-mail";
    if (!form.assunto) e.assunto = "Selecione um assunto";
    if (!form.mensagem.trim()) e.mensagem = "Escreva sua mensagem";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const enviar = async () => {
    if (!validate()) return;
    setEnviando(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.nome,
          from_email: form.email,
          empresa: form.empresa,
          assunto: form.assunto,
          mensagem: form.mensagem,
        },
        EMAILJS_PUBLIC_KEY,
      );
      showModal({
        tipo: "sucesso",
        titulo: "Mensagem enviada",
        mensagem: "Em breve entraremos em contato. Obrigado!",
      });
      setForm({ nome: "", email: "", empresa: "", assunto: "", mensagem: "" });
      setErrors({});
    } catch {
      showModal({
        tipo: "erro",
        titulo: "Falha no envio",
        mensagem:
          "Não foi possível enviar. Tente pelo WhatsApp ou LinkedIn diretamente.",
      });
    } finally {
      setEnviando(false);
    }
  };

  const whatsappUrl = (msg: string) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  const inputCls = (k: keyof Form) =>
    `w-full text-sm border rounded-lg px-3 py-2.5 bg-surface text-text placeholder:text-dim outline-none transition-colors ${
      errors[k]
        ? "border-red-300 bg-red-50 focus:border-red-400"
        : "border-border focus:border-accent"
    }`;

  return (
    <div className="pt-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-lg font-semibold text-text mb-1">Contato</h1>
        <p className="text-sm text-muted mb-8">
          Fale com a equipe AgroSat por e-mail, WhatsApp ou LinkedIn.
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          {/* E-mail */}
          <a
            href="mailto:agrosat.gs@gmail.com"
            className="bg-surface border border-border rounded-xl p-4 hover:border-accent/30 hover:bg-accent-bg transition-all group text-center"
          >
            <div className="w-8 h-8 bg-accent-bg border border-accent/20 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/10 transition-colors">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect
                  x="1"
                  y="3"
                  width="12"
                  height="8"
                  rx="1.5"
                  stroke="#2E7D4F"
                  strokeWidth="1.2"
                />
                <path d="M1 4.5l6 4 6-4" stroke="#2E7D4F" strokeWidth="1.2" />
              </svg>
            </div>
            <p className="text-xs font-medium text-text">E-mail</p>
            <p className="text-xs text-muted mt-0.5">agrosat.gs@gmail.com</p>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl("Olá, gostaria de saber mais sobre o AgroSat.")}
            target="_blank"
            rel="noreferrer"
            className="bg-surface border border-border rounded-xl p-4 hover:border-green-300 hover:bg-green-50 transition-all group text-center"
          >
            <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-green-100 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#16a34a">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.948-1.42A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.952 7.952 0 01-4.035-1.1l-.29-.173-2.937.843.856-2.86-.19-.293A7.953 7.953 0 014 12c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-text">WhatsApp</p>
            <p className="text-xs text-muted mt-0.5">Resposta em até 2h</p>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/gustavo-siciliano"
            target="_blank"
            rel="noreferrer"
            className="bg-surface border border-border rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50 transition-all group text-center"
          >
            <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#2563eb">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </div>
            <p className="text-xs font-medium text-text">LinkedIn</p>
            <p className="text-xs text-muted mt-0.5">@gustavo-siciliano</p>
          </a>
        </div>

        {/* Formulário */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <p className="text-sm font-semibold text-text mb-5">
            Enviar mensagem por e-mail
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-text block mb-1.5">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                value={form.nome}
                onChange={set("nome")}
                placeholder="Seu nome"
                className={inputCls("nome")}
              />
              {errors.nome && (
                <p className="text-xs text-red-600 mt-1">{errors.nome}</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-text block mb-1.5">
                E-mail <span className="text-red-500">*</span>
              </label>
              <input
                value={form.email}
                onChange={set("email")}
                type="email"
                placeholder="seu@email.com"
                className={inputCls("email")}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-medium text-text block mb-1.5">
                Empresa
              </label>
              <input
                value={form.empresa}
                onChange={set("empresa")}
                placeholder="Empresa (opcional)"
                className={inputCls("empresa")}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-text block mb-1.5">
                Assunto <span className="text-red-500">*</span>
              </label>
              <select
                value={form.assunto}
                onChange={set("assunto")}
                className={inputCls("assunto")}
              >
                <option value="">Selecione um assunto</option>
                {assuntos.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              {errors.assunto && (
                <p className="text-xs text-red-600 mt-1">{errors.assunto}</p>
              )}
            </div>
          </div>
          <div className="mb-5">
            <label className="text-xs font-medium text-text block mb-1.5">
              Mensagem <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.mensagem}
              onChange={set("mensagem")}
              rows={4}
              placeholder="Como podemos ajudar?"
              maxLength={1000}
              className={`${inputCls("mensagem")} resize-none`}
            />
            <div className="flex justify-between mt-1">
              {errors.mensagem ? (
                <p className="text-xs text-red-600">{errors.mensagem}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-dim">
                {form.mensagem.length}/1000
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={enviar}
              disabled={enviando}
              className="flex-1 bg-accent hover:bg-accent-hi text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
                  Enviando...
                </>
              ) : (
                "Enviar por e-mail"
              )}
            </button>
            <a
              href={whatsappUrl(
                `Olá! Meu nome é ${form.nome || "visitante"}.${form.assunto ? ` Assunto: ${form.assunto}.` : ""} ${form.mensagem || ""}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 text-sm font-medium py-2.5 px-5 rounded-lg transition-colors text-center"
            >
              Enviar via WhatsApp
            </a>
          </div>
        </div>

        {/* Integrantes */}
        <div className="mt-8">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">
            Equipe
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {mockIntegrantes.map((p) => (
              <div
                key={p.rm}
                className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3"
              >
                <img
                  src={p.foto}
                  alt={p.nome}
                  className="w-10 h-10 rounded-full object-cover object-top border border-border shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text truncate">
                    {p.nome.split(" ").slice(0, 2).join(" ")}
                  </p>
                  <p className="text-xs text-muted">{p.papel}</p>
                  <div className="flex gap-2 mt-1">
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-accent hover:underline"
                    >
                      LinkedIn
                    </a>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-muted hover:text-accent"
                    >
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
