import { supabase } from './supabase';

export interface QueueItem {
  id: string;
  shop_id: string;
  customer_id: string;
  booking_id: string;
  position: number;
  status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
  estimated_wait_time: number;
  joined_at: string;
  started_at?: string;
  completed_at?: string;
  customer_name?: string;
  service_name?: string;
}

export interface QueueSubscriptionCallback {
  (queue: QueueItem[]): void;
}

export class QueueRealtimeManager {
  private static instance: QueueRealtimeManager;
  private subscriptions: Map<string, any> = new Map();

  static getInstance(): QueueRealtimeManager {
    if (!QueueRealtimeManager.instance) {
      QueueRealtimeManager.instance = new QueueRealtimeManager();
    }
    return QueueRealtimeManager.instance;
  }

  subscribeToShopQueue(shopId: string, callback: QueueSubscriptionCallback): () => void {
    const subscriptionKey = `queue_${shopId}`;
    
    // Unsubscribe from existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).unsubscribe();
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
          // Fetch updated queue data
          const { data, error } = await supabase
            .from('queue')
            .select(`
              *,
              users:customer_id(full_name),
              bookings:booking_id(
                services:service_id(name)
              )
            `)
            .eq('shop_id', shopId)
            .in('status', ['waiting', 'in_service'])
            .order('position', { ascending: true });

          if (!error && data) {
            const formattedQueue = data.map(item => ({
              id: item.id,
              shop_id: item.shop_id,
              customer_id: item.customer_id,
              booking_id: item.booking_id,
              position: item.position,
              status: item.status,
              estimated_wait_time: item.estimated_wait_time || 0,
              joined_at: item.joined_at,
              started_at: item.started_at,
              completed_at: item.completed_at,
              customer_name: item.users?.full_name,
              service_name: item.bookings?.services?.name,
            }));
            
            callback(formattedQueue);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);

    // Return unsubscribe function
    return () => {
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.get(subscriptionKey).unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      }
    };
  }

  subscribeToCustomerQueue(customerId: string, callback: QueueSubscriptionCallback): () => void {
    const subscriptionKey = `customer_queue_${customerId}`;
    
    // Unsubscribe from existing subscription if any
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.get(subscriptionKey).unsubscribe();
    }

    // Create new subscription
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
          // Fetch updated queue data for this customer
          const { data, error } = await supabase
            .from('queue')
            .select(`
              *,
              shops:shop_id(name, address),
              bookings:booking_id(
                services:service_id(name)
              )
            `)
            .eq('customer_id', customerId)
            .in('status', ['waiting', 'in_service'])
            .order('joined_at', { ascending: false });

          if (!error && data) {
            const formattedQueue = data.map(item => ({
              id: item.id,
              shop_id: item.shop_id,
              customer_id: item.customer_id,
              booking_id: item.booking_id,
              position: item.position,
              status: item.status,
              estimated_wait_time: item.estimated_wait_time || 0,
              joined_at: item.joined_at,
              started_at: item.started_at,
              completed_at: item.completed_at,
              service_name: item.bookings?.services?.name,
            }));
            
            callback(formattedQueue);
          }
        }
      )
      .subscribe();

    this.subscriptions.set(subscriptionKey, subscription);

    // Return unsubscribe function
    return () => {
      if (this.subscriptions.has(subscriptionKey)) {
        this.subscriptions.get(subscriptionKey).unsubscribe();
        this.subscriptions.delete(subscriptionKey);
      }
    };
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

// Convenience functions
export const subscribeToShopQueue = (shopId: string, callback: QueueSubscriptionCallback) => {
  return QueueRealtimeManager.getInstance().subscribeToShopQueue(shopId, callback);
};

export const subscribeToCustomerQueue = (customerId: string, callback: QueueSubscriptionCallback) => {
  return QueueRealtimeManager.getInstance().subscribeToCustomerQueue(customerId, callback);
};

export const unsubscribeAllQueues = () => {
  QueueRealtimeManager.getInstance().unsubscribeAll();
};

// Legacy support
export const subscribeToQueueUpdates = (
  shopId: string, 
  onUpdate: (payload: any) => void
) => {
  console.log(`Subscribing to queue updates for shop: ${shopId}`);
  
  const channel = supabase
    .channel(`queue_updates_${shopId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'queue',
        filter: `shop_id=eq.${shopId}`,
      },
      onUpdate
    )
    .subscribe((status) => {
      console.log(`Queue subscription status: ${status}`);
    });

  return channel;
};
