/**
 * Root entry point
 * Handles initial routing based on auth state
 * Shows loading while session restores
 */

import { useAuthStore } from '@/lib/stores/auth.store';
import { View } from 'react-native';
import { getThemeColors } from '@/theme';

export default function RootIndex() {
  const sessionState = useAuthStore((s) => s.sessionState);
  const colors = getThemeColors('light');

  // Show blank loading screen while session restores
  // The _layout.tsx redirect logic will handle navigation
  if (sessionState === 'restoring' || sessionState === 'idle') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      />
    );
  }

  // This shouldn't render - _layout will redirect before we get here
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    />
  );
}
