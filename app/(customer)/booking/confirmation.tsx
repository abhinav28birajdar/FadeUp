import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { ModernCard } from "../../../src/components/ModernCard";
import { supabase } from "../../../src/lib/supabase";
import { useAuthStore } from "../../../src/store/authStore";
import { Booking, Service, Shop } from "../../../src/types/supabase";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        if (!user?.id) return;
        
        // Get the most recent booking for this user
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (bookingsError) throw bookingsError;
        
        if (bookingsData && bookingsData.length > 0) {
          const bookingData = bookingsData[0];
          setBooking(bookingData);
          
          // Fetch shop details
          const { data: shopData, error: shopError } = await supabase
            .from('shops')
            .select('*')
            .eq('id', bookingData.shop_id)
            .single();
          
          if (shopError) throw shopError;
          if (shopData) setShop(shopData);
          
          // Fetch service details
          const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .select('*')
            .eq('id', bookingData.service_id)
            .single();
          
          if (serviceError) throw serviceError;
          if (serviceData) setService(serviceData);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [user?.id]);

  const handleGoToQueue = () => {
    router.replace('/(customer)/queue');
  };

  const handleGoHome = () => {
    router.replace('/(customer)/home');
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
    <View className="flex-1 bg-dark-background px-6 py-12 justify-center">
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          spring: { 
            damping: 15, 
            stiffness: 150 
          }
        }}
      >
        <ModernCard className="p-8 items-center">
          <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 200 }}
            className="items-center mb-6"
          >
            <View className="w-20 h-20 bg-green-500 rounded-full items-center justify-center mb-4">
              <Text className="text-white text-4xl">✓</Text>
            </View>
            
            <Text className="text-primary-light text-2xl font-bold text-center mb-2">
              Booking Confirmed!
            </Text>
            
            <Text className="text-secondary-light text-center leading-6 mb-6">
              Your booking has been successfully confirmed. You've been added to the queue and 
              will receive updates on your position.
            </Text>

            {/* Booking Details */}
            {booking && shop && service && (
              <View className="w-full bg-brand-secondary/10 p-4 rounded-xl mb-6">
                <Text className="text-primary-light font-semibold text-lg mb-2">Booking Details</Text>
                <Text className="text-secondary-light mb-1">Shop: {shop.name}</Text>
                <Text className="text-secondary-light mb-1">Service: {service.name}</Text>
                <Text className="text-secondary-light mb-1">Date: {booking.booking_date}</Text>
                <Text className="text-secondary-light mb-1">Time: {booking.booking_time}</Text>
                <Text className="text-brand-primary font-semibold">Total: ${booking.total_price.toFixed(2)}</Text>
              </View>
            )}
          </MotiView>

          <View className="w-full space-y-3">
            <Pressable onPress={handleGoToQueue}>
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-brand-primary py-4 rounded-xl"
                >
                  <Text className="text-dark-background text-center font-semibold text-lg">
                    View Queue Status
                  </Text>
                </MotiView>
              )}
            </Pressable>

            <Pressable onPress={handleGoHome}>
              {({ pressed }) => (
                <MotiView
                  animate={{ scale: pressed ? 0.96 : 1 }}
                  className="bg-brand-secondary py-4 rounded-xl border border-brand-primary/30"
                >
                  <Text className="text-brand-primary text-center font-semibold text-lg">
                    Back to Home
                  </Text>
                </MotiView>
              )}
            </Pressable>
          </View>
        </ModernCard>
      </MotiView>
    </View>
  );
}
