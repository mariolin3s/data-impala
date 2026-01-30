export type AlertStatus = 'verde' | 'naranja' | 'rojo';

export interface AlertEvent {
  date: string;
  event: string;
  platform: string;
  event_count: number;
  weekday: string;
  id: string;
  status: AlertStatus;
  alerta_info: string;
  mediana: number;
  max: number;
  minimo: number;
}

export interface AlertSummary {
  total: number;
  success: number;
  warning: number;
  critical: number;
}

export interface GroupedAlerts {
  [platform: string]: AlertEvent[];
}
