import { AlertStatus } from '@/types/alert';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: AlertStatus;
  showLabel?: boolean;
}

const statusConfig = {
  verde: {
    label: 'Normal',
    icon: CheckCircle2,
    className: 'status-badge-success',
  },
  naranja: {
    label: 'Advertencia',
    icon: AlertTriangle,
    className: 'status-badge-warning',
  },
  rojo: {
    label: 'Crítico',
    icon: XCircle,
    className: 'status-badge-critical',
  },
  gris: {
    label: 'Sin datos',
    icon: CheckCircle2,
    className: 'status-badge-neutral',
  },
};

export function StatusBadge({ status, showLabel = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.gris;
  const Icon = config.icon;

  return (
    <span className={config.className}>
      <Icon className="h-3.5 w-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
