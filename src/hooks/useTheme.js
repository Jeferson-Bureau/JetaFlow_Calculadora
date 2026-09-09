import { useCallback, useEffect, useState } from 'react';

const KEY = 'jetaflow_theme';
export const THEME_OPTIONS = ['light', 'dark', 'system'];

/** Aplica o tema ao <html>: 'light'/'dark' fixam data-theme, 'system' remove. */
export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
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
