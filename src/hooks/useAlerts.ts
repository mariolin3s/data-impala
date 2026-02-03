import { useState, useEffect } from 'react';
import { AlertEvent } from '@/types/alert';
import alertsData from '@/data/alerts.json';

export function useAlerts() {
    const [alerts, setAlerts] = useState<AlertEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        try {
            const transformedData = (alertsData as any[]).map(item => ({
                ...item,
                event_count: Number(item.event_count || 0),
                mediana: Number(item.mediana || 0),
                max: Number(item.max || 0),
                minimo: Number(item.minimo || 0),
                weekday: Number(item.weekday || 0)
            }));
            setAlerts(transformedData as AlertEvent[]);
            setLoading(false);
        } catch (err) {
            console.error("Error loading alerts from JSON:", err);
            setError(err instanceof Error ? err : new Error('Unknown error loading alerts'));
            setLoading(false);
        }
    }, []);

    return { alerts, loading, error };
}
