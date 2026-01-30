import { AlertEvent } from '@/types/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Filter } from 'lucide-react';

interface AlertFiltersProps {
  alerts: AlertEvent[];
  selectedEvent: string | null;
  selectedPlatform: string | null;
  selectedStatus: string | null;
  onEventChange: (event: string | null) => void;
  onPlatformChange: (platform: string | null) => void;
  onStatusChange: (status: string | null) => void;
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

export function AlertFilters({
  alerts,
  selectedEvent,
  selectedPlatform,
  selectedStatus,
  onEventChange,
  onPlatformChange,
  onStatusChange,
  onClearFilters,
}: AlertFiltersProps) {
  const uniqueEvents = [...new Set(alerts.map((a) => a.event))].sort();
  const uniquePlatforms = [...new Set(alerts.map((a) => a.platform))].sort();

  const hasActiveFilters = selectedEvent || selectedPlatform || selectedStatus;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtrar por:</span>
      </div>

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
        </SelectContent>
      </Select>

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
  );
}
