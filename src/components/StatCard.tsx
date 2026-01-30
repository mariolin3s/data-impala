import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'critical';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-l-4 border-l-[hsl(var(--status-success))]',
  warning: 'border-l-4 border-l-[hsl(var(--status-warning))]',
  critical: 'border-l-4 border-l-[hsl(var(--status-critical))]',
};

export function StatCard({ title, value, icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn('stat-card', variantStyles[variant])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold mt-1 tracking-tight">{value}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}
