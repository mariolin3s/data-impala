import { AlertEvent, GroupedAlerts } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { cn } from '@/lib/utils';

interface EventGridProps {
  alerts: AlertEvent[];
}

const platformLabels: Record<string, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
};

export function EventGrid({ alerts }: EventGridProps) {
  const grouped = alerts.reduce<GroupedAlerts>((acc, alert) => {
    if (!acc[alert.platform]) {
      acc[alert.platform] = [];
    }
    acc[alert.platform].push(alert);
    return acc;
  }, {});

  const platforms = Object.keys(grouped).sort();

  return (
    <div className="space-y-6">
      {platforms.map((platform) => (
        <div key={platform} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-foreground">
              {platformLabels[platform] || platform}
            </h3>
          </div>
          
          <div className="divide-y divide-border">
            {grouped[platform].map((alert) => (
              <EventRow key={alert.id} alert={alert} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EventRow({ alert }: { alert: AlertEvent }) {
  const percentage = ((alert.event_count - alert.mediana) / alert.mediana * 100).toFixed(1);
  const isPositive = Number(percentage) >= 0;

  return (
    <div className={cn(
      "px-5 py-4 flex items-center justify-between gap-4 transition-colors",
      "hover:bg-muted/30"
    )}>
      <div className="flex items-center gap-4 min-w-0">
        <StatusBadge status={alert.status} showLabel={false} />
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{alert.event}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mediana: {alert.mediana.toLocaleString()}
          </p>
        </div>
      </div>
      
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
    </div>
  );
}
