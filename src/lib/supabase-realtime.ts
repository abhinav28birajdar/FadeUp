// src/lib/supabase-realtime.ts (Example function for queue subscription)
import { supabase } from './supabase';
import { useAppStore } from '../store'; // If you want to update Zustand directly
import { QueueEntry } from '../types';

interface RealtimeQueuePayload {
  new: QueueEntry;
  old: QueueEntry;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  schema: string;
  table: string;
  commit_timestamp: string;
  errors: any[];
}

export const subscribeToShopQueue = (shopId: string, onUpdate: (queue: QueueEntry[]) => void) => {
  const channel = supabase
    .channel(`shop_queue:${shopId}`) // Unique channel for each shop's queue
    .on<QueueEntry>(
      'postgres_changes',
      {
        event: '*', // Listen for all changes: INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'queue',
        filter: `shop_id=eq.${shopId}`
      },
      async (payload: RealtimeQueuePayload) => {

        const { data, error } = await supabase
          .from('queue')
          .select('*')
          .eq('shop_id', shopId)
          .order('position', { ascending: true }); 

        if (error) {
          console.error('Error fetching updated queue:', error);
          return;
        }
        onUpdate(data as QueueEntry[]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

