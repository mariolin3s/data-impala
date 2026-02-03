import { useState, useEffect } from 'react';
import { AlertEvent } from '@/types/alert';
import alertsData from '@/data/alerts.json';

export function useAlerts() {
    const [alerts, setAlerts] = useState<AlertEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        try {
            // In a static build, we just use the imported JSON
            // If we wanted to fetch it dynamically (e.g. from a public URL), we could use fetch()
            setAlerts(alertsData as AlertEvent[]);
            setLoading(false);
        } catch (err) {
            console.error("Error loading alerts from JSON:", err);
            setError(err instanceof Error ? err : new Error('Unknown error loading alerts'));
            setLoading(false);
        }
    }, []);

    return { alerts, loading, error };
}
