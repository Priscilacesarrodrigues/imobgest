import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../services/api";
import { logout, getUser } from "../services/auth";
import logo from "../assets/logo2.png";
import "./ClienteHome.css";

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M10 17v-2h4v2h-4Zm9-5-4-4v3h-6v2h6v3l4-4ZM4 4h10v2H6v14h8v2H4V4Z"
      />
    </svg>
  );
}

/* Ícone para item "Perfil" no menu */
function IconProfile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 12c2.76 0 5-2.24 5-5S14.76 2 12 2 7 4.24 7 7s2.24 5 5 5Zm0 2c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5Z"
      />
    </svg>
  );
}

/* Ícone para item "Trocar Senha" no menu */
function IconKey() {
  return (
    <svg width="18" height="18" viewBox="0 0 510 510" aria-hidden="true">
      <path
        fill="currentColor"
        d="M336 0c-97.2 0-176 78.8-176 176
           0 15.3 2 30.2 5.7 44.4L0 384v128h128v-64h64v-64h64v-64h64l28.3-28.3
           c14.2 3.7 29.1 5.7 44.4 5.7
           97.2 0 176-78.8 176-176S433.2 0 336 0zm0 96
           c-26.5 0-48 21.5-48 48s21.5 48 48 48
           48-21.5 48-48-21.5-48-48-48z"
      />
    </svg>
  );
}

export default function ClienteHome() {
  const navigate = useNavigate();
  const user = getUser();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function loadProposals() {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet("/proposals");
      setProposals(data.proposals || []);
    } catch (err) {
      setError(err.message || "Erro ao carregar propostas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProposals();
  }, []);

  async function handleNewProposal() {
    setCreating(true);
    setError("");
    try {
      await apiPost("/proposals", {});
      await loadProposals();
    } catch (err) {
      setError(err.message || "Erro ao criar proposta");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="ig-page">
      <header className="ig-topbar">
        <div className="ig-topbar-left">
          <img src={logo} alt="ImobGest" className="ig-logo" />
          <div className="ig-subtitle">Área do Cliente</div>
        </div>

        <div className="ig-topbar-right">
          <div className="ig-user">
            <div className="ig-user-name">{user?.name || "Usuário"}</div>

            <div className="ig-menu" ref={menuRef}>
              <button
                type="button"
                className="ig-icon-btn"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Abrir menu do perfil"
                title="Perfil"
              >
                <IconUser />
              </button>

              {menuOpen && (
                <div className="ig-menu-flyout">
                  <button type="button" className="ig-menu-item" onClick={() => alert("Perfil (próximo)")}>
                    <IconProfile />
                    <span>Perfil</span>
                  </button>

                  <button type="button" className="ig-menu-item" onClick={() => alert("Trocar Senha (próximo)")}>
                    <IconKey />
                    <span>Trocar Senha</span>
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="ig-icon-btn ig-logout" onClick={logout} title="Sair">
              <IconLogout />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      <main className="ig-content">
        <div className="ig-container">
          <div className="ig-actions">
            {/* ✅ AGORA NAVEGA */}
            <button className="ig-btn-primary" onClick={() => navigate("/cliente/etapas")}>
              Minhas Etapas
            </button>

            <button className="ig-btn-primary" onClick={() => alert("Mensagem (próximo)")}>
              Mensagem
            </button>
          </div>

          <div className="ig-actions secondary">
            <button className="ig-btn-primary" onClick={handleNewProposal} disabled={creating}>
              {creating ? "Criando..." : "Nova Proposta"}
            </button>

            <button className="ig-btn-primary" onClick={loadProposals} disabled={loading}>
              {loading ? "Atualizando..." : "Atualizar"}
            </button>
          </div>

          {error && <div className="ig-error">{error}</div>}

          <section className="ig-card">
            <h3 className="ig-card-title">Minhas Propostas</h3>

            {loading ? (
              <div>Carregando...</div>
            ) : proposals.length === 0 ? (
              <div className="ig-muted">Nenhuma proposta criada ainda.</div>
            ) : (
              <div className="ig-list">
                {proposals.map((p) => (
                  <div className="ig-list-item" key={p.id}>
                    <div>
                      <div className="ig-id">{p.id}</div>
                      <div className="ig-muted">
                        Status: {p.overallStatus} — Etapa atual: {p.currentStage}
                      </div>
                    </div>

                    <button className="ig-btn-outline" onClick={() => alert(`Abrir proposta ${p.id} (próximo)`)}>
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
