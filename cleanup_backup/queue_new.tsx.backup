import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatePresence, MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';

import { ModernCard } from '../../src/components/ModernCard';
import { QueueRealtimeManager } from '../../src/lib/queueRealtime';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { calculateQueuePositionTime } from '../../src/utils/queueUtils';

interface QueueItemDisplay {
  id: string;
  customer_id: string;
  booking_id: string;
  position: number;
  status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
  estimated_wait_time: number | null;
  joined_at: string;
  started_at: string | null;
  customer_name: string;
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
  }[];
  total_price: number;
  customer_note?: string;
  customer_phone?: string;
  customer_image?: string;
}

export default function EnhancedQueueScreen() {
  const { user } = useAuthStore();
  const [shopId, setShopId] = useState<string | null>(null);
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'waiting' | 'in_service' | 'completed'>('all');
  const [queueStats, setQueueStats] = useState({
    waiting: 0,
    in_service: 0,
    completed: 0,
    totalWaitTime: 0
  });
  const [queueManager] = useState(() => new QueueRealtimeManager());

  useEffect(() => {
    fetchShopId();
  }, [user?.id]);

  const fetchShopId = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching shop ID:', error);
        return;
      }

      if (data?.id) {
        setShopId(data.id);
      }
    } catch (error) {
      console.error('Error in fetchShopId:', error);
    }
  };

  useEffect(() => {
    if (!shopId) return;
    
    fetchQueueData();

    // Set up real-time subscription
    const processQueueUpdate = (updatedQueue: any[]) => {
      fetchQueueData(); // Re-fetch all data to ensure consistency
    };

    queueManager.subscribeToShopQueue(shopId, processQueueUpdate);

    return () => {
      queueManager.unsubscribeAll();
    };
  }, [shopId]);

  const fetchQueueData = async () => {
    if (!shopId) return;
    
    setLoading(true);
    try {
      // Fetch queue with customer and service details
      const { data, error } = await supabase
        .from('queue')
        .select(`
          *,
          customers:customer_id (
            id,
            first_name, 
            last_name,
            phone_number,
            avatar_url
          ),
          bookings:booking_id (
            id,
            total_price,
            customer_note,
            service_ids,
            services:service_id (
              id,
              name,
              duration,
              price
            )
          )
        `)
        .eq('shop_id', shopId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching queue:', error);
        return;
      }

      if (data) {
        const formattedQueue = data.map((item: any) => {
          const services = Array.isArray(item.bookings?.service_ids)
            ? item.bookings.services || []
            : [item.bookings?.services].filter(Boolean);

          return {
            id: item.id,
            customer_id: item.customer_id,
            booking_id: item.booking_id,
            position: item.position,
            status: item.status,
            estimated_wait_time: item.estimated_wait_time,
            joined_at: item.joined_at,
            started_at: item.started_at,
            customer_name: `${item.customers?.first_name || ''} ${item.customers?.last_name || ''}`,
            customer_phone: item.customers?.phone_number,
            customer_image: item.customers?.avatar_url,
            services,
            total_price: item.bookings?.total_price || 0,
            customer_note: item.bookings?.customer_note
          };
        });

        setShopQueue(formattedQueue);
        
        // Calculate queue statistics
        const waiting = formattedQueue.filter(item => item.status === 'waiting').length;
        const inService = formattedQueue.filter(item => item.status === 'in_service').length;
        const completed = formattedQueue.filter(item => item.status === 'completed').length;
        
        // Calculate estimated total wait time
        const totalWaitTime = formattedQueue
          .filter(item => item.status === 'waiting')
          .reduce((total: number, item: any) => {
            const serviceDuration = item.services.reduce((sum: number, service: any) => sum + (service.duration || 30), 0);
            return total + serviceDuration;
          }, 0);
        
        setQueueStats({
          waiting,
          in_service: inService,
          completed,
          totalWaitTime
        });
      }
    } catch (error) {
      console.error('Error in fetchQueueData:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateQueueItemStatus = async (queueItemId: string, newStatus: string) => {
    setActionLoading(queueItemId);
    
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'in_service') {
        updateData.started_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('queue')
        .update(updateData)
        .eq('id', queueItemId);

      if (error) {
        console.error('Error updating queue item:', error);
        Alert.alert('Error', 'Failed to update queue item');
        return;
      }

      // Also update the booking status if completing
      if (newStatus === 'completed') {
        const queueItem = shopQueue.find(item => item.id === queueItemId);
        if (queueItem) {
          await supabase
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', queueItem.booking_id);
        }
      }
      
      // Success feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Re-fetch queue data to update UI
      fetchQueueData();
    } catch (error) {
      console.error('Error updating queue item:', error);
      Alert.alert('Error', 'Failed to update queue item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = (queueItemId: string) => {
    Alert.alert(
      "Cancel Service",
      "Are you sure you want to cancel this customer's service?",
      [
        { text: "No", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => updateQueueItemStatus(queueItemId, 'cancelled')
        }
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchQueueData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return { bg: '#fcbb3f20', text: '#fcbb3f' };
      case 'in_service': return { bg: '#06b6d420', text: '#06b6d4' };
      case 'completed': return { bg: '#10b98120', text: '#10b981' };
      case 'cancelled': return { bg: '#ef444420', text: '#ef4444' };
      default: return { bg: '#71717a20', text: '#71717a' };
    }
  };

  const renderQueueItem = ({ item, index }: { item: QueueItemDisplay; index: number }) => {
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
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      updateQueueItemStatus(item.id, 'in_service');
                    }}
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
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      handleCancel(item.id);
                    }}
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
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    updateQueueItemStatus(item.id, 'completed');
                  }}
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
  };

  const renderFilterButton = (filterName: 'all' | 'waiting' | 'in_service' | 'completed', label: string, count: number) => (
    <Pressable onPress={() => setFilter(filterName)}>
      {({ pressed }) => (
        <MotiView
          animate={{ 
            scale: pressed ? 0.95 : 1,
            backgroundColor: filter === filterName ? '#CB9C5E20' : 'transparent',
          }}
          className={`px-4 py-2 rounded-lg flex-row items-center ${filter === filterName ? 'border border-brand-primary/30' : ''}`}
        >
          <Text className={`font-medium ${filter === filterName ? 'text-brand-primary' : 'text-secondary-light'}`}>
            {label}
          </Text>
          <View className={`ml-2 w-6 h-6 rounded-full items-center justify-center ${filter === filterName ? 'bg-brand-primary' : 'bg-gray-700'}`}>
            <Text className={`text-xs ${filter === filterName ? 'text-dark-background' : 'text-secondary-light'}`}>{count}</Text>
          </View>
        </MotiView>
      )}
    </Pressable>
  );

  const filteredQueue = filter === 'all'
    ? shopQueue
    : shopQueue.filter(item => item.status === filter);

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading queue...</Text>
      </View>
    );
  }

  if (!shopId) {
    return (
      <View className="flex-1 bg-dark-background p-6 justify-center items-center">
        <Ionicons name="alert-circle-outline" size={60} color="#A1A1AA" />
        <Text className="text-primary-light text-xl font-bold mt-4">No Shop Found</Text>
        <Text className="text-secondary-light text-center mt-2">
          You need to register your shop before managing a queue.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-dark-background"
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#CB9C5E']}
          tintColor="#CB9C5E"
        />
      }
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text className="text-primary-light text-4xl font-extrabold">
            Queue Management
          </Text>
          <Text className="text-secondary-light text-lg mt-1">
            Manage your customer queue
          </Text>
        </MotiView>
      </View>

      {/* Stats Cards */}
      <View className="px-6 mb-6">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-4">
          {/* Waiting card */}
          <MotiView
            from={{ opacity: 0, translateX: -50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 100 }}
          >
            <ModernCard className="w-40 p-4">
              <View className="w-12 h-12 bg-yellow-500/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="time-outline" size={24} color="#fcbb3f" />
              </View>
              <Text className="text-yellow-500 text-3xl font-bold">{queueStats.waiting}</Text>
              <Text className="text-secondary-light">Waiting</Text>
              {queueStats.waiting > 0 && (
                <Text className="text-xs text-secondary-light mt-1">
                  ~{queueStats.totalWaitTime} min total wait
                </Text>
              )}
            </ModernCard>
          </MotiView>

          {/* In Service card */}
          <MotiView
            from={{ opacity: 0, translateX: -30 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 150 }}
          >
            <ModernCard className="w-40 p-4">
              <View className="w-12 h-12 bg-cyan-500/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="cut-outline" size={24} color="#06b6d4" />
              </View>
              <Text className="text-cyan-500 text-3xl font-bold">{queueStats.in_service}</Text>
              <Text className="text-secondary-light">In Service</Text>
            </ModernCard>
          </MotiView>

          {/* Completed card */}
          <MotiView
            from={{ opacity: 0, translateX: -10 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: 200 }}
          >
            <ModernCard className="w-40 p-4">
              <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="checkmark-circle-outline" size={24} color="#10b981" />
              </View>
              <Text className="text-green-500 text-3xl font-bold">{queueStats.completed}</Text>
              <Text className="text-secondary-light">Completed</Text>
            </ModernCard>
          </MotiView>
        </ScrollView>
      </View>

      {/* Filters */}
      <View className="px-6 mb-4">
        <Text className="text-primary-light text-xl font-semibold mb-3">Queue Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="space-x-2">
          {renderFilterButton('all', 'All', shopQueue.length)}
          {renderFilterButton('waiting', 'Waiting', queueStats.waiting)}
          {renderFilterButton('in_service', 'In Service', queueStats.in_service)}
          {renderFilterButton('completed', 'Completed', queueStats.completed)}
        </ScrollView>
      </View>

      {/* Queue List */}
      <View className="px-6 pb-20">
        <AnimatePresence>
          {filteredQueue.length === 0 ? (
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 items-center"
            >
              <Ionicons
                name={filter === 'waiting' ? 'people-outline' : 
                     filter === 'in_service' ? 'cut-outline' : 
                     filter === 'completed' ? 'checkmark-done-outline' : 'list-outline'}
                size={60}
                color="#A1A1AA"
              />
              <Text className="text-secondary-light text-lg mt-4 text-center">
                {filter === 'all' ? 'No customers in your queue' : `No ${filter} customers`}
              </Text>
            </MotiView>
          ) : (
            filteredQueue.map((item, index) => (
              <MotiView key={item.id}>
                {renderQueueItem({ item, index })}
              </MotiView>
            ))
          )}
        </AnimatePresence>
      </View>
    </ScrollView>
  );
}