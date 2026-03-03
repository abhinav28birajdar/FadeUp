import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        let isMounted = true;

        const checkNetwork = async () => {
            try {
                const state = await Network.getNetworkStateAsync();
                if (isMounted) setIsConnected(state.isConnected ?? null);
            } catch {
                if (isMounted) setIsConnected(null);
            }
        };

        checkNetwork();

        // Poll every 5 seconds as expo-network lacks a real-time change event
        const interval = setInterval(checkNetwork, 5000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    return { isConnected };
}
