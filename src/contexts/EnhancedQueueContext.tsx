import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { enhancedQueueService } from '../services/firestoreEnhanced';
import { pushNotificationService } from '../services/pushNotifications';
import { QueueContextType, QueueItem } from '../types';
import { useAuth } from './AuthContext';

interface QueueProviderProps {
  children: ReactNode;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export const QueueProvider: React.FC<QueueProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize push notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await pushNotificationService.configureNotificationChannels();
        
        // Set up notification handlers
        pushNotificationService.addNotificationReceivedListener((notification) => {
          console.log('Notification received:', notification);
        });

        pushNotificationService.addNotificationResponseReceivedListener((response) => {
          console.log('Notification response:', response);
          // Handle navigation based on notification type
          const data = response.notification.request.content.data as any;
          if (data?.type === 'your_turn') {
            // Navigate to queue status or shop screen
          }
        });
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const joinQueue = async (shopId: string, serviceId: string): Promise<void> => {
    if (!user) {
      throw new Error('User must be logged in to join queue');
    }

    setLoading(true);
    try {
      const queueItem = await enhancedQueueService.joinQueue(shopId, user.id, serviceId);
      
      // Send local notification for testing
      await pushNotificationService.sendLocalNotification(
        'Joined Queue',
        `You're now in line. Position: ${queueItem.positionIndex + 1}`,
        {
          type: 'queue_update',
          shopId,
          queueItemId: queueItem.id,
        }
      );

      console.log('Successfully joined queue:', queueItem);
    } catch (error) {
      console.error('Error joining queue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const leaveQueue = async (queueItemId: string): Promise<void> => {
    setLoading(true);
    try {
      await enhancedQueueService.leaveQueue(queueItemId);
      
      await pushNotificationService.sendLocalNotification(
        'Left Queue',
        'You have left the queue successfully',
        {
          type: 'queue_update',
          queueItemId,
        }
      );

      console.log('Successfully left queue');
    } catch (error) {
      console.error('Error leaving queue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const completeCurrentCustomer = async (queueItemId: string): Promise<void> => {
    setLoading(true);
    try {
      await enhancedQueueService.completeService(queueItemId);
      console.log('Customer service completed');
    } catch (error) {
      console.error('Error completing customer service:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getQueuePosition = (userId: string, shopId: string): number => {
    const userQueue = queueItems.find(
      (item) => item.userId === userId && item.shopId === shopId && item.status !== 'done'
    );
    return userQueue ? userQueue.positionIndex : -1;
  };

  const getEstimatedWait = (position: number, shopId: string): number => {
    if (position <= 0) return 0;
    
    const shopQueue = queueItems.filter(
      (item) => item.shopId === shopId && item.status !== 'done'
    );
    
    const totalWaitTime = shopQueue
      .filter((item) => item.positionIndex < position)
      .reduce((total, item) => total + item.serviceDuration, 0);
    
    return totalWaitTime;
  };

  return (
    <QueueContext.Provider
      value={{
        queueItems,
        loading,
        joinQueue,
        leaveQueue,
        completeCurrentCustomer,
        getQueuePosition,
        getEstimatedWait,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = (): QueueContextType => {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
};