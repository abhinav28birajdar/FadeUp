import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { QueuePosition, queueService } from '../services/supabase';
import { toastService } from '../services/toast.service';
import { useAuth } from './AuthContext';

interface QueueContextType {
  queueItems: QueuePosition[];
  loading: boolean;
  myPosition: QueuePosition | null;
  joinQueue: (shopId: string, serviceIds: string[]) => Promise<void>;
  leaveQueue: (queueItemId: string) => Promise<void>;
  completeCurrentCustomer: (queueItemId: string) => Promise<void>;
  getQueuePosition: (userId: string, shopId: string) => number;
  getEstimatedWait: (position: number, shopId: string) => number;
}

interface QueueProviderProps {
  children: ReactNode;
  shopId?: string;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children, shopId }: QueueProviderProps) {
  const [queueItems, setQueueItems] = useState<QueuePosition[]>([]);
  const [myPosition, setMyPosition] = useState<QueuePosition | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load initial queue and subscribe to updates
  useEffect(() => {
    if (!shopId) return;

    let unsubscribe: (() => void) | undefined;

    const loadQueue = async () => {
      setLoading(true);
      try {
        const queue = await queueService.getShopQueue(shopId);
        setQueueItems(queue);
        
        // Get user's position if logged in
        if (user) {
          const position = await queueService.getUserQueuePosition(user.id, shopId);
          setMyPosition(position);
        }
      } catch (error) {
        console.error('Error loading queue:', error);
        toastService.error('Failed to load queue');
      } finally {
        setLoading(false);
      }
    };

    loadQueue();

    // Subscribe to real-time updates
    unsubscribe = queueService.subscribeToQueue(shopId, async (updatedQueue) => {
      setQueueItems(updatedQueue);
      
      if (user) {
        const position = await queueService.getUserQueuePosition(user.id, shopId);
        setMyPosition(position);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [shopId, user?.id]);

  const joinQueue = async (shopId: string, serviceIds: string[]): Promise<void> => {
    if (!user) {
      toastService.error('Please sign in to join the queue');
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      const position = await queueService.joinQueue(shopId, user.id, serviceIds);
      setMyPosition(position);
      toastService.success(`You're #${position.position} in line!`);
    } catch (error) {
      console.error('Error joining queue:', error);
      toastService.error('Failed to join queue');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async (queueItemId: string): Promise<void> => {
    try {
      setLoading(true);
      await queueService.leaveQueue(queueItemId);
      setMyPosition(null);
      toastService.success('Left the queue');
    } catch (error) {
      console.error('Error leaving queue:', error);
      toastService.error('Failed to leave queue');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeCurrentCustomer = async (queueItemId: string): Promise<void> => {
    try {
      setLoading(true);
      await queueService.updateQueueStatus(queueItemId, 'completed');
      toastService.success('Customer service completed');
    } catch (error) {
      console.error('Error completing service:', error);
      toastService.error('Failed to complete service');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getQueuePosition = (userId: string, shopId: string): number => {
    const userQueueItem = queueItems.find(
      item => item.customer_id === userId && item.shop_id === shopId && item.status === 'waiting'
    );
    return userQueueItem ? userQueueItem.position : 0;
  };

  const getEstimatedWait = (position: number, shopId: string): number => {
    if (position <= 0) return 0;
    
    const waitingQueue = queueItems
      .filter(item => item.shop_id === shopId && item.status === 'waiting')
      .slice(0, position - 1);
    
    return waitingQueue.reduce((total, item) => {
      return total + (item.estimated_wait_minutes || 30);
    }, 0);
  };

  const value: QueueContextType = {
    queueItems,
    loading,
    myPosition,
    joinQueue,
    leaveQueue,
    completeCurrentCustomer,
    getQueuePosition,
    getEstimatedWait,
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}