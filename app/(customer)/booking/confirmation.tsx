import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AnimatePresence, MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import { ModernCard } from "../../../src/components/ModernCard";
import { supabase } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/store/authStore";
import { Booking, Service, Shop } from "../../../src/types/supabase";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { id: bookingId } = useLocalSearchParams();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!user?.id) return;
        
        // Query parameters take precedence
        let bookingQuery;
        
        if (bookingId) {
          bookingQuery = supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();
        } else {
          // Fallback to most recent booking
          bookingQuery = supabase
            .from('bookings')
            .select('*')
            .eq('customer_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        }
        
        const { data: bookingData, error: bookingError } = await bookingQuery;
        
        if (bookingError) {
          console.error("Error fetching booking:", bookingError);
          setLoading(false);
          return;
        }
        
        if (bookingData) {
          setBooking(bookingData);
          
          // Fetch shop details
          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', bookingData.shop_id)
            .single();
          
          if (!shopError && shopData) {
            setShop(shopData);
          }
          
          // Fetch services - support for multiple services
          if (bookingData.service_ids && Array.isArray(bookingData.service_ids)) {
            const { data: servicesData, error: servicesError } = await supabase
              .from('services')
              .select('*')
              .in('id', bookingData.service_ids);
            
            if (!servicesError && servicesData) {
              setServices(servicesData);
            }
          } else if (bookingData.service_id) {
            // Legacy support for single service_id
            const { data: serviceData, error: serviceError } = await supabase
              .from('services')
              .select('*')
              .eq('id', bookingData.service_id)
              .single();
            
            if (!serviceError && serviceData) {
              setService(serviceData);
              setServices([serviceData]);
            }
          }
          
          // Check if user is in queue and get position
          const { data: queueData, error: queueError } = await supabase
            .from('queue')
            .select('position')
            .eq('customer_id', user.id)
            .eq('booking_id', bookingData.id)
            .single();
            
          if (!queueError && queueData) {
            setQueuePosition(queueData.position);
          }
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
    
    // Play success haptic feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user?.id, bookingId]);

  const handleGoToQueue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(customer)/queue');
  };

  const handleGoHome = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/(customer)/home');
  };
  
  const handleViewShop = () => {
    if (shop) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(`/(customer)/shop/${shop.id}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading booking details...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-dark-background" contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 40 }}>
      <AnimatePresence>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 100 }}
          className="mb-6"
        >
          <LinearGradient
            colors={['#2E2E2E', '#121212']}
            className="rounded-3xl p-8 items-center"
          >
            <MotiView
              from={{ opacity: 0, translateY: -10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 300 }}
            >
              <View className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center mb-6 shadow-lg">
                <Ionicons name="checkmark" size={50} color="#FFFFFF" />
              </View>
            </MotiView>
            
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 400 }}
            >
              <Text className="text-primary-light text-3xl font-bold text-center mb-2">
                Booking Confirmed
              </Text>
              
              <Text className="text-secondary-light text-center mb-4 px-4">
                Your appointment has been successfully booked
              </Text>
            </MotiView>
            
            {queuePosition !== null && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 500 }}
                className="bg-brand-primary/20 px-6 py-3 rounded-full mb-4"
              >
                <Text className="text-brand-primary font-semibold text-center">
                  Queue Position: #{queuePosition}
                </Text>
              </MotiView>
            )}
          </LinearGradient>
        </MotiView>
        
        {/* Shop Details */}
        {booking && shop && (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300 }}
            className="mb-6"
          >
            <ModernCard onPress={handleViewShop}>
              <View className="flex-row items-center p-4">
                <View className="w-16 h-16 bg-dark-card rounded-xl items-center justify-center mr-4">
                  {shop.image_url ? (
                    <Image
                      source={{ uri: shop.image_url }}
                      style={{ width: '100%', height: '100%', borderRadius: 12 }}
                    />
                  ) : (
                    <Ionicons name="business" size={30} color="#A1A1AA" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-primary-light">{shop.name}</Text>
                  <Text className="text-secondary-light">{shop.address}</Text>
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="star" size={14} color="#CB9C5E" />
                    <Text className="text-brand-primary ml-1 text-sm">{shop.average_rating?.toFixed(1) || '4.5'}</Text>
                  </View>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#A1A1AA" />
              </View>
            </ModernCard>
          </MotiView>
        )}
        
        {/* Appointment Details */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 400 }}
          className="mb-6"
        >
          <ModernCard>
            <View className="p-4">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-primary-light">Appointment Details</Text>
                <View className={`px-3 py-1 rounded-full ${
                  booking?.status === 'confirmed' ? 'bg-emerald-500/20' : 
                  booking?.status === 'pending' ? 'bg-yellow-500/20' : 
                  booking?.status === 'cancelled' ? 'bg-red-500/20' : 
                  'bg-gray-500/20'
                }`}>
                  <Text className={`text-xs font-medium ${
                    booking?.status === 'confirmed' ? 'text-emerald-400' : 
                    booking?.status === 'pending' ? 'text-yellow-400' : 
                    booking?.status === 'cancelled' ? 'text-red-400' : 
                    'text-gray-400'
                  }`}>
                    {booking?.status ? booking.status.toUpperCase() : 'PENDING'}
                  </Text>
                </View>
              </View>
              
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-brand-secondary/20 items-center justify-center mr-3">
                    <Ionicons name="calendar-outline" size={16} color="#CB9C5E" />
                  </View>
                  <View>
                    <Text className="text-secondary-light text-xs">DATE & TIME</Text>
                    <Text className="text-primary-light">
                      {booking?.booking_date && new Date(booking.booking_date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                      {booking?.slot_time && ` · ${booking.slot_time}`}
                    </Text>
                  </View>
                </View>
                
                <View className="flex-row items-center">
                  <View className="w-8 h-8 rounded-full bg-brand-secondary/20 items-center justify-center mr-3">
                    <Ionicons name="cut-outline" size={16} color="#CB9C5E" />
                  </View>
                  <View>
                    <Text className="text-secondary-light text-xs">SERVICES</Text>
                    <View>
                      {services.length > 0 ? (
                        services.map((service, index) => (
                          <Text key={index} className="text-primary-light">
                            {service.name}
                            {index < services.length - 1 ? ', ' : ''}
                          </Text>
                        ))
                      ) : service ? (
                        <Text className="text-primary-light">{service.name}</Text>
                      ) : (
                        <Text className="text-primary-light">Standard Service</Text>
                      )}
                    </View>
                  </View>
                </View>
                
                {booking?.customer_note && (
                  <View className="flex-row items-start">
                    <View className="w-8 h-8 rounded-full bg-brand-secondary/20 items-center justify-center mr-3">
                      <Ionicons name="chatbox-outline" size={16} color="#CB9C5E" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-secondary-light text-xs">YOUR NOTE</Text>
                      <Text className="text-primary-light">{booking.customer_note}</Text>
                    </View>
                  </View>
                )}
                
                <View className="flex-row items-center mt-2">
                  <View className="w-8 h-8 rounded-full bg-brand-secondary/20 items-center justify-center mr-3">
                    <Ionicons name="cash-outline" size={16} color="#CB9C5E" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-secondary-light text-xs">TOTAL</Text>
                    <Text className="text-brand-primary text-lg font-semibold">
                      ${booking?.total_price?.toFixed(2) || '0.00'}
                    </Text>
                    <Text className="text-secondary-light text-xs">
                      Pay at the shop
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </ModernCard>
        </MotiView>
        
        {/* Action Buttons */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 600 }}
          className="space-y-3"
        >
          {queuePosition !== null && (
            <Pressable onPress={handleGoToQueue}>
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-brand-primary py-4 px-6 rounded-xl"
                >
                  <Text className="text-dark-background text-center font-semibold text-lg">
                    View Live Queue
                  </Text>
                </MotiView>
              )}
            </Pressable>
          )}

          <Pressable onPress={handleGoHome}>
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed ? 0.96 : 1 }}
                className={queuePosition !== null ? 
                  "bg-dark-card py-4 px-6 rounded-xl border border-gray-700" : 
                  "bg-brand-primary py-4 px-6 rounded-xl"
                }
              >
                <Text className={queuePosition !== null ? 
                  "text-primary-light text-center font-semibold text-lg" : 
                  "text-dark-background text-center font-semibold text-lg"
                }>
                  Back to Home
                </Text>
              </MotiView>
            )}
          </Pressable>
        </MotiView>
      </AnimatePresence>
    </ScrollView>
  );
}
