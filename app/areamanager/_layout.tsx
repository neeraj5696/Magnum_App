import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AreaManagerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="alogin"
        options={{
          title: 'Area Manager Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="alist"
        options={{
          title: 'Complaints List',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="adetails"
        options={{
          title: 'Complaint Details',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 