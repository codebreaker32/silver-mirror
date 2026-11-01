import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="capture" />
      <Stack.Screen name="processing" options={{ gestureEnabled: false }} />
      <Stack.Screen name="result" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
