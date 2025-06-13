import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AreaHeadLayout() {
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
        name="login"
        options={{
          title: 'Manager Login',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: 'Manager Data List',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
