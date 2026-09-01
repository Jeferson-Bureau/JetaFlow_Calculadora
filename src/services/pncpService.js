// PNCP API Service — Portal Nacional de Contratações Públicas
// API Pública (sem autenticação) — REST / JSON
// Docs: https://pncp.gov.br/api/consulta/swagger-ui/index.html

const PROXY_PNCP_URL = '/api/pncp';
const DIRECT_PNCP_URL = 'https://pncp.gov.br/api/consulta';

async function fetchFromPncp(endpoint, options = {}) {
  const isBrowser = typeof window !== 'undefined';
  const urls = isBrowser
    ? [`${PROXY_PNCP_URL}${endpoint}`, `${DIRECT_PNCP_URL}${endpoint}`]
    : [`${DIRECT_PNCP_URL}${endpoint}`];

  let lastError;
  for (const url of urls) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// ── Códigos de Modalidade ──────────────────────────────────
export const MODALIDADES = [
  { id: 0,  label: 'Todas as Modalidades' },
  { id: 8,  label: 'Dispensa de Licitação' },
  { id: 6,  label: 'Pregão Eletrônico' },
  { id: 10, label: 'Concorrência' },
  { id: 9,  label: 'Inexigibilidade' },
  { id: 12, label: 'Credenciamento' },
  { id: 7,  label: 'Leilão' }
];

// ── UFs Brasileiras ────────────────────────────────────────
export const UF_LIST = [
  { sigla: '', label: 'Todos os Estados' },
  { sigla: 'AC', label: 'Acre' },
  { sigla: 'AL', label: 'Alagoas' },
  { sigla: 'AM', label: 'Amazonas' },
  { sigla: 'AP', label: 'Amapá' },
  { sigla: 'BA', label: 'Bahia' },
  { sigla: 'CE', label: 'Ceará' },
  { sigla: 'DF', label: 'Distrito Federal' },
  { sigla: 'ES', label: 'Espírito Santo' },
  { sigla: 'GO', label: 'Goiás' },
  { sigla: 'MA', label: 'Maranhão' },
  { sigla: 'MG', label: 'Minas Gerais' },
  { sigla: 'MS', label: 'Mato Grosso do Sul' },
  { sigla: 'MT', label: 'Mato Grosso' },
  { sigla: 'PA', label: 'Pará' },
  { sigla: 'PB', label: 'Paraíba' },
  { sigla: 'PE', label: 'Pernambuco' },
  { sigla: 'PI', label: 'Piauí' },
  { sigla: 'PR', label: 'Paraná' },
  { sigla: 'RJ', label: 'Rio de Janeiro' },
  { sigla: 'RN', label: 'Rio Grande do Norte' },
  { sigla: 'RO', label: 'Rondônia' },
  { sigla: 'RR', label: 'Roraima' },
  { sigla: 'RS', label: 'Rio Grande do Sul' },
  { sigla: 'SC', label: 'Santa Catarina' },
  { sigla: 'SE', label: 'Sergipe' },
  { sigla: 'SP', label: 'São Paulo' },
  { sigla: 'TO', label: 'Tocantins' }
];

// ── Helpers ────────────────────────────────────────────────
function formatDateParam(dateStr) {
  // Input: "2026-09-01" → Output: "20260901"
  return dateStr.replace(/-/g, '');
}

function formatCnpjForDisplay(cnpjRaw) {
  if (!cnpjRaw) return '';
  const c = cnpjRaw.replace(/[^0-9]/g, '');
  if (c.length !== 14) return cnpjRaw;
  return `${c.substring(0, 2)}.${c.substring(2, 5)}.${c.substring(5, 8)}/${c.substring(8, 12)}-${c.substring(12, 14)}`;
}

function getDefaultDateRange(daysBack = 7) {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - daysBack);
  return {
    dataInicial: start.toISOString().split('T')[0],
    dataFinal: end.toISOString().split('T')[0]
  };
}

// ── API Calls ──────────────────────────────────────────────

/**
 * Buscar contratações por data de publicação.
 * @param {Object} filters
 * @param {string} filters.dataInicial - "YYYY-MM-DD"
 * @param {string} filters.dataFinal   - "YYYY-MM-DD"
 * @param {number} filters.modalidade  - Código da modalidade (obrigatório na API)
 * @param {string} [filters.uf]        - Sigla UF
 * @param {string} [filters.cnpj]      - CNPJ do órgão (14 dígitos, sem formatação)
 * @param {number} [filters.pagina]    - Página (1-based)
 * @param {number} [filters.tamanhoPagina] - 10 a 50
 */
