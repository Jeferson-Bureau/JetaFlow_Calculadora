// Central de persistência local do JetaFlow.
// Todas as chaves ativas ficam registradas aqui para leitura segura e para
// o backup/restore completo dos dados do usuário (CRM, orçamentos, licitações, preços).

export const STORAGE_KEYS = {
  quotes: 'jetaflow_quotes_v1',
  papers: 'jetaflow_papers',
  clicks: 'jetaflow_clicks',
  offset: 'jetaflow_offset',
  finishings: 'jetaflow_finishings',
  financial: 'jetaflow_financial',
  clients: 'jetaflow_clients_v2',
  suppliers: 'jetaflow_suppliers_v2',
  biddings: 'jetaflow_biddings_v3'
};

// Chaves que compõem um backup completo. Inclui variações antigas para
// não perder dados de instalações que ainda não migraram.
export const BACKUP_KEYS = [
  ...Object.values(STORAGE_KEYS),
  'jetaflow_clients',
  'jetaflow_suppliers',
  'jetaflow_biddings',
  'jetaflow_biddings_v1',
  'jetaflow_biddings_v2'
];

/**
 * Lê e faz parse de uma chave do localStorage sem nunca lançar exceção.
 * localStorage corrompido, indisponível (modo privativo) ou JSON inválido
 * retorna o fallback em vez de derrubar a aplicação.
 */
export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return parsed == null ? fallback : parsed;
  } catch (err) {
    console.error(`[storage] Falha ao ler "${key}":`, err);
    return fallback;
  }
}

/** Grava um valor como JSON sem lançar exceção. Retorna true em caso de sucesso. */
export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] Falha ao gravar "${key}":`, err);
    return false;
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`[storage] Falha ao remover "${key}":`, err);
  }
}

// ── Backup / Restore ──────────────────────────────────────────────────────

/** Monta um objeto de backup com todas as chaves de dados presentes. */
export function buildBackup() {
  const data = {};
  for (const key of BACKUP_KEYS) {
    let raw = null;
    try {
      raw = localStorage.getItem(key);
    } catch (err) {
      console.error(`[storage] Falha ao ler "${key}" no backup:`, err);
    }
    if (raw == null) continue;
    try {
      data[key] = JSON.parse(raw);
    } catch {
      data[key] = raw;
    }
  }
  return {
    _app: 'JetaFlow Calculadora',
    _schema: 1,
    _exportedAt: new Date().toISOString(),
    data
  };
}

/** Dispara o download de um arquivo .json com o backup completo. */
export function downloadBackup() {
  const backup = buildBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `jetaflow-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Aplica um backup ao localStorage.
 * @param {object} parsed  - Conteúdo do arquivo (aceita o envelope completo ou só o mapa de chaves).
 * @param {object} [opts]
 * @param {boolean} [opts.merge=false] - Se true, mescla listas por `id` em vez de substituir.
 * @returns {string[]} chaves efetivamente aplicadas
 */
export function restoreBackup(parsed, { merge = false } = {}) {
  const payload = parsed && typeof parsed === 'object' && parsed.data ? parsed.data : parsed;
  if (!payload || typeof payload !== 'object') {
    throw new Error('Arquivo de backup inválido: estrutura não reconhecida.');
  }

  const applied = [];
  for (const key of Object.keys(payload)) {
    if (!BACKUP_KEYS.includes(key)) continue;
    const incoming = payload[key];

    if (merge && Array.isArray(incoming)) {
      const current = loadJSON(key, []);
      const byId = new Map();
      const all = [...(Array.isArray(current) ? current : []), ...incoming];
      all.forEach((item, idx) => {
        const id = item && item.id != null ? item.id : `__idx_${idx}`;
        byId.set(id, item);
      });
      saveJSON(key, Array.from(byId.values()));
    } else {
      saveJSON(key, incoming);
    }
    applied.push(key);
  }

  if (applied.length === 0) {
    throw new Error('Nenhuma chave de dados reconhecida no arquivo de backup.');
  }
  return applied;
}
