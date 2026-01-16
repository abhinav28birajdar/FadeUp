import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from '../../config/supabase';
import { analyticsService } from '../analytics.service';

export interface QueuePosition {
  id: string;
  shop_id: string;
  customer_id: string;
  booking_id?: string;
  service_ids: string[];
  position: number;
  estimated_wait_minutes?: number;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
  joined_at: string;
  served_at?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QueueStats {
  total_waiting: number;
  currently_serving: number;
  average_wait_time: number;
  estimated_wait: number;
}

class QueueService {
  private subscriptions: Map<string, RealtimeChannel> = new Map();

  /**
   * Join a queue
   */
  async joinQueue(shopId: string, customerId: string, serviceIds: string[]): Promise<QueuePosition> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      // Get current queue length for position
      const { count } = await supabase
        .from('queue_positions')
        .select('*', { count: 'exact', head: true })
        .eq('shop_id', shopId)
        .eq('status', 'waiting');

      const position = (count || 0) + 1;

      const { data, error } = await supabase
        .from('queue_positions')
        .insert({
          shop_id: shopId,
          customer_id: customerId,
          service_ids: serviceIds,
          position,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('queue_joined', {
        shopId,
        position,
        serviceCount: serviceIds.length,
      });

      return data as QueuePosition;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Leave a queue
   */
  async leaveQueue(queueItemId: string): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('queue_positions')
        .update({ status: 'cancelled' })
        .eq('id', queueItemId);

      if (error) throw error;

      analyticsService.trackEvent('queue_left', { queueItemId });
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Update queue position status
   */
  async updateQueueStatus(
    queueItemId: string,
    status: QueuePosition['status']
  ): Promise<QueuePosition> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const updateData: any = { status };

      if (status === 'serving') {
        updateData.served_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('queue_positions')
        .update(updateData)
        .eq('id', queueItemId)
        .select()
        .single();

      if (error) throw error;

      analyticsService.trackEvent('queue_status_updated', { queueItemId, status });

      return data as QueuePosition;
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get queue for a shop
   */
  async getShopQueue(shopId: string): Promise<QueuePosition[]> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('queue_positions')
        .select('*')
        .eq('shop_id', shopId)
        .in('status', ['waiting', 'serving'])
        .order('position', { ascending: true });

      if (error) throw error;

      return (data as QueuePosition[]) || [];
    } catch (error) {
      analyticsService.trackError(error as Error);
      throw error;
    }
  }

  /**
   * Get user's queue position
   */
  async getUserQueuePosition(customerId: string, shopId: string): Promise<QueuePosition | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('queue_positions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('shop_id', shopId)
        .in('status', ['waiting', 'serving'])
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"

      return data as QueuePosition | null;
    } catch (error) {
      console.error('Error getting user queue position:', error);
      return null;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(shopId: string): Promise<QueueStats> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase.rpc('get_queue_stats', {
        p_shop_id: shopId,
      });

      if (error) throw error;

      return data as QueueStats;
    } catch (error) {
      console.error('Error getting queue stats:', error);
      return {
        total_waiting: 0,
        currently_serving: 0,
        average_wait_time: 0,
        estimated_wait: 0,
      };
    }
  }

  /**
   * Subscribe to queue updates
   */
  subscribeToQueue(shopId: string, callback: (queue: QueuePosition[]) => void): () => void {
    const supabase = getSupabase();
    if (!supabase) return () => {};

    // Unsubscribe from existing subscription
    this.unsubscribeFromQueue(shopId);

    const channel = supabase
      .channel(`queue_${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_positions',
          filter: `shop_id=eq.${shopId}`,
        },
        async () => {
          // Fetch updated queue
          const queue = await this.getShopQueue(shopId);
          callback(queue);
        }
      )
      .subscribe();

    this.subscriptions.set(shopId, channel);

    // Return unsubscribe function
    return () => this.unsubscribeFromQueue(shopId);
  }

  /**
   * Unsubscribe from queue updates
   */
  private async unsubscribeFromQueue(shopId: string): Promise<void> {
    const channel = this.subscriptions.get(shopId);
    if (channel) {
      await channel.unsubscribe();
      this.subscriptions.delete(shopId);
    }
  }

  /**
   * Clean up all subscriptions
   */
  async cleanup(): Promise<void> {
    const supabase = getSupabase();
    if (!supabase) return;

    for (const channel of this.subscriptions.values()) {
      await channel.unsubscribe();
    }
    this.subscriptions.clear();
  }

  /**
   * Get customer's position in any queue
   */
  async getCustomerPosition(customerId: string): Promise<QueuePosition | null> {
    const supabase = getSupabase();
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('queue_positions')
        .select('*')
        .eq('customer_id', customerId)
        .in('status', ['waiting', 'serving'])
        .maybeSingle();

      if (error) throw error;
      return data as QueuePosition | null;
    } catch (error) {
      console.error('Error getting customer position:', error);
      return null;
    }
  }

  /**
   * Get customer's active queue entry
   */
  async getCustomerActiveEntry(customerId: string): Promise<QueuePosition | null> {
    return this.getCustomerPosition(customerId);
  }

  /**
   * Call the next customer (barber action)
   */
  async callCustomer(queueItemId: string): Promise<QueuePosition> {
    return this.updateQueueStatus(queueItemId, 'serving');
  }

  /**
   * Start service for a customer (barber action)
   */
  async startService(queueItemId: string): Promise<QueuePosition> {
    return this.updateQueueStatus(queueItemId, 'serving');
  }

  /**
   * Complete service for a customer (barber action)
   */
  async completeService(queueItemId: string): Promise<QueuePosition> {
    return this.updateQueueStatus(queueItemId, 'completed');
  }

  /**
   * Mark customer as no-show (barber action)
   */
  async markNoShow(queueItemId: string): Promise<QueuePosition> {
    return this.updateQueueStatus(queueItemId, 'cancelled');
  }

  /**
   * Alias for subscribeToQueue - for compatibility
   */
  onQueueUpdate(shopId: string, callback: (queue: QueuePosition[]) => void): () => void {
    return this.subscribeToQueue(shopId, callback);
  }
}

export const queueService = new QueueService();
