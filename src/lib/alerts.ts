import { AlertEvent } from '@/types/alert';
import { parseISO, subDays, format } from 'date-fns';

/**
 * Nº de días consecutivos en 'rojo' que definen un evento "estancado".
 * IMPORTANTE: para evaluar correctamente esta condición se necesita disponer
 * de los `STAGNANT_DAYS - 1` días previos al primer día visible; por eso el
 * hook `useAlerts` carga un buffer de histórico anterior al rango seleccionado.
 */
export const STAGNANT_DAYS = 7;

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

/**
 * True cuando la serie evento+form_name+plataforma lleva `days` días
 * consecutivos en 'rojo' hasta la fecha del alert (incluida).
 *
 * `history` debe incluir los días previos al rango visible (buffer de useAlerts);
 * de lo contrario, los eventos evaluados cerca del inicio del rango no pueden
 * confirmar la racha completa y se clasificarían erróneamente como "activos".
 *
 * Usa `parseISO` (fecha local) de forma consistente para evitar desfases de zona horaria.
 */
export function isStagnantAlert(
  alert: AlertEvent,
  history: AlertEvent[],
  days: number = STAGNANT_DAYS
): boolean {
  if (alert.status !== 'rojo') return false;
  const alertDate = parseISO(alert.date);
  for (let i = 0; i < days; i++) {
    const day = format(subDays(alertDate, i), 'yyyy-MM-dd');
    const hasRojo = history.some(
      (a) => a.date === day && sameSeries(a, alert) && a.status === 'rojo'
    );
    if (!hasRojo) return false;
  }
  return true;
}

/**
 * True cuando la serie no tenía alerta (naranja/rojo) el día anterior,
 * es decir, es una alerta "nueva" respecto a ayer.
 * Requiere el día previo en `history` para no marcar como "Nuevo" un evento
 * que en realidad venía en alerta desde antes del rango visible.
 */
export function isNewAlert(alert: AlertEvent, history: AlertEvent[]): boolean {
  if (alert.status === 'verde') return false;
  const prevDate = format(subDays(parseISO(alert.date), 1), 'yyyy-MM-dd');
  const hadAlertYesterday = history.some(
    (a) =>
      a.date === prevDate &&
      sameSeries(a, alert) &&
      (a.status === 'naranja' || a.status === 'rojo')
  );
  return !hadAlertYesterday;
}
