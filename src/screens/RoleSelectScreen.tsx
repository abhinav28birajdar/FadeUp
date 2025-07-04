// src/screens/RoleSelectScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator'; // Import your RootStackParamList
import { useAppStore } from '../store';
import GlassCard from '../components/GlassCard';

type Props = StackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const { setUserRole } = useAppStore();

  const handleRoleSelect = (role: 'customer' | 'shopkeeper') => {
    setUserRole(role);
    navigation.navigate('Login'); // Navigate to login screen
  };

  return (
    <ImageBackground
      source={require('../assets/background.jpg')} // Make sure you have a background image in assets
      className="flex-1 justify-center items-center bg-gray-900"
    >
      <GlassCard className="w-11/12 max-w-sm p-6 space-y-6 flex items-center">
        <Text className="text-3xl font-bold text-white mb-8 text-center">Welcome to FadeUp</Text>

        <TouchableOpacity
          onPress={() => handleRoleSelect('customer')}
          className="w-full bg-blue-500 py-4 px-6 rounded-lg shadow-md hover:bg-blue-600 active:bg-blue-700"
        >
          <Text className="text-white text-xl font-semibold text-center">Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleRoleSelect('shopkeeper')}
          className="w-full bg-emerald-500 py-4 px-6 rounded-lg shadow-md hover:bg-emerald-600 active:bg-emerald-700 mt-4"
        >
          <Text className="text-white text-xl font-semibold text-center">Shopkeeper</Text>
        </TouchableOpacity>
      </GlassCard>
    </ImageBackground>
  );
};

export default RoleSelectScreen;