import { Stack } from 'expo-router';

export default function EngineerCheckInOutLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="checkinout_login" options={{ title: 'Check In/Out Login', headerShown: false }} />
      <Stack.Screen name="check_in_out" options={{ title: 'Check In/Out Page', headerShown: false }} />
    </Stack>
  );
}
