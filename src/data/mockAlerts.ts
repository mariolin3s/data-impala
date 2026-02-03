import { AlertEvent } from '@/types/alert';

// Generate mock weekly data for trend analysis
export const mockAlerts: AlertEvent[] = [
  // 2026-01-29 (Wednesday)
  {
    date: '2026-01-29',
    event: 'page_view',
    platform: 'web',
    event_count: 45230,
    weekday: 'Wednesday',
    id: 'pv_web_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 42000,
    max: 50000,
    minimo: 35000,
  },
  {
    date: '2026-01-29',
    event: 'purchase',
    platform: 'web',
    event_count: 890,
    weekday: 'Wednesday',
    id: 'pur_web_001',
    status: 'rojo',
    alerta_info: 'Caída crítica: 890 eventos vs mínimo esperado 1200 (-25.8%)',
    mediana: 1500,
    max: 1800,
    minimo: 1200,
  },
  {
    date: '2026-01-29',
    event: 'add_to_cart',
    platform: 'web',
    event_count: 3200,
    weekday: 'Wednesday',
    id: 'atc_web_001',
    status: 'naranja',
    alerta_info: 'Desviación moderada: 3200 eventos vs mínimo esperado 3800 (-15.8%)',
    mediana: 4200,
    max: 5000,
    minimo: 3800,
  },
  {
    date: '2026-01-29',
    event: 'page_view',
    platform: 'ios',
    event_count: 28500,
    weekday: 'Wednesday',
    id: 'pv_ios_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 27000,
    max: 32000,
    minimo: 22000,
  },
  {
    date: '2026-01-29',
    event: 'session_start',
    platform: 'ios',
    event_count: 18200,
    weekday: 'Wednesday',
    id: 'ss_ios_001',
    status: 'naranja',
    alerta_info: 'Desviación por encima: 18200 eventos vs máximo esperado 15000 (+21.3%)',
    mediana: 12000,
    max: 15000,
    minimo: 9000,
  },
  {
    date: '2026-01-29',
    event: 'purchase',
    platform: 'ios',
    event_count: 560,
    weekday: 'Wednesday',
    id: 'pur_ios_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 520,
    max: 650,
    minimo: 400,
  },
  {
    date: '2026-01-29',
    event: 'page_view',
    platform: 'android',
    event_count: 22100,
    weekday: 'Wednesday',
    id: 'pv_and_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 21000,
    max: 26000,
    minimo: 17000,
  },
  {
    date: '2026-01-29',
    event: 'sign_up',
    platform: 'android',
    event_count: 145,
    weekday: 'Wednesday',
    id: 'su_and_001',
    status: 'rojo',
    alerta_info: 'Caída crítica: 145 eventos vs mínimo esperado 280 (-48.2%)',
    mediana: 350,
    max: 420,
    minimo: 280,
  },
  {
    date: '2026-01-29',
    event: 'add_to_cart',
    platform: 'android',
    event_count: 1850,
    weekday: 'Wednesday',
    id: 'atc_and_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 1800,
    max: 2200,
    minimo: 1400,
  },
  {
    date: '2026-01-29',
    event: 'begin_checkout',
    platform: 'web',
    event_count: 2100,
    weekday: 'Wednesday',
    id: 'bc_web_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 2000,
    max: 2500,
    minimo: 1600,
  },
  {
    date: '2026-01-29',
    event: 'login',
    platform: 'web',
    event_count: 8900,
    weekday: 'Wednesday',
    id: 'log_web_001',
    status: 'naranja',
    alerta_info: 'Desviación por encima: 8900 eventos vs máximo esperado 7500 (+18.7%)',
    mediana: 6000,
    max: 7500,
    minimo: 4500,
  },
  {
    date: '2026-01-29',
    event: 'view_item',
    platform: 'ios',
    event_count: 12300,
    weekday: 'Wednesday',
    id: 'vi_ios_001',
    status: 'verde',
    alerta_info: 'Valores dentro del rango esperado',
    mediana: 11500,
    max: 14000,
    minimo: 9000,
  },
];

// Weekly trend data for charts
export interface TrendDataPoint {
  date: string;
  dayName: string;
  web: number;
  ios: number;
  android: number;
  total: number;
}

export const weeklyTrendData: TrendDataPoint[] = [
  { date: '2026-01-23', dayName: 'Jue', web: 52000, ios: 31000, android: 24000, total: 107000 },
  { date: '2026-01-24', dayName: 'Vie', web: 48000, ios: 29000, android: 22000, total: 99000 },
  { date: '2026-01-25', dayName: 'Sáb', web: 35000, ios: 22000, android: 18000, total: 75000 },
  { date: '2026-01-26', dayName: 'Dom', web: 32000, ios: 20000, android: 16000, total: 68000 },
  { date: '2026-01-27', dayName: 'Lun', web: 55000, ios: 32000, android: 25000, total: 112000 },
  { date: '2026-01-28', dayName: 'Mar', web: 53000, ios: 30000, android: 24000, total: 107000 },
  { date: '2026-01-29', dayName: 'Mié', web: 45230, ios: 28500, android: 22100, total: 95830 },
];

export interface EventTrendData {
  date: string;
  dayName: string;
  value: number;
  mediana?: number;
  min: number;
  max: number;
  status: 'verde' | 'naranja' | 'rojo' | 'gris';
}

