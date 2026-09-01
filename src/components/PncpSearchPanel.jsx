import React, { useState, useCallback } from 'react';
import {
  Search,
  Loader2,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building,
  Calendar,
  DollarSign,
  MapPin,
  ExternalLink,
  X,
  Filter,
  Landmark,
  RefreshCw,
  Zap
} from 'lucide-react';

import {
  searchByPublication,
  searchOpenProposals,
  filterByKeyword,
  mapPncpToBidding,
  MODALIDADES,
  UF_LIST,
  getDefaultDateRange,
  formatCnpjForDisplay
} from '../services/pncpService';

export default function PncpSearchPanel({ onImportBidding, onClose }) {
  // ── Search Filters ───────────────────────────────────────
  const defaults = getDefaultDateRange(7);
  const [searchType, setSearchType] = useState('publicacao'); // 'publicacao' | 'proposta'
  const [modalidade, setModalidade] = useState(8); // Dispensa
  const [uf, setUf] = useState('SP');
  const [dataInicial, setDataInicial] = useState(defaults.dataInicial);
  const [dataFinal, setDataFinal] = useState(defaults.dataFinal);
  const [keyword, setKeyword] = useState('');

  // ── Results State ────────────────────────────────────────
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [importedIds, setImportedIds] = useState(new Set());

  // ── Search Execution ─────────────────────────────────────
  const executeSearch = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      let response;

      if (searchType === 'proposta') {
        // Propostas em aberto: dataFinal indica até quando procurar
        response = await searchOpenProposals({
          dataFinal,
          modalidade: modalidade || undefined,
          uf: uf || undefined,
          pagina: page,
          tamanhoPagina: 20
        });
      } else {
        // Por publicação: requer modalidade
        if (!modalidade) {
          setError('Selecione uma modalidade para buscar por publicação.');
          setIsLoading(false);
          return;
        }
        response = await searchByPublication({
          dataInicial,
          dataFinal,
          modalidade,
          uf: uf || undefined,
          pagina: page,
          tamanhoPagina: 20
        });
      }

      const items = response.data || [];
      setResults(items);
      setTotalRegistros(response.totalRegistros || 0);
      setTotalPaginas(response.totalPaginas || 0);

      // Apply local keyword filter
      const filtered = filterByKeyword(items, keyword);
      setFilteredResults(filtered);
      setHasSearched(true);
    } catch (err) {
      console.error('PNCP Search Error:', err);
      if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
        setError('A API do PNCP não respondeu a tempo. Tente novamente em alguns instantes.');
      } else {
        setError(`Erro ao consultar o PNCP: ${err.message}`);
      }
      setResults([]);
      setFilteredResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, modalidade, uf, dataInicial, dataFinal, keyword]);

  const handleSearch = (e) => {
    e?.preventDefault();
    executeSearch(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPaginas) {
      executeSearch(newPage);
    }
  };

  // Re-filter when keyword changes (client-side only)
  const handleKeywordChange = (val) => {
    setKeyword(val);
    if (results.length > 0) {
      setFilteredResults(filterByKeyword(results, val));
    }
  };

  const handleImport = (item) => {
    const formData = mapPncpToBidding(item);
    onImportBidding(formData);
    setImportedIds(prev => new Set([...prev, item.numeroControlePNCP]));
  };

  const formatBrlValue = (val) => {
    if (!val && val !== 0) return 'Sigiloso';
    return `R$ ${Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '—';
    const dt = new Date(isoStr);
    return `${dt.toLocaleDateString('pt-BR')} ${dt.toTimeString().substring(0, 5)}h`;
  };

  // ── Quick Period Buttons ─────────────────────────────────
  const setQuickPeriod = (days) => {
    const range = getDefaultDateRange(days);
    setDataInicial(range.dataInicial);
    setDataFinal(range.dataFinal);
  };

  return (
    <div className="glass-card" style={{
      padding: '20px',
      border: '1px solid rgba(6, 182, 212, 0.4)',
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.06), rgba(15, 23, 42, 0.9))'
    }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '10px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
            <Landmark size={22} color="#06b6d4" />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Buscar Licitações no PNCP
              <span style={{
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.65rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                API PÚBLICA
              </span>
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
              Portal Nacional de Contratações Públicas — Dados abertos do Governo Federal
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>

        {/* Row 1: Search Type + Modalidade + UF */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '10px' }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Tipo de Busca</label>
            <select
              className="form-select"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="publicacao">📅 Por Data de Publicação</option>
              <option value="proposta">📬 Propostas em Aberto</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Modalidade</label>
            <select
              className="form-select"
              value={modalidade}
              onChange={(e) => setModalidade(Number(e.target.value))}
            >
              {MODALIDADES.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Estado (UF)</label>
            <select
              className="form-select"
              value={uf}
              onChange={(e) => setUf(e.target.value)}
            >
              {UF_LIST.map(u => (
                <option key={u.sigla} value={u.sigla}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Period + Keyword + Search Button */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.5fr auto', gap: '10px', alignItems: 'end' }}>

          {searchType === 'publicacao' ? (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Data Inicial</label>
                <input
                  type="date"
                  className="form-input"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Data Final</label>
                <input
                  type="date"
                  className="form-input"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Encerramento até</label>
                <input
                  type="date"
                  className="form-input"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'end', paddingBottom: '2px' }}>
                {[7, 15, 30].map(d => (
                  <button key={d} type="button" onClick={() => setQuickPeriod(d)} style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    {d}d
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Palavra-chave (filtro local)</label>
            <div style={{ position: 'relative' }}>
              <Filter size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Ex: impressão, gráfico, cartilha..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: isLoading
                ? 'rgba(6, 182, 212, 0.3)'
                : 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: isLoading ? 'none' : '0 4px 15px rgba(6, 182, 212, 0.3)',
              whiteSpace: 'nowrap',
              height: '42px'
            }}
          >
            {isLoading ? (
              <><Loader2 size={16} className="spin" /> Buscando...</>
            ) : (
              <><Search size={16} /> Buscar no PNCP</>
            )}
          </button>
        </div>

        {/* Quick Period Buttons (only for publicação) */}
        {searchType === 'publicacao' && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Período rápido:</span>
            {[
              { label: 'Últimos 3 dias', days: 3 },
              { label: 'Última semana', days: 7 },
              { label: 'Últimos 15 dias', days: 15 },
              { label: 'Último mês', days: 30 }
            ].map(p => (
              <button key={p.days} type="button" onClick={() => setQuickPeriod(p.days)} style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-input)',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}>
                {p.label}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Error State */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          marginBottom: '14px'
        }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600, flex: 1 }}>{error}</span>
          <button
            onClick={() => executeSearch(currentPage)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={14} /> Tentar novamente
          </button>
        </div>
      )}

      {/* Results Summary Bar */}
      {hasSearched && !error && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          marginBottom: '14px'
        }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {filteredResults.length === results.length ? (
              <span>Encontradas <strong style={{ color: '#06b6d4' }}>{totalRegistros.toLocaleString('pt-BR')}</strong> contratações — Exibindo página <strong style={{ color: '#ffffff' }}>{currentPage}</strong> de {totalPaginas.toLocaleString('pt-BR')}</span>
            ) : (
              <span><strong style={{ color: '#06b6d4' }}>{filteredResults.length}</strong> resultados filtrados de {results.length} nesta página (total: {totalRegistros.toLocaleString('pt-BR')})</span>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPaginas > 1 && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: currentPage <= 1 ? 'transparent' : 'var(--bg-input)',
                  color: currentPage <= 1 ? 'var(--border-color)' : 'var(--text-muted)',
                  cursor: currentPage <= 1 ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, padding: '0 6px' }}>
                {currentPage} / {totalPaginas.toLocaleString('pt-BR')}
              </span>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPaginas || isLoading}
                style={{
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: currentPage >= totalPaginas ? 'transparent' : 'var(--bg-input)',
                  color: currentPage >= totalPaginas ? 'var(--border-color)' : 'var(--text-muted)',
                  cursor: currentPage >= totalPaginas ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          padding: '40px 20px',
          color: 'var(--text-muted)'
        }}>
          <Loader2 size={32} className="spin" color="#06b6d4" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Consultando o Portal Nacional de Contratações Públicas...</span>
        </div>
      )}

      {/* Empty State */}
      {hasSearched && !isLoading && !error && filteredResults.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '30px 20px',
          color: 'var(--text-muted)'
        }}>
          <Search size={40} style={{ opacity: 0.3, marginBottom: '10px' }} />
          <h4 style={{ fontSize: '1rem', color: '#ffffff', margin: '0 0 6px 0' }}>
            Nenhuma contratação encontrada
          </h4>
          <p style={{ fontSize: '0.82rem', margin: 0 }}>
            {keyword
              ? `Nenhum resultado para "${keyword}" nos dados desta página. Tente alterar a palavra-chave ou os filtros.`
              : 'Tente alterar o período, a modalidade ou o estado para encontrar resultados.'
            }
          </p>
        </div>
      )}

      {/* Results Grid */}
      {!isLoading && filteredResults.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredResults.map((item, idx) => {
            const ctrlId = item.numeroControlePNCP || `${idx}`;
            const isImported = importedIds.has(ctrlId);
            const cnpjRaw = item.orgaoEntidade?.cnpj || '';
            const pncpUrl = cnpjRaw && item.anoCompra && item.sequencialCompra
              ? `https://pncp.gov.br/app/editais/${cnpjRaw}/${item.anoCompra}/${item.sequencialCompra}`
              : '';

            return (
              <div
                key={ctrlId}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: isImported ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-color)',
                  background: isImported
                    ? 'rgba(16, 185, 129, 0.06)'
                    : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        padding: '2px 7px',
                        borderRadius: '5px',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        background: 'rgba(6, 182, 212, 0.15)',
                        color: '#06b6d4',
                        border: '1px solid rgba(6, 182, 212, 0.3)'
                      }}>
                        {item.modalidadeNome || 'Modalidade N/A'}
                      </span>

                      {item.situacaoCompraNome && (
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.12)',
                          color: 'var(--success)',
                          border: '1px solid rgba(16, 185, 129, 0.25)'
                        }}>
                          {item.situacaoCompraNome}
                        </span>
                      )}

                      {item.unidadeOrgao?.ufSigla && (
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(247, 181, 0, 0.12)',
                          color: 'var(--brand-yellow)',
                          border: '1px solid rgba(247, 181, 0, 0.25)'
                        }}>
                          <MapPin size={10} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                          {item.unidadeOrgao.municipioNome}/{item.unidadeOrgao.ufSigla}
                        </span>
                      )}

                      {isImported && (
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: 'var(--success)',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          ✓ Importado
                        </span>
                      )}
                    </div>

                    {/* Agency Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Building size={14} color="var(--brand-cyan)" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                        {item.orgaoEntidade?.razaoSocial || 'Órgão não identificado'}
                      </span>
                    </div>

                    {/* CNPJ */}
                    {cnpjRaw && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', paddingLeft: '20px', marginBottom: '6px' }}>
                        CNPJ: {formatCnpjForDisplay(cnpjRaw)} | Nº Compra: {item.numeroCompra || 'N/A'}/{item.anoCompra}
                      </div>
                    )}
                  </div>

                  {/* Import Button */}
                  <button
                    onClick={() => handleImport(item)}
                    disabled={isImported}
                    title={isImported ? 'Já importado' : 'Importar para cadastro local'}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isImported
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                      color: isImported ? 'var(--success)' : '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.78rem',
                      cursor: isImported ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      boxShadow: isImported ? 'none' : '0 3px 10px rgba(139, 92, 246, 0.3)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {isImported ? (
                      <>✓ Importado</>
                    ) : (
                      <><Zap size={14} /> Importar</>
                    )}
                  </button>
                </div>

                {/* Object Description */}
                <div style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.4',
                  marginBottom: '8px',
                  maxHeight: '52px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  <strong style={{ color: '#ffffff' }}>Objeto:</strong> {item.objetoCompra || 'Sem descrição'}
                </div>

                {/* Bottom Row: Value, Dates, Link */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>

                  {/* Value */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <DollarSign size={14} color="var(--success)" />
                    <span style={{
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: item.valorTotalEstimado ? 'var(--success)' : 'var(--text-muted)'
                    }}>
                      {formatBrlValue(item.valorTotalEstimado)}
                    </span>
                  </div>

                  {/* Dates */}
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {item.dataAberturaProposta && (
                      <span>
                        <Calendar size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Abertura: {formatDateTime(item.dataAberturaProposta)}
                      </span>
                    )}
                    {item.dataEncerramentoProposta && (
                      <span style={{ color: 'var(--brand-yellow)', fontWeight: 700 }}>
                        <Calendar size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
                        Encerramento: {formatDateTime(item.dataEncerramentoProposta)}
                      </span>
                    )}
                  </div>

                  {/* PNCP Link */}
                  {pncpUrl && (
                    <a
                      href={pncpUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: '#06b6d4',
                        textDecoration: 'none'
                      }}
                    >
                      <Landmark size={11} /> Ver no PNCP <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Pagination (when many results) */}
      {!isLoading && filteredResults.length > 0 && totalPaginas > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          alignItems: 'center',
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage <= 1 || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: currentPage <= 1 ? 'var(--border-color)' : 'var(--text-muted)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: currentPage <= 1 ? 'default' : 'pointer'
            }}
          >
            Primeira
          </button>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: currentPage <= 1 ? 'var(--border-color)' : 'var(--text-muted)',
              cursor: currentPage <= 1 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ChevronLeft size={16} /> Anterior
          </button>

          <span style={{ fontSize: '0.82rem', color: '#ffffff', fontWeight: 700, padding: '0 10px' }}>
            Página {currentPage} de {totalPaginas.toLocaleString('pt-BR')}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPaginas || isLoading}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-input)',
              color: currentPage >= totalPaginas ? 'var(--border-color)' : 'var(--text-muted)',
              cursor: currentPage >= totalPaginas ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            Próxima <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
