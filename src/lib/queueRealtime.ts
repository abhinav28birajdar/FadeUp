import { db } from '@/src/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, QuerySnapshot } from 'firebase/firestore';

/**
 * Subscribe to real-time updates for a shop's queue
 * @param shopId The shop ID to monitor queue for
 * @param onUpdate Callback function that receives the updated snapshot
 * @returns Unsubscribe function to stop listening for updates
 */
export function subscribeToQueueUpdates(
  shopId: string,
  onUpdate: (snapshot: QuerySnapshot) => void
) {
  // Create a query against the queue collection
  const queueQuery = query(
    collection(db, 'queue'),
    where('shop_id', '==', shopId),
    where('status', '==', 'waiting'),
    orderBy('position', 'asc')
  );

  // Listen for real-time updates
  const unsubscribe = onSnapshot(queueQuery, onUpdate, (error) => {
    console.error('Error listening to queue updates:', error);
  });

  return unsubscribe;
}