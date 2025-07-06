import { Stack } from 'expo-router';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustomerLayout() {
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
          name="home" 
          options={{ 
            title: 'FadeUp',
            headerLargeTitle: true,
          }} 
        />
        <Stack.Screen 
          name="shop/[id]" 
          options={{ 
            title: 'Shop Details',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="service/[id]" 
          options={{ 
            title: 'Service Details',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="booking/[shopId]" 
          options={{ 
            title: 'Book Appointment',
            headerBackTitle: 'Back',
          }} 
        />
        <Stack.Screen 
          name="booking/confirmation" 
          options={{ 
            title: 'Booking Confirmed',
            headerBackVisible: false,
          }} 
        />
        <Stack.Screen 
          name="queue" 
          options={{ 
            title: 'Live Queue',
            headerBackTitle: 'Back',
          }} 
        />
      </Stack>
    </View>
  );
}