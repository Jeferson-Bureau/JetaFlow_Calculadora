import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Wallet, Plus, Search, Edit, Trash2, X, Check, CheckCircle, AlertCircle, XCircle,
  ArrowDownCircle, ArrowUpCircle, Undo2, FileText, Award, Calendar, TrendingUp, Landmark
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import {
  RECEIVABLE_CATEGORIES, PAYABLE_CATEGORIES, PAYMENT_METHODS, PAYMENT_PRESETS,
  categoryLabel, generateNextFinanceCode, roundCents, todayStr, addDays, monthKey,
  formatDateBR, formatMonthBR, formatBRL, entryStatus, buildInstallments,
  summarize, cashFlowByMonth, pendingBillables, compareEntries
} from '../utils/finance';

const STATUS_STYLE = {
  aberto: { label: 'Em aberto', color: 'var(--brand-cyan)', bg: 'rgba(0, 168, 232, 0.12)', border: 'rgba(0, 168, 232, 0.35)' },
  vencido: { label: 'Vencido', color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)' },
  pago: { label: 'Pago', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)' },
  cancelado: { label: 'Cancelado', color: 'var(--text-muted)', bg: 'var(--tint-subtle)', border: 'var(--border-color)' }
};

const TYPE_STYLE = {
  receber: { label: 'A receber', color: 'var(--success)', Icon: ArrowDownCircle },
  pagar: { label: 'A pagar', color: 'var(--danger)', Icon: ArrowUpCircle }
};

const PLAN_OPTIONS = [
  { id: 'avista', label: 'À vista / parcela única' },
  { id: 'sinal_entrega', label: PAYMENT_PRESETS.sinal_entrega.label },
  { id: 'parcelado', label: 'Parcelado (N vezes)' },
  { id: 'mensal', label: 'Repetir todo mês (conta fixa)' }
];

const emptyForm = (type = 'receber') => ({
  type,
  description: '',
  category: type === 'pagar' ? 'papel' : 'venda',
  partyId: '',
  partyName: '',
  amount: '',
  firstDue: todayStr(),
  plan: 'avista',
  count: 3,
  intervalDays: 30,
  paymentMethod: 'PIX',
  notes: '',
  alreadyPaid: false,
  origin: null
});

const chipStyle = (active, color = 'var(--brand-cyan)') => ({
  padding: '8px 12px',
  borderRadius: '8px',
  border: active ? `1px solid ${color}` : '1px solid var(--border-color)',
  background: active ? 'var(--tint-subtle)' : 'var(--bg-input)',
  color: active ? 'var(--text-strong)' : 'var(--text-muted)',
  fontWeight: active ? 700 : 600,
  fontSize: '0.8rem',
  cursor: 'pointer'
});

const iconBtn = (color = 'var(--text-muted)') => ({
  background: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  color,
  cursor: 'pointer',
  borderRadius: '8px',
  minWidth: '36px',
  minHeight: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
});

