import { useState } from 'react';
import { apiPost } from '../services/api';
import './Login.css';

import logo from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
  const data = await apiPost('/auth/login', { email, password });

  console.log("LOGIN RESPONSE:", data);
  const { token, user } = data;
  console.log("TOKEN:", token, "USER:", user);

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  if (user.userType === 'INTERNO') {
    window.location.href = '/interno';
  } else {
    window.location.href = '/cliente';
  }
} catch (err) {
  console.log("LOGIN ERROR:", err);
  setError(err.message || 'Erro ao autenticar');
}

  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-topbar" />

        <div className="login-content">
          <div className="brand">
            <img src={logo} alt="Logo da empresa" />
            <div className="brand-title">
              <h1>ImobGest</h1>
              <p>Gestão de propostas e contratos</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>

            {error && <div className="error">{error}</div>}

            <div className="actions">
              <button type="submit">Entrar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
