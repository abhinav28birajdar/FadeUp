import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRenderTracker } from '../utils/performance';
import { calculateQueuePositionTime } from '../utils/queueUtils';
import { ModernCard } from './ModernCard';

interface QueueItemProps {
  item: {
    id: string;
    position: number;
    status: string;
    customer_name: string;
    customer_phone?: string;
    services: Array<{ name: string; price: number; duration: number }>;
    total_price: number;
    customer_note?: string;
    started_at?: string;
  };
  index: number;
  onUpdateStatus: (id: string, newStatus: string) => void;
  onCancel: (id: string) => void;
  actionLoading: string | null;
  shopQueue: any[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'waiting': return { bg: '#fcbb3f20', text: '#fcbb3f' };
    case 'in_service': return { bg: '#06b6d420', text: '#06b6d4' };
    case 'completed': return { bg: '#10b98120', text: '#10b981' };
    case 'cancelled': return { bg: '#ef444420', text: '#ef4444' };
    default: return { bg: '#71717a20', text: '#71717a' };
  }
}

const QueueItem = memo(({ 
  item, 
  index, 
  onUpdateStatus,
  onCancel,
  actionLoading,
  shopQueue
}: QueueItemProps) => {
  // Track renders in development mode
  useRenderTracker('QueueItem');
  
  const statusColors = getStatusColor(item.status);
  const waitTime = calculateQueuePositionTime(item.position, shopQueue);
  
  // Calculate time in service if applicable
  let timeInService = '';
  if (item.status === 'in_service' && item.started_at) {
    const startTime = new Date(item.started_at);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
    timeInService = `${diffMinutes}m in service`;
  }
  
  // Estimate service duration
  const serviceDuration = item.services.reduce((total, service) => total + (service.duration || 30), 0);

  // Memoize the status update handler
  const handleStatusUpdate = useCallback((newStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onUpdateStatus(item.id, newStatus);
  }, [item.id, onUpdateStatus]);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -20 }}
      transition={{ delay: index * 50 }}
      className="mb-4"
    >
      <ModernCard className="overflow-hidden">
        {/* Customer header with position badge */}
        <LinearGradient
          colors={['#1f1f1f', '#121212']}
          className="px-4 py-3 flex-row items-center"
        >
          <View className="w-10 h-10 bg-brand-primary rounded-full items-center justify-center mr-3">
            <Text className="text-dark-background text-lg font-bold">{item.position}</Text>
          </View>
          
          <View className="flex-1">
            <Text className="text-primary-light text-lg font-semibold">{item.customer_name}</Text>
            {item.customer_phone && (
              <Text className="text-secondary-light text-sm">{item.customer_phone}</Text>
            )}
          </View>
          
          <View 
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: statusColors.bg }}
          >
            <Text 
              className="text-sm font-medium"
              style={{ color: statusColors.text }}
            >
              {item.status === 'in_service' ? 'In Service' : 
               item.status === 'waiting' ? 'Waiting' : 
               item.status === 'completed' ? 'Completed' : 'Cancelled'}
            </Text>
          </View>
        </LinearGradient>
        
        {/* Service details */}
        <View className="p-4">
          {/* Services list */}
          <View className="mb-3">
            {item.services.map((service, idx) => (
              <View key={idx} className="flex-row justify-between items-center mb-1">
                <Text className="text-primary-light">• {service.name}</Text>
                <Text className="text-brand-primary font-medium">${service.price}</Text>
              </View>
            ))}
          </View>
          
          {/* Time and price summary */}
          <View className="flex-row justify-between items-center py-2 border-t border-gray-800">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color="#A1A1AA" />
              <Text className="text-secondary-light ml-1">
                {item.status === 'waiting' ? 
                  `Est. ${waitTime} min wait` : 
                  item.status === 'in_service' ? 
                  timeInService : 
                  `${serviceDuration} min service`}
              </Text>
            </View>
            <Text className="text-brand-primary text-lg font-semibold">
              ${item.total_price}
            </Text>
          </View>
          
          {/* Customer note if any */}
          {item.customer_note && (
            <View className="mt-2 bg-gray-800/30 p-3 rounded-lg">
              <Text className="text-secondary-light text-sm italic">
                "{item.customer_note}"
              </Text>
            </View>
          )}
          
          {/* Action buttons based on status */}
          <View className="flex-row mt-4 gap-2">
            {item.status === 'waiting' && (
              <>
                <Pressable
                  onPress={() => handleStatusUpdate('in_service')}
                  className="flex-1"
                  disabled={actionLoading === item.id}
                >
                  {({ pressed }) => (
                    <MotiView
                      animate={{ scale: pressed ? 0.98 : 1 }}
                      className="bg-brand-primary py-3 rounded-lg items-center"
                    >
                      {actionLoading === item.id ? (
                        <ActivityIndicator size="small" color="#1A1A1A" />
                      ) : (
                        <Text className="text-dark-background font-semibold">Start Service</Text>
                      )}
                    </MotiView>
                  )}
                </Pressable>
                
                <Pressable
                  onPress={() => onCancel(item.id)}
                  disabled={actionLoading === item.id}
                >
                  {({ pressed }) => (
                    <MotiView
                      animate={{ scale: pressed ? 0.98 : 1 }}
                      className="bg-dark-card border border-red-500/30 py-3 px-4 rounded-lg"
                    >
                      <Text className="text-red-500 font-semibold">Cancel</Text>
                    </MotiView>
                  )}
                </Pressable>
              </>
            )}
            
            {item.status === 'in_service' && (
              <Pressable
                onPress={() => handleStatusUpdate('completed')}
                className="flex-1"
                disabled={actionLoading === item.id}
              >
                {({ pressed }) => (
                  <MotiView
                    animate={{ scale: pressed ? 0.98 : 1 }}
                    className="bg-status-completed py-3 rounded-lg items-center"
                  >
                    {actionLoading === item.id ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <Text className="text-white font-semibold">Complete Service</Text>
                    )}
                  </MotiView>
                )}
              </Pressable>
            )}
          </View>
        </View>
      </ModernCard>
    </MotiView>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these props changed
  const statusUnchanged = prevProps.item.status === nextProps.item.status;
  const loadingUnchanged = prevProps.actionLoading === nextProps.actionLoading;
  const positionUnchanged = prevProps.item.position === nextProps.item.position;
  
  // Deep compare services efficiently
  const servicesUnchanged = 
    prevProps.item.services.length === nextProps.item.services.length &&
    prevProps.item.services.every((service, index) => {
      const nextService = nextProps.item.services[index];
      return (
        service.name === nextService.name &&
        service.price === nextService.price &&
        service.duration === nextService.duration
      );
    });
  
  const shouldSkipRender = statusUnchanged && loadingUnchanged && positionUnchanged && servicesUnchanged;
  
  // Log skipped renders in dev mode
  if (__DEV__ && shouldSkipRender) {
    console.debug(`QueueItem ${prevProps.item.id} - Skipped unnecessary render`);
  }
  
  return shouldSkipRender;
});

export default QueueItem;
