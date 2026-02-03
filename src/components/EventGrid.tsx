import { useState } from 'react';
import { AlertEvent } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { TrendChart } from './TrendChart';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';

interface EventGridProps {
  alerts: AlertEvent[];
  originalAlerts: AlertEvent[]; // Added to provide full history to TrendChart
}

const platformLabels: Record<string, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
};

export function EventGrid({ alerts, originalAlerts }: EventGridProps) {
  // Group by date
  const groupedByDate = alerts.reduce<Record<string, AlertEvent[]>>((acc, alert) => {
    if (!acc[alert.date]) {
      acc[alert.date] = [];
    }
    acc[alert.date].push(alert);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  if (alerts.length === 0) return null;

  return (
    <Accordion type="multiple" defaultValue={[dates[0]]} className="space-y-4">
      {dates.map((date) => (
        <AccordionItem
          key={date}
          value={date}
          className="bg-card border border-border rounded-xl overflow-hidden px-0"
        >
          <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">
                {format(parseISO(date), "EEEE, d 'de' MMMM", { locale: es })}
              </span>
              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {groupedByDate[date].length} eventos
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 border-t border-border">
            <div className="divide-y divide-border">
              {groupedByDate[date].map((alert) => (
                <EventRow key={alert.id} alert={alert} allAlerts={originalAlerts} />
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function EventRow({ alert, allAlerts }: { alert: AlertEvent; allAlerts: AlertEvent[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = ((alert.event_count - alert.mediana) / alert.mediana * 100).toFixed(1);
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
            <p className="font-medium text-foreground truncate">
              {alert.event}
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {platformLabels[alert.platform] || alert.platform}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Mediana: {alert.mediana.toLocaleString()} | Rango: {alert.minimo.toLocaleString()} - {alert.max.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right flex-shrink-0">
            <p className="font-semibold text-foreground tabular-nums">
              {alert.event_count.toLocaleString()}
            </p>
            <p className={cn(
              "text-xs font-medium",
              isPositive ? "text-[hsl(var(--status-success))]" : "text-[hsl(var(--status-critical))]"
            )}>
              {isPositive ? '+' : ''}{percentage}%
            </p>
          </div>
          <ChevronRight className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
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
