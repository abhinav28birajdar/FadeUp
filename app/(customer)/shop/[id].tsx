import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Linking,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View
} from 'react-native';
import { ModernCard } from '../../../src/components/ModernCard';
import { supabase } from '../../../src/lib/supabase';
import { useAuthStore } from '../../../src/store/authStore';
import { Service, Shop } from '../../../src/types/supabase';

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ShopDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [queueLength, setQueueLength] = useState(0);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  useEffect(() => {
    loadShopDetails();
    getUserLocation();
  }, [id]);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
      }
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const loadShopDetails = async () => {
    try {
      setLoading(true);

      // Fetch shop details
      const { data: shopData, error: shopError } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (shopError) throw shopError;
      setShop(shopData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('shop_id', id)
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch queue information
      const { data: queueData, error: queueError } = await supabase
        .from('queue')
        .select('*')
        .eq('shop_id', id)
        .eq('status', 'waiting')
        .order('position', { ascending: true });

      if (queueError) throw queueError;
      
      const queueCount = queueData?.length || 0;
      setQueueLength(queueCount);

      // Calculate estimated wait time (assuming 25 minutes per person)
      setEstimatedWaitTime(queueCount * 25);

    } catch (error) {
      console.error('Error loading shop details:', error);
      Alert.alert('Error', 'Failed to load shop details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadShopDetails();
  };

  const handleBookService = (service: Service) => {
    router.push(`/(customer)/booking/${id}`);
  };

  const handleCallShop = () => {
    if (shop?.phone_number) {
      Linking.openURL(`tel:${shop.phone_number}`);
    }
  };

  const handleGetDirections = () => {
    if (shop?.latitude && shop?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleViewQueue = () => {
    router.push({
      pathname: '/(customer)/queue',
      params: { shopId: id },
    });
  };

  const formatQueueTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <MotiView
          animate={{
            rotateZ: '360deg',
          }}
          transition={{
            loop: true,
            duration: 1000,
          }}
        >
          <Ionicons name="cut" size={48} color="#CB9C5E" />
        </MotiView>
        <Text className="text-brand-primary text-lg mt-4">Loading shop details...</Text>
      </View>
    );
  }

  if (!shop) {
    return (
      <View className="flex-1 bg-dark-background justify-center items-center">
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-primary-light text-xl mt-4">Shop not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-6 px-6 py-3 bg-brand-primary rounded-xl"
        >
          <Text className="text-dark-background font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const distance = userLocation && shop.latitude && shop.longitude
    ? calculateDistance(
        userLocation.coords.latitude,
        userLocation.coords.longitude,
        shop.latitude,
        shop.longitude
      )
    : null;

  return (
    <ScrollView
      className="flex-1 bg-dark-background"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CB9C5E" />
      }
    >
      {/* Header Image */}
      <View className="relative h-64">
        <Image
          source={{
            uri: shop.image_url || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800'
          }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/30" />
        
        {/* Back Button */}
        <Pressable
          onPress={() => router.back()}
          className="absolute top-12 left-4 w-10 h-10 bg-black/50 rounded-full items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Shop Rating */}
        <View className="absolute top-12 right-4 bg-black/50 px-3 py-1 rounded-full flex-row items-center">
          <Ionicons name="star" size={16} color="#CB9C5E" />
          <Text className="text-primary-light font-semibold ml-1">{shop.average_rating?.toFixed(1) || 'N/A'}</Text>
        </View>
      </View>

      <View className="px-4 pb-8">
        {/* Shop Info */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 100 }}
          className="-mt-8"
        >
          <ModernCard className="p-6">
            <Text className="text-primary-light text-2xl font-bold mb-2">{shop.name}</Text>
            
            <View className="flex-row items-center mb-3">
              <Ionicons name="location" size={16} color="#CB9C5E" />
              <Text className="text-secondary-light ml-2 flex-1">{shop.address}</Text>
              {distance && (
                <Text className="text-brand-primary font-semibold">{distance.toFixed(1)} km</Text>
              )}
            </View>

            {shop.description && (
              <Text className="text-secondary-light mb-4 leading-6">{shop.description}</Text>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <Pressable
                onPress={handleCallShop}
                className="flex-1 bg-brand-primary py-3 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="call" size={20} color="#1A1A1A" />
                <Text className="text-dark-background font-semibold ml-2">Call</Text>
              </Pressable>
              
              <Pressable
                onPress={handleGetDirections}
                className="flex-1 bg-brand-secondary py-3 rounded-xl flex-row items-center justify-center border border-brand-primary/30"
              >
                <Ionicons name="navigate" size={20} color="#CB9C5E" />
                <Text className="text-brand-primary font-semibold ml-2">Directions</Text>
              </Pressable>
            </View>
          </ModernCard>
        </MotiView>

        {/* Queue Status */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 200 }}
          className="mt-4"
        >
          <ModernCard className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-primary-light text-lg font-semibold">Current Queue</Text>
              <Pressable onPress={handleViewQueue}>
                <Text className="text-brand-primary font-medium">View Details</Text>
              </Pressable>
            </View>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-3 h-3 bg-brand-primary rounded-full mr-2" />
                <Text className="text-secondary-light">{queueLength} people waiting</Text>
              </View>
              
              <Text className="text-brand-primary font-semibold">
                ~{formatQueueTime(estimatedWaitTime)}
              </Text>
            </View>
          </ModernCard>
        </MotiView>

        {/* Services */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 300 }}
          className="mt-4"
        >
          <Text className="text-primary-light text-xl font-bold mb-3">Services</Text>
          
          {services.map((service, index) => (
            <MotiView
              key={service.id}
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ 
                timing: { duration: 500 },
                delay: 400 + index * 100 
              }}
              className="mb-3"
            >
              <ModernCard className="p-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-primary-light text-lg font-semibold flex-1">{service.name}</Text>
                  <Text className="text-brand-primary text-xl font-bold">${service.price}</Text>
                </View>
                
                <View className="flex-row items-center justify-between">
                  <Text className="text-secondary-light flex-1">
                    {service.description} • {service.duration} mins
                  </Text>
                  
                  <Pressable
                    onPress={() => handleBookService(service)}
                    className="bg-brand-primary px-4 py-2 rounded-lg ml-3"
                  >
                    <Text className="text-dark-background font-semibold">Book</Text>
                  </Pressable>
                </View>
              </ModernCard>
            </MotiView>
          ))}
          
          {services.length === 0 && (
            <ModernCard className="p-6 items-center">
              <Ionicons name="cut-outline" size={48} color="#6B7280" />
              <Text className="text-gray-400 text-center mt-3">
                No services available at the moment
              </Text>
            </ModernCard>
          )}
        </MotiView>

        {/* Shop Hours */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: 500 }}
          className="mt-4"
        >
          <ModernCard className="p-4">
            <Text className="text-primary-light text-lg font-semibold mb-3">Opening Hours</Text>
            
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time" size={20} color="#CB9C5E" />
                <Text className="text-secondary-light ml-2">Daily</Text>
              </View>
              
              <Text className="text-primary-light font-medium">
                9:00 AM - 8:00 PM
              </Text>
            </View>
          </ModernCard>
        </MotiView>
      </View>
    </ScrollView>
  );
};

export default ShopDetailScreen;