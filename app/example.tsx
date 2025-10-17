/**
 * Example screen demonstrating the new utilities
 */
import NetworkAwareView from '@/src/components/NetworkAwareView';
import { shopUtils } from '@/src/lib/supabaseUtils';
import { ShopWithDistance } from '@/src/types/supabase';
import { cache } from '@/src/utils/cacheManager';
import { useConnectivity } from '@/src/utils/connectivity';
import { logger } from '@/src/utils/logger';
import { fetchWithErrorHandling } from '@/src/utils/networkErrorHandler';
import { useToast } from '@/src/utils/toast';
import { useAppState } from '@/src/utils/useAppState';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExampleScreen() {
  const [shops, setShops] = useState<ShopWithDistance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const toast = useToast();
  const { isConnected, isInternetReachable, savePendingRequest } = useConnectivity();
  const isOnline = isConnected && isInternetReachable;
  const appState = useAppState();
  
  // Fetch shops with our error handling
  const fetchShops = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check cache first unless forced refresh
      if (!forceRefresh) {
        const cachedShops = await cache.get<ShopWithDistance[]>('nearby_shops');
        if (cachedShops) {
          logger.debug('Using cached shops data');
          setShops(cachedShops);
          setIsLoading(false);
          return;
        }
      }
      
      // No cache or forced refresh, fetch from API
      logger.info('Fetching shops from API');
      
      const response = await fetchWithErrorHandling(
        async () => {
          // In a real app, we'd use the user's location
          const { data, error } = await shopUtils.getAllShops();
          
          if (error) {
            throw error;
          }
          
          return data || [];
        },
        {},
        { retries: 2 }
      );
      
      if (response.error) {
        logger.error('Failed to fetch shops', response.error);
        setError('Could not load shops. Please try again.');
        toast.error('Failed to load shops');
      } else {
        setShops(response.data || []);
        // Cache the result
        await cache.set('nearby_shops', response.data, { ttl: 5 * 60 * 1000 }); // 5 minutes
        toast.success('Shops loaded successfully');
      }
    } catch (err) {
      logger.error('Error in fetchShops', err);
      setError('An unexpected error occurred');
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  // Load shops on mount
  useEffect(() => {
    fetchShops();
  }, [fetchShops]);
  
  // Handle app resuming from background
  useEffect(() => {
    if (appState.isResuming) {
      logger.debug('App resumed from background, refreshing data');
      fetchShops(true);
    }
  }, [appState.isResuming, fetchShops]);
  
  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchShops(true);
  }, [fetchShops]);
  
  // Demo an action that could be done offline
  const handleFakeBooking = async () => {
    if (!isOnline) {
      // In offline mode, save for later
      await savePendingRequest({
        endpoint: '/api/bookings',
        method: 'POST',
        body: {
          shop_id: 'demo-shop',
          service_ids: ['demo-service'],
          date: new Date().toISOString()
        }
      });
      
      toast.info('Booking saved for when you\'re back online');
    } else {
      // Online mode, perform action immediately
      toast.success('Booking created successfully!');
    }
  };
  
  // Clear cache demo
  const handleClearCache = async () => {
    await cache.clear();
    toast.info('Cache cleared');
    handleRefresh();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <NetworkAwareView
        requiresNetwork={true}
        onRetry={handleRefresh}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading} 
              onRefresh={handleRefresh} 
            />
          }
        >
          <Text style={styles.title}>FadeUp Demo</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Network Status</Text>
            <Text style={styles.infoText}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>App State</Text>
            <Text style={styles.infoText}>
              Active: {appState.isActive ? 'Yes' : 'No'}{'\n'}
              First Launch: {appState.isFirstLaunch ? 'Yes' : 'No'}{'\n'}
              Resuming: {appState.isResuming ? 'Yes' : 'No'}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Shops</Text>
            {isLoading ? (
              <Text style={styles.infoText}>Loading shops...</Text>
            ) : error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : shops.length === 0 ? (
              <Text style={styles.infoText}>No shops found</Text>
            ) : (
              <>
                <Text style={styles.infoText}>Found {shops.length} shops</Text>
                {shops.slice(0, 3).map(shop => (
                  <View key={shop.id} style={styles.shopItem}>
                    <Text style={styles.shopName}>{shop.name}</Text>
                    <Text style={styles.shopAddress}>{shop.address}</Text>
                  </View>
                ))}
                {shops.length > 3 && (
                  <Text style={styles.moreText}>
                    +{shops.length - 3} more shops...
                  </Text>
                )}
              </>
            )}
          </View>
          
          <View style={styles.buttonGroup}>
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleFakeBooking}
            >
              <Text style={styles.buttonText}>Test Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleClearCache}
            >
              <Text style={styles.buttonText}>Clear Cache</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                toast.show('This is a default toast message');
                setTimeout(() => {
                  toast.success('This is a success message');
                }, 1500);
                setTimeout(() => {
                  toast.error('This is an error message');
                }, 3000);
                setTimeout(() => {
                  toast.warning('This is a warning message');
                }, 4500);
              }}
            >
              <Text style={styles.buttonText}>Test Toast</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.button} 
              onPress={() => {
                logger.debug('Debug message from example screen');
                logger.info('Info message from example screen');
                logger.warn('Warning message from example screen');
                logger.error('Error message from example screen');
                toast.info('Logs generated. Check console.');
              }}
            >
              <Text style={styles.buttonText}>Test Logger</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.backButton]} 
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </NetworkAwareView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
  },
  shopItem: {
    marginTop: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
  },
  shopAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  moreText: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
  },
  buttonGroup: {
    marginTop: 8,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
});