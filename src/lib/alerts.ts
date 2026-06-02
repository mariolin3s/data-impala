import { AlertEvent } from '@/types/alert';

/**
 * Normaliza el form_name a un valor canónico.
 * Eventos que solo viven en un único flujo no llevan este parámetro,
 * por lo que null, '', 'null', 'undefined' o '(not set)' se tratan como "sin formulario" ('').
 */
export function normalizeFormName(value?: string | null): string {
  if (value === null || value === undefined) return '';
  const trimmed = String(value).trim();
  if (
    trimmed === '' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed === '(not set)'
  ) {
    return '';
  }
  return trimmed;
}

/** True cuando el form_name tiene un valor real (no es un evento de flujo único). */
export function hasFormName(value?: string | null): boolean {
  return normalizeFormName(value) !== '';
}

/**
 * Una "serie" de alerta se identifica por evento + form_name + plataforma.
 * El mismo evento se recicla en distintos flujos y se distingue por form_name.
 */
export function sameSeries(a: AlertEvent, b: AlertEvent): boolean {
  return (
    a.event === b.event &&
    a.platform === b.platform &&
    normalizeFormName(a.form_name) === normalizeFormName(b.form_name)
  );
}
