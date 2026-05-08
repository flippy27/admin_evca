/**
 * Root entry point
 * Handles initial routing based on auth state
 */

import { Redirect } from 'expo-router';
import { useAuthStore } from '@/lib/stores/auth.store';
import { View } from 'react-native';
import { getThemeColors } from '@/theme';

export default function RootIndex() {
  const sessionState = useAuthStore((s) => s.sessionState);
  const colors = getThemeColors('light');

  if (sessionState === 'authenticated') {
    return <Redirect href="/(app)/depot" />;
  }

  if (sessionState === 'unauthenticated') {
    return <Redirect href="/(auth)/login" />;
  }

  // idle | restoring — mostrar blank mientras carga
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    />
  );
}
