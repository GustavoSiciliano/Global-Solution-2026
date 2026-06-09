import { useState } from "react";
import { faqData } from "../data/mockData";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="pt-14 min-h-screen bg-sobre">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <h1 className="text-lg font-semibold text-text mb-1">
          Perguntas frequentes
        </h1>
        <p className="text-sm text-muted mb-10">
          Dúvidas sobre o AgroSat e o monitoramento agrícola.
        </p>
        <div className="space-y-2">
          {faqData.map((item, i) => (
            <div
              key={i}
              className="border border-border rounded-xl overflow-hidden bg-surface"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-surface2 transition-colors"
              >
                <span className="text-sm font-medium text-text">{item.q}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`shrink-0 text-muted transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                >
                  <path
                    d="M2 4l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
              {open === i && (
                <div className="px-5 pb-4 border-t border-border animate-slide-up">
                  <p className="text-sm text-muted leading-relaxed pt-4">
                    {item.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