export async function searchByPublication(filters = {}) {
  const defaults = getDefaultDateRange(7);
  const params = new URLSearchParams();

  params.set('dataInicial', formatDateParam(filters.dataInicial || defaults.dataInicial));
  params.set('dataFinal', formatDateParam(filters.dataFinal || defaults.dataFinal));
  params.set('codigoModalidadeContratacao', String(filters.modalidade || 8));
  params.set('pagina', String(filters.pagina || 1));
  params.set('tamanhoPagina', String(filters.tamanhoPagina || 20));

  if (filters.uf) params.set('uf', filters.uf);
  if (filters.cnpj) params.set('cnpj', filters.cnpj.replace(/[^0-9]/g, ''));

  const endpoint = `/v1/contratacoes/publicacao?${params.toString()}`;
  const res = await fetchFromPncp(endpoint, { signal: AbortSignal.timeout(15000) });

  if (res.status === 204) return { data: [], totalRegistros: 0, totalPaginas: 0, numeroPagina: 1, empty: true };
  if (!res.ok) throw new Error(`PNCP API Error: ${res.status} ${res.statusText}`);

  return res.json();
}

/**
 * Buscar contratações com propostas em aberto.
 * @param {Object} filters
 * @param {string} filters.dataFinal - "YYYY-MM-DD" (data limite para encerramento de propostas)
 * @param {number} [filters.modalidade]
 * @param {string} [filters.uf]
 * @param {number} [filters.pagina]
 * @param {number} [filters.tamanhoPagina]
 */
export async function searchOpenProposals(filters = {}) {
  const params = new URLSearchParams();

  // Default: propostas abertas nos próximos 30 dias
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  params.set('dataFinal', formatDateParam(filters.dataFinal || futureDate.toISOString().split('T')[0]));
  params.set('pagina', String(filters.pagina || 1));
  params.set('tamanhoPagina', String(filters.tamanhoPagina || 20));

  if (filters.modalidade) params.set('codigoModalidadeContratacao', String(filters.modalidade));
  if (filters.uf) params.set('uf', filters.uf);
  if (filters.cnpj) params.set('cnpj', filters.cnpj.replace(/[^0-9]/g, ''));

  const endpoint = `/v1/contratacoes/proposta?${params.toString()}`;
  const res = await fetchFromPncp(endpoint, { signal: AbortSignal.timeout(15000) });

  if (res.status === 204) return { data: [], totalRegistros: 0, totalPaginas: 0, numeroPagina: 1, empty: true };
  if (!res.ok) throw new Error(`PNCP API Error: ${res.status} ${res.statusText}`);

  return res.json();
}

/**
 * Consultar uma contratação específica por CNPJ + ano + sequencial.
 * @param {string} cnpj - CNPJ do órgão (14 dígitos)
 * @param {number} ano
 * @param {number} sequencial
 */
export async function getContratacao(cnpj, ano, sequencial) {
  const cleanCnpj = cnpj.replace(/[^0-9]/g, '');
  const endpoint = `/v1/orgaos/${cleanCnpj}/compras/${ano}/${sequencial}`;
  const res = await fetchFromPncp(endpoint, { signal: AbortSignal.timeout(15000) });

  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`PNCP API Error: ${res.status} ${res.statusText}`);

  return res.json();
}

import { KNOWN_PNCP_DATABASE } from '../data/initialData.js';

// ── Mapeamento PNCP → formato interno ──────────────────────

/**
 * Converte um DTO da API PNCP para o formato formData do LicitacaoManager.
 * @param {Object} item - RecuperarCompraPublicacaoDTO
 * @returns {Object} formData compatível com o LicitacaoManager
 */
