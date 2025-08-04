import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';

export const subscribeToQueueUpdates = (
  shopId: string, 
  onUpdate: (payload: any) => void
): RealtimeChannel => {
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
