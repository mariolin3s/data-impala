import { useState, useMemo, useEffect } from 'react';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertSummary, AlertEvent } from '@/types/alert';
import { StatCard } from './StatCard';
import { EventGrid } from './EventGrid';
import { DateSelector } from './DateSelector';
import { AlertFilters } from './AlertFilters';
import { TrendChart } from './TrendChart';
import { StatusHistoryChart } from './StatusHistoryChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Bell } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { subDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export function Dashboard() {
  const { alerts, loading, error } = useAlerts();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Set initial date range if needed (latest data-centric range)
  useEffect(() => {
    if (alerts.length > 0 && !dateRange?.from) {
      const dates = alerts.map(a => new Date(a.date).getTime());
      const maxDate = new Date(Math.max(...dates));
      setDateRange({
        from: subDays(maxDate, 6), // 7 days inclusive: current max - 6
        to: maxDate
      });
    }
  }, [alerts]);

  const filteredAlerts = useMemo(() => {
    const data = alerts || [];
    return data.filter((alert) => {
      if (!alert) return false;
      if (dateRange?.from && dateRange?.to) {
        const alertDate = parseISO(alert.date);
        if (!isWithinInterval(alertDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to)
        })) return false;
      } else if (dateRange?.from) {
        if (alert.date !== dateRange.from.toISOString().split('T')[0]) return false;
      }

      if (selectedEvent && alert.event !== selectedEvent) return false;
      if (selectedPlatform && alert.platform !== selectedPlatform) return false;
      if (selectedStatus && alert.status !== selectedStatus) return false;
      return true;
    });
  }, [alerts, dateRange, selectedEvent, selectedPlatform, selectedStatus]);

  const summary = useMemo<AlertSummary>(() => {
    return filteredAlerts.reduce(
      (acc, alert) => {
        acc.total++;
        if (alert.status === 'verde') acc.success++;
        if (alert.status === 'naranja') acc.warning++;
        if (alert.status === 'rojo') acc.critical++;
        return acc;
      },
      { total: 0, success: 0, warning: 0, critical: 0 }
    );
  }, [filteredAlerts]);

  const criticalAlerts = useMemo(() => {
    return filteredAlerts
      .filter((a) => a.status === 'rojo' || a.status === 'naranja')
      .sort((a, b) => (a.status === 'rojo' ? -1 : 1));
  }, [filteredAlerts]);

  const clearFilters = () => {
    setSelectedEvent(null);
    setSelectedPlatform(null);
    setSelectedStatus(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Activity className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-3 text-lg font-medium">Cargando datos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-destructive/10 p-6 rounded-lg text-destructive flex flex-col items-center gap-3">
          <XCircle className="h-8 w-8" />
          <p className="font-bold">Error al cargar los datos de alertas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">GA4 Alert Monitor</h1>
                <p className="text-sm text-muted-foreground">Monitorización de eventos</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DateSelector range={dateRange} onRangeChange={setDateRange} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="mb-6">
          <AlertFilters
            alerts={alerts}
            dateRange={dateRange}
            selectedEvent={selectedEvent}
            selectedPlatform={selectedPlatform}
            selectedStatus={selectedStatus}
            onEventChange={setSelectedEvent}
            onPlatformChange={setSelectedPlatform}
            onStatusChange={setSelectedStatus}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Eventos"
            value={summary.total}
            icon={<Activity className="h-6 w-6" />}
          />
          <StatCard
            title="Normal"
            value={summary.success}
            icon={<CheckCircle2 className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Advertencia"
            value={summary.warning}
            icon={<AlertTriangle className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Crítico"
            value={summary.critical}
            icon={<XCircle className="h-6 w-6" />}
            variant="critical"
          />
        </div>

        {/* Status History Chart */}
        <div className="mb-8">
          <StatusHistoryChart alerts={filteredAlerts} />
        </div>

        {/* Trend Chart removed from main layout */}

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-background">
              <Bell className="h-4 w-4 mr-2" />
              Alertas ({criticalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Todos los eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {criticalAlerts.length > 0 ? (
              <EventGrid
                alerts={criticalAlerts}
                originalAlerts={alerts}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--status-success))]" />
                <p className="text-lg font-medium">Todo en orden</p>
                <p className="text-sm">No hay alertas activas para los filtros seleccionados</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {filteredAlerts.length > 0 ? (
              <EventGrid
                alerts={filteredAlerts}
                originalAlerts={alerts}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Sin resultados</p>
                <p className="text-sm">No hay eventos que coincidan con los filtros</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
