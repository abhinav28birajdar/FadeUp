/**
 * Connectivity management utility
 * Monitors network status and provides utilities for offline handling
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { logger } from './logger';
import { useToast } from './toast';

// Storage keys for offline data
export const OFFLINE_STORAGE_KEYS = {
  PENDING_REQUESTS: '@FadeUp:pendingRequests',
};

// Types
export interface PendingRequest {
  id: string;
  endpoint: string;
  method: string;
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

interface ConnectivityContextType {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string | null;
  savePendingRequest: (request: Omit<PendingRequest, 'id' | 'timestamp' | 'retries'>) => Promise<string>;
  getPendingRequests: () => Promise<PendingRequest[]>;
  removePendingRequest: (id: string) => Promise<void>;
  isOfflineFirst: boolean;
  executeOfflineSync: () => Promise<void>;
}

const ConnectivityContext = createContext<ConnectivityContextType>({
  isConnected: null,
  isInternetReachable: null,
  type: null,
  savePendingRequest: async () => '',
  getPendingRequests: async () => [],
  removePendingRequest: async () => {},
  isOfflineFirst: false,
  executeOfflineSync: async () => {},
});

export const useConnectivity = () => useContext(ConnectivityContext);

interface ConnectivityProviderProps {
  children: ReactNode;
  offlineFirst?: boolean;
  syncInterval?: number;
}

export const ConnectivityProvider = ({
  children,
  offlineFirst = false,
  syncInterval = 60000, // Default: try to sync every minute when regaining connection
}: ConnectivityProviderProps) => {
  const [netInfo, setNetInfo] = useState<NetInfoState>({
    isConnected: null,
    isInternetReachable: null,
    type: null,
    details: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const toast = useToast();

  // Track connectivity changes
  useEffect(() => {
    let unsubscribe: NetInfoSubscription;

    const setupNetInfoListener = async () => {
      try {
        // Get initial network state
        const state = await NetInfo.fetch();
        setNetInfo(state);

        // Subscribe to network state updates
        unsubscribe = NetInfo.addEventListener((state) => {
          setNetInfo(state);

          // If we just regained connectivity, try to sync pending requests
          if (state.isConnected && state.isInternetReachable) {
            const previouslyOffline = !netInfo.isConnected || !netInfo.isInternetReachable;
            if (previouslyOffline) {
              logger.info('Network connection restored');
              toast.show('Network connection restored', { type: 'info' });
              executeOfflineSync();
            }
          } else if (state.isConnected === false) {
            logger.warn('Network connection lost');
            toast.show('You are offline. Some features may be limited.', { 
              type: 'warning',
              duration: 0, // Don't auto-dismiss
            });
          }
        });
      } catch (error) {
        logger.error('Failed to setup network info listener', error);
      }
    };

    setupNetInfoListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Save a request to be executed when online
  const savePendingRequest = async (
    request: Omit<PendingRequest, 'id' | 'timestamp' | 'retries'>
  ): Promise<string> => {
    try {
      const pendingRequests = await getPendingRequests();

      const newRequest: PendingRequest = {
        ...request,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        retries: 0,
      };

      const updatedRequests = [...pendingRequests, newRequest];
      await AsyncStorage.setItem(
        OFFLINE_STORAGE_KEYS.PENDING_REQUESTS,
        JSON.stringify(updatedRequests)
      );

      logger.debug('Saved pending request for offline mode', {
        endpoint: request.endpoint,
        method: request.method,
      });

      return newRequest.id;
    } catch (error) {
      logger.error('Failed to save pending request', error);
      throw error;
    }
  };

  // Get all pending requests
  const getPendingRequests = async (): Promise<PendingRequest[]> => {
    try {
      const requests = await AsyncStorage.getItem(OFFLINE_STORAGE_KEYS.PENDING_REQUESTS);
      return requests ? JSON.parse(requests) : [];
    } catch (error) {
      logger.error('Failed to get pending requests', error);
      return [];
    }
  };

  // Remove a pending request by ID
  const removePendingRequest = async (id: string): Promise<void> => {
    try {
      const pendingRequests = await getPendingRequests();
      const updatedRequests = pendingRequests.filter((request) => request.id !== id);
      await AsyncStorage.setItem(
        OFFLINE_STORAGE_KEYS.PENDING_REQUESTS,
        JSON.stringify(updatedRequests)
      );

      logger.debug('Removed pending request', { id });
    } catch (error) {
      logger.error('Failed to remove pending request', error);
      throw error;
    }
  };

  // Execute all pending requests
  const executeOfflineSync = async (): Promise<void> => {
    if (isSyncing || !netInfo.isConnected || !netInfo.isInternetReachable) {
      return;
    }

    try {
      setIsSyncing(true);
      const pendingRequests = await getPendingRequests();

      if (pendingRequests.length === 0) {
        return;
      }

      logger.info(`Attempting to sync ${pendingRequests.length} pending requests`);
      
      toast.show(`Syncing ${pendingRequests.length} offline ${pendingRequests.length === 1 ? 'change' : 'changes'}...`, {
        type: 'info',
      });

      // Process each pending request
      for (const request of pendingRequests) {
        try {
          // Execute the request
          const response = await fetch(request.endpoint, {
            method: request.method,
            headers: {
              'Content-Type': 'application/json',
              ...request.headers,
            },
            body: request.body ? JSON.stringify(request.body) : undefined,
          });

          if (response.ok) {
            // Successfully synced, remove from pending
            await removePendingRequest(request.id);
            logger.debug('Successfully synced offline request', {
              endpoint: request.endpoint,
              method: request.method,
            });
          } else {
            // Failed to sync, increment retry count if under threshold
            const MAX_RETRIES = 3;
            if (request.retries < MAX_RETRIES) {
              const updatedRequest = {
                ...request,
                retries: request.retries + 1,
              };

              // Update the request with incremented retry count
              const allRequests = await getPendingRequests();
              const updatedRequests = allRequests.map((r) =>
                r.id === request.id ? updatedRequest : r
              );
              await AsyncStorage.setItem(
                OFFLINE_STORAGE_KEYS.PENDING_REQUESTS,
                JSON.stringify(updatedRequests)
              );

              logger.warn('Failed to sync offline request, will retry later', {
                endpoint: request.endpoint,
                method: request.method,
                status: response.status,
                retries: updatedRequest.retries,
              });
            } else {
              // Max retries reached, give up on this request
              await removePendingRequest(request.id);
              logger.error('Failed to sync offline request after max retries', {
                endpoint: request.endpoint,
                method: request.method,
                status: response.status,
              });
            }
          }
        } catch (error) {
          logger.error('Error processing offline request', {
            error,
            request: {
              endpoint: request.endpoint,
              method: request.method,
            },
          });
        }
      }

      // Show summary of sync result
      const remainingRequests = await getPendingRequests();
      const syncedCount = pendingRequests.length - remainingRequests.length;
      
      if (syncedCount > 0) {
        if (remainingRequests.length === 0) {
          toast.show(`Successfully synced ${syncedCount} ${syncedCount === 1 ? 'change' : 'changes'}`, {
            type: 'success',
          });
        } else {
          toast.show(`Synced ${syncedCount} of ${pendingRequests.length} ${pendingRequests.length === 1 ? 'change' : 'changes'}`, {
            type: 'info',
          });
        }
      }
    } catch (error) {
      logger.error('Failed to execute offline sync', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Periodically try to sync if there are pending requests
  useEffect(() => {
    let syncTimer: NodeJS.Timeout;

    const checkAndSyncPending = async () => {
      try {
        const pendingRequests = await getPendingRequests();
        if (
          pendingRequests.length > 0 &&
          netInfo.isConnected &&
          netInfo.isInternetReachable
        ) {
          executeOfflineSync();
        }
      } catch (error) {
        logger.error('Error checking pending requests for sync', error);
      }
    };

    if (syncInterval > 0) {
      syncTimer = setInterval(checkAndSyncPending, syncInterval);
    }

    return () => {
      if (syncTimer) {
        clearInterval(syncTimer);
      }
    };
  }, [netInfo.isConnected, netInfo.isInternetReachable, syncInterval]);

  return (
    <ConnectivityContext.Provider
      value={{
        isConnected: netInfo.isConnected,
        isInternetReachable: netInfo.isInternetReachable,
        type: netInfo.type,
        savePendingRequest,
        getPendingRequests,
        removePendingRequest,
        isOfflineFirst: offlineFirst,
        executeOfflineSync,
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

// Create a hook that wraps fetch with offline capabilities
export const useOfflineFetch = () => {
  const { 
    isConnected, 
    isInternetReachable, 
    savePendingRequest,
    isOfflineFirst
  } = useConnectivity();

  const offlineFetch = async (
    url: string,
    options: RequestInit & { offlineOptions?: { canOffline: boolean } } = {}
  ) => {
    const isOnline = isConnected && isInternetReachable;
    const { offlineOptions, ...fetchOptions } = options;
    
    // Whether this request can be stored offline when connectivity is lost
    const canOffline = offlineOptions?.canOffline ?? false;

    // If we're online or this is a GET request, try the regular fetch
    if (isOnline || fetchOptions.method === 'GET' || fetchOptions.method === undefined) {
      try {
        const response = await fetch(url, fetchOptions);
        return response;
      } catch (error) {
        // If the fetch failed and we can store offline, do so
        if (canOffline && fetchOptions.method && fetchOptions.method !== 'GET') {
          await savePendingRequest({
            endpoint: url,
            method: fetchOptions.method,
            body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
            headers: fetchOptions.headers as Record<string, string>,
          });

          logger.debug('Request saved for offline processing', {
            url,
            method: fetchOptions.method,
          });

          // Return a mock successful response for offline-first approach
          if (isOfflineFirst) {
            return new Response(JSON.stringify({ success: true, offlineEnqueued: true }), {
              status: 202,
              statusText: 'Accepted for offline processing',
            });
          }
        }
        
        throw error;
      }
    } else if (canOffline && fetchOptions.method && fetchOptions.method !== 'GET') {
      // We're offline but this request can be stored for later
      await savePendingRequest({
        endpoint: url,
        method: fetchOptions.method,
        body: fetchOptions.body ? JSON.parse(fetchOptions.body as string) : undefined,
        headers: fetchOptions.headers as Record<string, string>,
      });

      logger.info('Request saved for when connectivity is restored', {
        url,
        method: fetchOptions.method,
      });

      // Return a mock successful response for offline-first approach
      if (isOfflineFirst) {
        return new Response(JSON.stringify({ success: true, offlineEnqueued: true }), {
          status: 202,
          statusText: 'Accepted for offline processing',
        });
      }
      
      throw new Error('Network request failed - saved for later');
    }

    // We're offline and this request can't be stored
    throw new Error('Network request failed - offline mode');
  };

  return {
    fetch: offlineFetch,
    isOnline: isConnected && isInternetReachable,
  };
};