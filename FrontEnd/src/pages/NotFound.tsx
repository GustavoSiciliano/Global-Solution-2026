import { Link } from "react-router-dom";
export default function NotFound() {
  return (
    <div className="bg-surface pt-14 min-h-screen flex items-center justify-center px-5">
      <div className="text-center">
        <p className="font-mono text-6xl text-border mb-3">404</p>
        <p className="text-sm font-medium text-text mb-2">
          Página não encontrada
        </p>
        <p className="text-sm text-muted mb-8">
          O satélite não conseguiu localizar este recurso.
        </p>
        <Link
          to="/"
          className="text-xs text-muted border border-border px-5 py-2 rounded-lg hover:text-text transition-colors font-mono bg-surface"
        >
          ← Voltar
        </Link>
      </div>
    </div>
  );
}
