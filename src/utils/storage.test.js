import { describe, it, expect, beforeEach } from 'vitest';
import { STORAGE_KEYS, BACKUP_KEYS, buildBackup, restoreBackup, loadJSON } from './storage';

// localStorage em memória (o Vitest roda em Node, sem navegador).
beforeEach(() => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem: (k) => (mem.has(k) ? mem.get(k) : null),
    setItem: (k, v) => mem.set(k, String(v)),
    removeItem: (k) => mem.delete(k),
    clear: () => mem.clear()
  };
});

describe('backup', () => {
  it('todas as chaves de dados do app entram no backup (inclui financeiro e atalhos do PNCP)', () => {
    for (const key of Object.values(STORAGE_KEYS)) expect(BACKUP_KEYS).toContain(key);
    expect(BACKUP_KEYS).toContain('jetaflow_pncp_atalhos_v2');
    expect(BACKUP_KEYS).toContain('jetaflow_finance_v1');
  });

  it('exporta e restaura os atalhos do PNCP', () => {
    const atalhos = [{ label: 'Banners', term: 'Banner' }];
    localStorage.setItem(STORAGE_KEYS.pncpShortcuts, JSON.stringify(atalhos));
    const backup = buildBackup();
    expect(backup.data[STORAGE_KEYS.pncpShortcuts]).toEqual(atalhos);

    localStorage.clear();
    restoreBackup(backup);
    expect(loadJSON(STORAGE_KEYS.pncpShortcuts, null)).toEqual(atalhos);
  });

  it('mesclar não duplica itens sem id e mescla por id os que têm', () => {
    localStorage.setItem(STORAGE_KEYS.pncpShortcuts, JSON.stringify([{ label: 'A', term: 'a' }, { label: 'B', term: 'b' }]));
    localStorage.setItem(STORAGE_KEYS.finance, JSON.stringify([{ id: 'f1', amount: 10 }]));
    restoreBackup({ data: {
      [STORAGE_KEYS.pncpShortcuts]: [{ label: 'B', term: 'b' }, { label: 'C', term: 'c' }],
      [STORAGE_KEYS.finance]: [{ id: 'f1', amount: 99 }, { id: 'f2', amount: 5 }]
    } }, { merge: true });
    expect(loadJSON(STORAGE_KEYS.pncpShortcuts, []).map(s => s.label)).toEqual(['A', 'B', 'C']);
    expect(loadJSON(STORAGE_KEYS.finance, [])).toEqual([{ id: 'f1', amount: 99 }, { id: 'f2', amount: 5 }]);
  });

  it('ignora chaves desconhecidas', () => {
    expect(restoreBackup({ data: { outra_coisa: [1], [STORAGE_KEYS.finance]: [] } })).toEqual([STORAGE_KEYS.finance]);
  });
});
