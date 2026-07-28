import { useState } from 'react';
import { AlertEvent, AlertStatus } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { TrendChart } from './TrendChart';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, Apple, Smartphone, Monitor, Sparkles, Clock, FileText, Layers } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { SortBy, SortDir } from './AlertFilters';
import { normalizeFormName, hasFormName, isStagnantAlert, isNewAlert } from '@/lib/alerts';

interface EventGridProps {
  alerts: AlertEvent[];
  originalAlerts: AlertEvent[];
  dateRange?: DateRange;
  sortBy?: SortBy;
  sortDir?: SortDir;
}

const platformConfig: Record<string, { label: string; icon: any; color: string; bgColor: string; order: number }> = {
  // Badges de plataforma con los tintes del DS (.ib-badge): verde / neutral / info
  android: {
    label: 'Android',
    icon: Smartphone,
    color: 'text-ib-green-900',
    bgColor: 'bg-ib-green-50 border-transparent',
    order: 0,
  },
  ios: {
    label: 'iOS',
    icon: Apple,
    color: 'text-foreground',
    bgColor: 'bg-muted border-transparent',
    order: 1,
  },
  web: {
    label: 'Web',
    icon: Monitor,
    color: 'text-sky-700',
    bgColor: 'bg-ib-tint-sky border-transparent',
    order: 2,
  },
};

const statusOrder: Record<string, number> = { rojo: 0, naranja: 1, verde: 2 };

/** Small platform pill (Android / iOS / Web) reused in single rows and group headers. */
function PlatformBadge({ platform }: { platform: string }) {
  const config = platformConfig[platform];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize',
        config.bgColor,
        config.color
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}

// isNewAlert e isStagnantAlert se importan de @/lib/alerts (fuente única).
// El prop `originalAlerts` que reciben estos componentes ya incluye el buffer
// de histórico previo al rango (ver useAlerts), imprescindible para evaluar la racha.

