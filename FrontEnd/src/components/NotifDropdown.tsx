import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNotifs } from "../context/NotifContext";
import { NotifBadge } from "./Ui";

const nivelCor: Record<string, string> = {
  CRITICO: "text-red-600",
  ALTO: "text-orange-600",
  MEDIO: "text-yellow-700",
  BAIXO: "text-accent",
};

export default function NotifDropdown() {
  const { notifs, naoLidas, marcarLida, marcarTodasLidas } = useNotifs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fechar ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1.5 text-muted hover:text-text transition-colors rounded-md hover:bg-surface2"
        aria-label="Notificações"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2a5.5 5.5 0 0 1 5.5 5.5c0 2.5.8 4 1.5 5H2c.7-1 1.5-2.5 1.5-5A5.5 5.5 0 0 1 9 2Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path
            d="M7.5 15a1.5 1.5 0 0 0 3 0"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
        <NotifBadge count={naoLidas} />
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-surface border border-border rounded-xl shadow-lg z-50 animate-slide-up overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text">Notificações</p>
            <div className="flex items-center gap-3">
              {naoLidas > 0 && (
                <button
                  onClick={marcarTodasLidas}
                  className="text-xs text-accent hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
              <span className="text-xs text-dim">{naoLidas} não lidas</span>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">
                Sem notificações
              </p>
            ) : (
              notifs.map((n) => (
                <Link
                  key={n.id}
                  to={n.href}
                  onClick={() => {
                    marcarLida(n.id);
                    setOpen(false);
                  }}
                  className={`flex gap-3 px-4 py-3 hover:bg-surface2 transition-colors border-b border-border/50 ${
                    !n.lida ? "bg-accent-bg/30" : ""
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-1 ${!n.lida ? "bg-accent" : "bg-border"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-xs font-semibold ${nivelCor[n.nivel] || "text-text"}`}
                    >
                      {n.titulo}
                    </p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed line-clamp-2">
                      {n.mensagem}
                    </p>
                    <p className="text-[10px] text-dim font-mono mt-1">
                      {n.dt}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border">
            <Link
              to="/alertas"
              onClick={() => setOpen(false)}
              className="text-xs text-accent hover:underline font-medium"
            >
              Ver todos os alertas →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
