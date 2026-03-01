import { useState, useEffect } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean | null>(true);

    useEffect(() => {
        const checkNetwork = async () => {
            const state = await Network.getNetworkStateAsync();
            setIsConnected(state.isConnected ?? null);
        };

        checkNetwork();

        // expo-network does not have a real-time event listener out of the box currently,
        // usually we'd use @react-native-community/netinfo. For now, checking periodically or assuming connected.
        const interval = setInterval(checkNetwork, 10000);
        return () => clearInterval(interval);
    }, []);

    return { isConnected };
}
