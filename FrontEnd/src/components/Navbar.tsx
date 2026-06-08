import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import NotifDropdown from "./NotifDropdown";

const mainLinks = [
  { to: "/", label: "Início" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/alertas", label: "Alertas" },
  { to: "/clima", label: "Clima" },
  { to: "/planos", label: "Planos" },
];

const moreLinks = [
  { to: "/queimadas", label: "Queimadas 🔥" },
  { to: "/simulador", label: "Simulador IA" },
  { to: "/pipeline", label: "Pipeline" },
  { to: "/comparativo", label: "Comparativo" },
  { to: "/gerenciar", label: "Gerenciar" },
  { to: "/sobre", label: "Sobre" },
  { to: "/faq", label: "FAQ" },
  { to: "/contato", label: "Contato" },
  { to: "/integrantes", label: "Equipe" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { alertasAtivos, apiStatus } = useAppContext();
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const criticos = alertasAtivos.filter((a) => a.ds_nivel === "CRITICO").length;
  const allLinks = [...mainLinks, ...moreLinks];

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-surface/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-14">
        <Link to="/" className="shrink-0">
          <img src="/logo.png" alt="AgroSat" className="h-8" />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-0.5">
          {mainLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors relative ${
                pathname === l.to
                  ? "text-accent font-medium bg-accent-bg"
                  : "text-muted hover:text-text hover:bg-surface2"
              }`}
            >
              {l.label}
              {l.to === "/alertas" && criticos > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] rounded-full flex items-center justify-center font-mono">
                  {criticos}
                </span>
              )}
            </Link>
          ))}

          <div className="relative">
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1 ${
                moreLinks.some((l) => l.to === pathname)
                  ? "text-accent font-medium bg-accent-bg"
                  : "text-muted hover:text-text hover:bg-surface2"
              }`}
            >
              Mais
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="M2 3.5l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
              </svg>
            </button>
            {moreOpen && (
              <div className="absolute top-9 right-0 w-44 bg-surface border border-border rounded-xl shadow-lg py-1 z-50 animate-slide-up">
                {moreLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2 text-sm transition-colors ${
                      pathname === l.to
                        ? "text-accent font-medium bg-accent-bg"
                        : "text-muted hover:text-text hover:bg-surface2"
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`hidden sm:flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full border ${
              apiStatus === "online"
                ? "border-accent/40 text-accent bg-accent-bg"
                : apiStatus === "offline"
                  ? "border-red-300 text-red-600 bg-red-50"
                  : "border-border text-muted"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === "online"
                  ? "bg-accent animate-pulse"
                  : apiStatus === "offline"
                    ? "bg-red-500"
                    : "bg-yellow-400 animate-pulse"
              }`}
            />
            {apiStatus}
          </div>

          <NotifDropdown />

          <button
            className="md:hidden text-muted p-1"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2l12 12M14 2L2 14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 4.5h12M2 8h12M2 11.5h12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-2 animate-fade-in">
          {allLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`flex items-center justify-between py-2.5 px-3 text-sm rounded-md mb-0.5 ${
                pathname === l.to
                  ? "text-accent font-medium bg-accent-bg"
                  : "text-muted hover:bg-surface2"
              }`}
            >
              {l.label}
              {l.to === "/alertas" && criticos > 0 && (
                <span className="bg-red-600 text-white text-xs rounded-full px-1.5 font-mono">
                  {criticos}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
