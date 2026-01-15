import { useEffect, useMemo, useState } from "react";
import { apiGet } from "../services/api";
import "./EtapasCliente.css";
import ClienteLayout from "../components/ClienteLayout";

const ETAPAS = [
  { n: 1, title: "Proposta", desc: "Proposta Comercial" },
  { n: 2, title: "Cadastro Pessoal", desc: "Ficha PF/PJ" },
  { n: 3, title: "Documentação", desc: "Checklist e anexos" },
  { n: 4, title: "Assinaturas", desc: "Assinatura física/digital" },
  { n: 5, title: "Contratos", desc: "Contrato final e arquivamento" },
];

export default function EtapasCliente() {
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet("/proposals");
      const list = data.proposals || [];

      // Por enquanto: pega a proposta mais recente do cliente (se existir)
      const sorted = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setProposal(sorted[0] || null);
    } catch (err) {
      setError(err.message || "Erro ao carregar etapas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const currentStage = proposal?.currentStage || 1;

  const etapasView = useMemo(() => {
    return ETAPAS.map((e) => {
      const unlocked = e.n <= currentStage; // liberadas até a etapa atual
      return { ...e, unlocked };
    });
  }, [currentStage]);

  function openStage(stageNumber) {
    // por enquanto: só placeholder
    alert(`Abrir Etapa ${stageNumber} (próximo)`);
    // depois a gente troca para: navigate(`/cliente/etapas/${stageNumber}`)
  }

  return (
    <div className="etapas-wrap">
      <div className="etapas-header">
        <div>
          <h2 className="etapas-title">Minhas Etapas</h2>
          <div className="etapas-subtitle">
            {proposal ? (
              <>
                Proposta: <b>{proposal.id}</b> — Etapa atual: <b>{proposal.currentStage}</b>
              </>
            ) : (
              <>Nenhuma proposta encontrada. Crie uma proposta para iniciar.</>
            )}
          </div>
        </div>

        <button className="ig-btn-outline" onClick={load} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar"}
        </button>
      </div>

      {error && <div className="ig-error">{error}</div>}

      {loading ? (
        <div>Carregando...</div>
      ) : !proposal ? (
        <div className="ig-card">
          <div className="ig-muted">
            Você ainda não tem proposta. Volte e clique em <b>Nova Proposta</b>.
          </div>
        </div>
      ) : (
        <div className="etapas-grid">
          {etapasView.map((e) => (
            <button
              key={e.n}
              className={`etapa-card ${e.unlocked ? "unlocked" : "locked"}`}
              onClick={() => e.unlocked && openStage(e.n)}
              disabled={!e.unlocked}
              type="button"
              title={e.unlocked ? "Abrir" : "Bloqueado"}
            >
              <div className="etapa-num">Etapa {e.n}</div>
              <div className="etapa-title">{e.title}</div>
              <div className="etapa-desc">{e.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