function Kpi({ label, value, hint, color, tint }) {
  return (
    <div style={{ background: tint || 'var(--tint-hairline)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: color || 'var(--text-muted)', textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: color || 'var(--text-strong)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
      {hint && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{hint}</div>}
    </div>
  );
}

export default function FinanceManager({
  entries = [],
  setEntries,
  settings = { openingBalance: 0 },
  setSettings,
  quotes = [],
  biddings = [],
  clients = [],
  suppliers = [],
  setActiveTab
}) {
  const today = todayStr();
  const [view, setView] = useState('lancamentos'); // 'lancamentos' | 'fluxo'
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('pendentes');
  const [monthFilter, setMonthFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(null);           // novo lançamento
  const [editing, setEditing] = useState(null);     // edição de um lançamento existente
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceDraft, setBalanceDraft] = useState('');

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const showToast = useCallback((message, type = 'success') => {
    clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), type === 'error' ? 7000 : 4000);
  }, []);
  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  // Esc fecha o modal aberto (o ConfirmDialog trata o próprio Esc).
  useEffect(() => {
    if (!form && !editing) return undefined;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || deleteTarget) return;
      setForm(null);
      setEditing(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [form, editing, deleteTarget]);

  const openingBalance = Number(settings.openingBalance) || 0;
  const summary = useMemo(() => summarize(entries, { today, openingBalance }), [entries, today, openingBalance]);
  const billables = useMemo(() => pendingBillables(quotes, biddings, entries), [quotes, biddings, entries]);
  const flow = useMemo(() => cashFlowByMonth(entries, { today, months: 6, openingBalance }), [entries, today, openingBalance]);

  const monthOptions = useMemo(() => {
    const set = new Set(entries.map(e => monthKey(e.paidDate || e.dueDate)).filter(Boolean));
    return [...set].sort().reverse();
  }, [entries]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries
      .filter(e => {
        const st = entryStatus(e, today);
        if (typeFilter !== 'all' && e.type !== typeFilter) return false;
        if (statusFilter === 'pendentes' && !(st === 'aberto' || st === 'vencido')) return false;
        if (statusFilter === 'vencido' && st !== 'vencido') return false;
        if (statusFilter === 'pago' && st !== 'pago') return false;
        if (statusFilter === 'cancelado' && st !== 'cancelado') return false;
        if (monthFilter !== 'all' && monthKey(e.paidDate || e.dueDate) !== monthFilter) return false;
        if (!q) return true;
        return [e.code, e.description, e.partyName, e.origin?.code, categoryLabel(e.type, e.category), e.notes]
          .some(v => String(v || '').toLowerCase().includes(q));
      })
      .sort(compareEntries);
  }, [entries, typeFilter, statusFilter, monthFilter, search, today]);

  const visibleTotals = useMemo(() => visible.reduce((acc, e) => {
    if (entryStatus(e, today) === 'cancelado') return acc;
    if (e.type === 'receber') acc.in += Number(e.amount) || 0; else acc.out += Number(e.amount) || 0;
    return acc;
  }, { in: 0, out: 0 }), [visible, today]);

  // Despesas pagas no mês por categoria (mini-DRE do mês corrente).
  const monthExpenses = useMemo(() => {
    const m = monthKey(today);
    const map = {};
    for (const e of entries) {
      if (e.type !== 'pagar' || !e.paidDate || e.canceled || monthKey(e.paidDate) !== m) continue;
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    }
    return Object.entries(map).map(([cat, v]) => ({ cat, label: categoryLabel('pagar', cat), value: roundCents(v) }))
      .sort((a, b) => b.value - a.value);
  }, [entries, today]);

  // ── Ações ─────────────────────────────────────────────────────────────────

  const partyList = (type) => (type === 'pagar' ? suppliers : clients);
  const partyDisplay = (p) => p?.tradeName || p?.name || '';

  const openNew = (type) => setForm(emptyForm(type));

  const openFromBillable = (b) => {
    setForm({
      ...emptyForm('receber'),
      description: b.kind === 'quote' ? `${b.code} — ${b.description}` : `${b.code} — ${b.description}`,
      category: b.category,
      partyId: b.clientId || '',
      partyName: b.partyName,
      amount: b.amount || '',
      plan: b.kind === 'quote' ? 'sinal_entrega' : 'avista',
      intervalDays: b.kind === 'quote' ? 7 : 30,
      firstDue: b.kind === 'quote' ? today : addDays(today, 30),
      paymentMethod: b.kind === 'bidding' ? 'Empenho / Nota de Empenho' : 'PIX',
      origin: { kind: b.kind, id: b.id, code: b.code }
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    const amount = roundCents(String(form.amount).replace(',', '.'));
    if (!form.description.trim()) { showToast('Informe a descrição.', 'warning'); return; }
    if (!(amount > 0)) { showToast('Informe um valor maior que zero.', 'warning'); return; }
    if (!form.firstDue) { showToast('Informe o vencimento.', 'warning'); return; }

    const count = Math.min(60, Math.max(1, Number(form.count) || 1));
    // Conta fixa mensal repete o MESMO valor; nos demais planos o valor é o total a dividir.
    const parts = form.plan === 'mensal'
      ? buildInstallments({ total: amount * count, count, firstDue: form.firstDue, monthly: true })
      : buildInstallments({
          total: amount,
          count: form.plan === 'parcelado' ? count : 1,
          percents: PAYMENT_PRESETS[form.plan]?.percents || null,
          firstDue: form.firstDue,
          intervalDays: Number(form.intervalDays) || 30
        });

    const party = partyList(form.type).find(p => p.id === form.partyId);
    const groupId = parts.length > 1 ? `grp-${Date.now()}` : null;
    const created = [];
    let pool = [...entries];

    parts.forEach((p) => {
      const code = generateNextFinanceCode(pool);
      const entry = {
        id: `fin-${Date.now()}-${p.installment}`,
        code,
        type: form.type,
        description: form.description.trim(),
        category: form.category,
        amount: p.amount,
        dueDate: p.dueDate,
        paidDate: form.alreadyPaid && parts.length === 1 ? form.firstDue : null,
        clientId: form.type === 'receber' ? form.partyId || '' : '',
        supplierId: form.type === 'pagar' ? form.partyId || '' : '',
        partyName: party ? partyDisplay(party) : form.partyName.trim(),
        origin: form.origin,
        groupId,
        installment: parts.length > 1 ? p.installment : null,
        installments: parts.length > 1 ? p.installments : null,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim(),
        createdAt: today
      };
      created.push(entry);
      pool = [...pool, entry];
    });

    setEntries(prev => [...created, ...prev]);
    setForm(null);
    showToast(created.length > 1
      ? `${created.length} lançamentos criados (${created[0].code} a ${created[created.length - 1].code})`
      : `Lançamento ${created[0].code} criado`);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const amount = roundCents(String(editing.amount).replace(',', '.'));
    if (!(amount > 0)) { showToast('Informe um valor maior que zero.', 'warning'); return; }
    const party = partyList(editing.type).find(p => p.id === editing.partyId);
    const updated = {
      ...editing,
      amount,
      clientId: editing.type === 'receber' ? editing.partyId || '' : '',
      supplierId: editing.type === 'pagar' ? editing.partyId || '' : '',
      partyName: party ? partyDisplay(party) : (editing.partyName || '').trim(),
      paidDate: editing.paidDate || null
    };
    delete updated.partyId;
    setEntries(prev => prev.map(x => (x.id === updated.id ? updated : x)));
    setEditing(null);
    showToast(`Lançamento ${updated.code} atualizado`);
  };

  const togglePaid = (entry) => {
    const paid = !entry.paidDate;
    setEntries(prev => prev.map(x => (x.id === entry.id ? { ...x, paidDate: paid ? today : null } : x)));
    showToast(paid
      ? `${entry.code} ${entry.type === 'receber' ? 'recebido' : 'pago'} em ${formatDateBR(today)}`
      : `Baixa de ${entry.code} estornada`, paid ? 'success' : 'warning');
  };

  const saveBalance = () => {
    setSettings({ ...settings, openingBalance: roundCents(String(balanceDraft).replace(',', '.')) });
    setEditingBalance(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const primaryBtn = (bg, fg = 'var(--on-accent)') => ({
    padding: '12px 18px',
    borderRadius: '10px',
    border: 'none',
    background: bg,
    color: fg,
    fontWeight: 800,
    fontSize: '0.9rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Cabeçalho */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <Wallet size={28} color="var(--success)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-strong)' }}>Financeiro</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Contas a receber e a pagar, cobranças de orçamentos aprovados e licitações ganhas, e fluxo de caixa.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => openNew('receber')} style={primaryBtn('linear-gradient(135deg, #10b981, #059669)')}>
            <Plus size={16} /> Conta a Receber
          </button>
          <button type="button" onClick={() => openNew('pagar')} style={primaryBtn('linear-gradient(135deg, #ef4444, #dc2626)')}>
            <Plus size={16} /> Conta a Pagar
          </button>
        </div>
      </div>

      {/* Indicadores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
        <div style={{ background: 'var(--tint-hairline)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Saldo em caixa
            {!editingBalance && (
              <button type="button" onClick={() => { setBalanceDraft(String(openingBalance)); setEditingBalance(true); }}
                title="Definir o saldo inicial de caixa (antes dos lançamentos)"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}>
                <Edit size={13} />
              </button>
            )}
          </div>
          {editingBalance ? (
            <form onSubmit={(e) => { e.preventDefault(); saveBalance(); }} style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
              <label htmlFor="fin-opening-balance" className="sr-only">Saldo inicial de caixa</label>
              <input id="fin-opening-balance" className="form-input" type="number" step="0.01" autoFocus value={balanceDraft}
                onChange={(e) => setBalanceDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setEditingBalance(false); }}
                style={{ padding: '6px 8px', fontSize: '0.85rem' }} />
              <button type="submit" aria-label="Salvar saldo inicial" style={iconBtn('var(--success)')}><Check size={16} /></button>
            </form>
          ) : (
            <>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: summary.cashBalance < 0 ? 'var(--danger)' : 'var(--text-strong)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                {formatBRL(summary.cashBalance)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Saldo inicial {formatBRL(openingBalance)} + baixas</div>
            </>
          )}
        </div>
        <Kpi label="A receber" value={formatBRL(summary.receivableOpen)} color="var(--success)" tint="rgba(16, 185, 129, 0.06)"
          hint={summary.receivableOverdueCount ? `${summary.receivableOverdueCount} vencido(s): ${formatBRL(summary.receivableOverdue)}` : `Próx. 7 dias: ${formatBRL(summary.dueNext7Receivable)}`} />
        <Kpi label="A pagar" value={formatBRL(summary.payableOpen)} color="var(--danger)" tint="rgba(239, 68, 68, 0.05)"
          hint={summary.payableOverdueCount ? `${summary.payableOverdueCount} vencido(s): ${formatBRL(summary.payableOverdue)}` : `Próx. 7 dias: ${formatBRL(summary.dueNext7Payable)}`} />
        <Kpi label={`Resultado de ${formatMonthBR(monthKey(today))}`} value={formatBRL(summary.resultMonth)}
          color={summary.resultMonth < 0 ? 'var(--danger)' : 'var(--brand-cyan)'} tint="rgba(0, 168, 232, 0.06)"
          hint={`Recebido ${formatBRL(summary.receivedMonth)} · Pago ${formatBRL(summary.paidMonth)}`} />
      </div>

      {/* A faturar: orçamentos aprovados e licitações ganhas sem cobrança */}
      {billables.length > 0 && (
        <div className="glass-card" style={{ padding: '16px 18px', border: '1px solid rgba(247, 181, 0, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <AlertCircle size={18} color="var(--brand-yellow)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-strong)' }}>
              A faturar ({billables.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              — vendas fechadas que ainda não viraram conta a receber
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {billables.map(b => (
              <div key={`${b.kind}:${b.id}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '10px 12px', borderRadius: '10px', background: 'var(--tint-hairline)', border: '1px solid var(--border-color)' }}>
                {b.kind === 'quote' ? <FileText size={16} color="var(--brand-cyan)" /> : <Award size={16} color="#8b5cf6" />}
                <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: '0.88rem' }}>
                    {b.code} · {b.partyName}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {b.kind === 'quote' ? 'Orçamento aprovado' : 'Licitação vencedora/homologada'} — {b.description}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-strong)', fontVariantNumeric: 'tabular-nums' }}>{formatBRL(b.amount)}</div>
                <button type="button" onClick={() => openFromBillable(b)} style={{ ...primaryBtn('linear-gradient(135deg, var(--brand-yellow), #d99b00)', '#000'), padding: '8px 14px', fontSize: '0.82rem' }}>
                  <Plus size={14} /> Lançar cobrança
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternador de visão */}
      <div style={{ display: 'flex', gap: '8px', background: 'var(--tint-hairline)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)', alignSelf: 'flex-start' }} role="tablist">
        {[['lancamentos', 'Lançamentos', FileText], ['fluxo', 'Fluxo de caixa', TrendingUp]].map(([key, label, Icon]) => (
          <button key={key} type="button" role="tab" aria-selected={view === key} onClick={() => setView(key)}
            style={{
              padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '6px',
              background: view === key ? 'var(--brand-cyan)' : 'transparent',
              color: view === key ? 'var(--on-accent)' : 'var(--text-muted)'
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {view === 'lancamentos' ? (
        <>
          {/* Filtros */}
          <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <label htmlFor="fin-search" className="sr-only">Buscar lançamentos</label>
                <input id="fin-search" type="text" className="form-input" style={{ paddingLeft: '38px' }}
                  placeholder="Buscar por código (FIN-A0001), descrição, cliente/fornecedor, ORC/LIC..."
                  value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <label htmlFor="fin-month" className="sr-only">Mês</label>
              <select id="fin-month" className="form-select" style={{ width: 'auto', minWidth: '160px' }} value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
                <option value="all">Todos os meses</option>
                {monthOptions.map(m => <option key={m} value={m}>{formatMonthBR(m)}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[['all', 'Tudo'], ['receber', 'A receber'], ['pagar', 'A pagar']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setTypeFilter(k)} style={chipStyle(typeFilter === k, k === 'pagar' ? 'var(--danger)' : k === 'receber' ? 'var(--success)' : 'var(--brand-cyan)')}>{l}</button>
              ))}
              <span style={{ width: 1, height: 22, background: 'var(--border-color)', margin: '0 4px' }} />
              {[['pendentes', 'Em aberto'], ['vencido', 'Vencidos'], ['pago', 'Pagos'], ['cancelado', 'Cancelados'], ['all', 'Todos']].map(([k, l]) => (
                <button key={k} type="button" onClick={() => setStatusFilter(k)} style={chipStyle(statusFilter === k)}>{l}</button>
              ))}
            </div>
          </div>

          {/* Lista */}
          {visible.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Wallet size={44} style={{ opacity: 0.3, marginBottom: '10px' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-strong)', margin: '0 0 6px 0' }}>
                {entries.length === 0 ? 'Nenhum lançamento ainda' : 'Nada encontrado com esses filtros'}
              </h3>
              <p style={{ fontSize: '0.85rem', margin: 0 }}>
                {entries.length === 0
                  ? 'Lance uma conta a receber ou a pagar, ou fature um orçamento aprovado pelo painel "A faturar".'
                  : 'Troque os filtros ou limpe a busca.'}
              </p>
              {entries.length === 0 && billables.length === 0 && setActiveTab && (
                <button type="button" onClick={() => setActiveTab('quotes')} style={{ ...chipStyle(false), marginTop: '14px' }}>
                  Ver histórico de orçamentos
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '8px 0' }}>
              {visible.map(e => {
                const st = entryStatus(e, today);
                const stStyle = STATUS_STYLE[st];
                const tStyle = TYPE_STYLE[e.type];
                const TypeIcon = tStyle.Icon;
                return (
                  <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 18px', borderBottom: '1px solid var(--border-color)', opacity: st === 'cancelado' ? 0.6 : 1 }}>
                    <TypeIcon size={20} color={tStyle.color} aria-label={tStyle.label} style={{ flexShrink: 0 }} />
                    <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-strong)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {e.description}{e.installments ? ` (${e.installment}/${e.installments})` : ''}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700 }}>{e.code}</span>
                        {e.partyName && <span>· {e.partyName}</span>}
                        <span>· {categoryLabel(e.type, e.category)}</span>
                        {e.origin?.code && <span>· origem {e.origin.code}</span>}
                        {e.paymentMethod && <span>· {e.paymentMethod}</span>}
                      </div>
                    </div>
                    <div style={{ minWidth: '130px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                        <Calendar size={12} /> {st === 'pago' ? `pago em ${formatDateBR(e.paidDate)}` : `vence ${formatDateBR(e.dueDate)}`}
                      </div>
                      <span style={{ display: 'inline-block', marginTop: '3px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800, color: stStyle.color, background: stStyle.bg, border: `1px solid ${stStyle.border}` }}>
                        {stStyle.label}
                      </span>
                    </div>
                    <div style={{ minWidth: '120px', textAlign: 'right', fontWeight: 800, fontSize: '1rem', color: tStyle.color, fontVariantNumeric: 'tabular-nums' }}>
                      {e.type === 'pagar' ? '− ' : '+ '}{formatBRL(e.amount)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {st !== 'cancelado' && (
                        <button type="button" onClick={() => togglePaid(e)} style={iconBtn(e.paidDate ? 'var(--warning)' : 'var(--success)')}
                          title={e.paidDate ? 'Estornar baixa' : (e.type === 'receber' ? 'Marcar como recebido hoje' : 'Marcar como pago hoje')}
                          aria-label={e.paidDate ? 'Estornar baixa' : 'Dar baixa'}>
                          {e.paidDate ? <Undo2 size={16} /> : <Check size={16} />}
                        </button>
                      )}
                      <button type="button" onClick={() => setEditing({ ...e, partyId: e.type === 'pagar' ? e.supplierId || '' : e.clientId || '' })} style={iconBtn()} title="Editar" aria-label="Editar">
                        <Edit size={15} />
                      </button>
                      <button type="button" onClick={() => setDeleteTarget(e)} style={iconBtn('var(--danger)')} title="Excluir" aria-label="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '18px', padding: '12px 18px 6px', fontSize: '0.85rem', fontWeight: 700, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)' }}>{visible.length} lançamento(s)</span>
                <span style={{ color: 'var(--success)' }}>Entradas {formatBRL(visibleTotals.in)}</span>
                <span style={{ color: 'var(--danger)' }}>Saídas {formatBRL(visibleTotals.out)}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Fluxo de caixa */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-start' }}>
          <div className="glass-card" style={{ padding: '18px', flex: '2 1 560px', minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-strong)' }}>Fluxo de caixa — próximos 6 meses</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>
              Pagos contam no mês da baixa; em aberto, no mês do vencimento (vencidos entram no mês atual). O saldo parte do caixa realizado.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 6px' }}>Mês</th>
                    <th style={{ padding: '8px 6px' }}>Entradas</th>
                    <th style={{ padding: '8px 6px' }}>Saídas</th>
                    <th style={{ padding: '8px 6px' }}>Resultado</th>
                    <th style={{ padding: '8px 6px' }}>Saldo previsto</th>
                  </tr>
                </thead>
                <tbody>
                  {flow.map((r, i) => (
                    <tr key={r.month} style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                      <td style={{ textAlign: 'left', padding: '10px 6px', fontWeight: 700, color: 'var(--text-strong)' }}>
                        {formatMonthBR(r.month)}{i === 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}> (atual)</span>}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--success)' }}>
                        {formatBRL(r.inflow)}
                        {i === 0 && r.realizedIn > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatBRL(r.realizedIn)} realizado</div>}
                      </td>
                      <td style={{ padding: '10px 6px', color: 'var(--danger)' }}>
                        {formatBRL(r.outflow)}
                        {i === 0 && r.realizedOut > 0 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatBRL(r.realizedOut)} realizado</div>}
                      </td>
                      <td style={{ padding: '10px 6px', fontWeight: 700, color: r.net < 0 ? 'var(--danger)' : 'var(--text-strong)' }}>{formatBRL(r.net)}</td>
                      <td style={{ padding: '10px 6px', fontWeight: 800, color: r.balance < 0 ? 'var(--danger)' : 'var(--text-strong)' }}>{formatBRL(r.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {flow.some(r => r.balance < 0) && (
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.82rem', color: 'var(--danger)', fontWeight: 700 }}>
                <AlertCircle size={16} /> O saldo previsto fica negativo em {formatMonthBR(flow.find(r => r.balance < 0).month)}.
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '18px', flex: '1 1 300px', minWidth: 0 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-strong)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Landmark size={16} color="var(--brand-cyan)" /> Resultado de {formatMonthBR(monthKey(today))}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Receitas recebidas</span><strong style={{ color: 'var(--success)' }}>{formatBRL(summary.receivedMonth)}</strong></div>
              {monthExpenses.map(x => (
                <div key={x.cat} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', paddingLeft: '10px' }}>
                  <span>− {x.label}</span><span>{formatBRL(x.value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Despesas pagas</span><strong style={{ color: 'var(--danger)' }}>{formatBRL(summary.paidMonth)}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px', marginTop: '4px', fontWeight: 800, fontSize: '0.95rem' }}>
                <span>= Resultado do mês</span>
                <span style={{ color: summary.resultMonth < 0 ? 'var(--danger)' : 'var(--brand-cyan)' }}>{formatBRL(summary.resultMonth)}</span>
              </div>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '12px 0 0 0' }}>
              Regime de caixa: considera só o que já foi recebido ou pago neste mês.
            </p>
          </div>
        </div>
      )}

      {/* Modal: novo lançamento */}
      {form && (
        <Modal title={form.origin ? `Lançar cobrança — ${form.origin.code}` : (form.type === 'pagar' ? 'Nova conta a pagar' : 'Nova conta a receber')}
          accent={form.type === 'pagar' ? 'var(--danger)' : 'var(--success)'} onClose={() => setForm(null)}>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {!form.origin && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {['receber', 'pagar'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, type: t, category: t === 'pagar' ? 'papel' : 'venda', partyId: '', partyName: '' })}
                    style={{ ...chipStyle(form.type === t, TYPE_STYLE[t].color), flex: 1, padding: '10px' }}>
                    {TYPE_STYLE[t].label}
                  </button>
                ))}
              </div>
            )}
            <EntryFields value={form} onChange={setForm} clients={clients} suppliers={suppliers} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fin-plan">Forma de lançamento</label>
                <select id="fin-plan" className="form-select" value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value, alreadyPaid: false })}>
                  {PLAN_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fin-first-due">{form.plan === 'avista' ? 'Vencimento' : '1º vencimento'}</label>
                <input id="fin-first-due" type="date" className="form-input" value={form.firstDue} onChange={(e) => setForm({ ...form, firstDue: e.target.value })} />
              </div>
              {(form.plan === 'parcelado' || form.plan === 'mensal') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="fin-count">{form.plan === 'mensal' ? 'Quantos meses' : 'Nº de parcelas'}</label>
                  <input id="fin-count" type="number" min="1" max="60" className="form-input" value={form.count} onChange={(e) => setForm({ ...form, count: e.target.value })} />
                </div>
              )}
              {(form.plan === 'parcelado' || form.plan === 'sinal_entrega') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="fin-interval">Intervalo entre parcelas (dias)</label>
                  <input id="fin-interval" type="number" min="1" className="form-input" value={form.intervalDays} onChange={(e) => setForm({ ...form, intervalDays: e.target.value })} />
                </div>
              )}
            </div>

            {form.plan === 'avista' && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.alreadyPaid} onChange={(e) => setForm({ ...form, alreadyPaid: e.target.checked })} />
                Já foi {form.type === 'pagar' ? 'pago' : 'recebido'} (baixa na data do vencimento)
              </label>
            )}

            <InstallmentPreview form={form} />

            <ModalActions onCancel={() => setForm(null)} submitLabel="Salvar lançamento" />
          </form>
        </Modal>
      )}

      {/* Modal: editar lançamento */}
      {editing && (
        <Modal title={`Editar ${editing.code}${editing.installments ? ` (${editing.installment}/${editing.installments})` : ''}`}
          accent={editing.type === 'pagar' ? 'var(--danger)' : 'var(--success)'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <EntryFields value={editing} onChange={setEditing} clients={clients} suppliers={suppliers} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="fin-edit-due">Vencimento</label>
                <input id="fin-edit-due" type="date" className="form-input" value={editing.dueDate || ''} onChange={(e) => setEditing({ ...editing, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fin-edit-paid">Data da baixa (vazio = em aberto)</label>
                <input id="fin-edit-paid" type="date" className="form-input" value={editing.paidDate || ''} onChange={(e) => setEditing({ ...editing, paidDate: e.target.value || null })} />
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '12px', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!editing.canceled} onChange={(e) => setEditing({ ...editing, canceled: e.target.checked || undefined })} />
              Cancelado (fica no histórico, fora dos totais)
            </label>
            {editing.origin?.code && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 10px 0' }}>Origem: {editing.origin.code}</p>
            )}
            <ModalActions onCancel={() => setEditing(null)} submitLabel="Salvar alterações" />
          </form>
        </Modal>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir lançamento"
        message={deleteTarget ? `Excluir ${deleteTarget.code} — "${deleteTarget.description}" (${formatBRL(deleteTarget.amount)})? Para manter o histórico, prefira marcar como cancelado.` : ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          setEntries(prev => prev.filter(x => x.id !== deleteTarget.id));
          showToast(`${deleteTarget.code} excluído`, 'warning');
          setDeleteTarget(null);
        }}
      />

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function EntryFields({ value, onChange, clients, suppliers }) {
  const isPay = value.type === 'pagar';
  const parties = isPay ? suppliers : clients;
  const categories = isPay ? PAYABLE_CATEGORIES : RECEIVABLE_CATEGORIES;
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="fin-description">Descrição *</label>
        <input id="fin-description" className="form-input" autoFocus value={value.description}
          placeholder={isPay ? 'Ex.: Resma Couché 150g — NF 1234' : 'Ex.: Panfletos A5 — 5.000 un'}
          onChange={(e) => onChange({ ...value, description: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
        <div className="form-group">
          <label className="form-label" htmlFor="fin-party">{isPay ? 'Fornecedor' : 'Cliente'}</label>
          <select id="fin-party" className="form-select" value={value.partyId || ''} onChange={(e) => onChange({ ...value, partyId: e.target.value })}>
            <option value="">{value.partyName ? `— ${value.partyName} (sem cadastro) —` : '— Sem cadastro —'}</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.code ? `${p.code} · ` : ''}{p.tradeName || p.name}</option>)}
          </select>
        </div>
        {!value.partyId && (
          <div className="form-group">
            <label className="form-label" htmlFor="fin-party-name">Nome (se não tiver cadastro)</label>
            <input id="fin-party-name" className="form-input" value={value.partyName || ''} onChange={(e) => onChange({ ...value, partyName: e.target.value })} />
          </div>
        )}
        <div className="form-group">
          <label className="form-label" htmlFor="fin-category">Categoria</label>
          <select id="fin-category" className="form-select" value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fin-amount">{value.plan === 'mensal' ? 'Valor por mês (R$) *' : value.plan ? 'Valor total (R$) *' : 'Valor (R$) *'}</label>
          <input id="fin-amount" type="number" step="0.01" min="0" className="form-input" value={value.amount} onChange={(e) => onChange({ ...value, amount: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="fin-method">Forma de pagamento</label>
          <select id="fin-method" className="form-select" value={value.paymentMethod || ''} onChange={(e) => onChange({ ...value, paymentMethod: e.target.value })}>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="fin-notes">Observações</label>
        <input id="fin-notes" className="form-input" value={value.notes || ''} placeholder="NF, nº do empenho, conta bancária…" onChange={(e) => onChange({ ...value, notes: e.target.value })} />
      </div>
    </>
  );
}

function InstallmentPreview({ form }) {
  const amount = roundCents(String(form.amount).replace(',', '.'));
  if (!(amount > 0) || !form.firstDue) return null;
  const count = Math.min(60, Math.max(1, Number(form.count) || 1));
  const parts = form.plan === 'mensal'
    ? buildInstallments({ total: amount * count, count, firstDue: form.firstDue, monthly: true })
    : buildInstallments({
        total: amount,
        count: form.plan === 'parcelado' ? count : 1,
        percents: PAYMENT_PRESETS[form.plan]?.percents || null,
        firstDue: form.firstDue,
        intervalDays: Number(form.intervalDays) || 30
      });
  if (parts.length < 2) return null;
  return (
    <div style={{ background: 'var(--tint-hairline)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px', fontSize: '0.8rem' }}>
      <div style={{ fontWeight: 700, color: 'var(--text-strong)', marginBottom: '6px' }}>
        {parts.length} lançamentos · total {formatBRL(parts.reduce((s, p) => s + p.amount, 0))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums', maxHeight: '90px', overflowY: 'auto' }}>
        {parts.map(p => <span key={p.installment}>{p.installment}/{p.installments}: {formatBRL(p.amount)} em {formatDateBR(p.dueDate)}</span>)}
      </div>
    </div>
  );
}

function Modal({ title, accent, onClose, children }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
      <div className="glass-card" role="dialog" aria-modal="true" aria-label={title}
        style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '22px', borderRadius: '16px', border: `1px solid ${accent}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-strong)' }}>{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitLabel }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
      <button type="button" onClick={onCancel} style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-muted)', fontWeight: 600, cursor: 'pointer' }}>
        Cancelar
      </button>
      <button type="submit" style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, var(--brand-cyan), #0077b6)', color: 'var(--on-accent)', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Check size={16} /> {submitLabel}
      </button>
    </div>
  );
}

function Toast({ toast, onClose }) {
  const tone = {
    success: { grad: 'linear-gradient(135deg, #10b981, #059669)', Icon: CheckCircle },
    warning: { grad: 'linear-gradient(135deg, #f59e0b, #d97706)', Icon: AlertCircle },
    error: { grad: 'linear-gradient(135deg, #ef4444, #dc2626)', Icon: XCircle }
  }[toast.type] || {};
  const Icon = tone.Icon || CheckCircle;
  return (
    <div role={toast.type === 'success' ? 'status' : 'alert'} onClick={onClose} title="Clique para fechar"
      style={{ position: 'fixed', bottom: '24px', right: '24px', maxWidth: 'min(480px, calc(100vw - 32px))', background: tone.grad, color: 'var(--on-accent)', padding: '14px 22px', borderRadius: '12px', boxShadow: 'var(--shadow-pop)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 100000, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
      <Icon size={20} style={{ flexShrink: 0 }} />
      <span>{toast.message}</span>
    </div>
  );
}
