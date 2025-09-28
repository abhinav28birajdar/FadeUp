import { router, useLocalSearchParams } from 'expo-router';
import { MotiView, AnimatePresence } from 'moti';
import React, { useState, useEffect } from 'react';
import { 
  ActivityIndicator, 
  Alert, 
  Pressable, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  StyleSheet,
  Dimensions,
  StatusBar 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const { userType } = useLocalSearchParams<{ userType?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showSocialLogin, setShowSocialLogin] = useState(false);
  
  const { setSession, setUser, setRole } = useAuthStore();

  const currentUserType = (userType as 'customer' | 'barber') || 'customer';
  
  const themeColors = {
    customer: {
      gradient: ['#667eea', '#764ba2'],
      primary: '#4facfe',
      accent: '#00f2fe',
    },
    barber: {
      gradient: ['#fa709a', '#fee140'],
      primary: '#fa709a',
      accent: '#fee140',
    },
  };

  const colors = themeColors[currentUserType];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert('Login Error', error.message);
        return;
      }

      if (data.session) {
        // Fetch user profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();

        if (profileError || !userProfile) {
          Alert.alert('Error', 'User profile not found');
          await supabase.auth.signOut();
          return;
        }

        // Role validation
        if (selectedRole !== 'unauthenticated' && userProfile.role !== selectedRole) {
          Alert.alert(
            'Role Mismatch', 
            `You selected ${selectedRole} but your account is registered as ${userProfile.role}`
          );
          await supabase.auth.signOut();
          router.replace('/role-select');
          return;
        }

        // Update auth store
        setSession(data.session);
        setUser(userProfile);
        setRole(userProfile.role);

        // Navigate based on role
        if (userProfile.role === 'customer') {
          router.replace('/(customer)/home');
        } else if (userProfile.role === 'shopkeeper') {
          router.replace('/(shopkeeper)/dashboard');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-6 bg-dark-background">
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-8"
      >
        <Text className="text-primary-light text-4xl font-bold text-center">
          Welcome Back
        </Text>
        <Text className="text-secondary-light text-lg text-center mt-2">
          Sign in to continue
        </Text>
      </MotiView>

      <ModernCard delay={200} className="w-full max-w-sm">
        <Text className="text-primary-light text-2xl font-bold text-center mb-6">
          Login
        </Text>

        <View className="space-y-4">
          <MotiView
            animate={{
              borderColor: emailFocused ? '#827092' : '#52525B',
            }}
            >
            <TextInput
              placeholder="Email"
              placeholderTextColor="#A1A1AA"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-dark-background/50 p-4 rounded-xl text-primary-light border border-dark-border"
            />
          </MotiView>

          <MotiView
            animate={{
              borderColor: passwordFocused ? '#827092' : '#52525B',
            }}
            >
            <TextInput
              placeholder="Password"
              placeholderTextColor="#A1A1AA"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              secureTextEntry
              className="bg-dark-background/50 p-4 rounded-xl text-primary-light border border-dark-border"
            />
          </MotiView>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            className="w-full"
          >
            {({ pressed }) => (
              <MotiView
                animate={{
                  scale: pressed ? 0.96 : 1,
                }}
                className="bg-brand-primary py-4 rounded-xl shadow-xl items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#F3F4F6" />
                ) : (
                  <Text className="text-primary-light text-xl font-bold">
                    Login
                  </Text>
                )}
              </MotiView>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/register')}
          className="mt-6"
        >
          {({ pressed }) => (
            <MotiView
              animate={{
                scale: pressed ? 0.96 : 1,
              }}
            >
              <Text className="text-brand-secondary text-base font-semibold text-center">
                Don't have an account? Register
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </View>
  );
}

