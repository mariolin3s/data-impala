import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DateRange } from "react-day-picker";

interface DateSelectorProps {
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
}

export function DateSelector({ range, onRangeChange }: DateSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              // aspecto tipo input del DS: borde neutro, sin elevación en hover
              "bg-card border-[1.5px] border-input text-foreground hover:bg-muted/50 hover:translate-y-0 hover:shadow-none"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
            {range?.from ? (
              range.to ? (
                <>
                  {format(range.from, "d LLL", { locale: es })} -{" "}
                  {format(range.to, "d LLL, yyyy", { locale: es })}
                </>
              ) : (
                format(range.from, "d 'de' MMMM, yyyy", { locale: es })
              )
            ) : (
              <span>Seleccionar periodo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 rounded-lg shadow-ib-md" align="end">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={range?.from}
            selected={range}
            onSelect={onRangeChange}
            numberOfMonths={2}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
