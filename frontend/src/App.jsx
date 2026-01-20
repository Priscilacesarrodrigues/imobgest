import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ClienteHome from "./pages/ClienteHome.jsx";
import InternoHome from "./pages/InternoHome.jsx";
import EtapasCliente from "./pages/EtapasCliente.jsx";
import Etapa1Proposta from "./pages/Etapa1Proposta.jsx";
import Etapa2CadastroPessoal from "./pages/Etapa2CadastroPessoal.jsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />

        {/* Protegidas */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/cliente"
          element={
            <RequireAuth>
              <ClienteHome />
            </RequireAuth>
          }
        />

        {/* Lista de etapas */}
        <Route
          path="/cliente/etapas"
          element={
            <RequireAuth>
              <EtapasCliente />
            </RequireAuth>
          }
        />

        {/* Rotas das etapas (detalhe) */}
        <Route
          path="/cliente/etapas/1"
          element={
            <RequireAuth>
              <Etapa1Proposta />
            </RequireAuth>
          }
        />

        <Route
          path="/cliente/etapas/2"
          element={
            <RequireAuth>
              <Etapa2CadastroPessoal />
            </RequireAuth>
          }
        />

        {/* (Opcional) rota dinâmica se quiser tratar 3,4,5 depois */}
        <Route
          path="/cliente/etapas/:etapa"
          element={
            <RequireAuth>
              <EtapasCliente />
            </RequireAuth>
          }
        />

        <Route
          path="/interno"
          element={
            <RequireAuth>
              <InternoHome />
            </RequireAuth>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
