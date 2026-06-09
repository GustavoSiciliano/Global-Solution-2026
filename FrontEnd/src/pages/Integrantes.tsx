import { mockIntegrantes } from '../data/mockData'

export default function Integrantes() {
  return (
    <div className="bg-gerenciar pt-14 min-h-screen">
      <div className="max-w-3xl mx-auto px-5 py-12">
        <h1 className="text-lg font-semibold text-text mb-1">Integrantes</h1>
        <p className="text-sm text-muted mb-10">1TDS Agosto · FIAP 2026</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          {mockIntegrantes.map(p => (
            <div key={p.rm} className="bg-surface border border-border rounded-xl p-5 hover:border-accent/30 hover:shadow-sm transition-all">
              <img src={p.foto} alt={p.nome} className="w-16 h-16 rounded-full mb-4 border-2 border-border object-cover object-top" />
              <p className="text-sm font-semibold text-text mb-0.5">{p.nome}</p>
              <p className="text-xs text-accent font-medium mb-0.5">{p.papel}</p>
              <p className="text-xs text-dim mb-1">{p.rm}</p>
              <p className="text-xs text-dim mb-5">1TDS Agosto · FIAP 2026</p>
              <div className="flex gap-2">
                <a href={p.github} target="_blank" rel="noreferrer"
                  className="flex-1 text-center text-xs font-medium text-muted border border-border py-1.5 rounded-lg hover:text-accent hover:border-accent/30 hover:bg-accent-bg transition-colors">
                  GitHub
                </a>
                <a href={p.linkedin} target="_blank" rel="noreferrer"
                  className="flex-1 text-center text-xs font-medium text-muted border border-border py-1.5 rounded-lg hover:text-accent hover:border-accent/30 hover:bg-accent-bg transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <p className="text-sm font-semibold text-text mb-4">Links do projeto</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <a href="https://github.com/GustavoSiciliano/Global-Solution-2026" target="_blank" rel="noreferrer"
              className="text-center text-sm font-medium text-accent border border-accent/30 bg-accent-bg py-2.5 rounded-lg hover:bg-accent/10 transition-colors">
              GitHub ↗
            </a>
            <a href="https://youtu.be/prsl2J08fCo" target="_blank" rel="noreferrer"
              className="text-center text-sm font-medium text-muted border border-border py-2.5 rounded-lg hover:text-accent hover:border-accent/30 transition-colors">
              Vídeo Demo ↗
            </a>
            <a href="https://global-solution-2026.onrender.com/health" target="_blank" rel="noreferrer"
              className="text-center text-sm font-medium text-muted border border-border py-2.5 rounded-lg hover:text-accent hover:border-accent/30 transition-colors">
              API Java ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
