import { Navigate } from 'react-router-dom';
import { getToken, getUser } from '../services/auth';

export function RequireAuth({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export function RequireInternal({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.profile !== 'INTERNAL') return <Navigate to="/cliente" replace />;
  return children;
}

export function RequireExternal({ children }) {
  const token = getToken();
  const user = getUser();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.profile !== 'EXTERNAL') return <Navigate to="/interno" replace />;
  return children;
}