export const getEventTrendData = (eventName: string, platform?: string): EventTrendData[] => {
  // Simulated data for different events
  const trendsByEvent: Record<string, EventTrendData[]> = {
    page_view: [
      { date: '2026-01-23', dayName: 'Jue', value: 48000, min: 35000, max: 50000, status: 'verde' },
      { date: '2026-01-24', dayName: 'Vie', value: 46000, min: 35000, max: 50000, status: 'verde' },
      { date: '2026-01-25', dayName: 'Sáb', value: 32000, min: 25000, max: 40000, status: 'verde' },
      { date: '2026-01-26', dayName: 'Dom', value: 30000, min: 25000, max: 40000, status: 'verde' },
      { date: '2026-01-27', dayName: 'Lun', value: 52000, min: 35000, max: 50000, status: 'naranja' },
      { date: '2026-01-28', dayName: 'Mar', value: 47000, min: 35000, max: 50000, status: 'verde' },
      { date: '2026-01-29', dayName: 'Mié', value: 45230, min: 35000, max: 50000, status: 'verde' },
    ],
    purchase: [
      { date: '2026-01-23', dayName: 'Jue', value: 1650, min: 1200, max: 1800, status: 'verde' },
      { date: '2026-01-24', dayName: 'Vie', value: 1720, min: 1200, max: 1800, status: 'verde' },
      { date: '2026-01-25', dayName: 'Sáb', value: 1100, min: 800, max: 1400, status: 'verde' },
      { date: '2026-01-26', dayName: 'Dom', value: 950, min: 800, max: 1400, status: 'verde' },
      { date: '2026-01-27', dayName: 'Lun', value: 1580, min: 1200, max: 1800, status: 'verde' },
      { date: '2026-01-28', dayName: 'Mar', value: 1420, min: 1200, max: 1800, status: 'verde' },
      { date: '2026-01-29', dayName: 'Mié', value: 890, min: 1200, max: 1800, status: 'rojo' },
    ],
    add_to_cart: [
      { date: '2026-01-23', dayName: 'Jue', value: 4500, min: 3800, max: 5000, status: 'verde' },
      { date: '2026-01-24', dayName: 'Vie', value: 4800, min: 3800, max: 5000, status: 'verde' },
      { date: '2026-01-25', dayName: 'Sáb', value: 3200, min: 2500, max: 4000, status: 'verde' },
      { date: '2026-01-26', dayName: 'Dom', value: 2900, min: 2500, max: 4000, status: 'verde' },
      { date: '2026-01-27', dayName: 'Lun', value: 4600, min: 3800, max: 5000, status: 'verde' },
      { date: '2026-01-28', dayName: 'Mar', value: 4200, min: 3800, max: 5000, status: 'verde' },
      { date: '2026-01-29', dayName: 'Mié', value: 3200, min: 3800, max: 5000, status: 'naranja' },
    ],
    sign_up: [
      { date: '2026-01-23', dayName: 'Jue', value: 380, min: 280, max: 420, status: 'verde' },
      { date: '2026-01-24', dayName: 'Vie', value: 350, min: 280, max: 420, status: 'verde' },
      { date: '2026-01-25', dayName: 'Sáb', value: 220, min: 180, max: 300, status: 'verde' },
      { date: '2026-01-26', dayName: 'Dom', value: 190, min: 180, max: 300, status: 'verde' },
      { date: '2026-01-27', dayName: 'Lun', value: 320, min: 280, max: 420, status: 'verde' },
      { date: '2026-01-28', dayName: 'Mar', value: 290, min: 280, max: 420, status: 'verde' },
      { date: '2026-01-29', dayName: 'Mié', value: 145, min: 280, max: 420, status: 'rojo' },
    ],
  };

  return trendsByEvent[eventName] || trendsByEvent.page_view;
};

// Historical status distribution for the last 14 days
export interface DailyStatusData {
  date: string;
  dayName: string;
  verde: number;
  naranja: number;
  rojo: number;
  total: number;
}

export const dailyStatusHistory: DailyStatusData[] = [
  { date: '2026-01-16', dayName: '16 Ene', verde: 18, naranja: 3, rojo: 1, total: 22 },
  { date: '2026-01-17', dayName: '17 Ene', verde: 20, naranja: 2, rojo: 0, total: 22 },
  { date: '2026-01-18', dayName: '18 Ene', verde: 17, naranja: 4, rojo: 1, total: 22 },
  { date: '2026-01-19', dayName: '19 Ene', verde: 19, naranja: 2, rojo: 1, total: 22 },
  { date: '2026-01-20', dayName: '20 Ene', verde: 21, naranja: 1, rojo: 0, total: 22 },
  { date: '2026-01-21', dayName: '21 Ene', verde: 16, naranja: 4, rojo: 2, total: 22 },
  { date: '2026-01-22', dayName: '22 Ene', verde: 18, naranja: 3, rojo: 1, total: 22 },
  { date: '2026-01-23', dayName: '23 Ene', verde: 20, naranja: 2, rojo: 0, total: 22 },
  { date: '2026-01-24', dayName: '24 Ene', verde: 19, naranja: 2, rojo: 1, total: 22 },
  { date: '2026-01-25', dayName: '25 Ene', verde: 17, naranja: 3, rojo: 2, total: 22 },
  { date: '2026-01-26', dayName: '26 Ene', verde: 18, naranja: 3, rojo: 1, total: 22 },
  { date: '2026-01-27', dayName: '27 Ene', verde: 15, naranja: 5, rojo: 2, total: 22 },
  { date: '2026-01-28', dayName: '28 Ene', verde: 19, naranja: 2, rojo: 1, total: 22 },
  { date: '2026-01-29', dayName: '29 Ene', verde: 8, naranja: 3, rojo: 2, total: 13 },
];
