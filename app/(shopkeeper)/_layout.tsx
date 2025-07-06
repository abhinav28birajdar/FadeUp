import { Stack } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShopkeeperLayout() {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#121212', '#1A1A1A', '#242424']}
        style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}
      />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#F3F4F6',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: 'transparent' },
        }}
      >
        <Stack.Screen 
          name="dashboard" 
          options={{ 
            title: 'Dashboard',
          }} 
        />
        <Stack.Screen 
          name="dashboard/booking/[id]" 
          options={{ 
            title: 'Booking Details',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="queue" 
          options={{ 
            title: 'Manage Queue',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="feedback" 
          options={{ 
            title: 'Customer Feedback',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="feedback/[id]" 
          options={{ 
            title: 'Feedback Details',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </View>
  );
}