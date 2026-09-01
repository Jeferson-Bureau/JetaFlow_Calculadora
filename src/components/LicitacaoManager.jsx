import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  Building,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Tag,
  CheckCircle,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  Award,
  Filter,
  Mail,
  Zap,
  ClipboardCheck,
  Globe,
  Landmark,
  Loader2,
  Eye,
  Package
} from 'lucide-react';
import { KNOWN_PNCP_DATABASE } from '../data/initialData';
import { getContratacao, mapPncpToBidding, searchBiddingByUasgAndEdital } from '../services/pncpService';

export function parseBrlCurrencyToFloat(str) {
  if (!str && str !== 0) return 0;
  if (typeof str === 'number') return str;

  let s = String(str).replace(/R\$/gi, '').replace(/[\s\=\"\']/g, '').trim();
  if (!s) return 0;

  // Format: "4.395,00" or "1.250.000,50" -> remove dot, convert comma to dot
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } 
  // Format: "4395,00" or "400,00" or "855,00" -> convert comma to dot
  else if (s.includes(',') && !s.includes('.')) {
    s = s.replace(',', '.');
  } 
  // Format: "400.00" or "4.395" -> check if dot is decimal or thousands
  else if (s.includes('.') && !s.includes(',')) {
    if (!/\.[0-9]{2}$/.test(s)) {
      s = s.replace(/\./g, '');
    }
  }

  const num = parseFloat(s);
  return isNaN(num) ? 0 : num;
}

export async function fetchRazaoSocialByCnpj(cnpjStr = '') {
  const cleanCnpj = cnpjStr.replace(/[^0-9]/g, '');
  if (cleanCnpj.length !== 14) return null;
  
  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/${cleanCnpj}`);
    if (res.ok) {
      const data = await res.json();
      const name = data.razao_social || data.estabelecimento?.nome_fantasia;
      if (name) return name.toUpperCase();
    }
  } catch (e) {
    console.warn('publica.cnpj.ws fallback:', e);
  }

  try {
    const res2 = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`)}`);
    if (res2.ok) {
      const data2 = await res2.json();
      const name2 = data2.razao_social || data2.nome_fantasia;
      if (name2) return name2.toUpperCase();
    }
  } catch (e2) {
    console.warn('BrasilAPI fallback:', e2);
  }

  return null;
}

// ── Helpers internos do parser ─────────────────────────────────
function formatRawCnpj(c) {
  if (!c || c.length !== 14) return c;
  return `${c.substring(0, 2)}.${c.substring(2, 5)}.${c.substring(5, 8)}/${c.substring(8, 12)}-${c.substring(12, 14)}`;
}

// ── Parser Principal de Alertas de Licitação ──────────────────
export function parseBiddingEmailAlert(text = '') {
  if (!text || !text.trim()) return {};

  const cleanText = text.trim();
  const parsed = {};

  // ── 0. Check KNOWN_PNCP_DATABASE by key ──────────────────
  const keyMatch = cleanText.match(/PNCP-([0-9]{14}-[0-9]+-[0-9]{6}-[0-9]{4})/i) ||
                   cleanText.match(/([0-9]{14}-[0-9]+-[0-9]{6}-[0-9]{4})/i);
  if (keyMatch && KNOWN_PNCP_DATABASE[keyMatch[1]]) {
    const known = KNOWN_PNCP_DATABASE[keyMatch[1]];
    Object.assign(parsed, known);
  }

  // ── 1. Links (Markdown e URLs soltas) ─────────────────────
  const mdLinkMatch = cleanText.match(/\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdLinkMatch) {
    const rawTitle = mdLinkMatch[1].replace(/\(\d+\s*visual\.\)/gi, '').replace(/\[|\]/g, '').trim();
    if (!rawTitle.startsWith('http')) {
      parsed.biddingNumber = rawTitle;
    }
    parsed.editalUrl = mdLinkMatch[2].trim();
  }

  if (!parsed.editalUrl) {
    const alertaUrlMatch = cleanText.match(/(https?:\/\/alertalicitacao\.com\.br[^\s\)\>\"]+)/i);
    if (alertaUrlMatch) parsed.editalUrl = alertaUrlMatch[1].trim();
  }

  if (!parsed.pncpUrl) {
    const pncpUrlMatch = cleanText.match(/(https?:\/\/pncp\.gov\.br[^\s\)\>\"]+)/i);
    if (pncpUrlMatch) parsed.pncpUrl = pncpUrlMatch[1].trim();
  }

  // ── 2. Identificador PNCP / CNPJ do órgão ────────────────
  const idMatch = cleanText.match(/Identificador(?: desta licitação)?:?\s*([^\s\n\r]+)/i) ||
                  cleanText.match(/PNCP-([0-9]{14})-[0-9]+-([0-9]{6})-([0-9]{4})/i) ||
                  cleanText.match(/([0-9]{14})-[0-9]+-([0-9]+)\/([0-9]{4})/i);

  if (idMatch) {
    const idStr = idMatch[1] || idMatch[0];
    const cnpjMatch = idStr.match(/([0-9]{14})/);
    if (cnpjMatch) {
      const c = cnpjMatch[1];
      parsed.agencyCnpj = formatRawCnpj(c);
      if (!parsed.pncpUrl) {
        const seqMatch = idStr.match(/-([0-9]{6})-([0-9]{4})/) || idStr.match(/-([0-9]+)\/([0-9]{4})/);
        const seqNum = seqMatch ? parseInt(seqMatch[1], 10) : '1';
        const yearNum = seqMatch ? seqMatch[2] : '2026';
        parsed.pncpUrl = `https://pncp.gov.br/app/editais/${c}/${yearNum}/${seqNum}`;
      }
    }
  }

  // Fallback CNPJ from any 14-digit format or formatted XX.XXX.XXX/XXXX-XX
  if (!parsed.agencyCnpj) {
    const pncpSimpleMatch = cleanText.match(/PNCP-([0-9]{14})/i) || cleanText.match(/([0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2})/);
    if (pncpSimpleMatch) {
      const c = pncpSimpleMatch[1].replace(/[^0-9]/g, '');
      if (c.length === 14) {
        parsed.agencyCnpj = formatRawCnpj(c);
      }
    }
  }

  // ── 3. Número da Licitação / Título ───────────────────────
  if (!parsed.biddingNumber) {
    const titleLineMatch = cleanText.match(/(Contratação Direta\s+(?:nº\s*)?[0-9]+\/[0-9]{4}|Pregão\s+Eletrônico\s+(?:nº\s*)?[0-9]+\/[0-9]{4}|Dispensa\s+(?:Eletrônica\s+)?(?:nº\s*)?[0-9]+\/[0-9]{4}|Concorrência\s+(?:Eletrônica\s+)?(?:nº\s*)?[0-9]+\/[0-9]{4}|Inexigibilidade\s+(?:nº\s*)?[0-9]+\/[0-9]{4})/i);
    if (titleLineMatch) {
      parsed.biddingNumber = titleLineMatch[1].trim();
    }
  }

  // ── 4. UASG ──────────────────────────────────────────────
  const uasgMatch = cleanText.match(/UASG:\s*([0-9]+)/i) ||
                    cleanText.match(/(?:UASG|Unidade Gestora|Unidade compradora|Código da Unidade)[\s:]*([0-9]{5,7})/i);
  if (uasgMatch) parsed.uasg = uasgMatch[1];

  // ── 5. Portal / Plataforma ────────────────────────────────
  const portalMatch = cleanText.match(/Portal:\s*([^\n\r]+)/i) ||
                      cleanText.match(/Plataforma:\s*([^\n\r]+)/i);
  if (portalMatch) {
    const pStr = portalMatch[1].trim();
    if (/comprasnet|compras\.gov/i.test(pStr)) parsed.platform = 'Compras.gov.br (Comprasnet)';
    else if (/BLL/i.test(pStr)) parsed.platform = 'BLL Compras';
    else if (/licitacoes-e|licitações-e/i.test(pStr)) parsed.platform = 'Licitações-e (BB)';
    else parsed.platform = pStr;
  }

  // ── 6. Data e Horário da Sessão (MELHORADO) ───────────────
  const datePatterns = [
    /(?:Abertura|Data da sessão|Data sessão|Data disputa|Início da sessão)[\s:]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})(?:\s*(?:às?\s*)?([0-9]{2}:[0-9]{2}))?/i,
    /(?:Data fim de recebimento de propostas|Encerramento proposta|Fim recebimento|Data encerramento)[\s:]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})(?:\s*(?:às?\s*)?([0-9]{2}:[0-9]{2}))?/i,
    /(?:Sessão|Disputa|Data da disputa)[\s:]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})(?:\s*(?:às?\s*)?([0-9]{2}:[0-9]{2}))?/i,
    /(?:Início receb\.\s*proposta|Início recebimento)[\s:]*([0-9]{2}\/[0-9]{2}\/[0-9]{4})(?:\s*(?:às?\s*)?([0-9]{2}:[0-9]{2}))?/i
  ];

  for (const pattern of datePatterns) {
    const dateMatch = cleanText.match(pattern);
    if (dateMatch) {
      const [d, m, y] = dateMatch[1].split('/');
      parsed.sessionDate = `${y}-${m}-${d}`;
      if (dateMatch[2]) parsed.sessionTime = dateMatch[2];
      break;
    }
  }

  // Fallback: data ISO no contexto de sessão
  if (!parsed.sessionDate) {
    const isoDateMatch = cleanText.match(/(?:Abertura|Sessão|Encerramento|Disputa)[\s:]*([0-9]{4}-[0-9]{2}-[0-9]{2})(?:\s*(?:às?\s*)?([0-9]{2}:[0-9]{2}))?/i);
    if (isoDateMatch) {
      parsed.sessionDate = isoDateMatch[1];
      if (isoDateMatch[2]) parsed.sessionTime = isoDateMatch[2];
    }
  }

  // Horário — SOMENTE em contexto de sessão/abertura, não qualquer HH:MM solto
  if (!parsed.sessionTime) {
    const timeContextMatch = cleanText.match(/(?:Horário|Hora|às)\s*(?:da sessão|da abertura)?[\s:]*([0-2]?[0-9]:[0-5][0-9])/i);
    if (timeContextMatch) {
      parsed.sessionTime = timeContextMatch[1];
    }
  }

  // ── 7. Modalidade ─────────────────────────────────────────
  const modMatch = cleanText.match(/Modalidade:\s*([^\n\r]+)/i);
  if (modMatch) {
    const mStr = modMatch[1].trim();
    if (/dispensa/i.test(mStr)) parsed.modality = 'Dispensa de Licitação';
    else if (/pregão/i.test(mStr)) parsed.modality = 'Pregão Eletrônico';
    else if (/concorrência/i.test(mStr)) parsed.modality = 'Concorrência Eletrônica';
    else if (/inexigibilidade/i.test(mStr)) parsed.modality = 'Inexigibilidade';
    else if (/credenciamento/i.test(mStr)) parsed.modality = 'Credenciamento';
    else parsed.modality = mStr;
  } else if (!parsed.modality) {
    if (/dispensa/i.test(parsed.biddingNumber || '')) parsed.modality = 'Dispensa de Licitação';
    else if (/pregão/i.test(parsed.biddingNumber || '')) parsed.modality = 'Pregão Eletrônico';
    else if (/concorrência/i.test(parsed.biddingNumber || '')) parsed.modality = 'Concorrência Eletrônica';
    else if (/inexigibilidade/i.test(parsed.biddingNumber || '')) parsed.modality = 'Inexigibilidade';
  }

  // ── 8. Órgão Contratante ──────────────────────────────────
  const orgaoMatch = cleanText.match(/Órgão:\s*([^\n\r]+)/i) ||
                     cleanText.match(/Órgão contratante:\s*([^\n\r]+)/i) ||
                     cleanText.match(/Razão Social:\s*([^\n\r]+)/i) ||
                     cleanText.match(/(MUNICÍPIO[^\n\r]{4,60}|PREFEITURA[^\n\r]{4,60}|TRIBUNAL[^\n\r]{4,60}|FUNDAÇÃO[^\n\r]{4,60}|UNIVERSIDADE[^\n\r]{4,60}|CÂMARA[^\n\r]{4,60}|GOVERNO[^\n\r]{4,60}|SECRETARIA[^\n\r]{4,60}|INSTITUTO[^\n\r]{4,60}|HOSPITAL[^\n\r]{4,60}|ASSEMBLEIA[^\n\r]{4,60})/i);
  if (orgaoMatch) {
    parsed.agency = (orgaoMatch[1] || orgaoMatch[0]).trim();
  }

  // ── 9. Valor (R$) ─────────────────────────────────────────
  const valorMatch = cleanText.match(/Valor:\s*R\$\s*([0-9\.\,]+)/i) ||
                     cleanText.match(/VALOR TOTAL ESTIMADO DA COMPRA[\s\S]*?R\$\s*([0-9\.\,]+)/i) ||
                     cleanText.match(/(?:Valor Total|Valor Estimado|Valor Referência|Valor Global)[\s:]*R\$\s*([0-9\.\,]+)/i) ||
                     cleanText.match(/R\$\s*([0-9]{1,3}(?:\.[0-9]{3})*,[0-9]{2}|[0-9]+,[0-9]{2}|[0-9]+\.[0-9]{2})/i);
  if (valorMatch) {
    parsed.totalValue = valorMatch[1].trim();
  }

  // ── 10. Endereço / Local de Entrega (MELHORADO) ───────────
  const addrMatch = cleanText.match(/(?:Cidade|Local de entrega|Endereço de entrega|Local\/Entrega|Endereço):\s*([^\n\r]+)/i) ||
                    cleanText.match(/Município:\s*([^\n\r]+)/i);
  if (addrMatch) {
    const addr = addrMatch[1].trim();
    parsed.deliveryAddress = addr.startsWith('Local') ? addr : `Local / Entrega: ${addr}`;
  }

  if (!parsed.deliveryAddress) {
    const ufMatch = cleanText.match(/\bUF:\s*([A-Z]{2})/i);
    const munMatch = cleanText.match(/Município:\s*([^\n\r,]+)/i);
    if (ufMatch && munMatch) {
      parsed.deliveryAddress = `Local / Entrega: ${munMatch[1].trim()} (${ufMatch[1].toUpperCase()})`;
    }
  }

  // ── 11. CATSER / CATMAT (NOVO) ────────────────────────────
  const catserMatch = cleanText.match(/CATSER[\s\/]*(?:CATMAT)?[\s:]*([0-9]{4,6})\s*[-–—]\s*([^\n\r]+)/i) ||
                      cleanText.match(/CATMAT[\s\/]*(?:CATSER)?[\s:]*([0-9]{4,6})\s*[-–—]\s*([^\n\r]+)/i) ||
                      cleanText.match(/Código do item:\s*([0-9]{4,6})\s*[-–—]\s*([^\n\r]+)/i);
  if (catserMatch) {
    parsed.catser = `${catserMatch[1]} - ${catserMatch[2].trim()}`;
  } else {
    const catserSimple = cleanText.match(/(?:CATSER|CATMAT)[\s:]*([0-9]{4,6})/i);
    if (catserSimple) parsed.catser = catserSimple[1];
  }

  // ── 12. Objeto da Licitação (MELHORADO) ───────────────────
  const objEndMarkers = /(?:Informação complementar|VALOR TOTAL|Itens da compra|Arquivos|CATSER|CATMAT|---+|_{5,}|Importante:|Atenção:|Enviado por|Este e-mail|Cancele seu alerta|alertalicitacao)/i;

  const objMatch = cleanText.match(/Objeto:\s*([\s\S]*?)$/i) ||
                   cleanText.match(/Objeto da (?:compra|contratação|licitação):\s*([\s\S]*?)$/i) ||
                   cleanText.match(/Descrição do objeto:\s*([\s\S]*?)$/i);

  if (objMatch && objMatch[1].trim()) {
    let objText = objMatch[1];
    const endIdx = objText.search(objEndMarkers);
    if (endIdx > 0) objText = objText.substring(0, endIdx);
    parsed.objectDescription = objText.replace(/[\r\n]+/g, ' ').trim();
  }

  if (!parsed.objectDescription) {
    const afterValorMatch = cleanText.match(/Valor:\s*R\$\s*[0-9\.\,]+\s+([\s\S]*?)$/i);
    if (afterValorMatch && afterValorMatch[1].trim()) {
      let objText = afterValorMatch[1];
      const endIdx = objText.search(objEndMarkers);
      if (endIdx > 0) objText = objText.substring(0, endIdx);
      objText = objText.substring(0, 500);
      parsed.objectDescription = objText.replace(/[\r\n]+/g, ' ').trim();
    }
  }

  if (!parsed.objectDescription) {
    const fallbackObjMatch = cleanText.match(/(contratação de (?:empresa )?(?:especializada )?(?:para )?(?:prestação de )?(?:serviços? )?[^\n\r]{10,200})/i) ||
                             cleanText.match(/(impressão [^\n\r]{5,200})/i) ||
                             cleanText.match(/(registro de preços[^\n\r]{5,200})/i) ||
                             cleanText.match(/(confecção[^\n\r]{5,200})/i);
    if (fallbackObjMatch) parsed.objectDescription = fallbackObjMatch[1].trim();
  }

  // ── 13. Informação Complementar (NOVO) ────────────────────
  const infoCompMatch = cleanText.match(/Informação complementar:\s*([\s\S]*?)(?:VALOR TOTAL|Itens|Arquivos|---+|_{5,}|Importante:|$)/i);
  if (infoCompMatch && infoCompMatch[1].trim()) {
    const infoComp = infoCompMatch[1].replace(/[\r\n]+/g, ' ').trim().substring(0, 400);
    if (parsed.objectDescription) {
      parsed.objectDescription += `\n\nInformação Complementar: ${infoComp}`;
    } else {
      parsed.objectDescription = infoComp;
    }
  }

  // ── 14. Parsing de Itens/Lotes (NOVO) ─────────────────────
  const items = [];
  const itemRegex = /(?:Item|Lote)\s*(\d+)\s*[-–:]\s*([^\n\r]+?)(?:\s*[-–|]\s*(?:Qtd|Quantidade)[\s:]*(\d+(?:[.,]\d+)?))?(?:\s*[-–|]\s*(?:Unidade|Unid|Un)[\s:]*([^\s|,]+))?(?:\s*[-–|]\s*(?:Valor Unit|V\.\s*Unit|Preço)[\s:]*R?\$?\s*([0-9.,]+))?(?:\s*[-–|]\s*(?:Valor Total|V\.\s*Total)[\s:]*R?\$?\s*([0-9.,]+))?/gi;
  let iMatch;
  while ((iMatch = itemRegex.exec(cleanText)) !== null) {
    items.push({
      num: parseInt(iMatch[1], 10),
      description: iMatch[2]?.trim() || '',
      quantity: iMatch[3] ? parseBrlCurrencyToFloat(iMatch[3]) : null,
      unit: iMatch[4]?.trim() || null,
      unitValue: iMatch[5] ? parseBrlCurrencyToFloat(iMatch[5]) : null,
      totalValue: iMatch[6] ? parseBrlCurrencyToFloat(iMatch[6]) : null
    });
  }

  if (items.length === 0) {
    const tableRowRegex = /^\s*(\d+)\s*[|\t]\s*(.+?)\s*[|\t]\s*(\d+(?:[.,]\d+)?)\s*[|\t]\s*(\w+)\s*[|\t]\s*R?\$?\s*([0-9.,]+)\s*(?:[|\t]\s*R?\$?\s*([0-9.,]+))?$/gm;
    let tMatch;
    while ((tMatch = tableRowRegex.exec(cleanText)) !== null) {
      items.push({
        num: parseInt(tMatch[1], 10),
        description: tMatch[2]?.trim() || '',
        quantity: parseBrlCurrencyToFloat(tMatch[3]),
        unit: tMatch[4]?.trim() || null,
        unitValue: parseBrlCurrencyToFloat(tMatch[5]),
        totalValue: tMatch[6] ? parseBrlCurrencyToFloat(tMatch[6]) : null
      });
    }
  }

  if (items.length > 0) {
    parsed.items = items;
  }

  // ── 15. Construção de URL ComprasNet via UASG (NOVO) ──────
  if (parsed.uasg && !parsed.editalUrl) {
    const pregaoNum = (parsed.biddingNumber || '').match(/(?:Pregão|PE)\s*(?:Eletrônico\s*)?(?:nº\s*)?(\d+)/i);
    if (pregaoNum) {
      parsed.editalUrl = `https://compras.dados.gov.br/pregoes/v1/pregoes.html?uasg=${parsed.uasg}&numero_aviso=${pregaoNum[1]}`;
    }
  }

  return parsed;
}















