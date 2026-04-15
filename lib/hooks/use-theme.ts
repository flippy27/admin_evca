/**
 * useTheme hook
 * Returns theme colors and utilities based on app settings
 */

import { getThemeColors } from '@/theme';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../stores/app.store';

export function useTheme() {
  const { colorScheme: setting } = useAppStore();
  const systemScheme = useColorScheme();

  // Resolve color scheme: if 'system', use device setting, otherwise use the app setting
  const resolved = (setting === 'system' ? (systemScheme ?? 'light') : setting) as 'light' | 'dark';
  const isDark = resolved === 'dark';
  const colors = getThemeColors(resolved);

  return {
    isDark,
    colors,
    theme: resolved,
  };
}
