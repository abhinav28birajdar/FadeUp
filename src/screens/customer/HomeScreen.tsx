// src/screens/customer/HomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, FlatList, Dimensions, ImageBackground, Image, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import GlassCard from '../../components/GlassCard';
import { Shop } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store'; // For logout
import { BlurView } from 'expo-blur';

type Props = StackScreenProps<RootStackParamList, 'Home'>;

const { width: screenWidth } = Dimensions.get('window');

const SLIDER_DATA = [
  { id: '1', image: require('../../assets/slider1.jpg'), text: 'Special Offers' },
  { id: '2', image: require('../../assets/slider2.jpg'), text: 'New Styles' },
  { id: '3', image: require('../../assets/slider3.jpg'), text: 'Exclusive Discounts' },
];

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentUser, setUserRole } = useAppStore(); // To clear user on logout

  const sliderScrollRef = useRef<FlatList | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const { data, error } = await supabase.from('shops').select('*');
        if (error) throw error;
        setShops(data as Shop[]);
      } catch (err: any) {
        console.error('Error fetching shops:', err.message);
        setError('Failed to load barber shops.');
        Alert.alert('Error', 'Failed to load shops: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();

    // Auto-rotating slider logic
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % SLIDER_DATA.length;
        sliderScrollRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setLoading(true); // Indicate loading while logging out
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setCurrentUser(null);
      setUserRole(null);
      navigation.replace('RoleSelect'); // Navigate back to entry
    } catch (err: any) {
      Alert.alert('Logout Error', err.message);
      setLoading(false);
    }
  };


  const renderShopCard = ({ item }: { item: Shop }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ShopDetails', { shopId: item.id })}
      className="mb-4"
    >
      <GlassCard className="w-full p-4 space-y-2">
        <Text className="text-xl font-bold text-white">{item.name}</Text>
        <Text className="text-gray-200">{item.description}</Text>
        <View className="flex-row items-center mt-2">
          {/* Implement star ratings here, e.g., using a loop or an icon component */}
          <Text className="text-yellow-400 font-semibold text-lg">{item.average_rating ? item.average_rating.toFixed(1) : 'N/A'}</Text>
          <Text className="text-gray-300 ml-2">({item.address})</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900 p-4">
        <Text className="text-red-500 text-lg">{error}</Text>
        <TouchableOpacity onPress={handleLogout} className="mt-4 bg-red-500 py-2 px-4 rounded-md">
          <Text className="text-white">Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <ImageBackground
      source={require('../../assets/background.jpg')} // Consistent background
      className="flex-1"
    >
      <ScrollView className="flex-1 p-4 pt-10">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-4xl font-extrabold text-white">FadeUp</Text>
          <TouchableOpacity onPress={handleLogout} className="bg-red-500 py-2 px-4 rounded-md shadow-lg">
            <Text className="text-white font-semibold">Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Auto-rotating Slider */}
        <View className="mb-6 rounded-xl overflow-hidden shadow-xl" style={{ width: screenWidth - 32, height: 200 }}>
          <FlatList
            ref={sliderScrollRef}
            data={SLIDER_DATA}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const contentOffsetX = e.nativeEvent.contentOffset.x;
              const currentIndex = Math.round(contentOffsetX / (screenWidth - 32));
              if (currentIndex !== activeSlide) {
                setActiveSlide(currentIndex);
              }
            }}
            renderItem={({ item }) => (
              <View style={{ width: screenWidth - 32, height: 200 }} className="relative">
                <Image
                  source={item.image}
                  className="w-full h-full object-cover"
                />
                <BlurView
                  intensity={40}
                  tint="dark"
                  className="absolute bottom-0 w-full p-4 items-center justify-center"
                >
                  <Text className="text-white text-xl font-bold">{item.text}</Text>
                </BlurView>
              </View>
            )}
          />
          <View className="absolute bottom-2 left-0 right-0 flex-row justify-center space-x-2">
            {SLIDER_DATA.map((_, index) => (
              <View
                key={index}
                className={`w-2 h-2 rounded-full ${index === activeSlide ? 'bg-white' : 'bg-gray-400'}`}
              />
            ))}
          </View>
        </View>

        <Text className="text-3xl font-bold text-white mb-4">Barber Shops</Text>

        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={renderShopCard}
          scrollEnabled={false} {/* Disable inner FlatList scrolling */}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <GlassCard className="p-4 items-center">
              <Text className="text-white text-lg">No shops available yet.</Text>
            </GlassCard>
          }
        />
      </ScrollView>
    </ImageBackground>
  );
};

export default HomeScreen;