import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { supabase } from '../../src/lib/supabase';
import supabaseUtils from '../../src/lib/supabaseUtils';
import { useAuthStore } from '../../src/store/authStore';
import { Shop } from '../../src/types/supabase';
import { getCurrentUserLocation, requestLocationPermissions } from '../../src/utils/location';

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
  const [shops, setShops] = useState<(Shop & { distanceKm?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  const { user } = useAuthStore();

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user location, shops, and upcoming bookings
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    Promise.all([
      fetchLocationAndShops(),
      fetchUpcomingBookings()
    ]).finally(() => {
      setRefreshing(false);
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInitialData();
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

  const fetchLocationAndShops = async () => {
    setLoading(true);
    setLocationStatus('Getting your location...');

    try {
      // Request location permissions
      const permissions = await requestLocationPermissions();
      
      if (permissions?.status === 'granted') {
        const location = await getCurrentUserLocation();
        if (location) {
          setUserLocation(location);
          setLocationStatus('Location found');
          
          // Fetch nearby shops using the utility function
          const result = await supabaseUtils.shopUtils.getShopsByLocation(
            location.latitude,
            location.longitude,
            20 // 20km radius
          );
          
          if (result.error) {
            console.error('Error fetching nearby shops:', result.error);
            setLocationStatus('Error loading nearby shops');
            return;
          }

          const nearbyShops = result.data || [];
          setShops(nearbyShops.map((shop: any) => ({ ...shop, distanceKm: shop.distance_km })));
          setLocationStatus(`Found ${nearbyShops.length} shops within 20km`);
        } else {
          setLocationStatus('Could not get location');
          // Fetch all shops if location not available
          const result = await supabaseUtils.shopUtils.getShopsByLocation(0, 0, 1000); // Large radius to get all
          if (result.data) {
            setShops(result.data);
          }
          setLocationStatus('Showing all shops');
        }
      } else {
        setLocationStatus('Location permission denied');
        // Fetch all shops if location not available
        const result = await supabaseUtils.shopUtils.getShopsByLocation(0, 0, 1000); // Large radius to get all
        if (result.data) {
          setShops(result.data);
        }
        setLocationStatus('Showing all shops');
      }
    } catch (error) {
      console.error('Error in fetchLocationAndShops:', error);
      setLocationStatus('Error loading data');
      Alert.alert('Error', 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleShopPress = (shopId: string) => {
    router.push(`/(customer)/shop/${shopId}`);
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

  const renderShopItem = ({ item, index }: { item: Shop & { distanceKm?: number }; index: number }) => (
    <Pressable onPress={() => handleShopPress(item.id)} className="mb-4">
      {({ pressed }) => (
        <ModernCard pressed={pressed} delay={index * 100}>
          <View className="space-y-3">
            <View className="h-40 bg-dark-background rounded-lg overflow-hidden">
              {item.image_url ? (
                <Image
                  source={{ uri: item.image_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  transition={500}
                />
              ) : (
                <View className="flex-1 items-center justify-center">
                  <Ionicons name="cut-outline" size={32} color="#A1A1AA" />
                  <Text className="text-secondary-light text-sm mt-2">No image available</Text>
                </View>
              )}
              
              {/* Shop name overlay */}
              <BlurView intensity={80} tint="dark" className="absolute bottom-0 left-0 right-0">
                <View className="py-2 px-3">
                  <Text className="text-primary-light text-lg font-semibold">
                    {item.name}
                  </Text>
                </View>
              </BlurView>
            </View>
            
            <View>
              <View className="flex-row items-center">
                <Ionicons name="location" size={16} color="#A1A1AA" />
                <Text className="text-secondary-light text-sm ml-1 flex-1">
                  {item.address}
                </Text>
              </View>
              
              <Text className="text-secondary-light text-sm mt-2 mb-3">
                {item.description || 'Professional barbering services'}
              </Text>
              
              <View className="flex-row items-center justify-between mt-1">
                {item.average_rating && item.average_rating > 0 && (
                  <View className="flex-row items-center bg-brand-primary/10 px-2 py-1 rounded-md">
                    <Ionicons name="star" size={14} color="#CB9C5E" />
                    <Text className="text-brand-primary text-sm font-semibold ml-1">
                      {item.average_rating.toFixed(1)}
                    </Text>
                    {item.total_ratings && (
                      <Text className="text-secondary-light text-xs ml-1">
                        ({item.total_ratings})
                      </Text>
                    )}
                  </View>
                )}
                
                {item.distanceKm && (
                  <View className="flex-row items-center">
                    <Ionicons name="navigate" size={14} color="#A1A1AA" />
                    <Text className="text-secondary-light text-xs ml-1">
                      {item.distanceKm.toFixed(1)} km
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ModernCard>
      )}
    </Pressable>
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

      <View className="px-6">
        {/* Location Status */}
        <ModernCard delay={400} className="mb-6">
          <Text className="text-secondary-light text-center">
            📍 {locationStatus}
          </Text>
        </ModernCard>

        {/* Nearby Shops Section */}
        <View className="flex-row justify-between items-center mb-4">
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

        {/* Shops List */}
        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#CB9C5E" />
            <Text className="text-secondary-light mt-4">
              Loading shops...
            </Text>
          </View>
        ) : shops.length === 0 ? (
          <ModernCard>
            <Text className="text-secondary-light text-center">
              No shops found nearby. Try enabling location services or check back later.
            </Text>
          </ModernCard>
        ) : (
          <FlatList
            data={shops}
            renderItem={renderShopItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </ScrollView>
  );
}

