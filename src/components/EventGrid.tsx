import { useState } from 'react';
import { AlertEvent } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendChart } from './TrendChart';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight, Apple, Smartphone, Monitor } from 'lucide-react';

import { DateRange } from "react-day-picker";

interface EventGridProps {
  alerts: AlertEvent[];
  originalAlerts: AlertEvent[]; // Added to provide full history to TrendChart
  dateRange?: DateRange;
}

const platformConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  web: {
    label: 'Web',
    icon: Monitor,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20'
  },
  ios: {
    label: 'iOS',
    icon: Apple,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10 border-slate-500/20'
  },
  android: {
    label: 'Android',
    icon: Smartphone,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20'
  },
};

export function EventGrid({ alerts, originalAlerts, dateRange }: EventGridProps) {
  // Group by date with safety
  const groupedByDate = (alerts || []).reduce<Record<string, AlertEvent[]>>((acc, alert) => {
    if (!alert || !alert.date) return acc;
    if (!acc[alert.date]) {
      acc[alert.date] = [];
    }
    acc[alert.date].push(alert);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) return (
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
            // Capitalize first letter
            dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
          }
        } catch (e) {
          console.error("Invalid date:", date);
        }

        return (
          <div key={date} className="space-y-3">
            <div className="flex items-center gap-3 px-1">
              <h3 className="font-bold text-lg text-foreground">
                {dateLabel}
              </h3>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {groupedByDate[date].length} eventos
              </span>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <div className="divide-y divide-border">
                {groupedByDate[date].map((alert) => (
                  <EventRow key={alert.id} alert={alert} allAlerts={originalAlerts} dateRange={dateRange} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EventRow({ alert, allAlerts, dateRange }: { alert: AlertEvent; allAlerts: AlertEvent[]; dateRange?: DateRange }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const calculatePercentage = () => {
    if (!alert.mediana || alert.mediana === 0) return alert.event_count > 0 ? "+100" : "0";
    return ((alert.event_count - alert.mediana) / alert.mediana * 100).toFixed(1);
  };

  const percentage = calculatePercentage();
  const isPositive = Number(percentage) >= 0;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer",
          "hover:bg-muted/50",
          isExpanded && "bg-muted/20"
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <StatusBadge status={alert.status} showLabel={false} />
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate flex items-center gap-2">
              {alert.event}
              {platformConfig[alert.platform] && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border capitalize",
                  platformConfig[alert.platform].bgColor,
                  platformConfig[alert.platform].color
                )}>
                  {(() => {
                    const Icon = platformConfig[alert.platform].icon;
                    return <Icon className="h-3 w-3" />;
                  })()}
                  {platformConfig[alert.platform].label}
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Mediana: {alert.mediana.toLocaleString()} | Rango: {alert.minimo.toLocaleString()} - {alert.max.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right flex-shrink-0">
            <p className="font-bold text-base text-foreground tabular-nums">
              {alert.event_count.toLocaleString()}
            </p>
            <div className="flex items-center justify-end gap-1.5">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                isPositive ? "bg-[hsl(var(--status-success))]/10 text-[hsl(var(--status-success))]" : "bg-[hsl(var(--status-critical))]/10 text-[hsl(var(--status-critical))]"
              )}>
                {isPositive ? '+' : ''}{percentage}%
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">vs Mediana</span>
            </div>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform shrink-0",
            isExpanded && "rotate-90"
          )} />
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5 pt-0 animate-in fade-in slide-in-from-top-2 duration-200">
          <TrendChart
            alerts={allAlerts}
            selectedEvent={alert.event}
            selectedPlatform={alert.platform}
            dateRange={dateRange}
          />
          <div className="mt-3 bg-muted/20 border border-border/50 rounded-lg p-3 text-sm">
            <p className="text-muted-foreground leading-relaxed italic">
              "{alert.alerta_info}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
