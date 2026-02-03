import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DailyStatusData } from '@/data/mockAlerts';
import { AlertEvent } from '@/types/alert';

const statusColors = {
  verde: 'hsl(142, 71%, 45%)',
  naranja: 'hsl(32, 95%, 55%)',
  rojo: 'hsl(0, 84%, 60%)',
  gris: 'hsl(215, 20%, 55%)',
};

// Types for internal state
interface ExtendedDailyStatusData extends DailyStatusData {
  gris: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as ExtendedDailyStatusData;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl min-w-[160px]">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.verde }} />
              <span className="text-muted-foreground">Normal</span>
            </div>
            <span className="font-medium text-foreground">{data.verde}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.naranja }} />
              <span className="text-muted-foreground">Advertencia</span>
            </div>
            <span className="font-medium text-foreground">{data.naranja}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.rojo }} />
              <span className="text-muted-foreground">Crítico</span>
            </div>
            <span className="font-medium text-foreground">{data.rojo}</span>
          </div>
          {data.gris > 0 && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.gris }} />
                <span className="text-muted-foreground">Sin datos</span>
              </div>
              <span className="font-medium text-foreground">{data.gris}</span>
            </div>
          )}
          <div className="pt-1.5 mt-1.5 border-t border-border flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-medium text-foreground">{data.total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLegend = () => (
  <div className="flex items-center justify-center gap-6 mt-2">
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.verde }} />
      <span className="text-xs text-muted-foreground">Normal</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.naranja }} />
      <span className="text-xs text-muted-foreground">Advertencia</span>
    </div>
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-3 rounded" style={{ backgroundColor: statusColors.rojo }} />
      <span className="text-xs text-muted-foreground">Crítico</span>
    </div>
  </div>
);

interface StatusHistoryChartProps {
  alerts: AlertEvent[];
}

export function StatusHistoryChart({ alerts }: StatusHistoryChartProps) {
  const dailyHistory = useMemo(() => {
    const grouped = alerts.reduce((acc, alert) => {
      if (!acc[alert.date]) {
        acc[alert.date] = { verde: 0, naranja: 0, rojo: 0, gris: 0, total: 0 };
      }
      const status = alert.status as keyof typeof statusColors;
      if (acc[alert.date][status] !== undefined) {
        (acc[alert.date][status] as number)++;
      }
      acc[alert.date].total++;
      return acc;
    }, {} as Record<string, any>);

    return Object.entries(grouped)
      .map(([date, counts]) => ({
        date,
        dayName: date.split('-').slice(1).reverse().join('/'), // Format as DD/MM
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14); // Keep last 14 days
  }, [alerts]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="font-semibold text-foreground">Distribución de Estados</h3>
        <p className="text-sm text-muted-foreground">Eventos por estado - Histórico</p>
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
            <XAxis
              dataKey="dayName"
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(217, 33%, 17%)', opacity: 0.5 }} />
            <Bar
              dataKey="verde"
              name="Normal"
              stackId="status"
              fill={statusColors.verde}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="naranja"
              name="Advertencia"
              stackId="status"
              fill={statusColors.naranja}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="rojo"
              name="Crítico"
              stackId="status"
              fill={statusColors.rojo}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <CustomLegend />
    </div>
  );
}