function sortAlerts(alerts: AlertEvent[], sortBy: SortBy, sortDir: SortDir): AlertEvent[] {
  const dir = sortDir === 'asc' ? 1 : -1;

  return [...alerts].sort((a, b) => {
    switch (sortBy) {
      case 'platform_event': {
        const platformDiff =
          (platformConfig[a.platform]?.order ?? 99) - (platformConfig[b.platform]?.order ?? 99);
        if (platformDiff !== 0) return platformDiff * dir;
        const eventDiff = a.event.localeCompare(b.event);
        if (eventDiff !== 0) return eventDiff * dir;
        return normalizeFormName(a.form_name).localeCompare(normalizeFormName(b.form_name)) * dir;
      }
      case 'event_name': {
        const eventDiff = a.event.localeCompare(b.event);
        if (eventDiff !== 0) return eventDiff * dir;
        return normalizeFormName(a.form_name).localeCompare(normalizeFormName(b.form_name)) * dir;
      }
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

interface EventGroup {
  key: string; // `${event}||${platform}`
  event: string;
  platform: string;
  series: AlertEvent[];
  worstStatus: AlertStatus;
  totalCount: number;
  isMulti: boolean;
  hasAlert: boolean;
  representative: AlertEvent;
}

/** Computes the % deviation of an alert vs its median, mirroring the row display logic. */
function deviationOf(a: AlertEvent): number {
  if (a.mediana === 0) return a.event_count > 0 ? 100 : 0;
  return ((a.event_count - a.mediana) / a.mediana) * 100;
}

/**
 * Groups a date's (already sorted) alerts by event+platform.
 * A group with a single flow renders as a simple row; with 2+ distinct
 * form_names it becomes a collapsible parent with its flows nested.
 */
function buildGroups(sortedAlerts: AlertEvent[]): EventGroup[] {
  const map = new Map<string, AlertEvent[]>();
  for (const alert of sortedAlerts) {
    const key = `${alert.event}||${alert.platform}`;
    const existing = map.get(key);
    if (existing) existing.push(alert);
    else map.set(key, [alert]);
  }

  return Array.from(map.entries()).map(([key, series]) => {
    const distinctForms = new Set(series.map((a) => normalizeFormName(a.form_name)));
    const worstStatus = series.reduce<AlertStatus>(
      (worst, a) => ((statusOrder[a.status] ?? 3) < (statusOrder[worst] ?? 3) ? a.status : worst),
      'verde'
    );
    return {
      key,
      event: series[0].event,
      platform: series[0].platform,
      series,
      worstStatus,
      totalCount: series.reduce((sum, a) => sum + a.event_count, 0),
      isMulti: distinctForms.size >= 2,
      hasAlert: series.some((a) => a.status === 'naranja' || a.status === 'rojo'),
      representative: series[0],
    };
  });
}

/** Orders groups using the same sort modes as individual rows, on each group's representative. */
function sortGroups(groups: EventGroup[], sortBy: SortBy, sortDir: SortDir): EventGroup[] {
  const dir = sortDir === 'asc' ? 1 : -1;
  return [...groups].sort((a, b) => {
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
        const severityDiff = (statusOrder[a.worstStatus] ?? 3) - (statusOrder[b.worstStatus] ?? 3);
        if (severityDiff !== 0) return severityDiff * dir;
        return a.event.localeCompare(b.event);
      }
      case 'deviation':
        return (deviationOf(b.representative) - deviationOf(a.representative)) * dir;
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
        const groups = sortGroups(buildGroups(sorted), sortBy, sortDir);

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <h3 className="font-bold text-lg text-foreground">{dateLabel}</h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {groupedByDate[date].length} eventos
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-ib-sm">
              <div className="divide-y divide-border">
                {groups.map((group) =>
                  group.isMulti ? (
                    <EventGroupRow
                      key={group.key}
                      group={group}
                      allAlerts={originalAlerts}
                      dateRange={dateRange}
                    />
                  ) : (
                    <EventRow
                      key={group.series[0].id}
                      alert={group.series[0]}
                      allAlerts={originalAlerts}
                      dateRange={dateRange}
                      isNew={isNewAlert(group.series[0], originalAlerts)}
                      isStagnant={isStagnantAlert(group.series[0], originalAlerts)}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({ alert, allAlerts, dateRange, isNew, isStagnant, variant = 'default' }: { alert: AlertEvent; allAlerts: AlertEvent[]; dateRange?: DateRange; isNew?: boolean; isStagnant?: boolean; variant?: 'default' | 'flow' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const calculatePercentage = () => {
    if (!alert.mediana || alert.mediana === 0) return alert.event_count > 0 ? '+100' : '0';
    return ((alert.event_count - alert.mediana) / alert.mediana * 100).toFixed(1);
  };

  const percentage = calculatePercentage();
  const isPositive = Number(percentage) >= 0;
  const isFlow = variant === 'flow';
  const primaryLabel = isFlow ? (normalizeFormName(alert.form_name) || 'Sin formulario') : alert.event;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer',
          'hover:bg-muted/50',
          isExpanded && 'bg-muted/20',
          isFlow && 'pl-12 bg-muted/10'
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <StatusBadge status={alert.status} showLabel={false} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate flex items-center gap-2">
              {isFlow && <FileText className="h-3 w-3 text-sky-600 shrink-0" />}
              {primaryLabel}
              {!isFlow && <PlatformBadge platform={alert.platform} />}
              {!isFlow && hasFormName(alert.form_name) && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-sky-500/10 border-sky-500/20 text-sky-600">
                  <FileText className="h-2.5 w-2.5" />
                  {normalizeFormName(alert.form_name)}
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-violet-500/15 border-violet-500/30 text-violet-600">
                  <Sparkles className="h-2.5 w-2.5" />
                  Nuevo
                </span>
              )}
              {isStagnant && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-amber-500/15 border-amber-500/30 text-amber-600">
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
        <div className={cn('px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-200', isFlow && 'pl-12')}>
          <TrendChart
            alerts={allAlerts}
            selectedEvent={alert.event}
            selectedPlatform={alert.platform}
            selectedFormName={alert.form_name}
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

/**
 * Collapsible parent for an event+platform that has 2+ flows (form_names).
 * Header shows the worst status, event, platform, flow count and aggregate total.
 * Auto-expanded when any flow is in naranja/rojo.
 */
function EventGroupRow({ group, allAlerts, dateRange }: { group: EventGroup; allAlerts: AlertEvent[]; dateRange?: DateRange }) {
  const [open, setOpen] = useState(group.hasAlert);

  // Flows ordered alphabetically by form name for stable, readable nesting.
  const flows = [...group.series].sort((a, b) =>
    normalizeFormName(a.form_name).localeCompare(normalizeFormName(b.form_name))
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer w-full',
            'hover:bg-muted/50',
            open && 'bg-muted/20'
          )}
        >
          <div className="flex items-center gap-4 min-w-0">
            <StatusBadge status={group.worstStatus} showLabel={false} />
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate flex items-center gap-2">
                {group.event}
                <PlatformBadge platform={group.platform} />
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border bg-sky-500/10 border-sky-500/20 text-sky-600">
                  <Layers className="h-2.5 w-2.5" />
                  {group.series.length} flujos
                </span>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                {group.series.length} flujos agrupados · expande para ver el detalle
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-base text-foreground tabular-nums">
                {group.totalCount.toLocaleString()}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                total
              </span>
            </div>
            <ChevronRight
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                open && 'rotate-90'
              )}
            />
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="divide-y divide-border border-t border-border">
          {flows.map((flow) => (
            <EventRow
              key={flow.id}
              alert={flow}
              allAlerts={allAlerts}
              dateRange={dateRange}
              variant="flow"
              isNew={isNewAlert(flow, allAlerts)}
              isStagnant={isStagnantAlert(flow, allAlerts)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
