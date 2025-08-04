import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/authStore';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const { role: selectedRole, setSession, setUser, setRole } = useAuthStore();

  const handleRegister = async () => {
    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    try {
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });

      if (error) {
        Alert.alert('Registration Error', error.message);
        return;
      }

      if (data.user) {
        // Determine final role
        const finalRole = selectedRole === 'unauthenticated' ? 'customer' : selectedRole;

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email.toLowerCase().trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: finalRole,
          });

        if (profileError) {
          Alert.alert('Profile Error', 'Failed to create user profile');
          console.error('Profile creation error:', profileError);
          return;
        }

        // Update auth store
        if (data.session) {
          setSession(data.session);
        }
        
        const newUser = {
          id: data.user.id,
          email: email.toLowerCase().trim(),
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role: finalRole,
          created_at: new Date().toISOString(),
        };
        
        setUser(newUser);
        setRole(finalRole);

        Alert.alert('Success', 'Registration successful!');

        // Navigate based on role
        if (finalRole === 'shopkeeper') {
          router.replace('/register-shop-details');
        } else {
          router.replace('/(customer)/home');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    fieldName: string,
    keyboardType: any = 'default',
    secureTextEntry = false
  ) => (
    <MotiView
      animate={{
        borderColor: focusedField === fieldName ? '#827092' : '#52525B',
      }}
      >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A1A1AA"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocusedField(fieldName)}
        onBlur={() => setFocusedField(null)}
        keyboardType={keyboardType}
        autoCapitalize={secureTextEntry ? 'none' : 'words'}
        autoCorrect={false}
        secureTextEntry={secureTextEntry}
        className="bg-dark-background/50 p-4 rounded-xl text-primary-light border border-dark-border"
      />
    </MotiView>
  );

  return (
    <ScrollView 
      className="flex-1 bg-dark-background"
      contentContainerStyle={{ 
        flexGrow: 1, 
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
      }}
      showsVerticalScrollIndicator={false}
    >
      <MotiView
        from={{ opacity: 0, translateY: -30 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-8"
      >
        <Text className="text-primary-light text-4xl font-bold text-center">
          Join FadeUp
        </Text>
        <Text className="text-secondary-light text-lg text-center mt-2">
          Create your account
        </Text>
      </MotiView>

      <ModernCard delay={200} className="w-full max-w-sm mx-auto">
        <Text className="text-primary-light text-2xl font-bold text-center mb-6">
          Register
        </Text>

        <View className="space-y-4">
          {renderInput('First Name', firstName, setFirstName, 'firstName')}
          {renderInput('Last Name', lastName, setLastName, 'lastName')}
          {renderInput('Email', email, setEmail, 'email', 'email-address')}
          {renderInput('Password', password, setPassword, 'password', 'default', true)}
          {renderInput('Confirm Password', confirmPassword, setConfirmPassword, 'confirmPassword', 'default', true)}

          <Pressable
            onPress={handleRegister}
            disabled={loading}
            className="w-full"
          >
            {({ pressed }) => (
              <MotiView
                animate={{
                  scale: pressed ? 0.96 : 1,
                }}
                className="bg-brand-primary py-4 rounded-xl shadow-xl items-center mt-2"
              >
                {loading ? (
                  <ActivityIndicator color="#F3F4F6" />
                ) : (
                  <Text className="text-primary-light text-xl font-bold">
                    Register
                  </Text>
                )}
              </MotiView>
            )}
          </Pressable>
        </View>

        <Pressable
          onPress={() => router.push('/login')}
          className="mt-6"
        >
          {({ pressed }) => (
            <MotiView
              animate={{
                scale: pressed ? 0.96 : 1,
              }}
            >
              <Text className="text-brand-secondary text-base font-semibold text-center">
                Already have an account? Login
              </Text>
            </MotiView>
          )}
        </Pressable>
      </ModernCard>
    </ScrollView>
  );
}

