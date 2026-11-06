import { WritableSignal, effect, signal } from '@angular/core';

const PREFIX = 'filters.';

/**
 * Signal cuyo valor se conserva en sessionStorage, para que los filtros
 * sobrevivan al cambiar de pantalla o recargar. Debe crearse en un contexto
 * de inyección (p. ej. como campo de un componente).
 */
export function persistedSignal<T>(key: string, initial: T): WritableSignal<T> {
  const storageKey = PREFIX + key;
  const state = signal<T>(read(storageKey, initial));
  effect(() => {
    const value = state();
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(value));
    } catch {}
  });
  return state;
}

/** Borra todos los filtros guardados (p. ej. al cerrar sesión). */
export function clearPersistedFilters(): void {
  try {
    Object.keys(sessionStorage)
      .filter(key => key.startsWith(PREFIX))
      .forEach(key => sessionStorage.removeItem(key));
  } catch {}
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
