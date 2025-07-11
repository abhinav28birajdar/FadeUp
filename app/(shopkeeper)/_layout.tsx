import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function ShopkeeperLayout() {
  return (
    <View className="flex-1 bg-background">
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#000000',
          },
          headerTintColor: '#E7E9EA',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'slide_from_right',
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
