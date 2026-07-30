import { Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TribuSelectorProps {
  value: string | null;
  onChange: (tribu: string | null) => void;
  tribus: string[];
}

/** Formatea el valor de tribu para mostrar (p. ej. "web_publica" → "Web pública"). */
export function formatTribu(tribu: string): string {
  const label = tribu.replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/**
 * Selector de tribu (equipo) en el header. Al elegir una tribu se filtra todo el
 * dashboard con sus eventos. La lista es dinámica (se pasa desde los datos cargados).
 * "Todas las tribus" (value 'all') equivale a null = sin filtro.
 */
export function TribuSelector({ value, onChange, tribus }: TribuSelectorProps) {
  if (tribus.length === 0) return null;

  return (
    <Select
      value={value ?? 'all'}
      onValueChange={(v) => onChange(v === 'all' ? null : v)}
    >
      <SelectTrigger className="h-9 w-[190px] rounded-full" aria-label="Filtrar por tribu">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="h-4 w-4 shrink-0 text-primary" />
          <SelectValue placeholder="Todas las tribus" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas las tribus</SelectItem>
        {tribus.map((tribu) => (
          <SelectItem key={tribu} value={tribu}>
            {formatTribu(tribu)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
