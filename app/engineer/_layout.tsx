import { Stack } from 'expo-router';
import { FC } from 'react';

const EngineerLayout: FC = () => {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="login"
        options={{
          title: 'Engineer Login',
        }}
      />
      <Stack.Screen
        name="list"
        options={{
          title: 'Engineer List',
        }}
      />
      <Stack.Screen
        name="details"
        options={{
          title: 'Engineer Details',
        }}
      />
    </Stack>
  );
};

export default EngineerLayout; 