import { useCallback, useEffect, useState } from 'react';

const KEY = 'jetaflow_theme';
export const THEME_OPTIONS = ['light', 'dark', 'system'];

/**
 * Resolve o tema para um data-theme SEMPRE explícito ('light' | 'dark') no
 * <html>. Em 'system', lê a preferência do SO. Assim o CSS só precisa de
 * :root (claro) + :root[data-theme="dark"], sem bloco @media duplicado.
 */
export function applyTheme(theme) {
  const resolved =
    theme === 'light' || theme === 'dark'
      ? theme
      : window.matchMedia?.('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  document.documentElement.setAttribute('data-theme', resolved);
}

export function getStoredTheme() {
  try {
    const v = localStorage.getItem(KEY);
    return THEME_OPTIONS.includes(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(getStoredTheme);

  const setTheme = useCallback((next) => {
    const value = THEME_OPTIONS.includes(next) ? next : 'system';
    setThemeState(value);
    try { localStorage.setItem(KEY, value); } catch { /* modo privativo */ }
    applyTheme(value);
  }, []);

  // Reflete mudança de tema do SO enquanto o usuário está em "Sistema".
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => { if (getStoredTheme() === 'system') applyTheme('system'); };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  return { theme, setTheme };
}
