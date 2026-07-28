import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Buscador de eventos en el header: por defecto es solo una lupa;
 * al pulsarla se despliega el campo de texto (estilo DS, foco verde).
 * Se contrae al perder el foco si el campo está vacío.
 */
export function HeaderSearch({ value, onChange }: HeaderSearchProps) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Si hay una búsqueda activa, mantener el campo abierto aunque se recargue
  useEffect(() => {
    if (value) setOpen(true);
  }, [value]);

  return (
    <div
      className={cn(
        'flex items-center rounded-full border-[1.5px] transition-all duration-300 ease-out overflow-hidden',
        open ? 'w-64 border-input bg-card focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ib-green-100' : 'w-9 border-transparent bg-transparent'
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Buscar evento"
        className={cn(
          'flex h-9 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary',
          open ? 'w-8 pl-2.5' : 'w-9 rounded-full hover:bg-muted'
        )}
      >
        <Search className="h-4 w-4" />
      </button>

      {open && (
        <>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => { if (!value) setOpen(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onChange('');
                setOpen(false);
              }
            }}
            placeholder="Buscar evento o formulario..."
            className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          {value && (
            <button
              type="button"
              onClick={() => { onChange(''); inputRef.current?.focus(); }}
              aria-label="Limpiar búsqueda"
              className="mr-2 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}
