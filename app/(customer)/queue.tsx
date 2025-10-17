import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from "react-native";
import { ModernCard } from "../../src/components/ModernCard";
import { QueueRealtimeManager } from "../../src/lib/queueRealtime";
import { supabase } from "../../src/lib/supabase";
import { useAuthStore } from "../../src/store/authStore";

import { QueueEntry } from "../../src/types/supabase";


interface QueueItemDisplay extends QueueEntry {
  customerName: string;
  services: string[];
}

export default function QueueScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [myQueuePosition, setMyQueuePosition] = useState<number | null>(null);
  const [queueAhead, setQueueAhead] = useState<number>(0);
  const [myShopId, setMyShopId] = useState<string | null>(null);
  const [queueManager] = useState(() => new QueueRealtimeManager());
  const [shopDetails, setShopDetails] = useState<{ name: string; address: string } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);

  // Fetch the shop ID for the customer's most recent booking
  useEffect(() => {
    fetchMyShopData();
  }, [user?.id]);
  
  const fetchMyShopData = async () => {
    try {
      if (!user?.id) return;
      
      const { data: bookingsData, error } = await supabase
        .from('bookings')
        .select('shop_id')
        .eq('customer_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) {
        console.error('Error fetching shop ID:', error);
        return;
      }
      
      if (bookingsData && bookingsData.length > 0) {
        const shopId = bookingsData[0].shop_id;
        setMyShopId(shopId);
        
        // Fetch shop details
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('name, address')
          .eq('id', shopId)
          .single();
          
        if (!shopError && shopData) {
          setShopDetails(shopData);
        }
      }
    } catch (error) {
      console.error("Error fetching shop data:", error);
    }
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyShopData();
    // The queue will be refreshed via the real-time subscription
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // Set up real-time queue updates
  useEffect(() => {
    if (!myShopId) {
      setLoading(false);
      return;
    }

    const processQueueUpdate = async (queueData: any[]) => {
      try {
        const queueEntries: QueueItemDisplay[] = [];
        let myPosition: number | null = null;
        
        // Process each queue entry
        for (const queueItem of queueData) {
          // Check if this is the current user's queue entry
          if (queueItem.customer_id === user?.id) {
            myPosition = queueItem.position;
          }

          // Fetch customer details
          const { data: customerData } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', queueItem.customer_id)
            .single();

          let customerName = "Unknown";
          if (customerData) {
            customerName = `${customerData.first_name} ${customerData.last_name.charAt(0)}.`;
          }

          // Fetch booking and service details
          const { data: bookingData } = await supabase
            .from('bookings')
            .select('service_ids')
            .eq('id', queueItem.booking_id)
            .single();

          let services: string[] = [];
          if (bookingData && Array.isArray(bookingData.service_ids)) {
            // Fetch all service names for the booking
            const { data: serviceList } = await supabase
              .from('services')
              .select('name')
              .in('id', bookingData.service_ids);
            if (serviceList) {
              services = serviceList.map((s: any) => s.name);
            }
          }

          queueEntries.push({
            ...queueItem,
            customerName,
            services,
          });
        }
        
        // Sort by position
  queueEntries.sort((a, b) => a.position - b.position);
        
        setShopQueue(queueEntries);
        setMyQueuePosition(myPosition);
        
        // Calculate how many people are ahead in the queue
        if (myPosition !== null) {
          const ahead = queueEntries.filter(entry => 
            entry.position < myPosition! && entry.status === "waiting"
          ).length;
          setQueueAhead(ahead);
        }
      } catch (error) {
        console.error("Error processing queue data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Subscribe to real-time updates
    queueManager.subscribeToCustomerQueue(user?.id || '', processQueueUpdate);
    
    // Clean up subscription on unmount
    return () => queueManager.unsubscribeAll();
  }, [myShopId, user?.id]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-dark-background">
        <ActivityIndicator size="large" color="#CB9C5E" />
      </View>
    );
  }

  if (!myShopId) {
    return (
      <View className="flex-1 p-4 justify-center items-center bg-dark-background">
        <ModernCard>
          <Text className="text-lg text-primary-light text-center">
            You don't have any active bookings.
          </Text>
        </ModernCard>
      </View>
    );
  }

  if (myQueuePosition === null) {
    return (
      <View className="flex-1 p-4 justify-center items-center bg-dark-background">
        <ModernCard>
          <Text className="text-lg text-primary-light text-center">
            You are not currently in the queue.
          </Text>
        </ModernCard>
      </View>
    );
  }

  // Calculate estimated wait time
  useEffect(() => {
    if (queueAhead > 0) {
      // Estimate 20 minutes per person ahead
      const estimatedMinutes = queueAhead * 20;
      setEstimatedTime(estimatedMinutes);
    } else {
      setEstimatedTime(0);
    }
  }, [queueAhead]);
  
  const formatEstimatedTime = (minutes: number) => {
    if (minutes === 0) return "You're next!";
    if (minutes < 60) return `About ${minutes} minutes`;
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) return `About ${hours} hour${hours > 1 ? 's' : ''}`;
    return `About ${hours} hour${hours > 1 ? 's' : ''} ${mins} min`;
  };
  
  // Navigate to shop details
  const handleViewShop = () => {
    if (myShopId) {
      router.push(`/(customer)/shop/${myShopId}`);
    }
  };
  
  // Get color based on queue position
  const getPositionColor = (position: number) => {
    if (position === 1) return "#10B981"; // Green for next
    if (position <= 3) return "#FCBB3F"; // Yellow for soon
    return "#CB9C5E"; // Brand color for others
  };

  return (
    <View className="flex-1 bg-dark-background">
      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={shopQueue}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={["#CB9C5E"]}
            tintColor="#CB9C5E"
          />
        }
        ListHeaderComponent={
          <>
            {/* Header */}
            <MotiView
              from={{ opacity: 0, translateY: -20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 600 }}
            >
              <Text className="text-4xl font-bold text-primary-light mb-4">
                Live Queue
              </Text>
              
              {shopDetails && (
                <Pressable onPress={handleViewShop}>
                  <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 300 }}
                    className="flex-row items-center mb-6"
                  >
                    <Ionicons name="business-outline" size={16} color="#A1A1AA" />
                    <Text className="text-secondary-light ml-1 text-base">
                      {shopDetails.name}
                    </Text>
                  </MotiView>
                </Pressable>
              )}
            </MotiView>

            {/* Position Card */}
            <MotiView
              from={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 200 }}
              className="mb-8"
            >
              <ModernCard>
                <LinearGradient
                  colors={['#1E1E1E', '#121212']}
                  className="px-4 py-6 rounded-2xl items-center"
                >
                  <BlurView tint="dark" intensity={40} className="absolute inset-0 rounded-2xl" />
                  
                  <Text className="text-lg font-semibold text-primary-light text-center mb-3">
                    Your Position
                  </Text>
                  
                  <View className="items-center">
                    <MotiView
                      from={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ 
                        delay: 300
                      }}
                    >
                      <View 
                        className="w-32 h-32 rounded-full items-center justify-center mb-4"
                        style={{ 
                          backgroundColor: `${getPositionColor(myQueuePosition || 0)}20`,
                          borderWidth: 2,
                          borderColor: getPositionColor(myQueuePosition || 0),
                        }}
                      >
                        <Text 
                          className="text-7xl font-bold"
                          style={{ color: getPositionColor(myQueuePosition || 0) }}
                        >
                          {myQueuePosition}
                        </Text>
                      </View>
                    </MotiView>
                    
                    <Text className="text-xl font-bold text-brand-primary mb-1">
                      {queueAhead === 0 ? "You're next!" : `${queueAhead} ahead of you`}
                    </Text>
                    
                    <Text className="text-secondary-light text-center">
                      {formatEstimatedTime(estimatedTime)}
                    </Text>
                    
                    {queueAhead > 0 && (
                      <View className="bg-brand-secondary/20 px-4 py-2 rounded-full mt-4">
                        <Text className="text-brand-primary text-sm">
                          We'll notify you when it's your turn
                        </Text>
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </ModernCard>
            </MotiView>

            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-xl font-semibold text-primary-light">
                Current Queue
              </Text>
              
              <View className="bg-dark-card px-3 py-1 rounded-full">
                <Text className="text-secondary-light text-xs">
                  {shopQueue.length} {shopQueue.length === 1 ? 'person' : 'people'}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item, index }) => {
          const isCurrentUser = item.customer_id === user?.id;
          const statusColors = {
            waiting: { bg: '#FCBB3F20', text: '#FCBB3F' },
            in_service: { bg: '#06B6D420', text: '#06B6D4' },
            completed: { bg: '#10B98120', text: '#10B981' },
            cancelled: { bg: '#F8717220', text: '#F87172' },
          };
          
          const status = item.status as keyof typeof statusColors;
          
          return (
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -20 }}
              transition={{ delay: index * 80 }}
              className="mb-3"
            >
              <ModernCard 
                pressed={false} 
                shimmer={false}
                className={isCurrentUser ? 'border border-brand-primary/30' : ''}
              >
                <LinearGradient
                  colors={isCurrentUser ? ['#CB9C5E10', '#12121210'] : ['#1A1A1A', '#12121210']}
                  className="px-4 py-3 rounded-xl"
                >
                  <View className="flex-row items-center">
                    <View 
                      className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
                        isCurrentUser ? 'bg-brand-primary' : 'bg-gray-700'
                      }`}
                    >
                      <Text className={`text-lg font-bold ${
                        isCurrentUser ? 'text-dark-background' : 'text-primary-light'
                      }`}>
                        {item.position}
                      </Text>
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-primary-light">
                          {isCurrentUser ? "You" : item.customerName}
                        </Text>
                        
                        {isCurrentUser && (
                          <View className="bg-brand-primary/20 px-2 py-0.5 rounded ml-2">
                            <Text className="text-xs font-medium text-brand-primary">YOU</Text>
                          </View>
                        )}
                      </View>
                      
                      {item.services.length > 0 && (
                        <Text className="text-sm text-secondary-light mt-0.5">
                          {item.services.join(", ")}
                        </Text>
                      )}
                    </View>
                    
                    <View 
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: statusColors[status]?.bg || '#71717A20' }}
                    >
                      <Text 
                        className="text-xs font-medium"
                        style={{ color: statusColors[status]?.text || '#71717A' }}
                      >
                        {status === 'waiting' ? 'WAITING' : 
                         status === 'in_service' ? 'IN SERVICE' : 
                         status === 'completed' ? 'COMPLETED' : 'CANCELLED'}
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </ModernCard>
            </MotiView>
          );
        }}
        ListEmptyComponent={
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300 }}
            className="items-center py-10"
          >
            <Ionicons name="people-outline" size={60} color="#71717A" />
            <Text className="text-primary-light text-lg font-medium mt-4 text-center">
              No one is currently in the queue
            </Text>
            <Text className="text-secondary-light text-center mt-2 px-8">
              This could mean the shop hasn't opened yet or all customers have been served
            </Text>
          </MotiView>
        }
      />
      
      {/* Action button to view shop details */}
      {myShopId && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          className="absolute bottom-8 right-8"
        >
          <Pressable onPress={handleViewShop}>
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed ? 0.95 : 1 }}
                className="bg-brand-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
              >
                <Ionicons name="storefront" size={24} color="#1A1A1A" />
              </MotiView>
            )}
          </Pressable>
        </MotiView>
      )}
    </View>
  );
}
