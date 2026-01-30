import { useState, useMemo } from 'react';
import { mockAlerts } from '@/data/mockAlerts';
import { AlertSummary } from '@/types/alert';
import { StatCard } from './StatCard';
import { AlertCard } from './AlertCard';
import { EventGrid } from './EventGrid';
import { DateSelector } from './DateSelector';
import { Activity, CheckCircle2, AlertTriangle, XCircle, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Dashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date('2026-01-29'));

  const summary = useMemo<AlertSummary>(() => {
    return mockAlerts.reduce(
      (acc, alert) => {
        acc.total++;
        if (alert.status === 'verde') acc.success++;
        if (alert.status === 'naranja') acc.warning++;
        if (alert.status === 'rojo') acc.critical++;
        return acc;
      },
      { total: 0, success: 0, warning: 0, critical: 0 }
    );
  }, []);

  const criticalAlerts = useMemo(() => {
    return mockAlerts.filter((a) => a.status === 'rojo' || a.status === 'naranja')
      .sort((a, b) => (a.status === 'rojo' ? -1 : 1));
  }, []);

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
            
            <DateSelector date={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
              <div className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--status-success))]" />
                <p className="text-lg font-medium">Todo en orden</p>
                <p className="text-sm">No hay alertas activas para esta fecha</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all">
            <EventGrid alerts={mockAlerts} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
