import { useEffect, useRef, useState } from "react";
import { logout, getUser } from "../services/auth";
import logo from "../assets/logo2.png";
import "../pages/ClienteHome.css"; // reaproveita o CSS que já está aprovado

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

export default function ClienteLayout({ title = "Área do Cliente", children }) {
  const user = getUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="ig-page">
      <header className="ig-topbar">
        <div className="ig-topbar-left">
          <img src={logo} alt="ImobGest" className="ig-logo" />
          <div className="ig-subtitle">{title}</div>
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
        <div className="ig-container">{children}</div>
      </main>
    </div>
  );
}
