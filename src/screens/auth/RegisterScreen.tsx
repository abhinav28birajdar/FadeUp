// src/screens/auth/RegisterScreen.tsx (Outline)
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ImageBackground } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store';
import GlassCard from '../../components/GlassCard';
import { UserRole } from '../../types';

type Props = StackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { userRole, setCurrentUser } = useAppStore(); // Get selected role from Zustand

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // After successful auth, insert user into our public.users table
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          role: userRole, // Use the role selected on RoleSelectScreen
        });

        if (insertError) {
          throw insertError;
        }

        // Set current user in Zustand
        setCurrentUser({
          id: data.user.id,
          email: data.user.email || '',
          role: userRole || 'customer', // Default to customer if not set
        });

        Alert.alert('Success', 'Account created! Please log in.');
        navigation.navigate('Login'); // Navigate to login screen
      }
    } catch (error: any) {
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/background.jpg')}
      className="flex-1 justify-center items-center bg-gray-900"
    >
      <GlassCard className="w-11/12 max-w-md p-6 space-y-6">
        <Text className="text-3xl font-bold text-white mb-6 text-center">Register</Text>
        <Text className="text-white text-base text-center mb-4">Registering as a {userRole || 'customer'}</Text>

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
          onPress={handleRegister}
          className="w-full bg-green-600 py-3 rounded-md shadow-md items-center justify-center disabled:opacity-50"
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white text-xl font-semibold">Register</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          className="w-full py-3 rounded-md mt-2"
        >
          <Text className="text-green-400 text-base text-center">Already have an account? Login</Text>
        </TouchableOpacity>
      </GlassCard>
    </ImageBackground>
  );
};

export default RegisterScreen;