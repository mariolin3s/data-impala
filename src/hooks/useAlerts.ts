import { useState, useEffect } from 'react';
import { AlertEvent } from '@/types/alert';
import { supabase } from '@/lib/supabase';
import { DateRange } from "react-day-picker";
import { format, subDays } from 'date-fns';
import { STAGNANT_DAYS } from '@/lib/alerts';

export function useAlerts(dateRange: DateRange | undefined) {
    // `alerts`: filas dentro del rango seleccionado (para mostrar).
    const [alerts, setAlerts] = useState<AlertEvent[]>([]);
    // `historyAlerts`: `alerts` + un buffer de STAGNANT_DAYS días previos,
    // necesario para calcular correctamente "estancado"/"nuevo" cerca del inicio del rango.
    const [historyAlerts, setHistoryAlerts] = useState<AlertEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAlerts() {
            if (!dateRange?.from || !dateRange?.to) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const fromDate = format(dateRange.from, 'yyyy-MM-dd');
                const toDate = format(dateRange.to, 'yyyy-MM-dd');
                // Se consulta desde STAGNANT_DAYS días antes del inicio del rango para
                // disponer del histórico previo (buffer) que necesita la lógica de estancados.
                const queryFromDate = format(subDays(dateRange.from, STAGNANT_DAYS), 'yyyy-MM-dd');

                console.log(`🔍 Starting fetch for range: ${fromDate} to ${toDate} (buffer desde ${queryFromDate})`);

                let allData: any[] = [];
                let from = 0;
                const pageSize = 1000;
                let hasMore = true;
                let totalEstimated = 0;

                // Initial fetch to get the first page and the total count
                const { data: firstPage, error: firstError, count } = await supabase
                    .from('data_impala_iberdrola')
                    .select('*', { count: 'exact' })
                    .gte('date', queryFromDate)
                    .lte('date', toDate)
                    // Orden determinista: `date` no es único (miles de filas por día),
                    // así que se añade `id` (clave única) como desempate. Sin esto, la
                    // paginación por rango salta/duplica filas en los límites de página.
                    .order('date', { ascending: false })
                    .order('id', { ascending: false })
                    .range(0, pageSize - 1);

                if (firstError) throw firstError;

                if (firstPage) {
                    allData = [...firstPage];
                    totalEstimated = count || 0;
                    console.log(`📄 Page 1 fetched: ${firstPage.length} rows. Total in range: ${totalEstimated}`);

                    if (firstPage.length < pageSize || allData.length >= totalEstimated) {
                        hasMore = false;
                    } else {
                        from = pageSize;
                    }
                } else {
                    hasMore = false;
                }

                // Fetch subsequent pages if necessary
                while (hasMore) {
                    console.log(`⏳ Fetching next page starting at offset ${from}...`);
                    const { data, error: supabaseError } = await supabase
                        .from('data_impala_iberdrola')
                        .select('*')
                        .gte('date', queryFromDate)
                        .lte('date', toDate)
                        .order('date', { ascending: false })
                        .order('id', { ascending: false })
                        .range(from, from + pageSize - 1);

                    if (supabaseError) throw supabaseError;

                    if (data && data.length > 0) {
                        allData = [...allData, ...data];
                        console.log(`✅ Page fetched: ${data.length} rows. Progress: ${allData.length}/${totalEstimated}`);
                        from += pageSize;

                        if (data.length < pageSize || allData.length >= totalEstimated) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                }

                // Transform data.
                // Se excluyen los eventos con status 'gris' (aún no activos): son ruido
                // y no deben aparecer en ninguna parte del dashboard ni en los cálculos.
                const transformedData = allData
                    .filter(item => item.status !== 'gris')
                    .map(item => ({
                        ...item,
                        event_count: Number(item.event_count || 0),
                        mediana: Number(item.mediana || 0),
                        max: Number(item.max || 0),
                        minimo: Number(item.minimo || 0),
                        weekday: item.weekday ? String(item.weekday) : '0',
                        form_name: item.form_name ?? null
                    }));

                // El buffer previo (queryFromDate..fromDate) se usa solo para cálculos
                // (estancado/nuevo); lo que se muestra es únicamente el rango seleccionado.
                const visibleData = transformedData.filter(item => item.date >= fromDate);

                console.log('✨ Data fetch complete:', {
                    visibleRecords: visibleData.length,
                    withBuffer: transformedData.length,
                    totalFromSupabase: totalEstimated,
                    range: { from: fromDate, to: toDate, buffer: queryFromDate }
                });

                setAlerts(visibleData as AlertEvent[]);
                setHistoryAlerts(transformedData as AlertEvent[]);
                setLoading(false);
            } catch (err) {
                console.error("❌ Error loading alerts from Supabase:", err);
                setError(err instanceof Error ? err : new Error('Unknown error loading alerts'));
                setLoading(false);
            }
        }

        fetchAlerts();
    }, [dateRange?.from, dateRange?.to]);

    return { alerts, historyAlerts, loading, error };
}
