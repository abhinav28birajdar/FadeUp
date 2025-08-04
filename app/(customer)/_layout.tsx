import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="shop/[id]" />
      <Stack.Screen name="shop/[id]/feedback" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="booking/[shopId]" />
      <Stack.Screen name="booking/confirmation" />
      <Stack.Screen name="queue" />
      <Stack.Screen name="explore-map" />
    </Stack>
  );
}
