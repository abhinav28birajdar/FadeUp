import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { queueService } from '../services/firestore';
import { QueueContextType, QueueItem } from '../types';
import { useAuth } from './AuthContext';

interface QueueProviderProps {
  children: ReactNode;
  shopId?: string;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children, shopId }: QueueProviderProps) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (shopId) {
      setLoading(true);
      const unsubscribe = queueService.onQueueUpdate(shopId, (queue) => {
        setQueueItems(queue);
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [shopId]);

  const joinQueue = async (shopId: string, serviceId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      // Get service details for the queue item
      // This is simplified - in production, you'd fetch service details
      const queueItem = {
        shopId,
        userId: user.id,
        serviceId,
        status: 'waiting' as const,
        customerName: user.name,
        customerPhone: user.phone,
        serviceName: 'Service', // Would be fetched from service
        serviceDuration: 30, // Would be fetched from service
      };

      await queueService.joinQueue(queueItem);
    } catch (error) {
      throw error;
    }
  };

  const leaveQueue = async (queueItemId: string): Promise<void> => {
    try {
      await queueService.leaveQueue(queueItemId);
    } catch (error) {
      throw error;
    }
  };

  const completeCurrentCustomer = async (queueItemId: string): Promise<void> => {
    try {
      await queueService.completeService(queueItemId);
    } catch (error) {
      throw error;
    }
  };

  const getQueuePosition = (userId: string, shopId: string): number => {
    const userQueueItem = queueItems.find(
      item => item.userId === userId && item.shopId === shopId && item.status === 'waiting'
    );
    return userQueueItem ? userQueueItem.positionIndex + 1 : 0;
  };

  const getEstimatedWait = (position: number, shopId: string): number => {
    if (position <= 0) return 0;
    
    const waitingQueue = queueItems
      .filter(item => item.shopId === shopId && item.status === 'waiting')
      .slice(0, position - 1);
    
    return waitingQueue.reduce((total, item) => total + item.serviceDuration, 0);
  };

  const value: QueueContextType = {
    queueItems,
    loading,
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