import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaHome, FaSave, FaCheckCircle } from "react-icons/fa";
import ClienteLayout from "../components/ClienteLayout";
import { apiGet, apiPost } from "../services/api";
import "./Etapa2CadastroPessoal.css";

const SECTIONS = [
  { key: "pessoais", label: "Dados Pessoais" },
  { key: "profissionais", label: "Dados Profissionais" },
  { key: "patrimonio", label: "Dados Patrimônio" },
  { key: "garantia", label: "Garantia" },
];

const ESTADO_CIVIL_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "SEPARADO", label: "Separado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
];

const REGIME_CASAMENTO_OPTIONS = [
  { value: "", label: "Selecione..." },
  { value: "COMUNHAO_PARCIAL", label: "Comunhão parcial de bens" },
  { value: "COMUNHAO_UNIVERSAL", label: "Comunhão universal de bens" },
  { value: "SEPARACAO_TOTAL", label: "Separação total de bens" },
  { value: "SEPARACAO_OBRIGATORIA", label: "Separação obrigatória de bens" },
  { value: "PARTICIPACAO_FINAL", label: "Participação final nos aquestos" },
];

/* Lista de tipos de imóveis (SELECT) */
const TIPOS_IMOVEIS = [
  "Casa",
  "Apartamento",
  "Terreno",
  "Sobrado",
  "Kitnet/Studio",
  "Sala Comercial",
  "Loja",
  "Galpão",
  "Prédio",
  "Sítio/Chácara",
  "Fazenda",
  "Outro",
];

const DEFAULT_PF = {
  nome: "",
  dataNascimento: "",
  nacionalidade: "",
  naturalidade: "",
  estadoCivil: "",
  regimeCasamento: "",
  profissao: "",
  cpf: "",
  rg: "",
  orgaoEmissor: "",
  dataEmissao: "",

  telRes: "",
  telComercial: "",
  celular: "",
  email: "",

  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  complemento: "",

  conjugeNome: "",
  conjugeDataNascimento: "",
  conjugeNacionalidade: "",
  conjugeNaturalidade: "",
  conjugeProfissao: "",
  conjugeCpf: "",
  conjugeRg: "",
  conjugeOrgaoEmissor: "",
  conjugeDataEmissao: "",
  conjugeComercial: "",
  conjugeCelular: "",
  conjugeEmail: "",

  // Dados Profissionais - Titular
  profEmpresa: "",
  profEndereco: "",
  profCidade: "",
  profEstado: "",
  profTelefone: "",
  profDataAdmissao: "",
  profCargo: "",
  profSalario: "",
  profOutrosRendimentos: "", // "SIM" | "NAO" | ""
  profOutrosValor: "",
  profOutrosProveniente: "",
  profConjugeAtividadeRemunerada: "", // "SIM" | "NAO" | ""

  // Dados Profissionais - Cônjuge
  conjugeProfEmpresa: "",
  conjugeProfEndereco: "",
  conjugeProfCidade: "",
  conjugeProfEstado: "",
  conjugeProfTelefone: "",
  conjugeProfDataAdmissao: "",
  conjugeProfCargo: "",
  conjugeProfSalario: "",
  conjugeProfOutrosRendimentos: "", // "SIM" | "NAO" | ""
  conjugeProfOutrosValor: "",
  conjugeProfOutrosProveniente: "",

  // Dados Patrimônio (Imóvel - Garantia) - PF
  patTipoImovel: "",
  patMatriculaRGI: "",
  patMatriculaIPTU: "",
  patCartorioRegistroNumero: "",
  patLivro: "",
  patFolha: "",
  patEndereco: "",
  patNumero: "",
  patBairro: "",
  patCidade: "",
  patEstado: "",
  patCep: "",
  patComplemento: "",
};

const DEFAULT_PJ = {
  razaoSocial: "",
  nomeFantasia: "",
  cnpj: "",
  inscricaoEstadual: "",
  inscricaoMunicipal: "",
  dataConstituicao: "",
  atividadePrincipal: "",
  email: "",
  telefone: "",

  endereco: "",
  numero: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  complemento: "",

  repNome: "",
  repCpf: "",
  repRg: "",
  repOrgaoEmissor: "",
  repDataEmissao: "",
  repDataNascimento: "",
  repEmail: "",
  repCelular: "",
  repCargo: "",
};

/* Máscaras (sem biblioteca) */
function onlyDigits(v = "") {
  return String(v).replace(/\D/g, "");
}

function applyMask(digits, pattern) {
  let i = 0;
  let out = "";
  for (const ch of pattern) {
    if (ch === "0") {
      if (i >= digits.length) break;
      out += digits[i++];
    } else {
      if (i < digits.length) out += ch;
    }
  }
  return out;
}

function maskCPF(v) {
  const d = onlyDigits(v).slice(0, 11);
  return applyMask(d, "000.000.000-00");
}

function maskCNPJ(v) {
  const d = onlyDigits(v).slice(0, 14);
  return applyMask(d, "00.000.000/0000-00");
}

