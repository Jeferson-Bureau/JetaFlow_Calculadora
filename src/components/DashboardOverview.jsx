import React, { useMemo } from 'react';
import {
  LayoutDashboard,
  Award,
  Users,
  Truck,
  Printer,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  Clock,
  Building,
  CheckCircle2,
  AlertCircle,
  FileText,
  Activity,
  ChevronRight,
  ShieldCheck,
  Percent,
  PieChart as PieIcon,
  BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

export default function DashboardOverview({
  biddings = [],
  clients = [],
  suppliers = [],
  papers = [],
  equipments = [],
  financialConfig = {},
  digitalClickRates = {},
  setActiveTab
}) {
  // ── 1. Estatísticas de Licitações ──
  const biddingStats = useMemo(() => {
    const total = biddings.length;
    const agendadas = biddings.filter(b => b.status === 'agendada');
    const homologadas = biddings.filter(b => b.status === 'homologada' || b.status === 'vencida');
    const emAnalise = biddings.filter(b => b.status === 'em_analise' || b.status === 'proposta_enviada');

    const totalValueAll = biddings.reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0);
    const totalValueAgendadas = agendadas.reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0);
    const totalValueHomologadas = homologadas.reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0);
    const totalValueEmAnalise = emAnalise.reduce((acc, b) => acc + (Number(b.totalValue) || 0), 0);

    // Próximas licitações ordenadas por data da sessão
    const proximas = [...agendadas].sort((a, b) => {
      const da = new Date(`${a.sessionDate || '9999-12-31'}T${a.sessionTime || '00:00'}`);
      const db = new Date(`${b.sessionDate || '9999-12-31'}T${b.sessionTime || '00:00'}`);
      return da - db;
    }).slice(0, 4);

    // Dados formatados para o gráfico de pizza de licitações
    const pieData = [
      { name: 'Agendadas (Disputa)', value: totalValueAgendadas, count: agendadas.length, color: '#8b5cf6' },
      { name: 'Homologadas/Vencidas', value: totalValueHomologadas, count: homologadas.length, color: '#10b981' },
      { name: 'Em Análise/Proposta', value: totalValueEmAnalise, count: emAnalise.length, color: '#00a8e8' }
    ].filter(item => item.value > 0 || item.count > 0);

    return {
      total,
      agendadasCount: agendadas.length,
      homologadasCount: homologadas.length,
      emAnaliseCount: emAnalise.length,
      totalValueAll,
      totalValueAgendadas,
      totalValueHomologadas,
      totalValueEmAnalise,
      proximas,
      pieData
    };
  }, [biddings]);

  // ── 2. Estatísticas do CRM de Clientes ──
  const clientStats = useMemo(() => {
    const total = clients.length;
    const cnpjCount = clients.filter(c => c.docType === 'cnpj' || (c.doc && c.doc.length > 14)).length;
    const cpfCount = total - cnpjCount;
    const maringaCount = clients.filter(c => (c.city || '').toLowerCase().includes('maringá') || (c.city || '').toLowerCase().includes('maringa')).length;
    const regiaoCount = total - maringaCount;

    // Dados para gráfico de barras comparativo de Clientes
    const barData = [
      { category: 'Tipo de Documento', PJ: cnpjCount, PF: cpfCount },
      { category: 'Localização', Maringá: maringaCount, Região: regiaoCount }
    ];

    return {
      total,
      cnpjCount,
      cpfCount,
      maringaCount,
      regiaoCount,
      barData,
      recentes: clients.slice(0, 4)
    };
  }, [clients]);

  // ── 3. Estatísticas de Fornecedores ──
  const supplierStats = useMemo(() => {
    const total = suppliers.length;
    const papeisCount = suppliers.filter(s => s.category === 'papeis').length;
    const acabamentoCount = suppliers.filter(s => s.category === 'acabamento').length;
    const comunicacaoCount = suppliers.filter(s => s.category === 'comunicacao_visual').length;
    const outrosCount = total - (papeisCount + acabamentoCount + comunicacaoCount);

    const categoryData = [
      { name: 'Papéis & Mídias', Qtd: papeisCount, fill: '#f7b500' },
      { name: 'Acabamentos', Qtd: acabamentoCount, fill: '#00a8e8' },
      { name: 'Comunicação Visual', Qtd: comunicacaoCount, fill: '#e62e6b' },
      { name: 'Serviços/Outros', Qtd: outrosCount, fill: '#8b5cf6' }
    ];

    return {
      total,
      papeisCount,
      acabamentoCount,
      comunicacaoCount,
      outrosCount,
      categoryData
    };
  }, [suppliers]);

  // ── 4. Parque Gráfico & Configurações ──
  const xeroxEquip = equipments.find(e => e.id === 'xerox-c8035') || equipments[0];
  const canonEquip = equipments.find(e => e.id === 'canon-gx7010');

  // Dados para comparação do Parque de Impressão (Custo de Clique A4)
  const equipmentComparisonData = useMemo(() => [
    {
      nome: 'Xerox C8035 (Laser)',
      ColorA4: Number(xeroxEquip?.clickColor || 0.305),
      PBA4: Number(xeroxEquip?.clickMono || 0.072)
    },
    {
      nome: 'Canon GX7010 (MegaTank)',
      ColorA4: 0.040,
      PBA4: 0.020
    }
  ], [xeroxEquip]);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Banner de Boas-Vindas / Hero do Dashboard */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(23, 53, 91, 0.85) 0%, rgba(13, 21, 37, 0.95) 100%)',
        border: '1px solid rgba(0, 168, 232, 0.3)',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(0, 168, 232, 0.2)', padding: '6px', borderRadius: '8px' }}>
              <LayoutDashboard size={22} color="var(--brand-cyan)" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Painel de Controle Geral — JetaFlow
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, maxWidth: '650px' }}>
            Visão consolidada do parque gráfico, pipeline de compras públicas (PNCP), carteira de clientes ativos e precificação industrial de alta precisão.
          </p>
        </div>

        {/* Status Operacional Rápido */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 8px var(--success)' }} />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Custo Xerox C8035</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ffffff' }}>R$ {xeroxEquip?.clickColor?.toFixed(3) || '0.305'} / A4</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 168, 232, 0.1)',
            border: '1px solid rgba(0, 168, 232, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Activity size={16} color="var(--brand-cyan)" />
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Margem Desejada</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--brand-cyan)' }}>{financialConfig.desiredProfitPercent || 30}% Líquida</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de KPIs Principais */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* KPI 1: Licitações em Disputa / Agendadas */}
        <div className="glass-card" style={{ padding: '20px', cursor: 'pointer', transition: 'transform 0.2s ease' }} onClick={() => setActiveTab('biddings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>
                Licitações Agendadas
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {biddingStats.agendadasCount}
              </div>
            </div>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
              <Award size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <span>Valor em disputa:</span>
            <strong style={{ color: '#a78bfa' }}>{formatCurrency(biddingStats.totalValueAgendadas)}</strong>
          </div>
        </div>

        {/* KPI 2: Total Licitações no Pipeline */}
        <div className="glass-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('biddings')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
                Pipeline Total Licitações
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {formatCurrency(biddingStats.totalValueAll)}
              </div>
            </div>
            <div style={{ background: 'rgba(0, 168, 232, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--brand-cyan)' }}>
              <DollarSign size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <span>Contratos cadastrados:</span>
            <strong style={{ color: 'var(--brand-cyan)' }}>{biddingStats.total} processos</strong>
          </div>
        </div>

        {/* KPI 3: Clientes Cadastrados (CRM) */}
        <div className="glass-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('clients')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase' }}>
                Clientes Ativos (CRM)
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {clientStats.total}
              </div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--success)' }}>
              <Users size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <span>{clientStats.cnpjCount} Pessoas Jurídicas</span>
            <strong style={{ color: 'var(--success)' }}>{clientStats.maringaCount} em Maringá</strong>
          </div>
        </div>

        {/* KPI 4: Fornecedores & Catálogo de Papéis */}
        <div className="glass-card" style={{ padding: '20px', cursor: 'pointer' }} onClick={() => setActiveTab('suppliers')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--brand-yellow)', textTransform: 'uppercase' }}>
                Rede de Fornecedores
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                {supplierStats.total}
              </div>
            </div>
            <div style={{ background: 'rgba(247, 181, 0, 0.15)', padding: '10px', borderRadius: '12px', color: 'var(--brand-yellow)' }}>
              <Truck size={22} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
            <span>{supplierStats.papeisCount} Papelarias / {supplierStats.acabamentoCount} Acabamentos</span>
            <strong style={{ color: 'var(--brand-yellow)' }}>{papers.length} papéis ativos</strong>
          </div>
        </div>

      </div>

      {/* ── SEÇÃO DE GRÁFICOS ANALÍTICOS (NOVO) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Gráfico 1: Pipeline de Licitações por Estágio (Rosca/Pie) */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieIcon size={18} color="#8b5cf6" />
              Volume Financeiro por Estágio (PNCP)
            </h3>
          </div>
          <div style={{ height: '230px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={biddingStats.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {biddingStats.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Valor Total']}
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda customizada */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '10px', fontSize: '0.75rem' }}>
            {biddingStats.pieData.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                <span style={{ color: 'var(--text-muted)' }}>{item.name}:</span>
                <strong style={{ color: '#fff' }}>{formatCurrency(item.value)} ({item.count})</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico 2: Comparativo Custo de Impressão por Máquina (Bar) */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--brand-cyan)" />
              Comparativo de Custos de Impressão (A4)
            </h3>
          </div>
          <div style={{ height: '230px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equipmentComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="nome" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(val) => `R$ ${val}`} />
                <Tooltip
                  formatter={(val) => [`R$ ${Number(val).toFixed(3)}`, 'Custo por Folha']}
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '0.8rem' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '8px' }} />
                <Bar dataKey="ColorA4" name="Color (R$/A4)" fill="#00a8e8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="PBA4" name="P&B (R$/A4)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bloco Duplo: Próximas Sessões de Licitação & Status das Máquinas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Lado Esquerdo: Agenda de Licitações Críticas */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} color="#8b5cf6" />
              Próximas Sessões de Licitação (Disputa)
            </h3>
            <button
              onClick={() => setActiveTab('biddings')}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#a78bfa',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Ver Todas ({biddingStats.total}) <ChevronRight size={14} />
            </button>
          </div>

          {biddingStats.proximas.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Nenhuma licitação com sessão pendente agendada no momento.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {biddingStats.proximas.map((lic) => {
                const isUrgent = lic.sessionDate === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={lic.id}
                    style={{
                      background: isUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      border: isUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          background: '#8b5cf6',
                          color: '#ffffff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {lic.biddingNumber || lic.code}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          UASG: {lic.uasg || 'S/N'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lic.agency}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lic.objectDescription}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#a78bfa' }}>
                        {formatCurrency(lic.totalValue)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: isUrgent ? 'var(--danger)' : 'var(--brand-yellow)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                        <Clock size={12} />
                        {lic.sessionDate ? lic.sessionDate.split('-').reverse().join('/') : '--/--/----'} {lic.sessionTime || '09:00'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Lado Direito: Parque de Máquinas & Tarifas de Produção */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Printer size={18} color="var(--brand-cyan)" />
              Capacidade do Parque Gráfico & Custos Ativos
            </h3>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-cyan)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Configurar <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Equipamento 1: Xerox AltaLink C8035 */}
            <div style={{ background: 'rgba(0, 168, 232, 0.05)', border: '1px solid rgba(0, 168, 232, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Xerox AltaLink C8035</strong>
                <span style={{ fontSize: '0.7rem', background: 'rgba(0, 168, 232, 0.2)', color: 'var(--brand-cyan)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Laser Digital A3 / SRA3
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.75rem', marginTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Color A4:</span><br />
                  <strong style={{ color: 'var(--brand-cyan)' }}>R$ {xeroxEquip?.clickColor?.toFixed(3) || '0.305'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PB A4:</span><br />
                  <strong style={{ color: '#ffffff' }}>R$ {xeroxEquip?.clickMono?.toFixed(3) || '0.072'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>SRA3 (2,3x):</span><br />
                  <strong style={{ color: 'var(--brand-yellow)' }}>R$ {((xeroxEquip?.clickColor || 0.305) * 2.3).toFixed(3)}</strong>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Suporta papéis até 256g/m² | Velocidade: 35 ppm
              </div>
            </div>

            {/* Equipamento 2: Canon MAXIFY GX7010 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>Canon MAXIFY GX7010</strong>
                <span style={{ fontSize: '0.7rem', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  MegaTank Jato de Tinta
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.75rem', marginTop: '6px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Color A4:</span><br />
                  <strong style={{ color: 'var(--brand-cyan)' }}>R$ 0,040</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>PB A4:</span><br />
                  <strong style={{ color: '#ffffff' }}>R$ 0,020</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Formato:</span><br />
                  <strong style={{ color: 'var(--text-muted)' }}>Até A4 / Ofício</strong>
                </div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Custo ultrabaixo de tinta contínua (GI-16) | Até 220g/m²
              </div>
            </div>

            {/* Equipamento 3: BannerCut Pro 60cm */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.9rem', color: '#ffffff' }}>BannerCut Pro 60cm</strong>
                <span style={{ fontSize: '0.7rem', background: 'rgba(230, 46, 107, 0.15)', color: 'var(--brand-magenta)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                  Plotter Recorte Digital
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Câmera CCD para leitura de marcas de registro, meio-corte de adesivos e corte total de caixas/tags até 300g/m².
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Acesso Rápido às Rotinas da Gráfica */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Atalhos de Trabalho Rápido
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          
          <button
            onClick={() => setActiveTab('digital')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(0, 168, 232, 0.3)',
              background: 'linear-gradient(135deg, rgba(0, 168, 232, 0.1), rgba(0, 119, 182, 0.1))',
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-cyan)' }}>
              <Printer size={16} /> Novo Orçamento Digital
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Calcular cartões, folders, panfletos e livros na Xerox C8035
            </span>
          </button>

          <button
            onClick={() => setActiveTab('biddings')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(109, 40, 217, 0.1))',
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#a78bfa' }}>
              <Award size={16} /> Importar do PNCP
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Consultar edital por número e UASG automaticamente
            </span>
          </button>

          <button
            onClick={() => setActiveTab('offset')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(230, 46, 107, 0.3)',
              background: 'linear-gradient(135deg, rgba(230, 46, 107, 0.1), rgba(184, 27, 79, 0.1))',
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--brand-magenta)' }}>
              <Layers size={16} /> Calculadora Off-set
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Grandes tiragens industriais com chapas CTP e giros
            </span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            style={{
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))',
              color: '#ffffff',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--success)' }}>
              <Users size={16} /> Cadastrar Cliente
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Gerenciar dados cadastrais e propostas de clientes
            </span>
          </button>

        </div>
      </div>

    </div>
  );
}
