import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { ModernCard } from '../../src/components/ModernCard';
import { getShopsByLocation } from '../../src/lib/supabaseUtils';
import { useAuthStore } from '../../src/store/authStore';
import { Shop } from '../../src/types/supabase';
import { getCurrentUserLocation, requestLocationPermissions } from '../../src/utils/location';

interface ShopWithDistance extends Shop {
  distance_km?: number;
}

export default function ExploreMapScreen() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [shops, setShops] = useState<ShopWithDistance[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopWithDistance | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    fetchLocationAndShops();
  }, []);

  const fetchLocationAndShops = async () => {
    setLoading(true);

    try {
      // Request location permissions
      const permissions = await requestLocationPermissions();
      
      if (permissions?.status === 'granted') {
        const location = await getCurrentUserLocation();
        if (location) {
          setUserLocation(location);
          setRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }
      }

      // Fetch nearby shops
      const currentLat = userLocation?.latitude || region.latitude;
      const currentLng = userLocation?.longitude || region.longitude;
      
      const result = await getShopsByLocation(currentLat, currentLng, 50); // 50km radius
      
      if (result.error) {
        console.error('Error fetching shops:', result.error);
        Alert.alert('Error', 'Failed to load shops');
        return;
      }

      const shopsData = result.data || [];
      setShops(shopsData);
    } catch (error) {
      console.error('Error in fetchLocationAndShops:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleShopPress = (shop: ShopWithDistance) => {
    setSelectedShop(shop);
  };

  const handleViewShop = () => {
    if (selectedShop) {
      router.push(`/(customer)/shop/${selectedShop.id}`);
    }
  };

  const handleBookNow = () => {
    if (selectedShop) {
      router.push(`/(customer)/booking/${selectedShop.id}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-dark-background">
        <ActivityIndicator size="large" color="#CB9C5E" />
        <Text className="text-secondary-light mt-4">Loading map...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark-background">
      {/* Header */}
      <View className="px-6 pt-12 pb-4 bg-dark-background">
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <Text className="text-3xl font-bold text-primary-light">
            Explore Nearby Shops
          </Text>
          <Text className="text-secondary-light mt-1">
            Find barber shops on the map
          </Text>
        </MotiView>
      </View>

      {/* Map */}
      <View className="flex-1 relative">
        <MapView
          style={{ flex: 1 }}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={!!userLocation}
          showsMyLocationButton={true}
        >
          {shops.map((shop) => (
            <Marker
              key={shop.id}
              coordinate={{
                latitude: shop.latitude || region.latitude,
                longitude: shop.longitude || region.longitude,
              }}
              title={shop.name}
              description={shop.description}
              onPress={() => handleShopPress(shop)}
            />
          ))}
        </MapView>

        {/* Shop Details Overlay */}
        {selectedShop && (
          <MotiView
            from={{ opacity: 0, translateY: 100 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="absolute bottom-6 left-4 right-4"
          >
            <ModernCard>
              <View className="space-y-3">
                <View>
                  <Text className="text-xl font-bold text-primary-light">
                    {selectedShop.name}
                  </Text>
                  <Text className="text-secondary-light mt-1">
                    {selectedShop.description || 'Professional barbering services'}
                  </Text>
                  <Text className="text-secondary-light text-xs mt-1">
                    {selectedShop.address}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-4">
                    {selectedShop.rating && selectedShop.rating > 0 && (
                      <View className="flex-row items-center">
                        <Text className="text-brand-primary font-semibold">
                          ⭐ {selectedShop.rating.toFixed(1)}
                        </Text>
                      </View>
                    )}
                    
                    {selectedShop.distance_km && (
                      <Text className="text-secondary-light text-xs">
                        {selectedShop.distance_km.toFixed(1)} km away
                      </Text>
                    )}
                  </View>

                  <Pressable onPress={() => setSelectedShop(null)}>
                    <Text className="text-secondary-light text-lg">✕</Text>
                  </Pressable>
                </View>

                <View className="flex-row space-x-3">
                  <Pressable onPress={handleViewShop} className="flex-1">
                    {({ pressed }) => (
                      <MotiView
                        animate={{ scale: pressed ? 0.96 : 1 }}
                        className="bg-brand-secondary py-3 px-4 rounded-xl"
                      >
                        <Text className="text-primary-light text-center font-semibold">
                          View Details
                        </Text>
                      </MotiView>
                    )}
                  </Pressable>

                  <Pressable onPress={handleBookNow} className="flex-1">
                    {({ pressed }) => (
                      <MotiView
                        animate={{ scale: pressed ? 0.96 : 1 }}
                        className="bg-brand-primary py-3 px-4 rounded-xl"
                      >
                        <Text className="text-dark-background text-center font-semibold">
                          Book Now
                        </Text>
                      </MotiView>
                    )}
                  </Pressable>
                </View>
              </View>
            </ModernCard>
          </MotiView>
        )}
      </View>
    </View>
  );
}