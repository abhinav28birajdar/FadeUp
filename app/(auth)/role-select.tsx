import { StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';

import { useAuthStore } from '@/src/store/authStore';
import ModernCard from '@/src/components/ModernCard';
import { UserRole } from '@/src/types/firebaseModels';

export default function RoleSelectScreen() {
  const { setRole } = useAuthStore();
  const [customerPressed, setCustomerPressed] = useState(false);
  const [shopkeeperPressed, setShopkeeperPressed] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setRole(role);
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 800 }}
      >
        <Text style={[styles.title, { color: '#38BDF8', fontSize: 32, fontWeight: 'bold' }]}>
          FadeUp
        </Text>
      </MotiView>

      <ModernCard style={{ width: '85%', maxWidth: 400 }} delay={300}>
        <Text style={{ color: '#38BDF8', fontSize: 20, fontWeight: '600', marginBottom: 24, textAlign: 'center' }}>I am a...</Text>

        <Pressable
          onPressIn={() => setCustomerPressed(true)}
          onPressOut={() => setCustomerPressed(false)}
          onPress={() => handleRoleSelect('customer')}
          style={({ pressed }) => [
            pressed && styles.buttonPressed
          ]}
        >
          <ModernCard 
            style={{ backgroundColor: '#0EA5E9', marginBottom: 16, paddingVertical: 16 }}
            pressed={customerPressed}
          >
            <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Customer</Text>
          </ModernCard>
        </Pressable>

        <Pressable
          onPressIn={() => setShopkeeperPressed(true)}
          onPressOut={() => setShopkeeperPressed(false)}
          onPress={() => handleRoleSelect('shopkeeper')}
          style={({ pressed }) => [
            pressed && styles.buttonPressed
          ]}
        >
          <ModernCard 
            style={{ backgroundColor: '#22C55E', paddingVertical: 16 }}
            pressed={shopkeeperPressed}
          >
            <Text style={{ color: '#F3F4F6', textAlign: 'center', fontSize: 18, fontWeight: '600' }}>Shopkeeper</Text>
          </ModernCard>
        </Pressable>
      </ModernCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 40,
  },
  buttonPressed: {
    opacity: 0.9,
  },
});