export function mapPncpToBidding(item) {
  const cnpjRaw = item.orgaoEntidade?.cnpj || '';
  const cnpjFormatted = formatCnpjForDisplay(cnpjRaw);

  // Mapear modalidade PNCP → nome interno
  const modalityMap = {
    6: 'Pregão Eletrônico',
    8: 'Dispensa de Licitação',
    9: 'Inexigibilidade',
    10: 'Concorrência Eletrônica',
    12: 'Credenciamento'
  };

  // Montar número da licitação
  const biddingNumber = item.numeroCompra
    ? `${item.modalidadeNome || 'Contratação'} nº ${item.numeroCompra}/${item.anoCompra}`
    : `Contratação PNCP ${item.sequencialCompra}/${item.anoCompra}`;

  // Data e Horário da sessão pública / encerramento da proposta
  let sessionDate = '';
  let sessionTime = '09:00';
  const rawDateStr = item.dataEncerramentoProposta || item.dataAberturaProposta || item.dataPublicacaoPncp || '';
  if (rawDateStr) {
    const isoMatch = String(rawDateStr).match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoMatch) {
      sessionDate = isoMatch[1];
    } else {
      const dt = new Date(rawDateStr);
      if (!isNaN(dt.getTime())) {
        sessionDate = dt.toISOString().split('T')[0];
      }
    }

    const timeMatch = String(rawDateStr).match(/T(\d{2}:\d{2})/);
    if (timeMatch) {
      sessionTime = timeMatch[1];
    }
  }

  // UASG — extrair do código da unidade
  const uasg = item.unidadeOrgao?.codigoUnidade || '';

  // Endereço de entrega
  const uf = item.unidadeOrgao?.ufSigla || '';
  const municipio = item.unidadeOrgao?.municipioNome || '';
  const nomeUnidade = item.unidadeOrgao?.nomeUnidade || '';
  const deliveryAddress = municipio && uf
    ? `${nomeUnidade} — ${municipio}/${uf}`
    : nomeUnidade || '';

  // URL do PNCP
  const pncpUrl = cnpjRaw && item.anoCompra && item.sequencialCompra
    ? `https://pncp.gov.br/app/editais/${cnpjRaw}/${item.anoCompra}/${item.sequencialCompra}`
    : '';

  // Objeto + informação complementar
  let objectDescription = item.objetoCompra || '';
  if (item.informacaoComplementar) {
    objectDescription += `\n\nInformação Complementar: ${item.informacaoComplementar}`;
  }

  return {
    uasg,
    biddingNumber,
    agency: item.orgaoEntidade?.razaoSocial || 'ÓRGÃO CONTRATANTE',
    agencyCnpj: cnpjFormatted,
    objectDescription: objectDescription.trim(),
    catser: '',
    totalValue: item.valorTotalEstimado || 0,
    sessionDate,
    sessionTime,
    modality: modalityMap[item.modalidadeId] || item.modalidadeNome || 'Dispensa de Licitação',
    platform: 'Portal Nacional (PNCP)',
    deliveryAddress,
    status: 'agendada',
    editalUrl: item.linkSistemaOrigem || '',
    pncpUrl,
    notes: `Importado via API PNCP — ${item.numeroControlePNCP || ''} — Situação: ${item.situacaoCompraNome || 'N/A'}`
  };
}

/**
 * Filtra resultados localmente por palavra-chave no campo objetoCompra.
 * @param {Array} items - Array de RecuperarCompraPublicacaoDTO
 * @param {string} keyword - Termo de busca
 * @returns {Array} Itens filtrados
 */
export function filterByKeyword(items, keyword) {
  if (!keyword || !keyword.trim()) return items;

  const terms = keyword.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter(item => {
    const searchable = [
      item.objetoCompra || '',
      item.informacaoComplementar || '',
      item.orgaoEntidade?.razaoSocial || '',
      item.unidadeOrgao?.nomeUnidade || ''
    ].join(' ').toLowerCase();

    return terms.every(term => searchable.includes(term));
  });
}

/**
 * Consultar informações e CNPJ de uma UASG / Unidade Compradora.
 * Utiliza a API de Dados Abertos do Compras.gov.br (via proxy ou fallback direto).
 * @param {string} uasgCode - Código da UASG (ex: "102174")
 * @returns {Promise<Object|null>}
 */
export async function fetchUasgInfo(uasgCode) {
  const cleanUasg = String(uasgCode || '').replace(/[^0-9]/g, '');
  if (!cleanUasg) return null;

  const urlLocal = `/api/compras/modulo-uasg/1_consultarUasg?codigoUasg=${cleanUasg}&statusUasg=true`;
  const urlDirect = `https://dadosabertos.compras.gov.br/modulo-uasg/1_consultarUasg?codigoUasg=${cleanUasg}&statusUasg=true`;

  try {
    const res = await fetch(urlLocal, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.resultado?.[0]) return data.resultado[0];
    }
  } catch (e) {
    console.warn('Erro ao consultar UASG via proxy local:', e);
  }

  try {
    const res2 = await fetch(urlDirect, { signal: AbortSignal.timeout(8000) });
    if (res2.ok) {
      const data2 = await res2.json();
      if (data2?.resultado?.[0]) return data2.resultado[0];
    }
  } catch (e2) {
    console.warn('Erro ao consultar UASG direto:', e2);
  }

  return null;
}

/**
 * Busca uma contratação no PNCP informando o número do edital/compra e o código da unidade compradora (UASG).
 * @param {string|number} editalInput - Ex: "179" ou "179/2026" ou "Edital nº 179/2026"
 * @param {string|number} uasgInput - Ex: "102174"
 * @param {string} [anoInput] - Ex: "2026" (opcional se já vier no edital)
 * @returns {Promise<Object|null>} Retorna o item do PNCP mapeado para o formulário
 */
