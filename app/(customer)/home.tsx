import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { Shop } from '../../src/types/supabase';
import { getCurrentUserLocation, requestLocationPermissions } from '../../src/utils/location';
import { filterAndSortShopsByDistance } from '../../src/utils/mapHelpers';

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
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<string>('');
  
  const { user } = useAuthStore();

  // Auto-rotate slider
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDER_DATA.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user location and shops
  useEffect(() => {
    fetchLocationAndShops();
  }, []);

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
        } else {
          setLocationStatus('Could not get location');
        }
      } else {
        setLocationStatus('Location permission denied');
      }

      // Fetch all shops
      const { data: shopsData, error } = await supabase
        .from('shops')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shops:', error);
        Alert.alert('Error', 'Failed to load shops');
        return;
      }

      if (shopsData && userLocation) {
        // Filter shops within 20km radius
        const nearbyShops = filterAndSortShopsByDistance(
          shopsData,
          userLocation.latitude,
          userLocation.longitude,
          20 // 20km radius
        );
        setShops(nearbyShops);
        setLocationStatus(`Found ${nearbyShops.length} shops within 20km`);
      } else {
        setShops(shopsData || []);
        setLocationStatus('Showing all shops');
      }
    } catch (error) {
      console.error('Error in fetchLocationAndShops:', error);
      setLocationStatus('Error loading data');
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
            <View className="h-40 bg-dark-background rounded-lg items-center justify-center">
              <Text className="text-secondary-light text-lg">
                {item.name}
              </Text>
            </View>
            
            <View>
              <Text className="text-primary-light text-lg font-bold">
                {item.name}
              </Text>
              <Text className="text-secondary-light text-sm mt-1">
                {item.description || 'Professional barbering services'}
              </Text>
              <Text className="text-secondary-light text-xs mt-1">
                {item.address}
              </Text>
              
              <View className="flex-row items-center justify-between mt-2">
                {item.average_rating && (
                  <View className="flex-row items-center">
                    <Text className="text-brand-primary text-sm font-semibold">
                      ⭐ {item.average_rating.toFixed(1)}
                    </Text>
                  </View>
                )}
                
                {item.distanceKm && (
                  <Text className="text-secondary-light text-xs italic">
                    {item.distanceKm.toFixed(1)} km away
                  </Text>
                )}
              </View>
            </View>
          </View>
        </ModernCard>
      )}
    </Pressable>
  );

  return (
    <ScrollView 
      className="flex-1 bg-dark-background"
      showsVerticalScrollIndicator={false}
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

