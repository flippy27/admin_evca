import { Stack } from 'expo-router';
import { getThemeColors } from '../../../../theme';

export default function ChargerDetailLayout() {
  const colors = getThemeColors('light');

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: { backgroundColor: colors.card, borderBottomColor: colors.border, borderBottomWidth: 1 },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="live"
        options={{
          title: 'Live View',
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />
      <Stack.Screen
        name="configuration"
        options={{
          title: 'Configuration',
        }}
      />
    </Stack>
  );
}
