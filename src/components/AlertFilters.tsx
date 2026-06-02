import { AlertEvent } from '@/types/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter, Search, ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Clock } from 'lucide-react';

import { DateRange } from "react-day-picker";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { normalizeFormName, hasFormName } from '@/lib/alerts';

export type SortBy = 'platform_event' | 'event_name' | 'severity' | 'deviation';
export type SortDir = 'asc' | 'desc';

interface AlertFiltersProps {
  alerts: AlertEvent[];
  dateRange: DateRange | undefined;
  selectedEvent: string | null;
  selectedPlatform: string | null;
  selectedFormName: string | null;
  selectedStatus: string | null;
  searchQuery: string;
  sortBy: SortBy;
  sortDir: SortDir;
  onEventChange: (event: string | null) => void;
  onPlatformChange: (platform: string | null) => void;
  onFormNameChange: (formName: string | null) => void;
  onStatusChange: (status: string | null) => void;
  onSearchChange: (query: string) => void;
  onSortByChange: (sort: SortBy) => void;
  onSortDirToggle: () => void;
  onClearFilters: () => void;
}

const platformLabels: Record<string, string> = {
  web: 'Web',
  ios: 'iOS',
  android: 'Android',
};

const statusLabels: Record<string, string> = {
  verde: 'Normal',
  naranja: 'Advertencia',
  rojo: 'Crítico',
};

const sortLabels: Record<SortBy, string> = {
  platform_event: 'Plataforma + Evento',
  event_name: 'Nombre del evento',
  severity: 'Severidad',
  deviation: 'Desviación %',
};

export function AlertFilters({
  alerts,
  dateRange,
  selectedEvent,
  selectedPlatform,
  selectedFormName,
  selectedStatus,
  searchQuery,
  sortBy,
  sortDir,
  onEventChange,
  onPlatformChange,
  onFormNameChange,
  onStatusChange,
  onSearchChange,
  onSortByChange,
  onSortDirToggle,
  onClearFilters,
}: AlertFiltersProps) {
  const rangeAlerts = alerts.filter((alert) => {
    if (dateRange?.from && dateRange?.to) {
      return isWithinInterval(parseISO(alert.date), {
        start: startOfDay(dateRange.from),
        end: endOfDay(dateRange.to),
      });
    }
    return true;
  });

  const uniqueEvents = [...new Set(rangeAlerts.map((a) => a.event))].sort();
  const uniquePlatforms = [...new Set(rangeAlerts.map((a) => a.platform))].sort();
  const uniqueFormNames = [
    ...new Set(
      rangeAlerts.map((a) => normalizeFormName(a.form_name)).filter((f) => f !== '')
    ),
  ].sort();
  const hasFlowlessEvents = rangeAlerts.some((a) => !hasFormName(a.form_name));

  const hasActiveFilters =
    selectedEvent || selectedPlatform || selectedFormName || selectedStatus || searchQuery;

  const SortDirIcon = sortDir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      {/* LEFT: filter controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground h-9">
          <Filter className="h-4 w-4" />
          <span>Filtrar:</span>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground px-0.5">Evento</label>
          <Select
            value={selectedEvent || 'all'}
            onValueChange={(v) => onEventChange(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[160px] bg-muted/50 border-border">
              <SelectValue placeholder="Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los eventos</SelectItem>
              {uniqueEvents.map((event) => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground px-0.5">Plataforma</label>
          <Select
            value={selectedPlatform || 'all'}
            onValueChange={(v) => onPlatformChange(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[140px] bg-muted/50 border-border">
              <SelectValue placeholder="Plataforma" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {uniquePlatforms.map((platform) => (
                <SelectItem key={platform} value={platform}>
                  {platformLabels[platform] || platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(uniqueFormNames.length > 0 || hasFlowlessEvents) && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium text-muted-foreground px-0.5">Formulario</label>
            <Select
              value={selectedFormName || 'all'}
              onValueChange={(v) => onFormNameChange(v === 'all' ? null : v)}
            >
              <SelectTrigger className="w-[160px] bg-muted/50 border-border">
                <SelectValue placeholder="Formulario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los formularios</SelectItem>
                {hasFlowlessEvents && (
                  <SelectItem value="__none__">
                    <span className="italic text-muted-foreground">Sin formulario</span>
                  </SelectItem>
                )}
                {uniqueFormNames.map((formName) => (
                  <SelectItem key={formName} value={formName}>
                    {formName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground px-0.5">Estado</label>
          <Select
            value={selectedStatus || 'all'}
            onValueChange={(v) => onStatusChange(v === 'all' ? null : v)}
          >
            <SelectTrigger className="w-[140px] bg-muted/50 border-border">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
            <SelectItem value="nuevo">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-violet-400" />
                Nuevo
              </span>
            </SelectItem>
            <SelectItem value="estancado">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-amber-400" />
                Eventos Estancados
              </span>
            </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      {/* RIGHT: search + sort */}
      <div className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground px-0.5">Buscar</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar evento o formulario..."
              className="pl-8 w-[200px] h-9 bg-muted/50 border-border text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium text-muted-foreground px-0.5">Ordenar por</label>
          <div className="flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
            <Select
              value={sortBy}
              onValueChange={(v) => onSortByChange(v as SortBy)}
            >
              <SelectTrigger className="w-[180px] bg-muted/50 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(sortLabels) as [SortBy, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-muted/50 border-border shrink-0"
              onClick={onSortDirToggle}
              title={sortDir === 'asc' ? 'Orden ascendente' : 'Orden descendente'}
            >
              <SortDirIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
