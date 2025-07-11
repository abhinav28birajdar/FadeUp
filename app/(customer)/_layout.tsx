import { Stack } from "expo-router";

export default function CustomerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="shop/[id]" />
      <Stack.Screen name="service/[id]" />
      <Stack.Screen name="booking/[shopId]" />
      <Stack.Screen name="booking/confirmation" />
      <Stack.Screen name="queue" />
    </Stack>
  );
}