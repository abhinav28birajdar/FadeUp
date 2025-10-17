/**
 * AppInitializer Component
 * Manages app initialization and real-time subscriptions
 */
import { QueueRealtimeManager } from '@/src/lib/queueRealtime';
import { supabase } from '@/src/lib/supabase';
import { useAuthStore } from '@/src/store/authStore';
import { logger } from '@/src/utils/logger';
import NetInfo, { NetInfoSubscription } from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

// Notification channels for real-time updates
const REALTIME_CHANNELS = {
  NOTIFICATIONS: 'notifications',
  BOOKINGS: 'bookings',
  QUEUE: 'queue',
  SHOP: 'shops',
  FEEDBACK: 'feedback',
};

export function AppInitializer() {
  const { session, user, role } = useAuthStore();
  const appStateRef = useRef(AppState.currentState);
  const netInfoUnsubscribeRef = useRef<NetInfoSubscription | null>(null);
  const queueRealtimeManager = QueueRealtimeManager.getInstance();
  
  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App is coming to foreground
        logger.info('App came to the foreground');
        
        // Reconnect to Supabase realtime if user is authenticated
        if (session) {
          await reconnectRealtime();
        }
      } else if (
        appStateRef.current === 'active' &&
        nextAppState.match(/inactive|background/)
      ) {
        // App is going to background
        logger.info('App went to the background');
      }
      
      appStateRef.current = nextAppState;
    };
    
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [session]);
  
  // Reconnect to Supabase realtime channels
  const reconnectRealtime = async () => {
    try {
      await supabase.removeAllChannels();
      setupRealtimeSubscriptions();
      logger.debug('Reconnected to Supabase realtime');
    } catch (error) {
      logger.error('Error reconnecting to Supabase realtime', error);
    }
  };
  
  // Monitor network connectivity
  useEffect(() => {
    netInfoUnsubscribeRef.current = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        if (session) {
          // Reconnect to realtime when network is restored
          reconnectRealtime();
        }
      }
    });
    
    return () => {
      if (netInfoUnsubscribeRef.current) {
        netInfoUnsubscribeRef.current();
      }
    };
  }, [session]);
  
  // Set up role-based real-time subscriptions
  useEffect(() => {
    if (user?.id && role) {
      setupRealtimeSubscriptions();
      
      // Clean up subscriptions when component unmounts or user changes
      return () => {
        cleanupSubscriptions();
      };
    }
  }, [user?.id, role]);
  
  const setupRealtimeSubscriptions = () => {
    if (!user?.id) return;
    
    try {
      // Subscribe to user's notifications
      supabase
        .channel(`${REALTIME_CHANNELS.NOTIFICATIONS}_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            logger.debug('New notification received', payload);
            // Add your notification handling logic here
          }
        )
        .subscribe((status) => {
          logger.info(`Notifications subscription status: ${status}`);
        });
      
      // Subscribe to user's bookings
      supabase
        .channel(`${REALTIME_CHANNELS.BOOKINGS}_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'bookings',
            filter: role === 'customer'
              ? `customer_id=eq.${user.id}`
              : `shop_id=eq.${user.id}`,
          },
          (payload) => {
            logger.debug('Booking update received', payload);
            // Add your booking update handling logic here
          }
        )
        .subscribe((status) => {
          logger.info(`Bookings subscription status: ${status}`);
        });
      
      // Role-specific subscriptions
      if (role === 'customer') {
        setupCustomerSubscriptions();
      } else if (role === 'shopkeeper') {
        setupShopkeeperSubscriptions();
      }
      
      logger.info('Realtime subscriptions set up successfully');
    } catch (error) {
      logger.error('Error setting up realtime subscriptions', error);
    }
  };
  
  const setupCustomerSubscriptions = () => {
    if (!user?.id) return;
    
    try {
      // Subscribe to queue updates
      queueRealtimeManager.subscribeToCustomerQueue(
        user.id,
        (queueItems) => {
          logger.debug('Customer queue updated', { count: queueItems.length });
          // Add your queue update handling logic here
        }
      );
    } catch (error) {
      logger.error('Error setting up customer subscriptions', error);
    }
  };
  
  const setupShopkeeperSubscriptions = async () => {
    if (!user?.id) return;
    
    try {
      // Get shopkeeper's shop
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single();
      
      if (shop?.id) {
        // Subscribe to shop's queue
        queueRealtimeManager.subscribeToShopQueue(
          shop.id,
          (queueItems) => {
            logger.debug('Shop queue updated', { count: queueItems.length });
            // Add your queue update handling logic here
          }
        );
        
        // Subscribe to shop's feedback
        supabase
          .channel(`${REALTIME_CHANNELS.FEEDBACK}_${shop.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'feedback',
              filter: `shop_id=eq.${shop.id}`,
            },
            (payload) => {
              logger.debug('New feedback received', payload);
              // Add your feedback handling logic here
            }
          )
          .subscribe((status) => {
            logger.info(`Feedback subscription status: ${status}`);
          });
      }
    } catch (error) {
      logger.error('Error setting up shopkeeper subscriptions', error);
    }
  };
  
  const cleanupSubscriptions = () => {
    logger.info('Cleaning up realtime subscriptions');
    
    // Clean up queue subscriptions
    queueRealtimeManager.unsubscribeAll();
    
    // Remove all Supabase channels
    supabase.removeAllChannels();
  };
  
  // This component doesn't render anything
  return null;
}