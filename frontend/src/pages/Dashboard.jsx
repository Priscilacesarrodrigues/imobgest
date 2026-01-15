import { useEffect, useState } from 'react';
import { apiGet, apiPost } from '../services/api';

export default function Dashboard() {
  const [proposals, setProposals] = useState([]);
  const [error, setError] = useState('');

  async function loadProposals() {
    try {
      const data = await apiGet('/proposals');
      setProposals(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleNewProposal() {
    try {
      await apiPost('/proposals', { title: 'Nova Proposta' });
      loadProposals();
    } catch (err) {
      alert(err.message);
    }
  }

  useEffect(() => {
    loadProposals();
  }, []);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>Dashboard</h2>
        <button onClick={handleNewProposal}>Nova Proposta</button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      <h3>Propostas</h3>

      {proposals.length === 0 && <p>Nenhuma proposta criada.</p>}

      <ul style={styles.list}>
        {proposals.map((p) => (
          <li key={p.id} style={styles.item}>
            <div>
              <strong>{p.title}</strong>
              <div>Status: {p.status}</div>
            </div>

            <a href={`/proposal/${p.id}/stage/1`}>Abrir</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: 24,
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  item: {
    border: '1px solid #ddd',
    padding: 12,
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  error: {
    color: 'red',
  },
};
