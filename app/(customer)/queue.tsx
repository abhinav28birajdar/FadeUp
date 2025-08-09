import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
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
  const [shopQueue, setShopQueue] = useState<QueueItemDisplay[]>([]);
  const [myQueuePosition, setMyQueuePosition] = useState<number | null>(null);
  const [queueAhead, setQueueAhead] = useState<number>(0);
  const [myShopId, setMyShopId] = useState<string | null>(null);
  const [queueManager] = useState(() => new QueueRealtimeManager());

  // Fetch the shop ID for the customer's most recent booking
  useEffect(() => {
    const fetchMyShopId = async () => {
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
          setMyShopId(bookingsData[0].shop_id);
        }
      } catch (error) {
        console.error("Error fetching shop ID:", error);
      }
    };

    fetchMyShopId();
  }, [user?.id]);

  // Set up real-time queue updates
  useEffect(() => {
    if (!myShopId) {
      setLoading(false);
      return;
    }

    const processQueueUpdate = async (queueData: any[]) => {
      try {
        const queueEntries: QueueItemDisplay[] = [];
        let myPosition = null;
        
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
            entry.position < myPosition && entry.status === "waiting"
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

  return (
    <View className="flex-1 p-4 bg-dark-background">
      <MotiView
        from={{ opacity: 0, translateY: -10 }}
        animate={{ opacity: 1, translateY: 0 }}
      >
        <Text className="text-4xl font-bold text-primary-light mb-6">
          Your Live Queue
        </Text>
      </MotiView>

      <ModernCard className="mb-6">
        <Text className="text-lg font-bold text-primary-light text-center mb-2">
          Your position in the queue
        </Text>
        <Text className="text-6xl font-bold text-accent-secondary text-center">
          {myQueuePosition}
        </Text>
        <Text className="text-base text-secondary-light text-center mt-2">
          {queueAhead === 0 
            ? "You're next!" 
            : `${queueAhead} ${queueAhead === 1 ? "person" : "people"} ahead of you`}
        </Text>
      </ModernCard>

      <Text className="text-xl font-bold text-primary-light mt-6 mb-4">
        People in Queue
      </Text>

      <FlatList
        data={shopQueue}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnimatePresence>
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -100 }}
              transition={{ 
                timing: { 
                  duration: 500,
                },
                delay: index * 100 
              }}
              className="mb-3"
            >
              <ModernCard>
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 rounded-full justify-center items-center mr-3 ${
                    item.customer_id === user?.id ? 'bg-brand-secondary' : 'bg-gray-600'
                  }`}>
                    <Text className="text-lg font-bold text-primary-light">
                      {item.position}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-light mb-1">
                      {item.customer_id === user?.id ? "You" : item.customerName}
                    </Text>
                    <Text className="text-sm text-secondary-light">
                      {item.services.join(", ")}
                    </Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${
                    item.status === "waiting" 
                      ? "bg-blue-500/20" 
                      : item.status === "completed"
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                  }`}>
                    <Text className={`text-xs font-bold ${
                      item.status === "waiting" 
                        ? "text-blue-400" 
                        : item.status === "completed"
                          ? "text-green-400"
                          : "text-red-400"
                    }`}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </ModernCard>
            </MotiView>
          </AnimatePresence>
        )}
        ListEmptyComponent={
          <ModernCard>
            <Text className="text-base text-primary-light text-center">
              No one is currently in the queue.
            </Text>
          </ModernCard>
        }
      />
    </View>
  );
}
