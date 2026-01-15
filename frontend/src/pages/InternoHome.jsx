import Dashboard from './Dashboard';
import { logout, getUser } from '../services/auth';

export default function InternoHome() {
  const user = getUser();

  return (
    <div>
      <div style={{ padding: 16, display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <b>Área Interna</b>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            {user?.name} — {user?.email}
          </div>
        </div>
        <button onClick={logout}>Sair</button>
      </div>

      {/* Reaproveita seu dashboard por enquanto */}
      <Dashboard />
    </div>
  );
}
