import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface QueueItem {
  id: string;
  shop_id: string;
  customer_id: string;
  booking_id: string;
  position: number;
  status: 'waiting' | 'in_service' | 'ready_next' | 'completed' | 'skipped';
  estimated_wait_time?: number;
  in_progress_start_time?: string;
  created_at: string;
  updated_at?: string;
  customer_name?: string;
  customer_avatar?: string;
  service_names?: string[];
}

export type RealtimeQueuePayload = RealtimePostgresChangesPayload<{
  [key: string]: any;
}>;

export interface QueueSubscriptionCallback {
  (queue: QueueItem[]): void;
}

export type QueueChangeHandler = (payload: RealtimeQueuePayload) => void;

/**
 * Manages queue subscriptions with enhanced functionality
 */
export class QueueRealtimeManager {
  private static instance: QueueRealtimeManager;
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  static getInstance(): QueueRealtimeManager {
    if (!QueueRealtimeManager.instance) {
      QueueRealtimeManager.instance = new QueueRealtimeManager();
    }
    return QueueRealtimeManager.instance;
  }

  /**
   * Subscribe to a shop's queue with automatic fetching of enriched data
   */
  subscribeToShopQueue(shopId: string, callback: QueueSubscriptionCallback): () => void {
    const subscriptionKey = `queue_${shopId}`;
    
    // Unsubscribe from existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey)?.unsubscribe();
    }

    // Create new subscription
    const subscription = supabase
      .channel(`queue_${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
          filter: `shop_id=eq.${shopId}`,
        },
        async () => {
          // Fetch updated queue data with related entities
          const { data, error } = await supabase
            .from('queue')
            .select(`
              *,
              users:customer_id(id, first_name, last_name, avatar_url),
              bookings:booking_id(
                id,
                service_ids,
                total_price,
                notes
              )
            `)
            .eq('shop_id', shopId)
            .in('status', ['waiting', 'ready_next', 'in_service'])
            .order('position', { ascending: true });

          if (!error && data) {
            // Transform and enrich the queue data
            const queueWithServices = await this.enrichQueueWithServices(data);
            callback(queueWithServices);
          } else {
            console.error('Error fetching queue data:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Shop queue subscription status for ${shopId}:`, status);
      });

    this.subscriptions.set(subscriptionKey, subscription);

    // Return unsubscribe function
    return () => {
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.get(subscriptionKey)?.unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      }
    };
  }

  /**
   * Subscribe to a customer's queue entries
   */
  subscribeToCustomerQueue(customerId: string, callback: QueueSubscriptionCallback): () => void {
    const subscriptionKey = `customer_queue_${customerId}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey)?.unsubscribe();
    }

    const subscription = supabase
      .channel(`customer_queue_${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
          filter: `customer_id=eq.${customerId}`,
        },
        async () => {
          // Fetch updated queue data for this customer with shop information
          const { data, error } = await supabase
            .from('queue')
            .select(`
              *,
              shops:shop_id(id, name, address),
              bookings:booking_id(
                id,
                service_ids,
                total_price,
                notes
              )
            `)
            .eq('customer_id', customerId)
            .in('status', ['waiting', 'ready_next', 'in_service'])
            .order('created_at', { ascending: false });

          if (!error && data) {
            // Transform and enrich the queue data
            const queueWithServices = await this.enrichQueueWithServices(data);
            callback(queueWithServices);
          } else {
            console.error('Error fetching customer queue data:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log(`Customer queue subscription status for ${customerId}:`, status);
      });

    this.subscriptions.set(subscriptionKey, subscription);

    return () => {
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.get(subscriptionKey)?.unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      }
    };
  }

  /**
   * Helper to enrich queue data with service information
   */
  private async enrichQueueWithServices(queueData: any[]): Promise<QueueItem[]> {
    // Extract all service IDs from bookings
    const serviceIds = queueData
      .flatMap(item => item.bookings?.service_ids || [])
      .filter(Boolean);
    
    if (serviceIds.length === 0) {
      return this.mapQueueData(queueData);
    }

    // Fetch all services in a single query
    const { data: services } = await supabase
      .from('services')
      .select('id, name')
      .in('id', serviceIds);
    
    // Create a map for quick service lookup
    const serviceMap = new Map();
    services?.forEach(service => {
      serviceMap.set(service.id, service.name);
    });
    
    // Map and enrich queue data
    return this.mapQueueData(queueData, serviceMap);
  }

  /**
   * Map database queue records to QueueItem objects
   */
  private mapQueueData(data: any[], serviceMap?: Map<string, string>): QueueItem[] {
    return data.map(item => {
      // Map service IDs to names if available
      const serviceNames = item.bookings?.service_ids?.map((id: string) => 
        serviceMap?.get(id) || 'Unknown Service'
      ) || [];
      
      // Format customer name
      const firstName = item.users?.first_name || '';
      const lastName = item.users?.last_name || '';
      const customerName = `${firstName} ${lastName}`.trim() || 'Unknown Customer';
      
      return {
        id: item.id,
        shop_id: item.shop_id,
        customer_id: item.customer_id,
        booking_id: item.booking_id,
        position: item.position,
        status: item.status,
        estimated_wait_time: item.estimated_wait_time,
        in_progress_start_time: item.in_progress_start_time,
        created_at: item.created_at,
        updated_at: item.updated_at,
        customer_name: customerName,
        customer_avatar: item.users?.avatar_url,
        service_names: serviceNames,
        // Additional booking details if needed
        total_price: item.bookings?.total_price,
        notes: item.bookings?.notes,
        // Shop details if available
        shop_name: item.shops?.name,
        shop_address: item.shops?.address,
      };
    });
  }

  /**
   * Unsubscribe from all queue channels
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    console.log('Unsubscribed from all queue channels');
  }
}

// Convenience functions for easier importing and usage
export const subscribeToShopQueue = (shopId: string, callback: QueueSubscriptionCallback): () => void => {
  return QueueRealtimeManager.getInstance().subscribeToShopQueue(shopId, callback);
};

export const subscribeToCustomerQueue = (customerId: string, callback: QueueSubscriptionCallback): () => void => {
  return QueueRealtimeManager.getInstance().subscribeToCustomerQueue(customerId, callback);
};

export const unsubscribeAllQueues = (): void => {
  QueueRealtimeManager.getInstance().unsubscribeAll();
};

/**
 * Basic subscription to queue updates (direct events without automatic fetching)
 * @param shopId The shop ID to subscribe to
 * @param onUpdate Callback function to handle queue updates
 * @returns The Supabase RealtimeChannel object for unsubscribing
 */
