import { useAppContext } from "../context/AppContext";

const cfg = {
  info: { cls: "bg-blue-50 border-blue-200", tc: "text-blue-700", icon: "ℹ" },
  aviso: {
    cls: "bg-yellow-50 border-yellow-200",
    tc: "text-yellow-800",
    icon: "◆",
  },
  erro: { cls: "bg-red-50 border-red-200", tc: "text-red-700", icon: "⚠" },
  sucesso: {
    cls: "bg-green-50 border-green-200",
    tc: "text-accent",
    icon: "✓",
  },
};

export default function Modal() {
  const { modalAviso, closeModal } = useAppContext();
  if (!modalAviso) return null;
  const { cls, tc, icon } = cfg[modalAviso.tipo];

  return (
    <div
      className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={closeModal}
    >
      <div
        className="bg-surface border border-border rounded-xl p-6 max-w-sm w-full shadow-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${cls} border rounded-lg px-4 py-3 mb-4 flex items-center gap-2`}
        >
          <span className={`${tc} text-base`}>{icon}</span>
          <h3 className={`font-semibold text-sm ${tc}`}>{modalAviso.titulo}</h3>
        </div>
        <p className="text-sm text-muted leading-relaxed">
          {modalAviso.mensagem}
        </p>
        <div className="flex justify-end gap-2 mt-5">
          {modalAviso.onConfirm && (
            <button
              onClick={() => {
                modalAviso.onConfirm?.();
                closeModal();
              }}
              className="px-4 py-1.5 text-sm font-medium text-accent border border-accent/30 bg-accent-bg rounded-lg hover:bg-accent/10 transition-colors"
            >
              Confirmar
            </button>
          )}
          <button
            onClick={closeModal}
            className="px-4 py-1.5 text-sm text-muted border border-border rounded-lg hover:text-text hover:bg-surface2 transition-colors"
          >
            {modalAviso.onConfirm ? "Cancelar" : "Fechar"}
          </button>
        </div>
      </div>
    </div>
  );
}
