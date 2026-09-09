import { useCallback, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

/**
 * useState que persiste automaticamente no localStorage a cada alteração.
 * Leitura inicial é tolerante a falhas (localStorage corrompido/indisponível
 * cai no valor padrão em vez de derrubar a aplicação).
 *
 * @param {string} key            chave do localStorage
 * @param {*|function} initialValue valor padrão (ou função que o produz)
 */
export function usePersistentState(key, initialValue) {
  const [state, setState] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
    return loadJSON(key, fallback);
  });

  const setPersistent = useCallback((value) => {
    setState((prev) => {
      const next = typeof value === 'function' ? value(prev) : value;
      saveJSON(key, next);
      return next;
    });
  }, [key]);

  return [state, setPersistent];
}