export const subscribeToQueueUpdates = (
  shopId: string,
  onUpdate: QueueChangeHandler
): RealtimeChannel => {
  console.log(`Subscribing to raw queue updates for shop: ${shopId}`);

  const channel = supabase
    .channel(`queue_updates_${shopId}`)
    .on(
      'postgres_changes',
      {
        event: '*', 
        schema: 'public',
        table: 'queue',
        filter: `shop_id=eq.${shopId}` 
      },
      (payload) => {
        console.log('Real-time queue update received:', payload);
        onUpdate(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Queue subscription status for shop ${shopId}:`, status);
    });

  return channel;
};

/**
 * Subscribe to real-time booking updates for a specific user or shop
 * @param userId The user ID to subscribe to (for customer's bookings)
 * @param shopId Optional shop ID (for shopkeeper's bookings)
 * @param onUpdate Callback function to handle booking updates
 * @returns The Supabase RealtimeChannel object for unsubscribing
 */
export const subscribeToBookingUpdates = (
  userId: string,
  shopId?: string,
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
): RealtimeChannel => {
  const channelId = shopId ? `booking_updates_shop_${shopId}` : `booking_updates_user_${userId}`;
  const filter = shopId ? `shop_id=eq.${shopId}` : `customer_id=eq.${userId}`;

  console.log(`Subscribing to booking updates with filter: ${filter}`);

  const channel = supabase
    .channel(channelId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter
      },
      (payload) => {
        console.log('Real-time booking update received:', payload);
        if (onUpdate) onUpdate(payload);
      }
    )
    .subscribe((status) => {
      console.log(`Booking subscription status: ${status}`);
    });

  return channel;
};
