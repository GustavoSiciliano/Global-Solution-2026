import { createContext, useContext, useState, type ReactNode } from "react";
import type { AlertaDetalhado } from "../types";

export interface Notif {
  id: number;
  titulo: string;
  mensagem: string;
  nivel: string;
  regiao: string;
  lida: boolean;
  href: string;
  dt: string;
}

interface NotifContextType {
  notifs: Notif[];
  naoLidas: number;
  marcarLida: (id: number) => void;
  marcarTodasLidas: () => void;
}

const NotifContext = createContext<NotifContextType | undefined>(undefined);

export function NotifProvider({
  children,
  alertas,
}: {
  children: ReactNode;
  alertas: AlertaDetalhado[];
}) {
  const [notifs, setNotifs] = useState<Notif[]>(() =>
    alertas.slice(0, 8).map((a, i) => ({
      id: i + 1,
      titulo: `Alerta ${a.ds_nivel} — ${a.regiao.nm_regiao}`,
      mensagem: a.ds_mensagem,
      nivel: a.ds_nivel,
      regiao: a.regiao.nm_regiao,
      lida: a.fl_resolvido === "S",
      href: `/regioes/${a.id_regiao}`,
      dt: a.dt_alerta,
    })),
  );

  const naoLidas = notifs.filter((n) => !n.lida).length;

  const marcarLida = (id: number) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n)),
    );

  const marcarTodasLidas = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })));

  return (
    <NotifContext.Provider
      value={{ notifs, naoLidas, marcarLida, marcarTodasLidas }}
    >
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifs() {
  const ctx = useContext(NotifContext);
  if (!ctx) throw new Error("useNotifs must be inside NotifProvider");
  return ctx;
}
