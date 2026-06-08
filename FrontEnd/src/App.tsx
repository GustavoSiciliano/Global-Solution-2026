import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { NotifProvider } from "./context/NotifContext";
import { useAppContext } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Modal from "./components/Modal";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RegiaoDetalhe from "./pages/RegiaoDetalhe";
import Alertas from "./pages/Alertas";
import Clima from "./pages/Clima";
import Sobre from "./pages/Sobre";
import SimuladorIA from "./pages/SimuladorIA";
import Contato from "./pages/Contato";
import Pipeline from "./pages/Pipeline";
import Comparativo from "./pages/Comparativo";
import Queimadas from "./pages/Queimadas";
import Planos from "./pages/Planos";
import FAQ from "./pages/FAQ";
import Integrantes from "./pages/Integrantes";
import Gerenciar from "./pages/Gerenciar";
import NotFound from "./pages/NotFound";

function AppInner() {
  const { alertasAtivos } = useAppContext();
  return (
    <NotifProvider alertas={alertasAtivos}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/regioes/:id" element={<RegiaoDetalhe />} />
            <Route path="/alertas" element={<Alertas />} />
            <Route path="/clima" element={<Clima />} />
            <Route path="/simulador" element={<SimuladorIA />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/comparativo" element={<Comparativo />} />
            <Route path="/queimadas" element={<Queimadas />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/gerenciar" element={<Gerenciar />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/integrantes" element={<Integrantes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Modal />
      </div>
    </NotifProvider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppInner />
      </AppProvider>
    </BrowserRouter>
  );
}
