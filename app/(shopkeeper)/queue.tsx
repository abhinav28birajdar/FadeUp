import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, Text, View } from "react-native";

interface QueueItemDisplay {
  id: string;
  customer_id: string;
  booking_id: string;
  position: number;
  status: 'waiting' | 'in_service' | 'completed' | 'cancelled';
  estimated_wait_time: number;
  joined_at: string;
  customer_name: string;
  service_name: string;
  total_price: number;
}

interface Shop {
  id: string;
  name: string;
  description?: string;
  address: string;
}

export default function ShopkeeperQueueScreen() {
  const { user } = useAuthStore();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch shop details
  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        if (!user?.id) {
          setLoading(false);
          return;
        }
        
        const { data: shopData, error } = await supabase
          .from('shops')
          .select('*')
          .eq('owner_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching shop details:', error);
        } else if (shopData) {
          setShop(shopData);
        }
      } catch (error) {
        console.error("Error fetching shop details:", error);
      }
    };

    fetchShopDetails();
  }, [user?.id]);

  // Fetch queue data
  const fetchQueue = async (shopId: string) => {
    try {
      const { data: queueData, error } = await supabase
        .from('queue')
        .select(`
          *,
          users:customer_id(full_name),
          bookings:booking_id(
            total_price,
            services:service_id(name)
          )
        `)
        .eq('shop_id', shopId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching queue:', error);
        return;
      }

      if (queueData) {
        const formattedQueue = queueData.map(item => ({
          id: item.id,
          customer_id: item.customer_id,
          booking_id: item.booking_id,
          position: item.position,
          status: item.status,
          estimated_wait_time: item.estimated_wait_time || 0,
          joined_at: item.joined_at,
          customer_name: item.users?.full_name || 'Unknown Customer',
          service_name: item.bookings?.services?.name || 'Unknown Service',
          total_price: item.bookings?.total_price || 0,
        }));

        setShopQueue(formattedQueue);
      }
    } catch (error) {
      console.error('Error fetching queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time queue updates
  useEffect(() => {
    if (!shop?.id) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchQueue(shop.id);

    // Set up real-time subscription
    const subscription = supabase
      .channel('queue_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
          filter: `shop_id=eq.${shop.id}`,
        },
        () => {
          fetchQueue(shop.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [shop?.id]);

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

      Alert.alert('Success', 'Queue updated successfully');
    } catch (error) {
      console.error('Error updating queue item:', error);
      Alert.alert('Error', 'Failed to update queue item');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return '#f59e0b';
      case 'in_service': return '#10b981';
      case 'completed': return '#8b5cf6';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatWaitTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderQueueItem = ({ item, index }: { item: QueueItemDisplay; index: number }) => (
    <MotiView
      from={{ opacity: 0, translateX: 50 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -50 }}
      transition={{
        duration: 300,
      }}
      className="bg-white rounded-2xl p-4 mx-4 mb-3 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View className="bg-[#CB9C5E] w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">{item.position}</Text>
            </View>
            <Text className="text-lg font-semibold text-gray-900">{item.customer_name}</Text>
          </View>
          <Text className="text-sm text-gray-600 ml-11">{item.service_name}</Text>
          <Text className="text-sm text-[#CB9C5E] font-semibold ml-11">${item.total_price}</Text>
        </View>
        
        <View className="items-end">
          <View 
            className="px-3 py-1 rounded-full mb-2"
            style={{ backgroundColor: getStatusColor(item.status) + '20' }}
          >
            <Text 
              className="text-sm font-medium"
              style={{ color: getStatusColor(item.status) }}
            >
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          {item.status === 'waiting' && (
            <Text className="text-xs text-gray-500">
              ~{formatWaitTime(item.estimated_wait_time)} wait
            </Text>
          )}
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xs text-gray-500">
          Joined: {new Date(item.joined_at).toLocaleTimeString()}
        </Text>
      </View>

      <View className="flex-row gap-2">
        {item.status === 'waiting' && (
          <>
            <Pressable
              className="flex-1 bg-green-500 py-2 px-4 rounded-lg disabled:opacity-50"
              onPress={() => updateQueueItemStatus(item.id, 'in_service')}
              disabled={actionLoading === item.id}
            >
              {actionLoading === item.id ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-medium">Start Service</Text>
              )}
            </Pressable>
            <Pressable
              className="bg-red-500 py-2 px-4 rounded-lg disabled:opacity-50"
              onPress={() => updateQueueItemStatus(item.id, 'cancelled')}
              disabled={actionLoading === item.id}
            >
              <Text className="text-white text-center font-medium">Cancel</Text>
            </Pressable>
          </>
        )}
        
        {item.status === 'in_service' && (
          <Pressable
            className="flex-1 bg-purple-500 py-2 px-4 rounded-lg disabled:opacity-50"
            onPress={() => updateQueueItemStatus(item.id, 'completed')}
            disabled={actionLoading === item.id}
          >
            {actionLoading === item.id ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white text-center font-medium">Complete Service</Text>
            )}
          </Pressable>
        )}
      </View>
    </MotiView>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="mt-4 text-gray-600">Loading queue...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-6">
        <Text className="text-xl font-semibold text-gray-900 mb-4">No Shop Found</Text>
        <Text className="text-gray-600 text-center">
          You need to register your shop to manage the queue.
        </Text>
      </View>
    );
  }

  const waitingCount = shopQueue.filter(item => item.status === 'waiting').length;
  const inServiceCount = shopQueue.filter(item => item.status === 'in_service').length;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{
          duration: 300,
        }}
        className="bg-[#CB9C5E] pt-12 pb-6 px-6"
      >
        <Text className="text-2xl font-bold text-white mb-1">Queue Management</Text>
        <Text className="text-white/90">{shop.name}</Text>
      </MotiView>

      {/* Stats */}
      <View className="flex-row px-4 -mt-4 mb-6">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 300,
          }}
          className="flex-1 bg-white rounded-2xl p-4 mr-2 shadow-sm"
        >
          <Text className="text-2xl font-bold text-orange-500">{waitingCount}</Text>
          <Text className="text-gray-600">Waiting</Text>
        </MotiView>
        
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 300,
          }}
          className="flex-1 bg-white rounded-2xl p-4 ml-2 shadow-sm"
        >
          <Text className="text-2xl font-bold text-green-500">{inServiceCount}</Text>
          <Text className="text-gray-600">In Service</Text>
        </MotiView>
      </View>

      {/* Queue List */}
      {shopQueue.length > 0 ? (
        <FlatList
          data={shopQueue.filter(item => item.status !== 'completed' && item.status !== 'cancelled')}
          renderItem={renderQueueItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-xl font-semibold text-gray-900 mb-2">No Queue Items</Text>
          <Text className="text-gray-600 text-center">
            When customers join your queue, they'll appear here for you to manage.
          </Text>
        </View>
      )}
    </View>
  );
}
