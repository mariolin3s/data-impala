import { useState, useEffect } from 'react';
import { AlertEvent } from '@/types/alert';
import { supabase } from '@/lib/supabase';

export function useAlerts() {
    const [alerts, setAlerts] = useState<AlertEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchAlerts() {
            try {
                // Supabase has a hard limit of 1000 rows per request
                // We need to paginate to get all data
                let allData: any[] = [];
                let from = 0;
                const pageSize = 1000;
                let hasMore = true;

                while (hasMore) {
                    const { data, error: supabaseError } = await supabase
                        .from('iberdrola')
                        .select('*')
                        .order('date', { ascending: false })
                        .range(from, from + pageSize - 1);

                    if (supabaseError) {
                        throw supabaseError;
                    }

                    if (data && data.length > 0) {
                        allData = [...allData, ...data];
                        from += pageSize;

                        // If we got less than pageSize, we've reached the end
                        if (data.length < pageSize) {
                            hasMore = false;
                        }
                    } else {
                        hasMore = false;
                    }
                }

                // Transform data to ensure numeric fields are numbers
                const transformedData = allData.map(item => ({
                    ...item,
                    event_count: Number(item.event_count || 0),
                    mediana: Number(item.mediana || 0),
                    max: Number(item.max || 0),
                    minimo: Number(item.minimo || 0),
                    weekday: item.weekday ? String(item.weekday) : '0'
                }));

                // Debug logging
                console.log('📥 Loaded from Supabase:', {
                    totalRecords: transformedData.length,
                    sampleDates: transformedData.slice(0, 10).map(item => item.date),
                    dateRange: transformedData.length > 0 ? {
                        earliest: transformedData[transformedData.length - 1]?.date,
                        latest: transformedData[0]?.date
                    } : null
                });

                setAlerts(transformedData as AlertEvent[]);
                setLoading(false);
            } catch (err) {
                console.error("Error loading alerts from Supabase:", err);
                setError(err instanceof Error ? err : new Error('Unknown error loading alerts'));
                setLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    return { alerts, loading, error };
}
