import { useState } from 'react';
import { AlertEvent } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { TrendChart } from './TrendChart';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, Apple, Smartphone, Monitor, Sparkles, Clock } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { SortBy, SortDir } from './AlertFilters';

interface EventGridProps {
  alerts: AlertEvent[];
  originalAlerts: AlertEvent[];
  dateRange?: DateRange;
  sortBy?: SortBy;
  sortDir?: SortDir;
}

const platformConfig: Record<string, { label: string; icon: any; color: string; bgColor: string; order: number }> = {
  android: {
    label: 'Android',
    icon: Smartphone,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    order: 0,
  },
  ios: {
    label: 'iOS',
    icon: Apple,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/20',
    order: 1,
  },
  web: {
    label: 'Web',
    icon: Monitor,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    order: 2,
  },
};

const statusOrder: Record<string, number> = { rojo: 0, naranja: 1, verde: 2 };

/** Returns true if this alert is "new" — the same event+platform had no alert (naranja/rojo) the day before. */
function isNewAlert(alert: AlertEvent, allAlerts: AlertEvent[]): boolean {
  if (alert.status === 'verde') return false;
  const prevDate = format(subDays(parseISO(alert.date), 1), 'yyyy-MM-dd');
  const hadAlertYesterday = allAlerts.some(
    (a) =>
      a.date === prevDate &&
      a.event === alert.event &&
      a.platform === alert.platform &&
      (a.status === 'naranja' || a.status === 'rojo')
  );
  return !hadAlertYesterday;
}

/** Returns true if this event+platform has been in 'rojo' for 7 consecutive days up to the alert date. */
function isStagnantAlert(alert: AlertEvent, allAlerts: AlertEvent[]): boolean {
  if (alert.status !== 'rojo') return false;
  const alertDate = parseISO(alert.date);
  for (let i = 0; i < 7; i++) {
    const day = format(subDays(alertDate, i), 'yyyy-MM-dd');
    const hasRojo = allAlerts.some(
      (a) =>
        a.date === day &&
        a.event === alert.event &&
        a.platform === alert.platform &&
        a.status === 'rojo'
    );
    if (!hasRojo) return false;
  }
  return true;
}

function sortAlerts(alerts: AlertEvent[], sortBy: SortBy, sortDir: SortDir): AlertEvent[] {
  const dir = sortDir === 'asc' ? 1 : -1;

  return [...alerts].sort((a, b) => {
    switch (sortBy) {
      case 'platform_event': {
        const platformDiff =
          (platformConfig[a.platform]?.order ?? 99) - (platformConfig[b.platform]?.order ?? 99);
        if (platformDiff !== 0) return platformDiff * dir;
        return a.event.localeCompare(b.event) * dir;
      }
      case 'event_name':
        return a.event.localeCompare(b.event) * dir;
      case 'severity': {
        const severityDiff = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
        if (severityDiff !== 0) return severityDiff * dir;
        return a.event.localeCompare(b.event);
      }
      case 'deviation': {
        const deviationA =
          a.mediana === 0 ? (a.event_count > 0 ? 100 : 0) : ((a.event_count - a.mediana) / a.mediana) * 100;
        const deviationB =
          b.mediana === 0 ? (b.event_count > 0 ? 100 : 0) : ((b.event_count - b.mediana) / b.mediana) * 100;
        return (deviationB - deviationA) * dir;
      }
      default:
        return 0;
    }
  });
}

export function EventGrid({
  alerts,
  originalAlerts,
  dateRange,
  sortBy = 'platform_event',
  sortDir = 'asc',
}: EventGridProps) {
  // Group by date
  const groupedByDate = (alerts || []).reduce<Record<string, AlertEvent[]>>((acc, alert) => {
    if (!alert || !alert.date) return acc;
    if (!acc[alert.date]) acc[alert.date] = [];
    acc[alert.date].push(alert);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0)
    return (
      <div className="text-center py-10 text-muted-foreground">
        No hay eventos para mostrar
      </div>
    );

  return (
    <div className="space-y-8">
      {dates.map((date) => {
        let dateLabel = date;
        try {
          const parsed = parseISO(date);
          if (parsed && !isNaN(parsed.getTime())) {
            dateLabel = format(parsed, "EEEE, d 'de' MMMM", { locale: es });
            dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
          }
        } catch (e) {
          console.error('Invalid date:', date);
        }

        const sorted = sortAlerts(groupedByDate[date], sortBy, sortDir);

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <h3 className="font-bold text-lg text-foreground">{dateLabel}</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {groupedByDate[date].length} eventos
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {sorted.map((alert) => (
                  <EventRow key={alert.id} alert={alert} allAlerts={originalAlerts} dateRange={dateRange} isNew={isNewAlert(alert, originalAlerts)} isStagnant={isStagnantAlert(alert, originalAlerts)} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({ alert, allAlerts, dateRange, isNew, isStagnant }: { alert: AlertEvent; allAlerts: AlertEvent[]; dateRange?: DateRange; isNew?: boolean; isStagnant?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculatePercentage = () => {
    if (!alert.mediana || alert.mediana === 0) return alert.event_count > 0 ? '+100' : '0';
    return ((alert.event_count - alert.mediana) / alert.mediana * 100).toFixed(1);
  };

  const percentage = calculatePercentage();
  const isPositive = Number(percentage) >= 0;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer',
          'hover:bg-muted/50',
          isExpanded && 'bg-muted/20'
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <StatusBadge status={alert.status} showLabel={false} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate flex items-center gap-2">
              {alert.event}
              {platformConfig[alert.platform] && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize',
                    platformConfig[alert.platform].bgColor,
                    platformConfig[alert.platform].color
                  )}
                >
                  {(() => {
                    const Icon = platformConfig[alert.platform].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {platformConfig[alert.platform].label}
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border bg-violet-500/15 border-violet-500/30 text-violet-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  Nuevo
                </span>
              )}
              {isStagnant && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border bg-amber-500/15 border-amber-500/30 text-amber-400">
                  <Clock className="h-2.5 w-2.5" />
                  Estancado
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Mediana: {alert.mediana.toLocaleString()} | Rango: {alert.minimo.toLocaleString()} -{' '}
              {alert.max.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-base text-foreground tabular-nums">
              {alert.event_count.toLocaleString()}
            </p>
            <div className="flex items-center justify-end gap-1.5">
              <span
                className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded',
                  isPositive
                    ? 'bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))]'
                    : 'bg-[hsl(var(--status-critical))]/10 text-[hsl(var(--status-critical))]'
                )}
              >
                {isPositive ? '+' : ''}
                {percentage}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                vs Mediana
              </span>
            </div>
          </div>
          <ChevronRight
            className={cn(
              'h-4 w-4 text-muted-foreground transition-transform shrink-0',
              isExpanded && 'rotate-90'
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <TrendChart
            alerts={allAlerts}
            selectedEvent={alert.event}
            selectedPlatform={alert.platform}
            dateRange={dateRange}
            selectedDate={alert.date}
          />
          <div className="mt-3 bg-muted/20 border border-border/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground leading-relaxed italic">"{alert.alerta_info}"</p>
          </div>
        </div>
      )}
    </div>
  );
}
