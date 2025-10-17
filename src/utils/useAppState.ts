/**
 * App State Management Hook
 * Provides global application state and utilities
 */
import { useCallback, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useConnectivity } from './connectivity';
import { logger } from './logger';
import { useToast } from './toast';

// How long the app can be in background before considering it "resumed"
const BACKGROUND_THRESHOLD = 30000; // 30 seconds

interface AppStateData {
  appState: AppStateStatus;
  lastActiveAt: number | null;
  backgroundDuration: number | null;
  isActive: boolean;
  isFirstLaunch: boolean;
  isResuming: boolean;
  lastSyncedAt: number | null;
}

export const useAppState = () => {
  const [state, setState] = useState<AppStateData>({
    appState: AppState.currentState,
    lastActiveAt: Date.now(),
    backgroundDuration: null,
    isActive: AppState.currentState === 'active',
    isFirstLaunch: true,
    isResuming: false,
    lastSyncedAt: null,
  });
  
  const connectivity = useConnectivity();
  const toast = useToast();

  // Handle app state changes (foreground, background)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const timestamp = Date.now();
      
      setState(prevState => {
        // Calculate how long the app was in background if we're coming back to foreground
        let backgroundDuration = null;
        if (nextAppState === 'active' && prevState.appState !== 'active' && prevState.lastActiveAt) {
          backgroundDuration = timestamp - prevState.lastActiveAt;
        }

        // Determine if this is a "resume" (coming back after significant time)
        const isResuming = 
          nextAppState === 'active' && 
          prevState.appState !== 'active' && 
          backgroundDuration !== null && 
          backgroundDuration > BACKGROUND_THRESHOLD;

        // If we're going to background, record the time
        const lastActiveAt = 
          nextAppState === 'active' 
            ? timestamp 
            : prevState.lastActiveAt;

        return {
          ...prevState,
          appState: nextAppState,
          lastActiveAt,
          isActive: nextAppState === 'active',
          backgroundDuration,
          isFirstLaunch: prevState.isFirstLaunch && nextAppState === 'active',
          isResuming,
        };
      });

      // Refresh data if we're coming back to foreground after a while
      if (nextAppState === 'active') {
        // Clear any existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }

        // Check if we need to refresh data (coming from background)
        const prevState = state;
        const backgroundDuration = prevState.lastActiveAt ? timestamp - prevState.lastActiveAt : null;
        
        if (
          backgroundDuration && 
          backgroundDuration > BACKGROUND_THRESHOLD && 
          connectivity.isConnected
        ) {
          refreshAppData();
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background, start timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        timeoutId = setTimeout(() => {
          logger.debug('App was in background for a while');
        }, BACKGROUND_THRESHOLD);
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [connectivity.isConnected, state]);

  // Function to refresh app data (call when resuming from background)
  const refreshAppData = useCallback(async () => {
    try {
      logger.debug('Refreshing app data after resuming');
      
      // Only sync if we have connectivity
      if (connectivity.isConnected && connectivity.isInternetReachable) {
        // Try to sync any offline data
        await connectivity.executeOfflineSync();
        
        // TODO: Add any other data refresh operations here
        // e.g., fetchLatestNotifications(), refreshUserData(), etc.
        
        setState(prev => ({ ...prev, lastSyncedAt: Date.now() }));
      } else if (!connectivity.isConnected) {
        toast.info('You appear to be offline. Some data may not be updated.');
      }
    } catch (error) {
      logger.error('Failed to refresh app data', error);
    }
  }, [connectivity]);

  // Provide a way to force a refresh
  const forceRefresh = useCallback(async () => {
    try {
      toast.info('Refreshing data...');
      await refreshAppData();
      toast.success('Data refreshed successfully');
    } catch (error) {
      logger.error('Failed to force refresh app data', error);
      toast.error('Failed to refresh data');
    }
  }, [refreshAppData, toast]);

  return {
    ...state,
    refreshAppData,
    forceRefresh,
    isOnline: connectivity.isConnected && connectivity.isInternetReachable,
  };
};