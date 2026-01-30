import { AlertEvent } from '@/types/alert';
import { StatusBadge } from './StatusBadge';
import { TrendingDown, TrendingUp, Activity } from 'lucide-react';

interface AlertCardProps {
  alert: AlertEvent;
}

export function AlertCard({ alert }: AlertCardProps) {
  const isBelow = alert.event_count < alert.minimo;
  const TrendIcon = isBelow ? TrendingDown : TrendingUp;

  return (
    <div className="alert-row">
      <div className="flex-shrink-0 mt-0.5">
        <StatusBadge status={alert.status} showLabel={false} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-semibold text-foreground">{alert.event}</h3>
          <span className="platform-tag">{alert.platform}</span>
        </div>
        
        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
          {alert.alerta_info}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            <span>Actual: <span className="text-foreground font-medium">{alert.event_count.toLocaleString()}</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendIcon className="h-3.5 w-3.5" />
            <span>Rango: {alert.minimo.toLocaleString()} - {alert.max.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
