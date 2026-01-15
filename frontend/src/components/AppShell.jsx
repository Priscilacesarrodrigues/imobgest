import { useEffect, useRef, useState } from "react";
import "./AppShell.css";
import logo from "../assets/logo.png";
import { logout } from "../services/auth";

export default function AppShell({ userName, rightTitle = "Área do Cliente", children }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        {/* LEFT */}
        <div className="app-header-left">
          <div className="user-block">
            <div className="user-name">{userName || "Usuário"}</div>

            <div className="menu-wrap" ref={menuRef}>
              <button
                className="icon-btn"
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Abrir menu"
                title="Menu"
              >
                ☰
              </button>

              {open && (
                <div className="mini-menu">
                  <button type="button" className="mini-item" onClick={() => alert("Perfil (próximo)")}>
                    Perfil
                  </button>
                  <button type="button" className="mini-item" onClick={() => alert("Trocar Senha (próximo)")}>
                    Trocar Senha
                  </button>
                </div>
              )}
            </div>

            <button className="icon-btn logout-btn" type="button" onClick={logout} title="Sair">
              ⎋ Sair
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="app-header-right">
          <img src={logo} alt="ImobGest" className="app-logo" />
          <div className="app-subtitle">{rightTitle}</div>
        </div>
      </header>

      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
