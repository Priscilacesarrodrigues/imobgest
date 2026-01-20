import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../services/api";
import "./EtapasCliente.css";
import ClienteLayout from "../components/ClienteLayout";

const ETAPAS = [
  { n: 1, title: "Proposta" },
  { n: 2, title: "Cadastro Pessoal" },
  { n: 3, title: "Documentação" },
  { n: 4, title: "Assinaturas" },
  { n: 5, title: "Contratos" },
];

// ✅ Enquanto estiver desenvolvendo telas, deixe true.
// ✅ Para voltar ao fluxo real (etapa N só libera se N-1 APPROVED), mude para false.
const DEV_UNLOCK_ALL = true;

export default function EtapasCliente() {
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const data = await apiGet("/proposals");
      const list = data.proposals || [];
      const sorted = [...list].sort((a, b) =>
        a.createdAt < b.createdAt ? 1 : -1
      );
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

  const etapasView = useMemo(() => {
    const stages = proposal?.stages || [];

    return ETAPAS.map((e) => {
      const stageObj = stages.find((s) => Number(s.n) === e.n);
      const status = stageObj?.status || (e.n === 1 ? "OPEN" : "LOCKED");

      // desbloqueio: etapa 1 liberada; etapa N se N-1 APPROVED
      let unlocked = e.n === 1;

      // ✅ Opção A: liberar tudo enquanto desenvolve
      if (DEV_UNLOCK_ALL) {
        unlocked = true;
      } else if (e.n > 1) {
        const prev = stages.find((s) => Number(s.n) === e.n - 1);
        unlocked = prev?.status === "APPROVED";
      }

      return { ...e, unlocked, status };
    });
  }, [proposal]);

  function openStage(stageNumber) {
    navigate(`/cliente/etapas/${stageNumber}`);
  }

  function statusLabel(status) {
    if (status === "OPEN") return "Status: Em preenchimento";
    if (status === "SUBMITTED") return "Status: Aguardando Aprovação";
    if (status === "APPROVED") return "Status: Aprovada";
    if (status === "REJECTED") return "Status: Reprovada";
    return "Etapa não liberada";
  }

  return (
    <ClienteLayout title="Área do Cliente">
      <div className="etapas-wrap">
        <div className="etapas-topbar">
          <button
            type="button"
            className="ig-btn-outline etapas-back"
            onClick={() => navigate("/cliente")}
          >
            <span className="etapas-back-ico" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            Voltar
          </button>

          <div className="etapas-head">
            <h2 className="etapas-title">Minhas Etapas</h2>
            <div className="etapas-subtitle">
              {proposal ? (
                <>
                  Proposta: <b>{proposal.id}</b>
                </>
              ) : (
                <>Nenhuma proposta encontrada. Crie uma proposta para iniciar.</>
              )}
            </div>
          </div>

          <button
            className="ig-btn-outline etapas-refresh"
            onClick={load}
            disabled={loading}
            type="button"
          >
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
                //  evita tooltip duplicado do navegador
                title={e.unlocked ? "Abrir" : undefined}
                aria-disabled={!e.unlocked}
              >
                <div className="etapa-row">
                  <div className="etapa-title">{e.title}</div>

                  <div className="etapa-status-wrap abaixo">
                    <div className={`etapa-status s-${String(e.status).toLowerCase()}`}>
                      {!e.unlocked ? "Etapa não liberada" : statusLabel(e.status)}
                    </div>

                    {!e.unlocked && (
                      <div className="etapa-tooltip">
                        Necessário finalização da etapa anterior
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}
