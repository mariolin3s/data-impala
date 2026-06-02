import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAlerts } from '@/hooks/useAlerts';
import { AlertSummary, AlertEvent } from '@/types/alert';
import { sameSeries, normalizeFormName } from '@/lib/alerts';
import { StatCard } from './StatCard';
import { EventGrid } from './EventGrid';
import { DateSelector } from './DateSelector';
import { AlertFilters, SortBy, SortDir } from './AlertFilters';
import { StatusHistoryChart } from './StatusHistoryChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Bell, LogOut, Clock } from 'lucide-react';
import { DateRange } from "react-day-picker";
import { subDays, format } from 'date-fns';

export function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 14),
    to: subDays(new Date(), 1),
  });
  const { alerts, loading, error } = useAlerts(dateRange);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [selectedFormName, setSelectedFormName] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('platform_event');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  /** True when the event+form_name+platform series had no naranja/rojo alert the previous day */
  const isNewAlert = (alert: AlertEvent, allAlerts: AlertEvent[]): boolean => {
    if (alert.status === 'verde') return false;
    const prevDate = format(subDays(new Date(alert.date), 1), 'yyyy-MM-dd');
    return !allAlerts.some(
      (a) =>
        a.date === prevDate &&
        sameSeries(a, alert) &&
        (a.status === 'naranja' || a.status === 'rojo')
    );
  };

  /** True when the event+form_name+platform series has been 'rojo' for 7 consecutive days up to the alert date */
  const isStagnantAlert = (alert: AlertEvent, allAlerts: AlertEvent[]): boolean => {
    if (alert.status !== 'rojo') return false;
    const alertDate = new Date(alert.date);
    for (let i = 0; i < 7; i++) {
      const day = format(subDays(alertDate, i), 'yyyy-MM-dd');
      const hasRojo = allAlerts.some(
        (a) =>
          a.date === day &&
          sameSeries(a, alert) &&
          a.status === 'rojo'
      );
      if (!hasRojo) return false;
    }
    return true;
  };

  const filteredAlerts = useMemo(() => {
    const data = alerts || [];

    return data.filter((alert) => {
      if (!alert) return false;
      if (selectedStatus === 'nuevo') {
        // Special case: only show alerts that are new vs the previous day
        if (!isNewAlert(alert, data)) return false;
      } else if (selectedStatus === 'estancado') {
        // Special case: only show stagnant alerts (rojo for 7+ consecutive days)
        if (!isStagnantAlert(alert, data)) return false;
      } else {
        if (selectedStatus && alert.status !== selectedStatus) return false;
      }
      if (selectedEvent && alert.event !== selectedEvent) return false;
      if (selectedPlatform && alert.platform !== selectedPlatform) return false;
      if (selectedFormName) {
        // '__none__' filtra los eventos de flujo único (sin form_name)
        const formName = normalizeFormName(alert.form_name);
        if (selectedFormName === '__none__' ? formName !== '' : formName !== selectedFormName) {
          return false;
        }
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesEvent = alert.event.toLowerCase().includes(q);
        const matchesForm = normalizeFormName(alert.form_name).toLowerCase().includes(q);
        if (!matchesEvent && !matchesForm) return false;
      }
      return true;
    });
  }, [alerts, selectedEvent, selectedPlatform, selectedFormName, selectedStatus, searchQuery]);

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

  const allCriticalAlerts = useMemo(() => {
    return filteredAlerts.filter((a) => a.status === 'rojo' || a.status === 'naranja');
  }, [filteredAlerts]);

  const stagnantAlerts = useMemo(() => {
    return filteredAlerts.filter((a) => isStagnantAlert(a, alerts || []));
  }, [filteredAlerts, alerts]);

  const activeAlerts = useMemo(() => {
    return allCriticalAlerts.filter((a) => !isStagnantAlert(a, alerts || []));
  }, [allCriticalAlerts, alerts]);

  const clearFilters = () => {
    setSelectedEvent(null);
    setSelectedPlatform(null);
    setSelectedFormName(null);
    setSelectedStatus(null);
    setSearchQuery('');
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
                <h1 className="text-xl font-bold text-foreground">DATA IMPALA</h1>
                <p className="text-sm text-muted-foreground">Monitorización de eventos by Mario Hinojo</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <DateSelector range={dateRange} onRangeChange={setDateRange} />
              <button
                id="logout-button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="h-9 w-9 rounded-lg border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
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
            selectedFormName={selectedFormName}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
            sortBy={sortBy}
            sortDir={sortDir}
            onEventChange={setSelectedEvent}
            onPlatformChange={setSelectedPlatform}
            onFormNameChange={setSelectedFormName}
            onStatusChange={setSelectedStatus}
            onSearchChange={setSearchQuery}
            onSortByChange={setSortBy}
            onSortDirToggle={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
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

        {/* Tabs */}
        <Tabs defaultValue="alerts" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border">
            <TabsTrigger value="alerts" className="data-[state=active]:bg-background">
              <Bell className="h-4 w-4 mr-2" />
              Alertas ({activeAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="all_alerts" className="data-[state=active]:bg-background">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Todas las Alertas ({allCriticalAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="stagnant" className="data-[state=active]:bg-background">
              <Clock className="h-4 w-4 mr-2" />
              Eventos Estancados ({stagnantAlerts.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-background">
              <Activity className="h-4 w-4 mr-2" />
              Todos los eventos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="alerts" className="space-y-4">
            {activeAlerts.length > 0 ? (
              <EventGrid
                alerts={activeAlerts}
                originalAlerts={alerts}
                dateRange={dateRange}
                sortBy={sortBy}
                sortDir={sortDir}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--status-success))]" />
                <p className="text-lg font-medium">Todo en orden</p>
                <p className="text-sm">No hay nuevas alertas activas para los filtros seleccionados</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all_alerts" className="space-y-4">
            {allCriticalAlerts.length > 0 ? (
              <EventGrid
                alerts={allCriticalAlerts}
                originalAlerts={alerts}
                dateRange={dateRange}
                sortBy={sortBy}
                sortDir={sortDir}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--status-success))]" />
                <p className="text-lg font-medium">Todo en orden</p>
                <p className="text-sm">No hay alertas para los filtros seleccionados</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stagnant" className="space-y-4">
            {stagnantAlerts.length > 0 ? (
              <EventGrid
                alerts={stagnantAlerts}
                originalAlerts={alerts}
                dateRange={dateRange}
                sortBy={sortBy}
                sortDir={sortDir}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--status-success))]" />
                <p className="text-lg font-medium">Sin eventos estancados</p>
                <p className="text-sm">No hay eventos en alerta roja durante 7 días consecutivos</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            {filteredAlerts.length > 0 ? (
              <EventGrid
                alerts={filteredAlerts}
                originalAlerts={alerts}
                dateRange={dateRange}
                sortBy={sortBy}
                sortDir={sortDir}
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
