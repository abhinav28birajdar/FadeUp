// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store';
import GlassCard from '../../components/GlassCard';
import { UserRole } from '../../types';

type Props = StackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUserRole, setCurrentUser } = useAppStore(); // Use global state

  const handleLogin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert('Login Error', error.message);
    } else if (data.user) {
      // Fetch user's role from your 'users' table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role, shop_id, email')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        Alert.alert('Login Error', 'Failed to fetch user role.');
        await supabase.auth.signOut(); // Sign out if role fetch fails
      } else if (userData) {
        setUserRole(userData.role as UserRole);
        setCurrentUser({
          id: data.user.id,
          email: userData.email,
          role: userData.role as UserRole,
          shop_id: userData.shop_id,
        });

        if (userData.role === 'customer') {
          navigation.replace('Home'); // Use replace to clear auth history
        } else {
          navigation.replace('ShopkeeperDashboard');
        }
      }
    }
    setLoading(false);
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')} // Same background image
      className="flex-1 justify-center items-center bg-gray-900"
    >
      <GlassCard className="w-11/12 max-w-md p-6 space-y-6">
        <Text className="text-3xl font-bold text-white mb-6 text-center">Login</Text>

        <TextInput
          className="w-full p-3 rounded-md border border-gray-300 text-lg bg-white/70 text-gray-800"
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          className="w-full p-3 rounded-md border border-gray-300 text-lg bg-white/70 text-gray-800"
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="w-full bg-indigo-600 py-3 rounded-md shadow-md items-center justify-center disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-xl font-semibold">Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          className="w-full py-3 rounded-md mt-2"
        >
          <Text className="text-indigo-400 text-base text-center">Don't have an account? Register</Text>
        </TouchableOpacity>
      </GlassCard>
    </ImageBackground>
  );
};

export default LoginScreen;