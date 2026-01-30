import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ date, onDateChange }: DateSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(subDays(date, 1))}
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[200px] justify-start text-left font-normal",
              "bg-muted/50 border-border hover:bg-muted"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "d 'de' MMMM, yyyy", { locale: es })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => d && onDateChange(d)}
            initialFocus
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDateChange(addDays(date, 1))}
        className="h-9 w-9"
        disabled={date >= new Date()}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
