import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { subscribeToQueueUpdates } from '../../src/lib/queueRealtime';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Booking, QueueEntry, Service, Shop } from '../../src/types/supabase';

interface DashboardStats {
  todayBookings: number;
  todayRevenue: number;
  queueLength: number;
  averageWaitTime: number;
}

interface BookingWithUser extends Booking {
  users?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  services?: {
    name: string;
    duration: number;
    price: number;
  };
}

interface QueueWithDetails extends QueueEntry {
  users?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
  services?: {
    name: string;
    duration: number;
    price: number;
  };
}

export default function ShopkeeperDashboardScreen() {
  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    todayBookings: 0,
    todayRevenue: 0,
    queueLength: 0,
    averageWaitTime: 0,
  });
  const [queue, setQueue] = useState<QueueWithDetails[]>([]);
  const [todayBookings, setTodayBookings] = useState<BookingWithUser[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuthStore();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (shop?.id) {
      // Subscribe to real-time queue updates
      const unsubscribe = subscribeToQueueUpdates(shop.id, async (payload) => {
        // Need to fetch the current queue data since the payload doesn't contain it directly
        const { data: updatedQueueData } = await supabase
          .from('queue')
          .select(`
            *,
            users:customer_id(id, first_name, last_name, avatar_url),
            bookings:booking_id(
              id,
              service_ids,
              total_price,
              notes
            )
          `)
          .eq('shop_id', shop.id)
          .in('status', ['waiting', 'ready_next', 'in_service'])
          .order('position', { ascending: true });
          
        if (updatedQueueData) {
          setQueue(updatedQueueData as QueueWithDetails[]);
          setStats(prev => ({
            ...prev,
            queueLength: updatedQueueData.length,
            averageWaitTime: updatedQueueData.length * 25, // 25 mins average per person
          }));
        }
      });

      return () => {
        if (unsubscribe) {
          unsubscribe.unsubscribe();
        }
      };
    }
  }, [shop?.id]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (!user?.shop_id) {
        Alert.alert('Error', 'No shop associated with your account');
        return;
      }

      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', user.shop_id)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', user.shop_id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch current queue
      const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            phone_number
          ),
          services:service_id (
            name,
            duration,
            price
          )
        `)
        .eq('shop_id', user.shop_id)
        .eq('status', 'waiting')
        .order('position', { ascending: true });

      if (queueError) throw queueError;
      setQueue(queueData || []);

      // Fetch today's bookings
      const today = new Date().toISOString().split('T')[0];
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          users:customer_id (
            first_name,
            last_name,
            phone_number
          ),
          services:service_id (
            name,
            duration,
            price
          )
        `)
        .eq('shop_id', user.shop_id)
        .gte('booking_date', today)
        .lt('booking_date', `${today}T23:59:59`)
        .order('booking_date', { ascending: true });

      if (bookingsError) throw bookingsError;
      setTodayBookings(bookingsData || []);

      // Calculate stats
      const completedBookings = bookingsData?.filter(b => b.status === 'completed') || [];
      const todayRevenue = completedBookings.reduce((sum, booking) => 
        sum + (booking.services?.price || 0), 0
      );

      setStats({
        todayBookings: bookingsData?.length || 0,
        todayRevenue,
        queueLength: queueData?.length || 0,
        averageWaitTime: (queueData?.length || 0) * 25,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, []);

  const handleCompleteQueueEntry = async (queueId: string) => {
    try {
      const { error } = await supabase
        .from('queue')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', queueId);

      if (error) throw error;

      Alert.alert('Success', 'Customer service completed!');
      loadDashboardData();
    } catch (error) {
      console.error('Error completing queue entry:', error);
      Alert.alert('Error', 'Failed to complete service');
    }
  };

  const handleViewBooking = (bookingId: string) => {
    router.push(`/(shopkeeper)/dashboard/booking/${bookingId}`);
  };

  const handleManageQueue = () => {
    // Direct users to the enhanced queue screen
    router.push('/(shopkeeper)/queue_new');
  };

  const handleViewFeedback = () => {
    router.push('/(shopkeeper)/feedback');
  };

  const renderStatsCard = (
    title: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string,
    delay: number
  ) => (
    <MotiView
      from={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex-1 mr-3"
    >
      <ModernCard className="p-4 items-center">
        <View className={`w-12 h-12 ${color} rounded-full items-center justify-center mb-2`}>
          <Ionicons name={icon} size={24} color="#F3F4F6" />
        </View>
        <Text className="text-primary-light text-2xl font-bold">
          {typeof value === 'number' && value > 999 ? `${(value/1000).toFixed(1)}k` : value}
        </Text>
        <Text className="text-secondary-light text-xs text-center">{title}</Text>
      </ModernCard>
    </MotiView>
  );

  const renderQueueItem = ({ item, index }: { item: QueueWithDetails; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
      className="mb-3"
    >
      <ModernCard className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-brand-primary rounded-full items-center justify-center mr-3">
              <Text className="text-dark-background font-bold">{item.position}</Text>
            </View>
            <View>
              <Text className="text-primary-light font-semibold">
                {item.users?.first_name} {item.users?.last_name}
              </Text>
              <Text className="text-secondary-light text-sm">
                {item.services?.name} • {item.services?.duration}min
              </Text>
            </View>
          </View>
          
          <Pressable
            onPress={() => handleCompleteQueueEntry(item.id)}
            className="bg-status-completed px-3 py-1 rounded-lg"
          >
            <Text className="text-primary-light text-sm font-semibold">Complete</Text>
          </Pressable>
        </View>
        
        <Text className="text-secondary-light text-xs">
          Waited: {Math.floor((new Date().getTime() - new Date(item.created_at).getTime()) / 60000)} minutes
        </Text>
      </ModernCard>
    </MotiView>
  );

  const renderBookingItem = ({ item, index }: { item: BookingWithUser; index: number }) => (
    <Pressable onPress={() => handleViewBooking(item.id)}>
      {({ pressed }) => (
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 50 }}
          className="mb-2"
        >
          <ModernCard pressed={pressed} className="p-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-primary-light font-semibold">
                  {item.users?.first_name} {item.users?.last_name}
                </Text>
                <Text className="text-secondary-light text-sm">
                  {item.services?.name} • {new Date(item.booking_date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View className="items-end">
                <Text className="text-brand-primary font-bold">${item.services?.price}</Text>
                <View className={`px-2 py-1 rounded ${
                  item.status === 'confirmed' ? 'bg-status-confirmed' :
                  item.status === 'completed' ? 'bg-status-completed' :
                  item.status === 'cancelled' ? 'bg-status-error' :
                  'bg-status-pending'
                }`}>
                  <Text className="text-primary-light text-xs font-medium capitalize">
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </ModernCard>
        </MotiView>
      )}
    </Pressable>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CB9C5E" />
      }
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text className="text-primary-light text-4xl font-extrabold">
            {shop?.name || 'Dashboard'}
          </Text>
          <Text className="text-secondary-light text-lg mt-1">
            Manage your barbershop
          </Text>
        </MotiView>
      </View>

      <View className="px-6">
        {/* Stats Grid */}
        <View className="flex-row mb-6">
          {renderStatsCard('Today\'s Bookings', stats.todayBookings, 'calendar', 'bg-brand-primary', 100)}
          {renderStatsCard('Revenue', `$${stats.todayRevenue}`, 'cash', 'bg-status-completed', 200)}
        </View>
        
        <View className="flex-row mb-6">
          {renderStatsCard('Queue Length', stats.queueLength, 'people', 'bg-brand-secondary', 300)}
          {renderStatsCard('Avg Wait', `${stats.averageWaitTime}m`, 'time', 'bg-status-pending', 400)}
        </View>

        {/* Quick Actions */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          className="mb-6"
        >
          <Text className="text-primary-light text-2xl font-bold mb-4">Quick Actions</Text>
          <View className="flex-row space-x-3">
            <Pressable onPress={handleManageQueue} className="flex-1">
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-brand-primary py-4 rounded-xl items-center"
                >
                  <Ionicons name="list" size={24} color="#1A1A1A" />
                  <Text className="text-dark-background font-semibold mt-1">Manage Queue</Text>
                </MotiView>
              )}
            </Pressable>
            
            <Pressable onPress={handleViewFeedback} className="flex-1">
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-brand-secondary py-4 rounded-xl items-center border border-brand-primary/30"
                >
                  <Ionicons name="chatbubbles" size={24} color="#CB9C5E" />
                  <Text className="text-brand-primary font-semibold mt-1">View Feedback</Text>
                </MotiView>
              )}
            </Pressable>
          </View>
        </MotiView>

        {/* Current Queue */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          className="mb-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-primary-light text-2xl font-bold">Current Queue</Text>
            <Pressable onPress={handleManageQueue}>
              <Text className="text-brand-primary font-medium">View All</Text>
            </Pressable>
          </View>
          
          {queue.length === 0 ? (
            <ModernCard className="p-6 items-center">
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text className="text-secondary-light text-center mt-3">
                No customers in queue
              </Text>
            </ModernCard>
          ) : (
            <FlatList
              data={queue.slice(0, 3)} // Show only first 3 items
              renderItem={renderQueueItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </MotiView>

        {/* Today's Bookings */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 700 }}
          className="mb-8"
        >
          <Text className="text-primary-light text-2xl font-bold mb-4">Today's Bookings</Text>
          
          {todayBookings.length === 0 ? (
            <ModernCard className="p-6 items-center">
              <Ionicons name="calendar-outline" size={48} color="#6B7280" />
              <Text className="text-secondary-light text-center mt-3">
                No bookings for today
              </Text>
            </ModernCard>
          ) : (
            <FlatList
              data={todayBookings.slice(0, 5)} // Show only first 5 items
              renderItem={renderBookingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </MotiView>
      </View>
    </ScrollView>
  );
}
