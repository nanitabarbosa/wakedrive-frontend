export type EmptyStateKind = 'empty' | 'search' | 'error';

export interface EmptyStateStyle {
  icon: string;
  title: string;
  tone: 'neutral' | 'danger';
}

export const EMPTY_STATE_STYLES: Record<EmptyStateKind, EmptyStateStyle> = {
  empty: { icon: 'inbox', title: 'Nada por mostrar', tone: 'neutral' },
  search: { icon: 'search_off', title: 'Sin resultados', tone: 'neutral' },
  error: { icon: 'cloud_off', title: 'No se pudo cargar', tone: 'danger' },
};
