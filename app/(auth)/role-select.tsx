import { router } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ModernCard } from '../../src/components/ModernCard';
import { useAuthStore } from '../../src/store/authStore';

export default function RoleSelectScreen() {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'shopkeeper' | null>(null);
  const { setRole } = useAuthStore();

  const handleRoleSelect = (role: 'customer' | 'shopkeeper') => {
    setSelectedRole(role);
    setRole(role);
    setTimeout(() => {
      router.push('/login');
    }, 200); // Small delay for visual feedback
  };

  return (
    <View className="flex-1 justify-center items-center px-6 bg-dark-background">
      <MotiView
        from={{ opacity: 0, translateY: -50 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="mb-12"
      >
        <Text className="text-primary-light text-6xl font-bold text-center">
          FadeUp
        </Text>
        <Text className="text-secondary-light text-lg text-center mt-2">
          Book your perfect cut
        </Text>
      </MotiView>

      <ModernCard delay={300} className="w-full max-w-sm">
        <Text className="text-primary-light text-2xl font-bold text-center mb-8">
          I am a...
        </Text>
        
        <View className="space-y-4">
          <Pressable
            onPress={() => handleRoleSelect('customer')}
            className="w-full"
          >
            {({ pressed }) => (
              <MotiView
                animate={{
                  scale: pressed ? 0.96 : 1,
                }}
                className="bg-brand-primary py-4 px-6 rounded-xl shadow-lg"
              >
                <Text className="text-primary-light text-xl font-bold text-center">
                  Customer
                </Text>
                <Text className="text-primary-light/80 text-sm text-center mt-1">
                  Book appointments & manage queue
                </Text>
              </MotiView>
            )}
          </Pressable>

          <Pressable
            onPress={() => handleRoleSelect('shopkeeper')}
            className="w-full"
          >
            {({ pressed }) => (
              <MotiView
                animate={{
                  scale: pressed ? 0.96 : 1,
                }}
                className="bg-brand-secondary py-4 px-6 rounded-xl shadow-lg"
              >
                <Text className="text-primary-light text-xl font-bold text-center">
                  Shopkeeper
                </Text>
                <Text className="text-primary-light/80 text-sm text-center mt-1">
                  Manage your shop & appointments
                </Text>
              </MotiView>
            )}
          </Pressable>
        </View>
      </ModernCard>
    </View>
  );
}