function maskRG(v) {
  const d = onlyDigits(v).slice(0, 9);
  if (d.length <= 8) return applyMask(d, "00.000.000");
  return applyMask(d, "00.000.000-0");
}

function maskPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (!d) return "";
  if (d.length <= 10) return applyMask(d, "(00) 0000-0000");
  return applyMask(d, "(00) 00000-0000");
}

function maskCEP(v) {
  const d = onlyDigits(v).slice(0, 8);
  return applyMask(d, "00000-000");
}

function maskMoneyBR(v) {
  const d = onlyDigits(v);
  if (!d) return "";
  const cents = d.padStart(3, "0");
  const intPart = cents.slice(0, -2);
  const decPart = cents.slice(-2);
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${intWithDots},${decPart}`;
}

function yesNoOptions() {
  return [
    { value: "", label: "Selecione..." },
    { value: "NAO", label: "Não" },
    { value: "SIM", label: "Sim" },
  ];
}

/* CEP -> ViaCEP (autofill)*/
async function fetchAddressByCep(cepDigits, signal) {
  const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, { signal });
  if (!res.ok) throw new Error("Não foi possível consultar o CEP.");
  const data = await res.json();
  if (data?.erro) return null;
  return data;
}

export default function Etapa2CadastroPessoal() {
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [stage, setStage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [tipoCadastro, setTipoCadastro] = useState(null); // "PF" | "PJ" | null
  const [active, setActive] = useState("pessoais");

  const [pf, setPf] = useState(DEFAULT_PF);
  const [pj, setPj] = useState(DEFAULT_PJ);

  const [done, setDone] = useState({
    pessoais: false,
    profissionais: false,
    patrimonio: false,
    garantia: false,
  });

  const isLocked = !!stage?.status && stage.status !== "OPEN";
  const inputsDisabled = loading || saving || isLocked;

  async function load() {
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const data = await apiGet("/proposals");
      const list = data.proposals || [];
      const sorted = [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      const p = sorted[0] || null;
      setProposal(p);

      if (!p) return;

      const stages = p.stages || [];
      const s2 = stages.find((s) => Number(s.n) === 2) || { n: 2, status: "OPEN", data: {} };
      setStage(s2);

      const saved = s2.data || {};
      if (saved?.tipoCadastro) setTipoCadastro(saved.tipoCadastro);
      if (saved?.pf) setPf({ ...DEFAULT_PF, ...saved.pf });
      if (saved?.pj) setPj({ ...DEFAULT_PJ, ...saved.pj });
      if (saved?.done) setDone((prev) => ({ ...prev, ...saved.done }));
    } catch (err) {
      setError(err.message || "Erro ao carregar Etapa 2");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function setPfField(name, value) {
    setPf((prev) => ({ ...prev, [name]: value }));
  }
  function setPjField(name, value) {
    setPj((prev) => ({ ...prev, [name]: value }));
  }

  function validatePF() {
    if (!String(pf.nome || "").trim()) return "Preencha: Nome";
    if (!String(pf.cpf || "").trim()) return "Preencha: CPF";
    if (!String(pf.dataNascimento || "").trim()) return "Preencha: Data de Nascimento";
    if (!String(pf.email || "").trim()) return "Preencha: E-mail";
    return "";
  }

  function validatePJ() {
    if (!String(pj.razaoSocial || "").trim()) return "Preencha: Razão Social";
    if (!String(pj.cnpj || "").trim()) return "Preencha: CNPJ";
    if (!String(pj.email || "").trim()) return "Preencha: E-mail da Empresa";
    if (!String(pj.repNome || "").trim()) return "Preencha: Representante Legal - Nome";
    if (!String(pj.repCpf || "").trim()) return "Preencha: Representante Legal - CPF";
    return "";
  }

  async function saveSection(nextStatus) {
    if (!proposal) return;
    if (isLocked) return;

    setError("");
    setInfo("");
    setSaving(true);

    try {
      if (!tipoCadastro) {
        setError("Selecione PF ou PJ para continuar.");
        setSaving(false);
        return;
      }

      if (active === "pessoais" && nextStatus === "SUBMITTED") {
        const msg = tipoCadastro === "PF" ? validatePF() : validatePJ();
        if (msg) {
          setError(msg);
          setSaving(false);
          return;
        }
      }

      const payloadData = {
        tipoCadastro,
        pf,
        pj,
        done: {
          ...done,
          [active]: true,
        },
      };

      await apiPost(`/proposals/${proposal.id}/stages/2`, { status: nextStatus, data: payloadData });

      setDone((prev) => ({ ...prev, [active]: true }));
      setInfo(nextStatus === "SUBMITTED" ? "Enviado para aprovação." : "Salvo com sucesso.");
      await load();
    } catch (err) {
      setError(err.message || "Erro ao salvar Etapa 2");
    } finally {
      setSaving(false);
    }
  }

  async function setTipoAndPersist(tipo) {
    if (isLocked) return;
    setTipoCadastro(tipo);

    if (!proposal) return;

    setError("");
    setInfo("");
    setSaving(true);
    try {
      const payloadData = { tipoCadastro: tipo, pf, pj, done };
      await apiPost(`/proposals/${proposal.id}/stages/2`, { status: "OPEN", data: payloadData });
      setInfo(`Tipo selecionado: ${tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}.`);
      await load();
    } catch (err) {
      setError(err.message || "Erro ao salvar tipo de cadastro");
    } finally {
      setSaving(false);
    }
  }

  const leftSlot = useMemo(() => {
    return (
      <button
        className="ig-btn-outline"
        type="button"
        onClick={() => navigate(-1)}
        disabled={saving || loading}
        title="Voltar"
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <FaArrowLeft />
        Voltar
      </button>
    );
  }, [saving, loading, navigate]);

  const rightSlot = useMemo(() => {
    const enviarLabel = isLocked ? "Enviado para Aprovação" : "Enviar para Aprovação";

    return (
      <>
        <button
          className="ig-btn-outline"
          type="button"
          onClick={() => navigate("/cliente")}
          disabled={saving || loading}
          title="Início"
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FaHome />
          Início
        </button>

        <button
          className="ig-btn-outline"
          type="button"
          onClick={() => saveSection("OPEN")}
          disabled={saving || loading || !proposal || isLocked}
          title={isLocked ? "Após enviar, não é possível alterar" : "Salvar"}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <FaSave />
          {saving ? "Salvando..." : "Salvar"}
        </button>

        <button
          className="ig-btn-primary"
          type="button"
          onClick={() => saveSection("SUBMITTED")}
          disabled={saving || loading || !proposal || isLocked}
          title={isLocked ? "Enviado. Não pode mais ser alterado" : "Enviar para aprovação"}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            minWidth: 300,
            padding: "12px 22px",
            fontWeight: 600,
            ...(isLocked ? { background: "#16a34a", borderColor: "#16a34a" } : {}),
          }}
        >
          <FaCheckCircle />
          {saving ? "Enviando..." : enviarLabel}
        </button>
      </>
    );
  }, [saving, loading, proposal, navigate, isLocked]);

  const etapaTitle =
    tipoCadastro === "PJ" ? "Etapa 2 - Cadastro (Pessoa Jurídica)" : "Etapa 2 - Cadastro (Pessoa Física)";

  return (
    <ClienteLayout title="Área do Cliente">
      <div className="ig-container">
        <EtapaHeader
          title={tipoCadastro ? etapaTitle : "Etapa 2 - Cadastro (selecione PF/PJ)"}
          proposalId={proposal?.id}
          status={stage?.status || "Em preenchimento"}
          leftSlot={leftSlot}
          rightSlot={rightSlot}
        />

        {error && <div className="ig-error">{error}</div>}
        {info && (
          <div className="cp-info">
            <b>{info}</b>
          </div>
        )}

        {loading ? (
          <div>Carregando...</div>
        ) : !proposal ? (
          <div className="ig-card">
            <div className="ig-muted">
              Você ainda não tem proposta. Volte e clique em <b>Nova Proposta</b>.
            </div>
          </div>
        ) : (
          <>
            {!tipoCadastro ? (
              <div className="ig-card" style={{ padding: 18 }}>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
                  Para continuar, escolha o tipo de cadastro
                </div>
                <div className="ig-muted" style={{ marginBottom: 14 }}>
                  Isso define quais campos serão exibidos na Etapa 2.
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    className="ig-btn-primary"
                    disabled={inputsDisabled || !proposal}
                    onClick={() => setTipoAndPersist("PF")}
                    style={{ minWidth: 220, justifyContent: "center" }}
                  >
                    Pessoa Física (PF)
                  </button>

                  <button
                    type="button"
                    className="ig-btn-outline"
                    disabled={inputsDisabled || !proposal}
                    onClick={() => setTipoAndPersist("PJ")}
                    style={{ minWidth: 220, justifyContent: "center" }}
                  >
                    Pessoa Jurídica (PJ)
                  </button>
                </div>

                <div className="ig-muted" style={{ marginTop: 14 }}>
                  * Você pode alterar o tipo enquanto a etapa estiver em <b>OPEN</b> (não enviada).
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  <button
                    type="button"
                    className="ig-btn-outline"
                    disabled={inputsDisabled}
                    title={isLocked ? "Etapa enviada: não é possível alterar" : "Alterar tipo de cadastro"}
                    onClick={() => {
                      if (isLocked) return;
                      setTipoCadastro(null);
                      setActive("pessoais");
                      setInfo("");
                      setError("");
                    }}
                  >
                    Alterar PF/PJ
                  </button>
                </div>

                <div className="cp-tabs">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      className={["cp-tab", active === s.key ? "is-active" : "", done[s.key] ? "is-done" : ""].join(
                        " "
                      )}
                      onClick={() => setActive(s.key)}
                      disabled={loading}
                    >
                      {s.label}
                      {done[s.key] && <span className="cp-dot" aria-hidden="true" />}
                    </button>
                  ))}
                </div>

                <div className="cp-panel ig-card">
                  {active === "pessoais" ? (
                    tipoCadastro === "PF" ? (
                      <PFForm pf={pf} setPfField={setPfField} inputsDisabled={inputsDisabled} />
                    ) : (
                      <PJForm pj={pj} setPjField={setPjField} inputsDisabled={inputsDisabled} />
                    )
                  ) : active === "profissionais" ? (
                    tipoCadastro === "PF" ? (
                      <PFProfissionaisForm pf={pf} setPfField={setPfField} inputsDisabled={inputsDisabled} />
                    ) : (
                      <>
                        <div className="cp-panel-head">
                          <h3>Dados Profissionais (PJ)</h3>
                          <div className="ig-muted">Em construção…</div>
                        </div>
                        <div className="ig-muted">Na sequência montamos a versão PJ.</div>
                      </>
                    )
                  ) : active === "patrimonio" ? (
                    tipoCadastro === "PF" ? (
                      <PFPatrimonioForm pf={pf} setPfField={setPfField} inputsDisabled={inputsDisabled} />
                    ) : (
                      <>
                        <div className="cp-panel-head">
                          <h3>Dados Patrimônio (PJ)</h3>
                          <div className="ig-muted">Em construção…</div>
                        </div>
                        <div className="ig-muted">Na sequência montamos a versão PJ.</div>
                      </>
                    )
                  ) : (
                    <>
                      <div className="cp-panel-head">
                        <h3>{SECTIONS.find((s) => s.key === active)?.label}</h3>
                        <div className="ig-muted">Em construção…</div>
                      </div>
                      <div className="ig-muted">Vamos montar esse formulário na sequência.</div>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </ClienteLayout>
  );
}

/* FORM PF (autofill CEP)*/
function PFForm({ pf, setPfField, inputsDisabled }) {
  const isCasado = pf.estadoCivil === "CASADO";

  const lastCepRef = useRef("");
  const abortRef = useRef(null);

  useEffect(() => {
    const cepDigits = onlyDigits(pf.cep);
    if (inputsDisabled) return;
    if (cepDigits.length !== 8) return;
    if (lastCepRef.current === cepDigits) return;

    lastCepRef.current = cepDigits;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const data = await fetchAddressByCep(cepDigits, controller.signal);
        if (!data) return;

        setPfField("endereco", data.logradouro || "");
        setPfField("bairro", data.bairro || "");
        setPfField("cidade", data.localidade || "");
        setPfField("estado", data.uf || "");

        if (!String(pf.complemento || "").trim() && data.complemento) {
          setPfField("complemento", data.complemento);
        }
      } catch (e) {
        // silencioso
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.cep, inputsDisabled]);

  return (
    <>
      <div className="cp-panel-head">
        <h3>Cadastro - Pessoa Física</h3>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Titular</div>

        <div className="cp-grid">
          <Field label="Nome Completo">
            <input value={pf.nome} onChange={(e) => setPfField("nome", e.target.value)} disabled={inputsDisabled} />
          </Field>

          <Field label="Data de Nascimento">
            <input
              type="date"
              value={pf.dataNascimento}
              onChange={(e) => setPfField("dataNascimento", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Nacionalidade">
            <input
              value={pf.nacionalidade}
              onChange={(e) => setPfField("nacionalidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Naturalidade">
            <input
              value={pf.naturalidade}
              onChange={(e) => setPfField("naturalidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Estado civil">
            <select
              value={pf.estadoCivil}
              onChange={(e) => {
                const v = e.target.value;
                setPfField("estadoCivil", v);
                if (v !== "CASADO") setPfField("regimeCasamento", "");
              }}
              disabled={inputsDisabled}
            >
              {ESTADO_CIVIL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          {isCasado && (
            <Field label="Regime de casamento">
              <select
                value={pf.regimeCasamento}
                onChange={(e) => setPfField("regimeCasamento", e.target.value)}
                disabled={inputsDisabled}
              >
                {REGIME_CASAMENTO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Profissão">
            <input
              value={pf.profissao}
              onChange={(e) => setPfField("profissao", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CPF">
            <input
              value={pf.cpf}
              onChange={(e) => setPfField("cpf", maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="RG">
            <input
              value={pf.rg}
              onChange={(e) => setPfField("rg", maskRG(e.target.value))}
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="Órgão Emissor">
            <input
              value={pf.orgaoEmissor}
              onChange={(e) => setPfField("orgaoEmissor", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Emissão">
            <input
              type="date"
              value={pf.dataEmissao}
              onChange={(e) => setPfField("dataEmissao", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Telefone Residencial">
            <input
              value={pf.telRes}
              onChange={(e) => setPfField("telRes", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 0000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="Telefone Comercial">
            <input
              value={pf.telComercial}
              onChange={(e) => setPfField("telComercial", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 0000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="Telefone Celular">
            <input
              value={pf.celular}
              onChange={(e) => setPfField("celular", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="E-mail">
            <input value={pf.email} onChange={(e) => setPfField("email", e.target.value)} disabled={inputsDisabled} />
          </Field>
        </div>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Endereço</div>

        <div className="cp-grid">
          <Field label="Endereço">
            <input
              value={pf.endereco}
              onChange={(e) => setPfField("endereco", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Nº">
            <input value={pf.numero} onChange={(e) => setPfField("numero", e.target.value)} disabled={inputsDisabled} />
          </Field>

          <Field label="Bairro">
            <input value={pf.bairro} onChange={(e) => setPfField("bairro", e.target.value)} disabled={inputsDisabled} />
          </Field>

          <Field label="Cidade">
            <input value={pf.cidade} onChange={(e) => setPfField("cidade", e.target.value)} disabled={inputsDisabled} />
          </Field>

          <Field label="Estado">
            <input value={pf.estado} onChange={(e) => setPfField("estado", e.target.value)} disabled={inputsDisabled} />
          </Field>

          <Field label="CEP">
            <input
              value={pf.cep}
              onChange={(e) => setPfField("cep", maskCEP(e.target.value))}
              placeholder="00000-000"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <div className="cp-span2">
            <Field label="Complemento">
              <input
                value={pf.complemento}
                onChange={(e) => setPfField("complemento", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Cônjuge</div>

        <div className="cp-grid">
          <Field label="Nome Completo">
            <input
              value={pf.conjugeNome}
              onChange={(e) => setPfField("conjugeNome", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Data de Nascimento">
            <input
              type="date"
              value={pf.conjugeDataNascimento}
              onChange={(e) => setPfField("conjugeDataNascimento", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Nacionalidade">
            <input
              value={pf.conjugeNacionalidade}
              onChange={(e) => setPfField("conjugeNacionalidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Naturalidade">
            <input
              value={pf.conjugeNaturalidade}
              onChange={(e) => setPfField("conjugeNaturalidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Profissão">
            <input
              value={pf.conjugeProfissao}
              onChange={(e) => setPfField("conjugeProfissao", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CPF">
            <input
              value={pf.conjugeCpf}
              onChange={(e) => setPfField("conjugeCpf", maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="RG">
            <input
              value={pf.conjugeRg}
              onChange={(e) => setPfField("conjugeRg", maskRG(e.target.value))}
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="Órgão Emissor">
            <input
              value={pf.conjugeOrgaoEmissor}
              onChange={(e) => setPfField("conjugeOrgaoEmissor", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Emissão">
            <input
              type="date"
              value={pf.conjugeDataEmissao}
              onChange={(e) => setPfField("conjugeDataEmissao", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Telefone Comercial">
            <input
              value={pf.conjugeComercial}
              onChange={(e) => setPfField("conjugeComercial", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 0000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="Telefone Celular">
            <input
              value={pf.conjugeCelular}
              onChange={(e) => setPfField("conjugeCelular", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="E-mail">
            <input
              value={pf.conjugeEmail}
              onChange={(e) => setPfField("conjugeEmail", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>
        </div>
      </div>
    </>
  );
}

/* FORM PF - DADOS PROFISSIONAIS (conforme imagem) */
function PFProfissionaisForm({ pf, setPfField, inputsDisabled }) {
  const outrosTitular = pf.profOutrosRendimentos === "SIM";
  const conjugeRemunerado = pf.profConjugeAtividadeRemunerada === "SIM";
  const outrosConjuge = pf.conjugeProfOutrosRendimentos === "SIM";
  const YESNO = yesNoOptions();

  useEffect(() => {
    if (pf.profOutrosRendimentos === "NAO") {
      if (pf.profOutrosValor) setPfField("profOutrosValor", "");
      if (pf.profOutrosProveniente) setPfField("profOutrosProveniente", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.profOutrosRendimentos]);

  useEffect(() => {
    if (pf.profConjugeAtividadeRemunerada === "NAO") {
      setPfField("conjugeProfEmpresa", "");
      setPfField("conjugeProfEndereco", "");
      setPfField("conjugeProfCidade", "");
      setPfField("conjugeProfEstado", "");
      setPfField("conjugeProfTelefone", "");
      setPfField("conjugeProfDataAdmissao", "");
      setPfField("conjugeProfCargo", "");
      setPfField("conjugeProfSalario", "");
      setPfField("conjugeProfOutrosRendimentos", "");
      setPfField("conjugeProfOutrosValor", "");
      setPfField("conjugeProfOutrosProveniente", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.profConjugeAtividadeRemunerada]);

  useEffect(() => {
    if (pf.conjugeProfOutrosRendimentos === "NAO") {
      if (pf.conjugeProfOutrosValor) setPfField("conjugeProfOutrosValor", "");
      if (pf.conjugeProfOutrosProveniente) setPfField("conjugeProfOutrosProveniente", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.conjugeProfOutrosRendimentos]);

  return (
    <>
      <div className="cp-panel-head">
        <h3>Dados Profissionais - Pessoa Física</h3>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Titular</div>

        <div className="cp-grid">
          <div className="cp-span2">
            <Field label="Empresa onde trabalha">
              <input
                value={pf.profEmpresa}
                onChange={(e) => setPfField("profEmpresa", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>

          <div className="cp-span2">
            <Field label="Endereço">
              <input
                value={pf.profEndereco}
                onChange={(e) => setPfField("profEndereco", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>

          <Field label="Cidade">
            <input
              value={pf.profCidade}
              onChange={(e) => setPfField("profCidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Estado">
            <input
              value={pf.profEstado}
              onChange={(e) => setPfField("profEstado", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Telefone">
            <input
              value={pf.profTelefone}
              onChange={(e) => setPfField("profTelefone", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </Field>

          <Field label="Data admissão">
            <input
              type="date"
              value={pf.profDataAdmissao}
              onChange={(e) => setPfField("profDataAdmissao", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Cargo">
            <input
              value={pf.profCargo}
              onChange={(e) => setPfField("profCargo", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Salário">
            <input
              value={pf.profSalario}
              onChange={(e) => setPfField("profSalario", maskMoneyBR(e.target.value))}
              disabled={inputsDisabled}
              placeholder="0,00"
              inputMode="numeric"
            />
          </Field>

          <Field label="Possui outros rendimentos?">
            <select
              value={pf.profOutrosRendimentos}
              onChange={(e) => setPfField("profOutrosRendimentos", e.target.value)}
              disabled={inputsDisabled}
            >
              {YESNO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Valor">
            <input
              value={pf.profOutrosValor}
              onChange={(e) => setPfField("profOutrosValor", maskMoneyBR(e.target.value))}
              disabled={inputsDisabled || !outrosTitular}
              placeholder="0,00"
              inputMode="numeric"
            />
          </Field>

          <Field label="Proveniente de">
            <input
              value={pf.profOutrosProveniente}
              onChange={(e) => setPfField("profOutrosProveniente", e.target.value)}
              disabled={inputsDisabled || !outrosTitular}
            />
          </Field>

          <Field label="Cônjuge exerce atividade remunerada?">
            <select
              value={pf.profConjugeAtividadeRemunerada}
              onChange={(e) => setPfField("profConjugeAtividadeRemunerada", e.target.value)}
              disabled={inputsDisabled}
            >
              {YESNO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {conjugeRemunerado && (
        <div className="cp-group">
          <div className="cp-group-title">Cônjuge</div>

          <div className="cp-grid">
            <div className="cp-span2">
              <Field label="Empresa onde trabalha">
                <input
                  value={pf.conjugeProfEmpresa}
                  onChange={(e) => setPfField("conjugeProfEmpresa", e.target.value)}
                  disabled={inputsDisabled}
                />
              </Field>
            </div>

            <div className="cp-span2">
              <Field label="Endereço">
                <input
                  value={pf.conjugeProfEndereco}
                  onChange={(e) => setPfField("conjugeProfEndereco", e.target.value)}
                  disabled={inputsDisabled}
                />
              </Field>
            </div>

            <Field label="Cidade">
              <input
                value={pf.conjugeProfCidade}
                onChange={(e) => setPfField("conjugeProfCidade", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>

            <Field label="Estado">
              <input
                value={pf.conjugeProfEstado}
                onChange={(e) => setPfField("conjugeProfEstado", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>

            <Field label="Telefone">
              <input
                value={pf.conjugeProfTelefone}
                onChange={(e) => setPfField("conjugeProfTelefone", maskPhone(e.target.value))}
                disabled={inputsDisabled}
                placeholder="(00) 00000-0000"
                inputMode="numeric"
              />
            </Field>

            <Field label="Data admissão">
              <input
                type="date"
                value={pf.conjugeProfDataAdmissao}
                onChange={(e) => setPfField("conjugeProfDataAdmissao", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>

            <Field label="Cargo">
              <input
                value={pf.conjugeProfCargo}
                onChange={(e) => setPfField("conjugeProfCargo", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>

            <Field label="Salário">
              <input
                value={pf.conjugeProfSalario}
                onChange={(e) => setPfField("conjugeProfSalario", maskMoneyBR(e.target.value))}
                disabled={inputsDisabled}
                placeholder="0,00"
                inputMode="numeric"
              />
            </Field>

            <Field label="Possui outros rendimentos?">
              <select
                value={pf.conjugeProfOutrosRendimentos}
                onChange={(e) => setPfField("conjugeProfOutrosRendimentos", e.target.value)}
                disabled={inputsDisabled}
              >
                {YESNO.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Valor">
              <input
                value={pf.conjugeProfOutrosValor}
                onChange={(e) => setPfField("conjugeProfOutrosValor", maskMoneyBR(e.target.value))}
                disabled={inputsDisabled || !outrosConjuge}
                placeholder="0,00"
                inputMode="numeric"
              />
            </Field>

            <Field label="Proveniente de">
              <input
                value={pf.conjugeProfOutrosProveniente}
                onChange={(e) => setPfField("conjugeProfOutrosProveniente", e.target.value)}
                disabled={inputsDisabled || !outrosConjuge}
              />
            </Field>
          </div>
        </div>
      )}
    </>
  );
}

/* FORM PF - DADOS PATRIMÔNIO (Tipo = SELECT + autofill CEP) */
function PFPatrimonioForm({ pf, setPfField, inputsDisabled }) {
  const lastCepRef = useRef("");
  const abortRef = useRef(null);

  useEffect(() => {
    const cepDigits = onlyDigits(pf.patCep);
    if (inputsDisabled) return;
    if (cepDigits.length !== 8) return;
    if (lastCepRef.current === cepDigits) return;

    lastCepRef.current = cepDigits;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const data = await fetchAddressByCep(cepDigits, controller.signal);
        if (!data) return;

        // Preenche automaticamente endereço (mesma lógica do PJ)
        setPfField("patEndereco", data.logradouro || "");
        setPfField("patBairro", data.bairro || "");
        setPfField("patCidade", data.localidade || "");
        setPfField("patEstado", data.uf || "");

        if (!String(pf.patComplemento || "").trim() && data.complemento) {
          setPfField("patComplemento", data.complemento);
        }
      } catch (e) {
        // silencioso
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pf.patCep, inputsDisabled]);

  return (
    <>
      <div className="cp-panel-head">
        <h3>Dados Patrimoniais para Garantia</h3>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Imóvel</div>

        <div className="cp-grid">
          <Field label="Tipo">
            <select
              value={pf.patTipoImovel || ""}
              onChange={(e) => setPfField("patTipoImovel", e.target.value)}
              disabled={inputsDisabled}
            >
              <option value="" disabled>
                Selecione...
              </option>
              {TIPOS_IMOVEIS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Matrícula do RGI">
            <input
              value={pf.patMatriculaRGI}
              onChange={(e) => setPfField("patMatriculaRGI", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Matrícula do IPTU">
            <input
              value={pf.patMatriculaIPTU}
              onChange={(e) => setPfField("patMatriculaIPTU", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <div className="cp-span2">
            <Field label="Cartório de Registro nº">
              <input
                value={pf.patCartorioRegistroNumero}
                onChange={(e) =>
                  setPfField("patCartorioRegistroNumero", e.target.value)
                }
                disabled={inputsDisabled}
              />
            </Field>
          </div>

          <Field label="Livro">
            <input
              value={pf.patLivro}
              onChange={(e) => setPfField("patLivro", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Folha">
            <input
              value={pf.patFolha}
              onChange={(e) => setPfField("patFolha", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <div className="cp-span2">
            <Field label="Endereço">
              <input
                value={pf.patEndereco}
                onChange={(e) => setPfField("patEndereco", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>

          <Field label="Nº">
            <input
              value={pf.patNumero}
              onChange={(e) => setPfField("patNumero", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Bairro">
            <input
              value={pf.patBairro}
              onChange={(e) => setPfField("patBairro", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Cidade">
            <input
              value={pf.patCidade}
              onChange={(e) => setPfField("patCidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Estado">
            <input
              value={pf.patEstado}
              onChange={(e) => setPfField("patEstado", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CEP">
            <input
              value={pf.patCep}
              onChange={(e) => setPfField("patCep", maskCEP(e.target.value))}
              placeholder="00000-000"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <div className="cp-span2">
            <Field label="Complemento">
              <input
                value={pf.patComplemento}
                onChange={(e) => setPfField("patComplemento", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>
        </div>
      </div>
    </>
  );
}

/* FORM PJ (autofill CEP) */
function PJForm({ pj, setPjField, inputsDisabled }) {
  const lastCepRef = useRef("");
  const abortRef = useRef(null);

  useEffect(() => {
    const cepDigits = onlyDigits(pj.cep);
    if (inputsDisabled) return;
    if (cepDigits.length !== 8) return;
    if (lastCepRef.current === cepDigits) return;

    lastCepRef.current = cepDigits;

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const data = await fetchAddressByCep(cepDigits, controller.signal);
        if (!data) return;

        setPjField("endereco", data.logradouro || "");
        setPjField("bairro", data.bairro || "");
        setPjField("cidade", data.localidade || "");
        setPjField("estado", data.uf || "");

        if (!String(pj.complemento || "").trim() && data.complemento) {
          setPjField("complemento", data.complemento);
        }
      } catch (e) {
        // silencioso
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pj.cep, inputsDisabled]);

  return (
    <>
      <div className="cp-panel-head">
        <h3>Cadastro - Pessoa Jurídica</h3>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Empresa</div>

        <div className="cp-grid">
          <Field label="Razão Social">
            <input
              value={pj.razaoSocial}
              onChange={(e) => setPjField("razaoSocial", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Nome Fantasia">
            <input
              value={pj.nomeFantasia}
              onChange={(e) => setPjField("nomeFantasia", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CNPJ">
            <input
              value={pj.cnpj}
              onChange={(e) => setPjField("cnpj", maskCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="Inscrição Estadual">
            <input
              value={pj.inscricaoEstadual}
              onChange={(e) =>
                setPjField("inscricaoEstadual", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Inscrição Municipal">
            <input
              value={pj.inscricaoMunicipal}
              onChange={(e) =>
                setPjField("inscricaoMunicipal", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Data de Constituição">
            <input
              type="date"
              value={pj.dataConstituicao}
              onChange={(e) =>
                setPjField("dataConstituicao", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <div className="cp-span2">
            <Field label="Atividade Principal">
              <input
                value={pj.atividadePrincipal}
                onChange={(e) =>
                  setPjField("atividadePrincipal", e.target.value)
                }
                disabled={inputsDisabled}
              />
            </Field>
          </div>

          <Field label="E-mail da Empresa">
            <input
              value={pj.email}
              onChange={(e) => setPjField("email", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Telefone da Empresa">
            <input
              value={pj.telefone}
              onChange={(e) => setPjField("telefone", maskPhone(e.target.value))}
              disabled={inputsDisabled}
              placeholder="(00) 0000-0000"
              inputMode="numeric"
            />
          </Field>
        </div>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Endereço da Empresa</div>

        <div className="cp-grid">
          <Field label="Endereço">
            <input
              value={pj.endereco}
              onChange={(e) => setPjField("endereco", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Nº">
            <input
              value={pj.numero}
              onChange={(e) => setPjField("numero", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Bairro">
            <input
              value={pj.bairro}
              onChange={(e) => setPjField("bairro", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Cidade">
            <input
              value={pj.cidade}
              onChange={(e) => setPjField("cidade", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Estado">
            <input
              value={pj.estado}
              onChange={(e) => setPjField("estado", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CEP">
            <input
              value={pj.cep}
              onChange={(e) => setPjField("cep", maskCEP(e.target.value))}
              placeholder="00000-000"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <div className="cp-span2">
            <Field label="Complemento">
              <input
                value={pj.complemento}
                onChange={(e) => setPjField("complemento", e.target.value)}
                disabled={inputsDisabled}
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="cp-group">
        <div className="cp-group-title">Representante Legal</div>

        <div className="cp-grid">
          <Field label="Nome">
            <input
              value={pj.repNome}
              onChange={(e) => setPjField("repNome", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Cargo/Função">
            <input
              value={pj.repCargo}
              onChange={(e) => setPjField("repCargo", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="CPF">
            <input
              value={pj.repCpf}
              onChange={(e) => setPjField("repCpf", maskCPF(e.target.value))}
              placeholder="000.000.000-00"
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="RG">
            <input
              value={pj.repRg}
              onChange={(e) => setPjField("repRg", maskRG(e.target.value))}
              disabled={inputsDisabled}
              inputMode="numeric"
            />
          </Field>

          <Field label="Órgão Emissor">
            <input
              value={pj.repOrgaoEmissor}
              onChange={(e) =>
                setPjField("repOrgaoEmissor", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Emissão">
            <input
              type="date"
              value={pj.repDataEmissao}
              onChange={(e) =>
                setPjField("repDataEmissao", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Data de Nascimento">
            <input
              type="date"
              value={pj.repDataNascimento}
              onChange={(e) =>
                setPjField("repDataNascimento", e.target.value)
              }
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="E-mail">
            <input
              value={pj.repEmail}
              onChange={(e) => setPjField("repEmail", e.target.value)}
              disabled={inputsDisabled}
            />
          </Field>

          <Field label="Celular">
            <input
              value={pj.repCelular}
              onChange={(e) =>
                setPjField("repCelular", maskPhone(e.target.value))
              }
              disabled={inputsDisabled}
              placeholder="(00) 00000-0000"
              inputMode="numeric"
            />
          </Field>
        </div>
      </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div className="cp-field">
      <label className="cp-label">{label}</label>
      {children}
    </div>
  );
}

function EtapaHeader({ title, proposalId, status, leftSlot, rightSlot }) {
  return (
    <div className="ig-card" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 150, display: "flex", alignItems: "center" }}>
          {leftSlot}
        </div>

        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.1 }}>
            {title}
          </div>
          <div className="ig-muted" style={{ marginTop: 6 }}>
            {proposalId ? (
              <>
                Proposta: <b>{proposalId}</b> • Status: <b>{status}</b>
              </>
            ) : (
              <>
                Status: <b>{status}</b>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            minWidth: 360,
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {rightSlot}
        </div>
      </div>
    </div>
  );
}

export { PFPatrimonioForm, PJForm, Field, EtapaHeader };