export function getSessionBadge(sessionDateStr) {

  if (!sessionDateStr) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  if (sessionDateStr === todayStr) {
    return { label: '🚨 SESSÃO HOJE', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.25)', border: 'rgba(239, 68, 68, 0.5)' };
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  if (sessionDateStr === tomorrowStr) {
    return { label: '⚠️ SESSÃO AMANHÃ', color: 'var(--brand-yellow)', bg: 'rgba(247, 181, 0, 0.25)', border: 'rgba(247, 181, 0, 0.5)' };
  }

  const sessionD = new Date(sessionDateStr);
  const todayD = new Date(todayStr);
  const diffDays = Math.ceil((sessionD - todayD) / (1000 * 60 * 60 * 24));
  if (diffDays > 0) {
    return { label: `📅 EM ${diffDays} DIAS`, color: 'var(--brand-cyan)', bg: 'rgba(0, 168, 232, 0.15)', border: 'rgba(0, 168, 232, 0.4)' };
  }

  return { label: '⌛ SESSÃO ENCERRADA', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.08)', border: 'var(--border-color)' };
}

export default function LicitacaoManager({
  biddings,
  clients = [],
  onAddBidding,
  onUpdateBidding,
  onDeleteBidding,
  onResetBiddings
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFetchingCnjp, setIsFetchingCnpj] = useState(false);
  const [rawAlertText, setRawAlertText] = useState('');
  const [inputEdital, setInputEdital] = useState('');
  const [inputUasg, setInputUasg] = useState('');
  const [importMode, setImportMode] = useState('edital_uasg'); // 'edital_uasg' | 'email_text'
  const [parsedPreview, setParsedPreview] = useState(null);
  const [editingBidding, setEditingBidding] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState('');

  // Atualizar preview do parser em tempo real conforme o usuário digita/cola texto
  useEffect(() => {
    if (importMode === 'email_text') {
      if (!rawAlertText.trim()) {
        setParsedPreview(null);
        return;
      }
      const timer = setTimeout(() => {
        try {
          const preview = parseBiddingEmailAlert(rawAlertText);
          setParsedPreview(preview);
        } catch (e) {
          console.error('Erro no preview do parser:', e);
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [rawAlertText, importMode]);

  // Form State
  const [formData, setFormData] = useState({
    uasg: '',
    biddingNumber: '',
    agency: '',
    agencyCnpj: '',
    objectDescription: '',
    catser: '',
    totalValue: '',
    sessionDate: '',
    sessionTime: '09:00',
    modality: 'Dispensa de Licitação',
    platform: 'Portal Nacional (PNCP)',
    deliveryAddress: '',
    status: 'agendada',
    editalUrl: '',
    pncpUrl: '',
    notes: ''
  });

  const statusLabels = {
    agendada: { label: 'Agendada', color: 'var(--brand-cyan)', bg: 'rgba(0, 168, 232, 0.15)', border: 'rgba(0, 168, 232, 0.4)' },
    em_disputa: { label: 'Em Disputa / Pregão', color: 'var(--brand-yellow)', bg: 'rgba(247, 181, 0, 0.15)', border: 'rgba(247, 181, 0, 0.4)' },
    proposta_enviada: { label: 'Proposta Enviada', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: 'rgba(139, 92, 246, 0.4)' },
    vencedora: { label: 'Arrematada / Vencedora', color: 'var(--success)', bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)' },
    homologada: { label: 'Homologada', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.4)' },
    fracassada: { label: 'Deserta / Fracassada', color: 'var(--text-muted)', bg: 'rgba(255, 255, 255, 0.08)', border: 'var(--border-color)' },
    cancelada: { label: 'Cancelada / Revogada', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)' }
  };

  const openNewBiddingModal = () => {
    setEditingBidding(null);
    setSelectedClientId('');
    setFormData({
      uasg: '',
      biddingNumber: '',
      agency: '',
      agencyCnpj: '',
      objectDescription: '',
      catser: '',
      totalValue: '',
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: '09:00',
      modality: 'Dispensa de Licitação',
      platform: 'Portal Nacional (PNCP)',
      deliveryAddress: '',
      status: 'agendada',
      editalUrl: '',
      pncpUrl: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditBiddingModal = (bidding) => {
    setEditingBidding(bidding);
    setSelectedClientId('');
    setFormData({
      uasg: bidding.uasg || '',
      biddingNumber: bidding.biddingNumber || '',
      agency: bidding.agency || '',
      agencyCnpj: bidding.agencyCnpj || '',
      objectDescription: bidding.objectDescription || '',
      catser: bidding.catser || '',
      totalValue: bidding.totalValue || '',
      sessionDate: bidding.sessionDate || '',
      sessionTime: bidding.sessionTime || '09:00',
      modality: bidding.modality || 'Dispensa de Licitação',
      platform: bidding.platform || 'Portal Nacional (PNCP)',
      deliveryAddress: bidding.deliveryAddress || '',
      status: bidding.status || 'agendada',
      editalUrl: bidding.editalUrl || '',
      pncpUrl: bidding.pncpUrl || '',
      notes: bidding.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const finalNumber = formData.biddingNumber.trim() || 'Licitação N/A';
    const finalAgency = formData.agency.trim() || 'Órgão Contratante';
    const numValue = parseBrlCurrencyToFloat(formData.totalValue);

    const dataToSave = {
      ...formData,
      biddingNumber: finalNumber,
      agency: finalAgency,
      totalValue: numValue
    };

    if (editingBidding) {
      onUpdateBidding({
        ...editingBidding,
        ...dataToSave
      });
    } else {
      const newBidding = {
        id: `lic-${Date.now()}`,
        ...dataToSave,
        createdAt: new Date().toISOString().split('T')[0]
      };
      onAddBidding(newBidding);
    }

    setIsModalOpen(false);
  };

  const handleCopyBidding = (bidding) => {
    const info = `Código: ${bidding.code || ''}\nUASG: ${bidding.uasg || 'N/A'}\nLicitação: ${bidding.biddingNumber}\nÓrgão: ${bidding.agency} (CNPJ: ${bidding.agencyCnpj || 'N/A'})\nObjeto: ${bidding.objectDescription}\nValor Estimado: R$ ${Number(bidding.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\nSessão: ${bidding.sessionDate ? bidding.sessionDate.split('-').reverse().join('/') : ''} às ${bidding.sessionTime || ''}\nModalidade: ${bidding.modality}\nPlataforma: ${bidding.platform}\nCATSER: ${bidding.catser || 'N/A'}\nLocal Entrega: ${bidding.deliveryAddress || 'N/A'}${bidding.pncpUrl ? `\nPortal PNCP: ${bidding.pncpUrl}` : ''}${bidding.editalUrl ? `\nAlerta Licitação: ${bidding.editalUrl}` : ''}`;
    navigator.clipboard.writeText(info);
    setCopiedId(bidding.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExecuteImportAlert = async () => {
    setIsFetchingCnpj(true);

    try {
      // ── MODO 1: Buscar diretamente por Número do Edital + UASG ──────
      if (importMode === 'edital_uasg') {
        if (!inputEdital.trim() || !inputUasg.trim()) {
          alert('Por favor, informe tanto o Número do Edital (ex: 179/2026) quanto a Unidade Compradora / UASG (ex: 102174).');
          setIsFetchingCnpj(false);
          return;
        }

        const biddingResult = await searchBiddingByUasgAndEdital(inputEdital, inputUasg);
        if (biddingResult) {
          setEditingBidding(null);
          setSelectedClientId('');
          setFormData({
            ...biddingResult,
            status: 'agendada'
          });
          setIsImportModalOpen(false);
          setInputEdital('');
          setInputUasg('');
          setIsModalOpen(true);
          return;
        } else {
          alert(`Nenhuma contratação encontrada no PNCP para o Edital "${inputEdital}" na UASG "${inputUasg}". Verifique os números informados.`);
          setIsFetchingCnpj(false);
          return;
        }
      }

      // ── MODO 2: Importar por Texto / E-mail do Alerta ────────────────
      if (!rawAlertText.trim()) {
        setIsFetchingCnpj(false);
        return;
      }

      // 1. Verificar se contém link direto do PNCP para consulta oficial via API
      const pncpUrlMatch = rawAlertText.match(/https?:\/\/pncp\.gov\.br\/app\/editais\/([0-9]{14})\/([0-9]{4})\/([0-9]+)/i);
      if (pncpUrlMatch) {
        const [, cnpj, ano, sequencial] = pncpUrlMatch;
        try {
          const pncpData = await getContratacao(cnpj, parseInt(ano, 10), parseInt(sequencial, 10));
          if (pncpData) {
            const mapped = mapPncpToBidding(pncpData);
            setEditingBidding(null);
            setSelectedClientId('');
            setFormData({
              ...mapped,
              status: 'agendada'
            });
            setIsFetchingCnpj(false);
            setIsImportModalOpen(false);
            setRawAlertText('');
            setIsModalOpen(true);
            return;
          }
        } catch (apiErr) {
          console.warn('Falha na API PNCP direta, usando fallback do parser de texto:', apiErr);
        }
      }

      // 2. Parser inteligente do texto/e-mail
      const extracted = parseBiddingEmailAlert(rawAlertText);

      // Consulta de Razão Social via Receita Federal caso não venha no texto
      let officialAgencyName = extracted.agency;
      if (extracted.agencyCnpj && (!officialAgencyName || officialAgencyName.startsWith('ÓRGÃO'))) {
        const liveName = await fetchRazaoSocialByCnpj(extracted.agencyCnpj);
        if (liveName) officialAgencyName = liveName;
      }

      if (!officialAgencyName) {
        officialAgencyName = extracted.agencyCnpj ? `ÓRGÃO CONTRATANTE (CNPJ: ${extracted.agencyCnpj})` : 'ÓRGÃO CONTRATANTE';
      }

      const numericVal = extracted.totalValue ? parseBrlCurrencyToFloat(extracted.totalValue) : 0;

      // Anexar itens na observação técnica se houver lista extraída
      let customNotes = `Importado via Alerta Licitação (CNPJ: ${extracted.agencyCnpj || 'PNCP'})`;
      if (extracted.items && extracted.items.length > 0) {
        const itemsSummary = extracted.items
          .map(it => `Item ${it.num}: ${it.description} (Qtd: ${it.quantity || '-'} ${it.unit || ''} | Ref: R$ ${it.unitValue ? it.unitValue.toFixed(2) : '-'})`)
          .join('\n');
        customNotes += `\n\nItens Detectados:\n${itemsSummary}`;
      }

      setEditingBidding(null);
      setSelectedClientId('');
      setFormData({
        uasg: extracted.uasg || '',
        biddingNumber: extracted.biddingNumber || 'Contratação Direta PNCP',
        agency: officialAgencyName,
        agencyCnpj: extracted.agencyCnpj || '',
        objectDescription: extracted.objectDescription || `Serviços de impressão gráfica conforme edital ${extracted.biddingNumber || 'PNCP'}.`,
        catser: extracted.catser || '',
        totalValue: numericVal > 0 ? numericVal : '',
        sessionDate: extracted.sessionDate || '',
        sessionTime: extracted.sessionTime || '09:00',
        modality: extracted.modality || 'Dispensa de Licitação',
        platform: extracted.platform || 'Portal Nacional (PNCP)',
        deliveryAddress: extracted.deliveryAddress || '',
        status: 'agendada',
        editalUrl: extracted.editalUrl || '',
        pncpUrl: extracted.pncpUrl || '',
        notes: customNotes
      });

      setIsImportModalOpen(false);
      setRawAlertText('');
      setIsModalOpen(true);
    } catch (err) {
      console.error('Erro ao processar importação do alerta:', err);
      alert('Erro ao consultar o PNCP: ' + (err.message || 'Verifique sua conexão.'));
    } finally {
      setIsFetchingCnpj(false);
    }
  };

  const handleSelectAgencyFromCRM = (clientId) => {
    setSelectedClientId(clientId);
    const clientObj = clients.find(c => c.id === clientId);
    if (clientObj) {
      setFormData(prev => ({
        ...prev,
        agency: clientObj.tradeName || clientObj.name,
        agencyCnpj: clientObj.doc || ''
      }));
    }
  };

  // Filtered Biddings List
  const filteredBiddings = biddings.filter(b => {
    const matchesSearch =
      (b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.uasg || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.biddingNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.agency || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.agencyCnpj || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.objectDescription || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.platform || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.catser || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || b.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const totalEstimateValue = biddings.reduce((sum, b) => sum + (Number(b.totalValue) || 0), 0);
  const totalAgendadas = biddings.filter(b => b.status === 'agendada' || b.status === 'em_disputa').length;
  const totalVencedoras = biddings.filter(b => b.status === 'vencedora' || b.status === 'homologada').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner & Action Controls */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(139, 92, 246, 0.15)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
            <Award size={28} color="#8b5cf6" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Gestão de Licitações & Pregões Públicos
              </h2>
              <span style={{
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 700,
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--success)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Mail size={12} /> Alerta Licitação: jeferson.arte@gmail.com
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Acompanhamento de processos licitatórios, editais, UASG, prazos de sessões e propostas arrematadas.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            title="Importar e-mail de Alerta Licitação em 1 clique"
            style={{
              padding: '12px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(247, 181, 0, 0.4)',
              background: 'rgba(247, 181, 0, 0.15)',
              color: 'var(--brand-yellow)',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Zap size={16} /> Colar Alerta (E-mail)
          </button>

          {onResetBiddings && (
            <button
              type="button"
              onClick={onResetBiddings}
              title="Recarregar licitações iniciais"
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'var(--bg-input)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🔄 Recarregar
            </button>
          )}

          <button
            onClick={openNewBiddingModal}
            style={{
              padding: '12px 22px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s ease'
            }}
          >
            <Plus size={18} /> Nova Licitação
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px' }}>
        
        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total de Licitações
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
            {biddings.length}
          </div>
        </div>

        <div style={{ background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase' }}>
            Valor Total Estimado
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginTop: '2px' }}>
            R$ {totalEstimateValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: 'rgba(0, 168, 232, 0.06)', border: '1px solid rgba(0, 168, 232, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase' }}>
            Sessões Agendadas
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--brand-cyan)', marginTop: '2px' }}>
            {totalAgendadas}
          </div>
        </div>

        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '12px', padding: '14px 16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', textTransform: 'uppercase' }}>
            Arrematadas / Vencedoras
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#8b5cf6', marginTop: '2px' }}>
            {totalVencedoras}
          </div>
        </div>

      </div>

      {/* Search & Status Filter Bar */}
      <div className="glass-card" style={{ padding: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Search Input */}
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '38px' }}
            placeholder="Buscar por Código (LIC-A0001), UASG, Licitação nº, Órgão, Objeto ou CATSER..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter Dropdown & Buttons */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: filterStatus === 'all' ? '1px solid #8b5cf6' : '1px solid var(--border-color)',
              background: filterStatus === 'all' ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-input)',
              color: filterStatus === 'all' ? '#ffffff' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            Todas ({biddings.length})
          </button>

          {Object.entries(statusLabels).map(([stKey, stObj]) => {
            const count = biddings.filter(b => b.status === stKey).length;
            const isSel = filterStatus === stKey;
            return (
              <button
                key={stKey}
                type="button"
                onClick={() => setFilterStatus(stKey)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: isSel ? `1px solid ${stObj.color}` : '1px solid var(--border-color)',
                  background: isSel ? stObj.bg : 'var(--bg-input)',
                  color: isSel ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {stObj.label} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Biddings Grid */}
      {filteredBiddings.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: '0 0 6px 0' }}>Nenhuma licitação encontrada</h3>
          <p style={{ fontSize: '0.85rem', margin: '0 0 16px 0' }}>
            {searchTerm ? 'Tente buscar com outros termos ou limpe o campo de busca.' : 'Cadastre sua primeira licitação clicando em "+ Nova Licitação" ou "⚡ Colar Alerta (E-mail)".'}
          </p>
          {onResetBiddings && (
            <button
              onClick={onResetBiddings}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                color: '#ffffff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🔄 Recarregar Licitações Padrão
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {filteredBiddings.map((bidding) => {
            const stObj = statusLabels[bidding.status] || statusLabels.agendada;

            return (
              <div
                key={bidding.id}
                className="glass-card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  border: `1px solid ${stObj.border}`,
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(23, 53, 91, 0.3))'
                }}
              >
                <div>
                  {/* Card Header: Code & Status Badges + Action Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        background: 'rgba(247, 181, 0, 0.2)',
                        color: 'var(--brand-yellow)',
                        border: '1px solid rgba(247, 181, 0, 0.4)',
                        letterSpacing: '0.5px'
                      }}>
                        {bidding.code || 'LIC-A0000'}
                      </span>

                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: stObj.bg,
                        color: stObj.color,
                        border: `1px solid ${stObj.border}`
                      }}>
                        {stObj.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleCopyBidding(bidding)}
                        title="Copiar dados da licitação"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: copiedId === bidding.id ? 'var(--success)' : 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedId === bidding.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>

                      <button
                        onClick={() => openEditBiddingModal(bidding)}
                        title="Editar licitação"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-input)',
                          color: 'var(--brand-cyan)',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit size={14} />
                      </button>

                      <button
                        onClick={() => onDeleteBidding(bidding.id)}
                        title="Excluir licitação"
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Bidding Number & Modality */}
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 2px 0', lineHeight: '1.3' }}>
                    {bidding.biddingNumber}
                  </h3>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.75rem', color: 'var(--brand-cyan)', fontWeight: 600, marginBottom: '8px' }}>
                    <span>Modalidade: {bidding.modality}</span>
                    {bidding.uasg && <span>• UASG: {bidding.uasg}</span>}
                  </div>

                  {/* Agency & CNPJ */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', marginBottom: '2px' }}>
                      <Building size={14} color="var(--brand-cyan)" />
                      <span>{bidding.agency}</span>
                    </div>
                    {bidding.agencyCnpj && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '20px' }}>
                        CNPJ do Órgão: {bidding.agencyCnpj}
                      </div>
                    )}
                  </div>

                  {/* Object Description */}
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4', marginBottom: '10px' }}>
                    <strong style={{ color: '#ffffff' }}>Do Objeto:</strong> {bidding.objectDescription}
                  </div>

                  {/* Date & Time Session Highlight Box */}
                  {(() => {
                    const sBadge = getSessionBadge(bidding.sessionDate);
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        background: sBadge ? sBadge.bg : 'rgba(247, 181, 0, 0.08)',
                        border: `1px solid ${sBadge ? sBadge.border : 'rgba(247, 181, 0, 0.25)'}`,
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: sBadge ? sBadge.color : 'var(--brand-yellow)' }}>
                          <Calendar size={14} />
                          <span>Sessão: {bidding.sessionDate ? bidding.sessionDate.split('-').reverse().join('/') : 'A definir'}</span>
                          {sBadge && (
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}>
                              {sBadge.label}
                            </span>
                          )}
                        </div>
                        {bidding.sessionTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 800, color: sBadge ? sBadge.color : 'var(--brand-yellow)' }}>
                            <Clock size={14} />
                            <span>{bidding.sessionTime}h</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Value & Platform & CATSER */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Valor Referência / Estimado:</span>
                      {Number(bidding.totalValue || 0) > 0 ? (
                        <strong style={{ fontSize: '1.05rem', color: 'var(--success)', fontWeight: 800 }}>
                          R$ {Number(bidding.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>
                          Sigiloso / A definir
                        </span>
                      )}
                    </div>

                    {bidding.platform && (
                      <div>
                        Plataforma: <strong style={{ color: 'var(--text-main)' }}>{bidding.platform}</strong>
                      </div>
                    )}

                    {bidding.catser && (
                      <div>
                        CATSER: <strong style={{ color: 'var(--text-main)' }}>{bidding.catser}</strong>
                      </div>
                    )}

                    {bidding.deliveryAddress && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={13} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>Entrega: {bidding.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Portal Action Buttons (PNCP & Alerta Licitação) */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    {bidding.pncpUrl && (
                      <a
                        href={bidding.pncpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: '#06b6d4',
                          textDecoration: 'none',
                          background: 'rgba(6, 182, 212, 0.12)',
                          border: '1px solid rgba(6, 182, 212, 0.35)',
                          borderRadius: '6px',
                          padding: '6px 10px'
                        }}
                      >
                        <Landmark size={13} /> Portal PNCP (Governo) <ExternalLink size={12} />
                      </a>
                    )}

                    {bidding.editalUrl && (
                      <a
                        href={bidding.editalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          color: 'var(--brand-yellow)',
                          textDecoration: 'none',
                          background: 'rgba(247, 181, 0, 0.1)',
                          border: '1px solid rgba(247, 181, 0, 0.3)',
                          borderRadius: '6px',
                          padding: '6px 10px'
                        }}
                      >
                        <Globe size={13} /> Alerta Licitação <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  {/* Notes */}
                  {bidding.notes && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      lineHeight: '1.3'
                    }}>
                      📝 {bidding.notes}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Form: Add / Edit Bidding */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '740px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #8b5cf6'
          }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Award size={22} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  {editingBidding ? `Editar Licitação (${editingBidding.code})` : 'Novo Cadastro de Licitação'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Bidding Number, UASG & Modality */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.2fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Número da Licitação *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: Contratação Direta 199/2026"
                    value={formData.biddingNumber}
                    onChange={(e) => setFormData({ ...formData, biddingNumber: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">UASG (Código)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 986969"
                    value={formData.uasg}
                    onChange={(e) => setFormData({ ...formData, uasg: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Modalidade</label>
                  <select
                    className="form-select"
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value })}
                  >
                    <option value="Pregão Eletrônico">Pregão Eletrônico</option>
                    <option value="Dispensa de Licitação">Dispensa de Licitação</option>
                    <option value="Concorrência Eletrônica">Concorrência Eletrônica</option>
                    <option value="Inexigibilidade">Inexigibilidade</option>
                    <option value="Tomada de Preços">Tomada de Preços</option>
                    <option value="Leilão">Leilão</option>
                  </select>
                </div>
              </div>

              {/* CRM Agency Selector */}
              {clients.length > 0 && (
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} /> Selecionar Órgão da Base de Clientes (CRM):
                  </span>
                  <select
                    className="form-select"
                    style={{ maxWidth: '280px', padding: '6px 10px', fontSize: '0.8rem' }}
                    value={selectedClientId}
                    onChange={(e) => handleSelectAgencyFromCRM(e.target.value)}
                  >
                    <option value="">-- Selecionar do CRM --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>[{c.code || 'CLI-A0000'}] {c.tradeName || c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Agency & CNPJ */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Órgão Contratante *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Ex: MUNICIPIO DE RIBEIRAO PRETO"
                    value={formData.agency}
                    onChange={(e) => setFormData({ ...formData, agency: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CNPJ do Órgão</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="56.024.581/0001-56"
                    value={formData.agencyCnpj}
                    onChange={(e) => setFormData({ ...formData, agencyCnpj: e.target.value })}
                  />
                </div>
              </div>

              {/* Do Objeto */}
              <div className="form-group">
                <label className="form-label">Do Objeto (Descrição dos Impressos / Serviços) *</label>
                <textarea
                  required
                  className="form-input"
                  rows="3"
                  placeholder="Ex: Registro de preços para confecção de cartilhas, agendas e envelopes de provas..."
                  value={formData.objectDescription}
                  onChange={(e) => setFormData({ ...formData, objectDescription: e.target.value })}
                />
              </div>

              {/* Links do Edital (PNCP & Alerta Licitação) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Link do PNCP (Governo)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Ex: https://pncp.gov.br/app/editais/56024581000156/2026/374"
                    value={formData.pncpUrl}
                    onChange={(e) => setFormData({ ...formData, pncpUrl: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link do Alerta Licitação</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="Ex: https://alertalicitacao.com.br/!licitacao/PNCP-56024581000156-1-000374-2026"
                    value={formData.editalUrl}
                    onChange={(e) => setFormData({ ...formData, editalUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Value, Session Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Valor Total / Referência (R$)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 855.00"
                    value={formData.totalValue}
                    onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data da Sessão</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.sessionDate}
                    onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Horário</label>
                  <input
                    type="time"
                    className="form-input"
                    value={formData.sessionTime}
                    onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Status da Licitação</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="agendada">Agendada</option>
                    <option value="em_disputa">Em Disputa / Pregão</option>
                    <option value="proposta_enviada">Proposta Enviada</option>
                    <option value="vencedora">Arrematada / Vencedora</option>
                    <option value="homologada">Homologada</option>
                    <option value="fracassada">Deserta / Fracassada</option>
                    <option value="cancelada">Cancelada / Revogada</option>
                  </select>
                </div>
              </div>

              {/* CATSER & Platform */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">CATSER / CATMAT</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 24180 - CONFECÇÃO DE IMPRESSOS EM GERAL"
                    value={formData.catser}
                    onChange={(e) => setFormData({ ...formData, catser: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plataforma ou Local</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Compras.gov.br (Comprasnet), Licitações-e, PNCP, BLL"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div className="form-group">
                <label className="form-label">Local de Entrega do Objeto</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ex: Ribeirão Preto (SP)"
                  value={formData.deliveryAddress}
                  onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="form-group">
                <label className="form-label">Observações Técnicas / Edital</label>
                <textarea
                  className="form-input"
                  rows="2"
                  placeholder="Ex: Exige amostras prévias, garantia de proposta de 5%, prazos de faturamento, etc."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: '#ffffff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {editingBidding ? 'Salvar Alterações' : 'Cadastrar Licitação'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal: Smart Email Alert Parser */}
      {isImportModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '680px',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid var(--brand-yellow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={22} color="var(--brand-yellow)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                  Importar Licitação do Governo (PNCP / Compras.gov)
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setImportMode('edital_uasg')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: importMode === 'edital_uasg' ? 'linear-gradient(135deg, var(--brand-yellow), #d99b00)' : 'transparent',
                  color: importMode === 'edital_uasg' ? '#000000' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Landmark size={15} /> Por Edital nº & Unidade (UASG)
              </button>
              <button
                type="button"
                onClick={() => setImportMode('email_text')}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: importMode === 'email_text' ? 'linear-gradient(135deg, var(--brand-yellow), #d99b00)' : 'transparent',
                  color: importMode === 'email_text' ? '#000000' : 'var(--text-muted)',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s'
                }}
              >
                <Mail size={15} /> Colar Texto / E-mail do Alerta
              </button>
            </div>

            {/* Content: Mode Edital + UASG */}
            {importMode === 'edital_uasg' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(247, 181, 0, 0.08)', border: '1px solid rgba(247, 181, 0, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: '1.4' }}>
                    💡 <strong>Consulta Automática Direta:</strong> Informe apenas o número do edital e o código da unidade compradora (UASG). O sistema busca o órgão oficial, valor, datas, objeto e especificações diretamente na base do <strong>PNCP</strong> e <strong>Compras.gov.br</strong>!
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--brand-yellow)" /> Número do Edital *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: Edital nº 179/2026 ou 179"
                      value={inputEdital}
                      onChange={(e) => setInputEdital(e.target.value)}
                      autoFocus
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Exemplo: <strong>Edital nº 179/2026</strong>
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} color="var(--brand-cyan)" /> Unidade Compradora / UASG *
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: 102174"
                      value={inputUasg}
                      onChange={(e) => setInputUasg(e.target.value)}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Código de 5 ou 6 dígitos da unidade (ex: <strong>102174</strong>)
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Content: Mode Colar Texto */
              <>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 0, marginBottom: '10px', lineHeight: '1.4' }}>
                  Cole abaixo o <strong>texto ou link do Alerta Licitação / PNCP</strong>. O sistema reconhece os dados automaticamente:
                </p>

                <textarea
                  className="form-input"
                  rows="7"
                  placeholder="Cole aqui o texto completo ou link do Alerta Licitação / PNCP..."
                  value={rawAlertText}
                  onChange={(e) => setRawAlertText(e.target.value)}
                  style={{ fontSize: '0.85rem', fontFamily: 'monospace', marginBottom: '12px' }}
                />

                {/* Live Parsing Preview */}
                {parsedPreview && (
                  <div style={{
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(247, 181, 0, 0.35)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--brand-yellow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Eye size={14} /> Prévia da Leitura Automática:
                      </span>
                      {rawAlertText.includes('pncp.gov.br') && (
                        <span style={{ fontSize: '0.7rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.15)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          🌐 Link Oficial PNCP Detectado
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {parsedPreview.biddingNumber ? <CheckCircle size={14} color="var(--success)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                        <span style={{ color: 'var(--text-muted)' }}>Licitação:</span>
                        <strong style={{ color: '#fff' }}>{parsedPreview.biddingNumber || 'Não detectado'}</strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {parsedPreview.agency || parsedPreview.agencyCnpj ? <CheckCircle size={14} color="var(--success)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                        <span style={{ color: 'var(--text-muted)' }}>Órgão:</span>
                        <strong style={{ color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px' }}>
                          {parsedPreview.agency || (parsedPreview.agencyCnpj ? `CNPJ ${parsedPreview.agencyCnpj}` : 'Não detectado')}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {parsedPreview.sessionDate ? <CheckCircle size={14} color="var(--success)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                        <span style={{ color: 'var(--text-muted)' }}>Sessão:</span>
                        <strong style={{ color: 'var(--brand-cyan)' }}>
                          {parsedPreview.sessionDate ? `${parsedPreview.sessionDate.split('-').reverse().join('/')} às ${parsedPreview.sessionTime || '09:00'}h` : 'A definir'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {parsedPreview.totalValue ? <CheckCircle size={14} color="var(--success)" /> : <AlertCircle size={14} color="var(--text-muted)" />}
                        <span style={{ color: 'var(--text-muted)' }}>Valor:</span>
                        <strong style={{ color: 'var(--success)' }}>
                          {parsedPreview.totalValue ? `R$ ${parseBrlCurrencyToFloat(parsedPreview.totalValue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Sigiloso / Não informado'}
                        </strong>
                      </div>

                      {parsedPreview.uasg && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={14} color="var(--success)" />
                          <span style={{ color: 'var(--text-muted)' }}>UASG:</span>
                          <strong style={{ color: '#fff' }}>{parsedPreview.uasg}</strong>
                        </div>
                      )}

                      {parsedPreview.catser && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CheckCircle size={14} color="var(--success)" />
                          <span style={{ color: 'var(--text-muted)' }}>CATSER:</span>
                          <strong style={{ color: '#fff' }}>{parsedPreview.catser}</strong>
                        </div>
                      )}
                    </div>

                    {parsedPreview.items && parsedPreview.items.length > 0 && (
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px', marginTop: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontWeight: 700, color: 'var(--brand-cyan)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Package size={13} /> {parsedPreview.items.length} item(ns) / lote(s) detectado(s):
                        </span>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-main)', marginTop: '2px', maxHeight: '60px', overflowY: 'auto' }}>
                          {parsedPreview.items.map((it, idx) => (
                            <div key={idx}>• Item {it.num}: {it.description} {it.quantity ? `(${it.quantity} ${it.unit || 'un'})` : ''}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isFetchingCnjp}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleExecuteImportAlert}
                disabled={isFetchingCnjp}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, var(--brand-yellow), #d99b00)',
                  color: '#000000',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isFetchingCnjp ? (
                  <>
                    <Loader2 size={16} className="spin" /> Consultando PNCP / Compras.gov...
                  </>
                ) : (
                  <>
                    <Zap size={16} /> {importMode === 'edital_uasg' ? 'Buscar no PNCP e Importar' : 'Processar Alerta e Abrir Cadastro'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
