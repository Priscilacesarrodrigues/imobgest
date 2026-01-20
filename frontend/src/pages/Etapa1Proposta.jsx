import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClienteLayout from "../components/ClienteLayout";
import { apiGet, apiPost } from "../services/api";
import "./Etapa1Proposta.css";

function addMonthsISO(dateISO, months) {
  if (!dateISO || !months) return "";
  const [y, m, d] = dateISO.split("-").map(Number);
  if (!y || !m || !d) return "";
  const dt = new Date(y, m - 1, d);
  dt.setMonth(dt.getMonth() + Number(months));
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function moneyToNumber(v) {
  if (v == null) return 0;
  const s = String(v)
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function numberToBRL(n) {
  const value = Number(n || 0);
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const DEFAULT_FORM = {
  tipoLocacao: "RESIDENCIAL",

  locadoraDocs: "",
  locadoraEmails: "",
  locatariaDocs: "",
  locatariaEmails: "",
  fiadoraNome: "",
  fiadoraEmails: "",

  cep: "",
  logradouro: "",
  numero: "",
  bairro: "",
  cidade: "",
  uf: "",
  complemento: "",
  areaTerrenoM2: "",
  areaConstruidaM2: "",

  prazoMeses: "",
  dataInicio: "",
  dataFim: "",

  aluguelMensal: "",
  condominio: "",
  condominioNaoSeAplica: false,
  iptu: "",
  iptuNaoSeAplica: false,
  aguaEsgoto: "",
  aguaNaoSeAplica: false,
  energia: "",
  energiaNaoSeAplica: false,
  internet: "",
  internetNaoSeAplica: false,
  totem: "",
  totemNaoSeAplica: false,

  descontoValor: "",
  descontoMeses: "",
  descontoNaoSeAplica: false,

  carenciaMeses: "",
  carenciaNaoSeAplica: false,

  mesBaseReajuste: "",
  indiceReajuste: "IGP-M da Fundação Getúlio Vargas",
  diaVencimento: "Todo dia 05 de cada mês referente ao uso do mês anterior",

  garantia: "CAUCAO",
  caucaoQtdAlugueis: "3",
  seguradoraNome: "",

  observacoes: "",
};

function garantiaLabel(v) {
  if (v === "CAUCAO") return "Caução";
  if (v === "SEGURO_FIANCA") return "Seguro Fiança";
  if (v === "FIADOR") return "Fiador(a)";
  return "Sem Garantias";
}

/** helpers */
function strToList(s) {
  if (!s) return [""];
  const lines = String(s)
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
  return lines.length ? lines : [""];
}
function listToStr(arr) {
  const lines = (arr || [])
    .map((x) => String(x || "").trim())
    .filter((x) => x.length > 0);
  return lines.join("\n");
}

export default function Etapa1Proposta() {
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [stage, setStage] = useState(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  // listas (1 por linha)
  const [locadoraDocsList, setLocadoraDocsList] = useState([""]);
  const [locadoraEmailsList, setLocadoraEmailsList] = useState([""]);
  const [locatariaDocsList, setLocatariaDocsList] = useState([""]);
  const [locatariaEmailsList, setLocatariaEmailsList] = useState([""]);
  const [fiadoraEmailsList, setFiadoraEmailsList] = useState([""]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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
      const s1 = stages.find((s) => Number(s.n) === 1) || { n: 1, status: "OPEN", data: {} };
      setStage(s1);

      const saved = s1.data || {};
      const merged = { ...DEFAULT_FORM, ...saved };
      setForm(merged);

      setLocadoraDocsList(strToList(merged.locadoraDocs));
      setLocadoraEmailsList(strToList(merged.locadoraEmails));
      setLocatariaDocsList(strToList(merged.locatariaDocs));
      setLocatariaEmailsList(strToList(merged.locatariaEmails));
      setFiadoraEmailsList(strToList(merged.fiadoraEmails));
    } catch (err) {
      setError(err.message || "Erro ao carregar proposta");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // data fim automática
  useEffect(() => {
    const fim = addMonthsISO(form.dataInicio, form.prazoMeses);
    setForm((prev) => ({ ...prev, dataFim: fim }));
  }, [form.dataInicio, form.prazoMeses]);

  // sincroniza listas -> strings
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      locadoraDocs: listToStr(locadoraDocsList),
      locadoraEmails: listToStr(locadoraEmailsList),
      locatariaDocs: listToStr(locatariaDocsList),
      locatariaEmails: listToStr(locatariaEmailsList),
      fiadoraEmails: listToStr(fiadoraEmailsList),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locadoraDocsList, locadoraEmailsList, locatariaDocsList, locatariaEmailsList, fiadoraEmailsList]);

  const resumo = useMemo(() => {
    const aluguel = moneyToNumber(form.aluguelMensal);
    const condominio = form.condominioNaoSeAplica ? 0 : moneyToNumber(form.condominio);
    const iptu = form.iptuNaoSeAplica ? 0 : moneyToNumber(form.iptu);
    const agua = form.aguaNaoSeAplica ? 0 : moneyToNumber(form.aguaEsgoto);
    const energia = form.energiaNaoSeAplica ? 0 : moneyToNumber(form.energia);
    const internet = form.internetNaoSeAplica ? 0 : moneyToNumber(form.internet);
    const totem = form.totemNaoSeAplica ? 0 : moneyToNumber(form.totem);

    const totalMensal = aluguel + condominio + iptu + agua + energia + internet + totem;

    return {
      totalMensal,
      enderecoLinha: `${form.logradouro || ""}${form.numero ? ", " + form.numero : ""}${
        form.bairro ? " - " + form.bairro : ""
      }${form.cidade ? " - " + form.cidade : ""}${form.uf ? "/" + form.uf : ""}${
        form.cep ? " - CEP " + form.cep : ""
      }${form.complemento ? " (" + form.complemento + ")" : ""}`.trim(),
      tipoLocacaoLabel:
        form.tipoLocacao === "RESIDENCIAL" ? "Residencial" : "Comercial",
      garantiaLabel: garantiaLabel(form.garantia),
    };
  }, [form]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function statusLabel(status) {
    if (status === "OPEN") return "Em preenchimento";
    if (status === "SUBMITTED") return "Aguardando aprovação";
    if (status === "APPROVED") return "Aprovada";
    if (status === "REJECTED") return "Reprovada";
    return "—";
  }

  function validateBasic() {
    const required = [
      ["locadoraDocs", "Locadora (CPF/CNPJ)"],
      ["locatariaDocs", "Locatária (CPF/CNPJ)"],
      ["cep", "CEP"],
      ["logradouro", "Logradouro"],
      ["numero", "Número"],
      ["cidade", "Cidade"],
      ["uf", "UF"],
      ["prazoMeses", "Prazo (meses)"],
      ["dataInicio", "Data de início"],
      ["aluguelMensal", "Valor do aluguel"],
      ["mesBaseReajuste", "Mês base de reajuste"],
    ];
    for (const [key, label] of required) {
      if (!String(form[key] || "").trim()) return `Preencha: ${label}`;
    }
    return "";
  }

  async function saveStage(nextStatus) {
    if (!proposal) return;

    setError("");
    setInfo("");
    setSaving(true);

    try {
      if (nextStatus === "SUBMITTED") {
        const msg = validateBasic();
        if (msg) {
          setError(msg);
          setSaving(false);
          return;
        }
      }

      const payload = { status: nextStatus, data: form };
      await apiPost(`/proposals/${proposal.id}/stages/1`, payload);

      setInfo(nextStatus === "SUBMITTED" ? "Enviado para aprovação." : "Salvo com sucesso.");
      await load();
    } catch (err) {
      setError(err.message || "Erro ao salvar proposta");
    } finally {
      setSaving(false);
    }
  }

  function updateList(setter, idx, value) {
    setter((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }
  function addLine(setter) {
    setter((prev) => [...prev, ""]);
  }
  function removeLine(setter, idx) {
    setter((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== idx);
    });
  }

  return (
    <ClienteLayout title="Área do Cliente">
      <div className="ig-container">
        <div className="p1-topbar">
          <button className="ig-btn-outline" type="button" onClick={() => navigate("/cliente/etapas")}>
            Voltar
          </button>

          <div className="p1-head">
            <h2 className="p1-title">Etapa 1 — Proposta Comercial de Locação</h2>
            <div className="p1-sub">
              {proposal ? (
                <>
                  Proposta: <b>{proposal.id}</b> • Status: <b>{statusLabel(stage?.status || "OPEN")}</b>
                </>
              ) : (
                <>Nenhuma proposta encontrada.</>
              )}
            </div>
          </div>

          <div className="p1-actions">
            <button
              className="ig-btn-outline"
              type="button"
              onClick={() => saveStage("OPEN")}
              disabled={saving || loading || !proposal}
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>

            <button
              className="ig-btn-primary"
              type="button"
              onClick={() => saveStage("SUBMITTED")}
              disabled={saving || loading || !proposal}
            >
              {saving ? "Enviando..." : "Enviar para Aprovação"}
            </button>
          </div>
        </div>

        {error && <div className="ig-error">{error}</div>}
        {info && <div className="p1-info">{info}</div>}

        {loading ? (
          <div>Carregando...</div>
        ) : !proposal ? (
          <div className="ig-card">
            <div className="ig-muted">
              Você ainda não tem proposta. Volte e clique em <b>Nova Proposta</b>.
            </div>
          </div>
        ) : (
          <div className="p1-surface">
            <div className="p1-form">
              {/* PARTES */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Partes</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-grid">
                    <div>
                      <div className="p1-label">Tipo de Locação (Residencial / Comercial)</div>
                      <select
                        className="p1-select"
                        value={form.tipoLocacao}
                        onChange={(e) => setField("tipoLocacao", e.target.value)}
                      >
                        <option value="RESIDENCIAL">Residencial</option>
                        <option value="COMERCIAL">Comercial</option>
                      </select>
                    </div>

                    <RepeatField
                      label="Locadora (CPF/CNPJ) — um ou mais"
                      placeholder="000.000.000-00"
                      values={locadoraDocsList}
                      onChange={(i, v) => updateList(setLocadoraDocsList, i, v)}
                      onAdd={() => addLine(setLocadoraDocsList)}
                      onRemove={(i) => removeLine(setLocadoraDocsList, i)}
                    />

                    <RepeatField
                      label="E-mails Locadora"
                      placeholder="email@dominio.com"
                      values={locadoraEmailsList}
                      onChange={(i, v) => updateList(setLocadoraEmailsList, i, v)}
                      onAdd={() => addLine(setLocadoraEmailsList)}
                      onRemove={(i) => removeLine(setLocadoraEmailsList, i)}
                    />

                    <RepeatField
                      label="Locatária (CPF/CNPJ) — um ou mais"
                      placeholder="000.000.000-00"
                      values={locatariaDocsList}
                      onChange={(i, v) => updateList(setLocatariaDocsList, i, v)}
                      onAdd={() => addLine(setLocatariaDocsList)}
                      onRemove={(i) => removeLine(setLocatariaDocsList, i)}
                    />

                    <RepeatField
                      label="E-mails Locatária"
                      placeholder="email@dominio.com"
                      values={locatariaEmailsList}
                      onChange={(i, v) => updateList(setLocatariaEmailsList, i, v)}
                      onAdd={() => addLine(setLocatariaEmailsList)}
                      onRemove={(i) => removeLine(setLocatariaEmailsList, i)}
                    />

                    <div>
                      <div className="p1-label">Nome do Fiador(a) (se aplicável)</div>
                      <input
                        className="p1-input"
                        value={form.fiadoraNome}
                        onChange={(e) => setField("fiadoraNome", e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>

                    <RepeatField
                      label="E-mails Fiador(a)"
                      placeholder="email@dominio.com"
                      values={fiadoraEmailsList}
                      onChange={(i, v) => updateList(setFiadoraEmailsList, i, v)}
                      onAdd={() => addLine(setFiadoraEmailsList)}
                      onRemove={(i) => removeLine(setFiadoraEmailsList, i)}
                    />
                  </div>
                </div>
              </section>

              {/* ENDEREÇO */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Endereço do Imóvel</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-label">Endereço do Imóvel Locado (com CEP e complemento)</div>

                  <div className="p1-address-grid">
                    <input className="p1-input" placeholder="CEP" value={form.cep} onChange={(e) => setField("cep", e.target.value)} />
                    <input className="p1-input" placeholder="Logradouro" value={form.logradouro} onChange={(e) => setField("logradouro", e.target.value)} />
                    <input className="p1-input" placeholder="Número" value={form.numero} onChange={(e) => setField("numero", e.target.value)} />
                    <input className="p1-input" placeholder="Bairro" value={form.bairro} onChange={(e) => setField("bairro", e.target.value)} />
                    <input className="p1-input" placeholder="Cidade" value={form.cidade} onChange={(e) => setField("cidade", e.target.value)} />
                    <input className="p1-input" placeholder="UF" value={form.uf} onChange={(e) => setField("uf", e.target.value)} />
                    <input className="p1-input" placeholder="Complemento" value={form.complemento} onChange={(e) => setField("complemento", e.target.value)} />
                  </div>

                  <div className="p1-note">
                    Prévia: <b>{resumo.enderecoLinha || "—"}</b>
                  </div>
                </div>
              </section>

              {/* METRAGEM */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Metragem</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-grid">
                    <div>
                      <div className="p1-label">Área do Terreno (m²)</div>
                      <input className="p1-input" value={form.areaTerrenoM2} onChange={(e) => setField("areaTerrenoM2", e.target.value)} placeholder="Ex: 250" />
                    </div>
                    <div>
                      <div className="p1-label">Área Construída (m²)</div>
                      <input className="p1-input" value={form.areaConstruidaM2} onChange={(e) => setField("areaConstruidaM2", e.target.value)} placeholder="Ex: 180" />
                    </div>
                  </div>
                </div>
              </section>

              {/* DATAS */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Prazo e Datas</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-grid">
                    <div>
                      <div className="p1-label">Prazo (meses)</div>
                      <input className="p1-input" value={form.prazoMeses} onChange={(e) => setField("prazoMeses", e.target.value)} placeholder="Ex: 30" />
                    </div>
                    <div>
                      <div className="p1-label">Data de Início</div>
                      <input className="p1-input" type="date" value={form.dataInicio} onChange={(e) => setField("dataInicio", e.target.value)} />
                    </div>
                    <div>
                      <div className="p1-label">Data de Fim (calculada)</div>
                      <input className="p1-input" type="date" value={form.dataFim} disabled />
                    </div>
                  </div>
                </div>
              </section>

              {/* VALORES (mantive simples por enquanto) */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Custo mensal</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-grid">
                    <div>
                      <div className="p1-label">Aluguel</div>
                      <input className="p1-input" value={form.aluguelMensal} onChange={(e) => setField("aluguelMensal", e.target.value)} placeholder="Ex: 2.500,00" />
                    </div>

                    <MoneyField label="Condomínio" value={form.condominio} setValue={(v) => setField("condominio", v)} na={form.condominioNaoSeAplica} setNa={(v) => setField("condominioNaoSeAplica", v)} />
                    <MoneyField label="IPTU" value={form.iptu} setValue={(v) => setField("iptu", v)} na={form.iptuNaoSeAplica} setNa={(v) => setField("iptuNaoSeAplica", v)} />
                    <MoneyField label="Água/Esgoto" value={form.aguaEsgoto} setValue={(v) => setField("aguaEsgoto", v)} na={form.aguaNaoSeAplica} setNa={(v) => setField("aguaNaoSeAplica", v)} />
                    <MoneyField label="Energia" value={form.energia} setValue={(v) => setField("energia", v)} na={form.energiaNaoSeAplica} setNa={(v) => setField("energiaNaoSeAplica", v)} />
                    <MoneyField label="Internet" value={form.internet} setValue={(v) => setField("internet", v)} na={form.internetNaoSeAplica} setNa={(v) => setField("internetNaoSeAplica", v)} />
                    <MoneyField label="Totem" value={form.totem} setValue={(v) => setField("totem", v)} na={form.totemNaoSeAplica} setNa={(v) => setField("totemNaoSeAplica", v)} />
                  </div>

                  <div className="p1-note" style={{ marginTop: 10 }}>
                    <b>Total mensal estimado:</b> {numberToBRL(resumo.totalMensal)}
                  </div>
                </div>
              </section>

              {/* OBS */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Observações</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-label">Observações</div>
                  <textarea
                    className="p1-textarea"
                    rows={6}
                    value={form.observacoes}
                    onChange={(e) => setField("observacoes", e.target.value)}
                    placeholder="Digite observações..."
                  />
                </div>
              </section>

              {/* RESUMO */}
              <section className="p1-section">
                <div className="p1-section-head">
                  <h3 className="p1-section-title">Resumo</h3>
                </div>

                <div className="p1-section-body">
                  <div className="p1-summary">
                    <div><b>Tipo:</b> {resumo.tipoLocacaoLabel}</div>
                    <div><b>Endereço:</b> {resumo.enderecoLinha || "—"}</div>
                    <div><b>Prazo:</b> {form.prazoMeses || "—"} meses</div>
                    <div><b>Início:</b> {form.dataInicio || "—"}</div>
                    <div><b>Fim:</b> {form.dataFim || "—"}</div>
                    <div><b>Garantia:</b> {resumo.garantiaLabel}</div>
                    <div><b>Total:</b> {numberToBRL(resumo.totalMensal)}</div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        )}
      </div>
    </ClienteLayout>
  );
}

function RepeatField({ label, placeholder, values, onChange, onAdd, onRemove }) {
  return (
    <div>
      <div className="p1-label">{label}</div>
      <div className="p1-repeat">
        {values.map((v, idx) => (
          <div key={idx} className="p1-repeat-row">
            <input
              className="p1-input"
              value={v}
              onChange={(e) => onChange(idx, e.target.value)}
              placeholder={placeholder}
            />
            {values.length > 1 && (
              <button type="button" className="p1-remove" onClick={() => onRemove(idx)} title="Remover">
                ×
              </button>
            )}
          </div>
        ))}
        <button type="button" className="p1-addline" onClick={onAdd}>
          + Adicionar
        </button>
      </div>
    </div>
  );
}

function MoneyField({ label, value, setValue, na, setNa }) {
  return (
    <div>
      <div className="p1-label">{label}</div>
      <div className="p1-inline">
        <input className="p1-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ex: 350,00" disabled={na} />
        <label className="p1-check">
          <input type="checkbox" checked={na} onChange={(e) => setNa(e.target.checked)} />
          Não se aplica
        </label>
      </div>
    </div>
  );
}
