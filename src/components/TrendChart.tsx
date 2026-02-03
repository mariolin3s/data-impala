import { useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
} from 'recharts';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { EventTrendData, TrendDataPoint } from '@/data/mockAlerts';
import { AlertEvent } from '@/types/alert';

interface TrendChartProps {
  alerts: AlertEvent[];
  selectedEvent?: string | null;
  selectedPlatform?: string | null;
}

const platformColors = {
  web: 'hsl(217, 91%, 60%)',
  ios: 'hsl(142, 71%, 45%)',
  android: 'hsl(32, 95%, 55%)',
  total: 'hsl(280, 65%, 60%)',
};

const statusColors = {
  verde: 'hsl(142, 71%, 45%)',
  naranja: 'hsl(32, 95%, 55%)',
  rojo: 'hsl(0, 84%, 60%)',
  gris: 'hsl(215, 20%, 55%)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
        <p className="font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EventTrendTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as EventTrendData;
    const StatusIcon = data.status === 'verde' ? CheckCircle2 :
      data.status === 'naranja' ? AlertTriangle : AlertCircle;

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl min-w-[180px]">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <StatusIcon
              className="w-4 h-4"
              style={{ color: statusColors[data.status as keyof typeof statusColors] }}
            />
            <span className="text-muted-foreground">Event Count:</span>
            <span className="font-medium text-foreground">
              {data.value.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <div className="w-3 h-3 rounded bg-[hsl(215,20%,55%)]/20 border border-[hsl(215,20%,55%)]/40" />
            <span>Mediana: {data.mediana.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs">
            <div className="w-3 h-3 rounded bg-[hsl(142,71%,45%)]/20 border border-[hsl(142,71%,45%)]/40" />
            <span>Rango esperado: {data.min.toLocaleString()} - {data.max.toLocaleString()}</span>
          </div>
          {data.status !== 'verde' && data.status !== 'gris' && (
            <div className="pt-1 border-t border-border mt-1">
              <span
                className="text-xs font-medium"
                style={{ color: statusColors[data.status as keyof typeof statusColors] }}
              >
                {data.status === 'naranja' ? '⚠ Desviación moderada' : '🚨 Anomalía crítica'}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;

  if (!cx || !cy) return null;

  const isAnomaly = payload.status !== 'verde' && payload.status !== 'gris';
  const color = statusColors[payload.status as keyof typeof statusColors] || statusColors.verde;

  if (isAnomaly) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.2} />
        <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.4} />
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="hsl(222, 47%, 11%)" strokeWidth={2} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="hsl(222, 47%, 11%)" fontSize={8} fontWeight="bold">!</text>
      </g>
    );
  }

  return (
    <circle cx={cx} cy={cy} r={5} fill={color} stroke="hsl(222, 47%, 11%)" strokeWidth={2} />
  );
};

export function TrendChart({ alerts, selectedEvent, selectedPlatform }: TrendChartProps) {
  const eventData = useMemo(() => {
    if (!selectedEvent) return [];

    const data = alerts || [];
    return data
      .filter(a => a && a.event === selectedEvent && (!selectedPlatform || a.platform === selectedPlatform))
      .map(a => ({
        date: a.date,
        dayName: a.date ? a.date.split('-').slice(1).reverse().join('/') : '',
        value: a.event_count || 0,
        mediana: a.mediana || 0,
        min: a.minimo || 0,
        max: a.max || 0,
        status: a.status || 'gris'
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [alerts, selectedEvent, selectedPlatform]);

  if (!selectedEvent) return null;

  return (
    <div className="bg-card/30 rounded-xl p-4 mt-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Tendencia de {selectedEvent}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 border-t border-dashed border-[hsl(215,20%,55%)]" />
            <span className="text-muted-foreground whitespace-nowrap">Mediana</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-2 rounded bg-[hsl(142,71%,45%)]/20 border border-[hsl(142,71%,45%)]/40" />
            <span className="text-muted-foreground whitespace-nowrap">Rango esperado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[hsl(217,91%,60%)]" />
            <span className="text-muted-foreground whitespace-nowrap">Event count</span>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="expectedRangeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" vertical={false} />
            <XAxis
              dataKey="dayName"
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />
            <Tooltip content={<EventTrendTooltip />} />

            <Area
              type="monotone"
              dataKey="max"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="url(#expectedRangeGradient)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke="hsl(142, 71%, 45%)"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="hsl(222, 47%, 11%)"
              fillOpacity={1}
            />

            <Line
              type="monotone"
              dataKey="mediana"
              stroke="hsl(215, 20%, 55%)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              dot={<CustomDot />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div >
  );
}
