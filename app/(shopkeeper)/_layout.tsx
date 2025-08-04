import { Stack } from "expo-router";

export default function ShopkeeperLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="dashboard/booking/[id]" />
      <Stack.Screen name="queue" />
      <Stack.Screen name="feedback" />
      <Stack.Screen name="feedback/[id]" />
    </Stack>
  );
}
