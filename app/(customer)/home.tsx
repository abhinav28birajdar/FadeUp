import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import NearbyShopsList from '../../src/components/NearbyShopsList';
import { supabase } from '../../src/lib/supabase';
import { Shop } from '../../src/services/shopDiscoveryService';
import { useAuthStore } from '../../src/store/authStore';

const SLIDER_DATA = [
  {
    id: '1',
    title: 'Premium Cuts',
    description: 'Experience the finest barbering',
    image: 'https://via.placeholder.com/400x200/CB9C5E/F3F4F6?text=Premium+Cuts',
  },
  {
    id: '2', 
    title: 'Modern Styles',
    description: 'Latest trends and classic looks',
    image: 'https://via.placeholder.com/400x200/827092/F3F4F6?text=Modern+Styles',
  },
  {
    id: '3',
    title: 'Expert Barbers',
    description: 'Skilled professionals near you',
    image: 'https://via.placeholder.com/400x200/CB9C5E/F3F4F6?text=Expert+Barbers',
  },
];

export default function CustomerHomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [shopsRefreshTrigger, setShopsRefreshTrigger] = useState(0);
  
  const { user } = useAuthStore();

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch upcoming bookings on load
  useEffect(() => {
    fetchUpcomingBookings();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUpcomingBookings();
    setShopsRefreshTrigger(prev => prev + 1);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const fetchUpcomingBookings = async () => {
    if (!user?.id) return;
    
    setLoadingBookings(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          shops:shop_id (name, address, average_rating),
          services:service_id (name, price, duration)
        `)
        .eq('customer_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .order('booking_date', { ascending: true })
        .limit(3);
        
      if (error) {
        console.error('Error fetching bookings:', error);
        return;
      }
      
      setUpcomingBookings(bookings || []);
    } catch (error) {
      console.error('Error in fetchUpcomingBookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleShopPress = (shop: Shop) => {
    router.push(`/(customer)/shop/${shop.id}`);
  };

  const handleViewOnMap = () => {
    router.push('/(customer)/explore-map');
  };

  const renderSliderItem = ({ item, index }: { item: typeof SLIDER_DATA[0]; index: number }) => (
    <View className="w-screen px-6">
      <ModernCard className="h-48">
        <View className="flex-1 justify-center items-center">
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            <Text className="text-primary-light text-2xl font-bold text-center mb-2">
              {item.title}
            </Text>
            <Text className="text-secondary-light text-base text-center">
              {item.description}
            </Text>
          </MotiView>
        </View>
      </ModernCard>
    </View>
  );



  // Navigate to booking details
  const handleBookingPress = (bookingId: string) => {
    router.push(`/(customer)/booking/confirmation?id=${bookingId}`);
  };

  return (
    <ScrollView 
      className="flex-1 bg-dark-background"
      showsVerticalScrollIndicator={false}
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
      <View className="px-6 pt-12 pb-6">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text className="text-primary-light text-4xl font-extrabold">
            Welcome{user?.first_name ? `, ${user.first_name}` : ''}!
          </Text>
          <Text className="text-secondary-light text-lg mt-1">
            Find the perfect barber near you
          </Text>
        </MotiView>
      </View>

      {/* Upcoming bookings */}
      <View className="px-6 mb-8">
        <Text className="text-primary-light text-2xl font-semibold mb-4">
          Upcoming Appointments
        </Text>
        
        {loadingBookings ? (
          <ModernCard shimmer delay={200}>
            <View className="h-24 items-center justify-center">
              <ActivityIndicator size="small" color="#CB9C5E" />
              <Text className="text-secondary-light mt-2">Loading your appointments...</Text>
            </View>
          </ModernCard>
        ) : upcomingBookings.length === 0 ? (
          <ModernCard delay={200}>
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-full bg-dark-background items-center justify-center mr-4">
                <Ionicons name="calendar-outline" size={24} color="#A1A1AA" />
              </View>
              <View className="flex-1">
                <Text className="text-primary-light text-lg font-medium">No upcoming appointments</Text>
                <Text className="text-secondary-light mt-1">Book your next visit to secure your spot</Text>
              </View>
            </View>
          </ModernCard>
        ) : (
          upcomingBookings.map((booking) => (
            <ModernCard 
              key={booking.id} 
              delay={200}
              className="mb-3"
              onPress={() => handleBookingPress(booking.id)}
            >
              <View className="flex-row">
                <View className="w-12 h-12 rounded-full bg-brand-primary/20 items-center justify-center mr-4">
                  <Ionicons name="cut-outline" size={20} color="#CB9C5E" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary-light text-lg font-medium">{booking.shops.name}</Text>
                  <Text className="text-brand-primary font-medium">
                    {new Date(booking.booking_date).toLocaleDateString()} at {booking.booking_time}
                  </Text>
                  <Text className="text-secondary-light mt-1">
                    {booking.services.name} · ${booking.services.price}
                  </Text>
                </View>
                <View>
                  <View className={`px-3 py-1 rounded-full ${
                    booking.status === 'confirmed' ? 'bg-status-confirmed/20' : 'bg-status-pending/20'
                  }`}>
                    <Text className={`text-xs ${
                      booking.status === 'confirmed' ? 'text-status-confirmed' : 'text-status-pending'
                    }`}>
                      {booking.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </View>
            </ModernCard>
          ))
        )}
      </View>

      {/* Slider */}
      <View className="mb-8">
        <FlatList
          data={SLIDER_DATA}
          renderItem={renderSliderItem}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
            setActiveSlide(index);
          }}
        />
        
        {/* Pagination dots */}
        <View className="flex-row justify-center mt-4 space-x-2">
          {SLIDER_DATA.map((_, index) => (
            <MotiView
              key={index}
              animate={{
                scale: index === activeSlide ? 1.2 : 1,
                backgroundColor: index === activeSlide ? '#827092' : '#52525B',
              }}
              className="w-2 h-2 rounded-full"
            />
          ))}
        </View>
      </View>

      {/* Nearby Shops Section Header */}
      <View className="px-6 mb-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-primary-light text-3xl font-semibold">
            Nearby Shops
          </Text>
          
          <Pressable onPress={handleViewOnMap}>
            {({ pressed }) => (
              <MotiView
                animate={{ scale: pressed ? 0.96 : 1 }}
                className="bg-brand-secondary py-2 px-4 rounded-xl"
              >
                <Text className="text-primary-light text-sm font-semibold">
                  View on Map
                </Text>
              </MotiView>
            )}
          </Pressable>
        </View>
      </View>

      {/* Nearby Shops List */}
      <View style={{ flex: 1, minHeight: 600 }}>
        <NearbyShopsList
          refreshTrigger={shopsRefreshTrigger}
          onShopPress={handleShopPress}
        />
      </View>
    </ScrollView>
  );
}

