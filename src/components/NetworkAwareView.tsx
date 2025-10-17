/**
 * NetworkAwareView Component
 * A smart container that handles network connectivity states
 */
import React, { ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConnectivity } from '../utils/connectivity';
import { logger } from '../utils/logger';
import { useToast } from '../utils/toast';

interface NetworkAwareViewProps {
  children: ReactNode;
  fallbackComponent?: ReactNode;
  loadingComponent?: ReactNode;
  requiresNetwork?: boolean;
  onRetry?: () => void;
}

export const NetworkAwareView: React.FC<NetworkAwareViewProps> = ({
  children,
  fallbackComponent,
  loadingComponent,
  requiresNetwork = true,
  onRetry
}) => {
  const { isConnected, isInternetReachable } = useConnectivity();
  const [isRetrying, setIsRetrying] = useState(false);
  const toast = useToast();

  const isOnline = isConnected && isInternetReachable;
  const showOfflineMessage = requiresNetwork && !isOnline;

  useEffect(() => {
    // Log connectivity changes
    if (requiresNetwork) {
      if (!isOnline) {
        logger.info('Network connectivity lost - NetworkAwareView');
      } else {
        logger.info('Network connectivity restored - NetworkAwareView');
      }
    }
  }, [isOnline, requiresNetwork]);

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      
      // If we have a retry callback, execute it
      if (onRetry) {
        await onRetry();
      }
      
      // Check if network is available now
      if (isConnected && isInternetReachable) {
        toast.success('Connection restored!');
      } else {
        toast.error('Still offline. Please check your connection.');
      }
    } catch (error) {
      logger.error('Error during retry', error);
      toast.error('Failed to reconnect. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  };

  // If we're offline and require a network connection
  if (showOfflineMessage) {
    // If a custom fallback is provided, use it
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }
    
    // Otherwise show our default offline message
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No Internet Connection</Text>
        <Text style={styles.message}>
          This feature requires an internet connection. Please check your connection and try again.
        </Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.buttonText}>Retry</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // If we're loading
  if (isRetrying) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.message}>Reconnecting...</Text>
      </View>
    );
  }

  // Everything is good, show the children
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NetworkAwareView;