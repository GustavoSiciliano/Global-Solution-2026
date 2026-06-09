import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type {
  AlertaDetalhado,
  EstatisticasDashboard,
  ApiStatus,
} from "../types";
import { javaApi, checkJavaHealth, startKeepAlive } from "../services/api";
import { mockEstatisticas } from "../data/mockData";

interface AppContextType {
  alertasAtivos: AlertaDetalhado[];
  estatisticas: EstatisticasDashboard;
  apiStatus: ApiStatus;
  modalAviso: ModalAviso | null;
  showModal: (aviso: ModalAviso) => void;
  closeModal: () => void;
  loading: boolean;
  recarregar: () => void;
}

export interface ModalAviso {
  tipo: "info" | "aviso" | "erro" | "sucesso";
  titulo: string;
  mensagem: string;
  onConfirm?: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [alertasAtivos, setAlertasAtivos] = useState<AlertaDetalhado[]>([]);
  const [estatisticas, setEstatisticas] =
    useState<EstatisticasDashboard>(mockEstatisticas);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");
  const [modalAviso, setModalAviso] = useState<ModalAviso | null>(null);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const [alertas, stats, isOnline] = await Promise.all([
        javaApi.getAlertas(),
        javaApi.getEstatisticas(),
        checkJavaHealth(),
      ]);
      setAlertasAtivos(alertas.filter((a) => a.fl_resolvido === "N"));
      setEstatisticas(stats);
      setApiStatus(isOnline ? "online" : "offline");
    } catch {
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // Keep-alive: pinga as APIs a cada 14 min para evitar hibernação do Render
    const stopPing = startKeepAlive();
    // Auto-refresh dos alertas a cada 5 minutos
    const refresh = setInterval(
      () => {
        javaApi
          .getAlertas()
          .then((a) =>
            setAlertasAtivos(a.filter((x) => x.fl_resolvido === "N")),
          )
          .catch(() => {});
      },
      5 * 60 * 1000,
    );
    return () => {
      stopPing();
      clearInterval(refresh);
    };
  }, []);

  const showModal = (aviso: ModalAviso) => setModalAviso(aviso);
  const closeModal = () => setModalAviso(null);

  return (
    <AppContext.Provider
      value={{
        alertasAtivos,
        estatisticas,
        apiStatus,
        modalAviso,
        showModal,
        closeModal,
        loading,
        recarregar: carregar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
}
