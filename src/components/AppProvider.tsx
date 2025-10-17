/**
 * AppProvider Component
 * Integrates all app-wide providers and utilities in the correct order
 */
import React, { ReactNode, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { cache } from '../utils/cacheManager';
import { ConnectivityProvider } from '../utils/connectivity';
import { logger } from '../utils/logger';
import { ToastProvider } from '../utils/toast';
import { AppInitializer } from './AppInitializer';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const { session } = useAuthStore();

  // Perform initialization and cleanup
  useEffect(() => {
    const initialize = async () => {
      try {
        // Perform startup tasks
        logger.info('App initializing');
        
        // Clean up expired cache entries on app start
        await cache.purgeExpired();
      } catch (error) {
        logger.error('Error during app initialization', error);
      }
    };

    initialize();

    return () => {
      // Cleanup logic when component unmounts
      logger.info('App shutting down');
    };
  }, []);

  // Nest providers in the correct order (inside-out)
  // Order matters! Providers that depend on others should be nested inside them
  return (
    <ConnectivityProvider offlineFirst={false} syncInterval={60000}>
      <ToastProvider maxToasts={3}>
        {children}
        {/* Only initialize real-time features when user is authenticated */}
        {session && <AppInitializer />}
      </ToastProvider>
    </ConnectivityProvider>
  );
}

export default AppProvider;