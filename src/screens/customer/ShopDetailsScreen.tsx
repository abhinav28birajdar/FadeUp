// src/screens/customer/ShopDetailsScreen.tsx (Outline)
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import GlassCard from '../../components/GlassCard';
import { supabase } from '../../lib/supabase';
import { Shop, Service } from '../../types';

type Props = StackScreenProps<RootStackParamList, 'ShopDetails'>;

const ShopDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { shopId } = route.params;
  const [shop, setShop] = useState<Shop | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopDetails = async () => {
      try {
        const { data: shopData, error: shopError } = await supabase
          .from('shops')
          .select('*')
          .eq('id', shopId)
          .single();

        if (shopError) throw shopError;
        setShop(shopData as Shop);

        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('*')
          .eq('shop_id', shopId);

        if (servicesError) throw servicesError;
        setServices(servicesData as Service[]);

      } catch (error: any) {
        Alert.alert('Error', `Failed to fetch shop details: ${error.message}`);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopDetails();
  }, [shopId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!shop) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-xl">Shop not found.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-blue-500 py-2 px-4 rounded-md">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4 pt-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mb-4">
          <Text className="text-blue-400 text-lg">< Back</Text>
        </TouchableOpacity>

        <GlassCard className="mb-6 p-4">
          <Text className="text-3xl font-bold text-white mb-2">{shop.name}</Text>
          <Text className="text-gray-200 text-lg mb-1">Address: {shop.address}</Text>
          <Text className="text-yellow-400 text-lg mb-2">Average Rating: {shop.average_rating?.toFixed(1) || 'N/A'}</Text>
          <Text className="text-white">{shop.description}</Text>
        </GlassCard>

        <Text className="text-2xl font-bold text-white mb-4">Services</Text>
        {services.length === 0 ? (
          <GlassCard className="p-4 items-center">
            <Text className="text-white text-lg">No services available for this shop.</Text>
          </GlassCard>
        ) : (
          services.map((service) => (
            <TouchableOpacity
              key={service.id}
              onPress={() => navigation.navigate('ServiceDetails', { serviceId: service.id, shopId: shop.id })}
              className="mb-3"
            >
              <GlassCard className="p-4 flex-row justify-between items-center">
                <View>
                  <Text className="text-xl font-semibold text-white">{service.name}</Text>
                  <Text className="text-gray-300">Duration: {service.duration_minutes} mins</Text>
                </View>
                <Text className="text-white text-lg font-bold">${service.price.toFixed(2)}</Text>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ImageBackground>
  );
};

export default ShopDetailsScreen;