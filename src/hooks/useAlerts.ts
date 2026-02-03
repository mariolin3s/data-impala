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
                const { data, error: supabaseError } = await supabase
                    .from('iberdrola')
                    .select('*')
                    .order('date', { ascending: false });

                if (supabaseError) {
                    throw supabaseError;
                }

                // Transform data to ensure numeric fields are numbers
                const transformedData = (data || []).map(item => ({
                    ...item,
                    event_count: Number(item.event_count || 0),
                    mediana: Number(item.mediana || 0),
                    max: Number(item.max || 0),
                    minimo: Number(item.minimo || 0),
                    weekday: item.weekday ? String(item.weekday) : '0'
                }));

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
