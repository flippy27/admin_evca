import { Stack } from 'expo-router';
import { getThemeColors } from '../../../theme';

export default function SiteDetailLayout() {
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
        name="profile"
        options={{
          title: 'Site Profile',
        }}
      />
    </Stack>
  );
}
