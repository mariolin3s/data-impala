import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { weeklyTrendData, getEventTrendData, TrendDataPoint, EventTrendData } from '@/data/mockAlerts';

interface TrendChartProps {
  selectedEvent?: string | null;
  selectedPlatform?: string | null;
}

const platformColors = {
  web: 'hsl(217, 91%, 60%)',
  ios: 'hsl(142, 71%, 45%)',
  android: 'hsl(32, 95%, 55%)',
  total: 'hsl(280, 65%, 60%)',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
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
    const statusColors = {
      verde: 'hsl(142, 71%, 45%)',
      naranja: 'hsl(32, 95%, 55%)',
      rojo: 'hsl(0, 84%, 60%)',
    };

    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
        <p className="text-sm font-medium text-foreground mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: statusColors[data.status] }}
            />
            <span className="text-muted-foreground">Valor:</span>
            <span className="font-medium text-foreground">
              {data.value.toLocaleString()}
            </span>
          </div>
          <div className="text-muted-foreground text-xs">
            Rango: {data.min.toLocaleString()} - {data.max.toLocaleString()}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function TrendChart({ selectedEvent, selectedPlatform }: TrendChartProps) {
  const isEventView = !!selectedEvent;

  const eventData = useMemo(() => {
    if (selectedEvent) {
      return getEventTrendData(selectedEvent, selectedPlatform || undefined);
    }
    return [];
  }, [selectedEvent, selectedPlatform]);

  if (isEventView) {
    const avgMin = eventData.length > 0 ? eventData[0].min : 0;
    const avgMax = eventData.length > 0 ? eventData[0].max : 0;

    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">
              Tendencia: {selectedEvent}
            </h3>
            <p className="text-sm text-muted-foreground">Últimos 7 días</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 bg-[hsl(var(--status-success))] opacity-50" />
              <span className="text-muted-foreground">Rango esperado</span>
            </div>
          </div>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={eventData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="eventGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
              <XAxis
                dataKey="dayName"
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(215, 20%, 55%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}
              />
              <Tooltip content={<EventTrendTooltip />} />
              <ReferenceLine
                y={avgMax}
                stroke="hsl(142, 71%, 45%)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                y={avgMin}
                stroke="hsl(142, 71%, 45%)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Eventos"
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={2}
                fill="url(#eventGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  const colors = {
                    verde: 'hsl(142, 71%, 45%)',
                    naranja: 'hsl(32, 95%, 55%)',
                    rojo: 'hsl(0, 84%, 60%)',
                  };
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={colors[payload.status as keyof typeof colors]}
                      stroke="hsl(222, 47%, 9%)"
                      strokeWidth={2}
                    />
                  );
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Default: Platform comparison chart
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">Tendencia por plataforma</h3>
          <p className="text-sm text-muted-foreground">Eventos totales - Últimos 7 días</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.web }} />
            <span className="text-muted-foreground">Web</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.ios }} />
            <span className="text-muted-foreground">iOS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: platformColors.android }} />
            <span className="text-muted-foreground">Android</span>
          </div>
        </div>
      </div>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="webGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={platformColors.web} stopOpacity={0.3} />
                <stop offset="95%" stopColor={platformColors.web} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="iosGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={platformColors.ios} stopOpacity={0.3} />
                <stop offset="95%" stopColor={platformColors.ios} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="androidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={platformColors.android} stopOpacity={0.3} />
                <stop offset="95%" stopColor={platformColors.android} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis
              dataKey="dayName"
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(215, 20%, 55%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="web"
              name="Web"
              stroke={platformColors.web}
              strokeWidth={2}
              fill="url(#webGradient)"
            />
            <Area
              type="monotone"
              dataKey="ios"
              name="iOS"
              stroke={platformColors.ios}
              strokeWidth={2}
              fill="url(#iosGradient)"
            />
            <Area
              type="monotone"
              dataKey="android"
              name="Android"
              stroke={platformColors.android}
              strokeWidth={2}
              fill="url(#androidGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