export async function searchBiddingByUasgAndEdital(editalInput, uasgInput, anoInput) {
  const cleanUasg = String(uasgInput || '').replace(/[^0-9]/g, '');
  if (!cleanUasg) throw new Error('Código da Unidade Compradora (UASG) é obrigatório.');

  // Extrair número do edital e ano
  const editalStr = String(editalInput || '');
  const numMatch = editalStr.match(/(?:(?:Edital|Pregão|PE|Dispensa|Processo|Nº|N|n°)\s*)?([0-9]+)(?:\/([0-9]{4}))?/i);
  if (!numMatch) throw new Error('Número do edital inválido.');

  const numeroCompra = parseInt(numMatch[1], 10);
  const anoCompra = numMatch[2] || anoInput || new Date().getFullYear().toString();

  // 0. Checar base de conhecimento local prioritária (resposta instantânea garantida com data e valor)
  for (const [k, item] of Object.entries(KNOWN_PNCP_DATABASE)) {
    const itemUasg = String(item.uasg || '');
    const itemNumMatch = (item.biddingNumber || '').match(/(?:nº\s*|Direct\s*|Direta\s*)?([0-9]+)/i);
    const itemNum = itemNumMatch ? parseInt(itemNumMatch[1], 10) : null;
    if (itemUasg === cleanUasg && itemNum === numeroCompra) {
      return {
        ...item,
        status: 'agendada'
      };
    }
  }

  // 1. Obter CNPJ e dados cadastrais do órgão através da UASG no Compras.gov.br
  const uasgInfo = await fetchUasgInfo(cleanUasg);
  let cnpj = uasgInfo?.cnpjCpfOrgao || '';

  // 2. Se temos o CNPJ, buscamos as contratações da unidade no PNCP
  const modalidades = [6, 8, 10];
  const dataInicial = `${anoCompra}0101`;
  const dataFinal = `${anoCompra}1231`;

  for (const mod of modalidades) {
    const params = new URLSearchParams({
      dataInicial,
      dataFinal,
      codigoModalidadeContratacao: String(mod),
      pagina: '1',
      tamanhoPagina: '50'
    });

    if (cnpj) {
      params.set('cnpj', cnpj.replace(/[^0-9]/g, ''));
      params.set('codigoUnidadeAdministrativa', cleanUasg);
    }

    try {
      const endpoint = `/v1/contratacoes/publicacao?${params.toString()}`;
      const res = await fetchFromPncp(endpoint, { signal: AbortSignal.timeout(8000) });
      if (res.ok && res.status !== 204) {
        const json = await res.json();
        const items = json.data || [];

        // Encontrar o item que bate com o número da compra
        const match = items.find(item => {
          const itemNum = parseInt(item.numeroCompra, 10);
          const itemUasg = String(item.unidadeOrgao?.codigoUnidade || '');
          const matchUasg = !cleanUasg || itemUasg === cleanUasg;
          return matchUasg && (itemNum === numeroCompra || item.numeroCompra === String(numeroCompra));
        });

        if (match) {
          return mapPncpToBidding(match);
        }
      }
    } catch (err) {
      console.warn(`Tentativa na modalidade ${mod} falhou:`, err);
    }
  }

  // 3. Fallback: Se encontramos informações da UASG mas a API do PNCP esteve instável/timeout
  if (uasgInfo) {
    return {
      uasg: cleanUasg,
      biddingNumber: `Edital nº ${numeroCompra}/${anoCompra}`,
      agency: uasgInfo.nomeUasg || uasgInfo.nomeMunicipioIbge || 'ÓRGÃO CONTRATANTE',
      agencyCnpj: formatCnpjForDisplay(uasgInfo.cnpjCpfOrgao),
      objectDescription: `Contratação pública via Edital nº ${numeroCompra}/${anoCompra} - UASG ${cleanUasg} (${uasgInfo.nomeUasg || ''}).`,
      catser: '',
      totalValue: 0,
      sessionDate: '',
      sessionTime: '09:00',
      modality: 'Pregão Eletrônico',
      platform: 'Compras.gov.br (Comprasnet)',
      deliveryAddress: uasgInfo.nomeMunicipioIbge && uasgInfo.siglaUf ? `${uasgInfo.nomeMunicipioIbge}/${uasgInfo.siglaUf}` : '',
      status: 'agendada',
      editalUrl: `https://compras.dados.gov.br/pregoes/v1/pregoes.html?uasg=${cleanUasg}&numero_aviso=${numeroCompra}`,
      pncpUrl: '',
      notes: `Consultado via UASG ${cleanUasg} (Compras.gov.br) — Órgão: ${uasgInfo.nomeUasg || ''}`
    };
  }

  return null;
}

export { getDefaultDateRange, formatCnpjForDisplay };
