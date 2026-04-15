/**
 * useTheme hook
 * Returns theme colors and utilities based on app settings
 */

import { useColorScheme } from 'react-native';
import { useAppStore } from '../stores/app.store';
import { getThemeColors } from '../theme';

export function useTheme() {
  const { colorScheme: setting } = useAppStore();
  const systemScheme = useColorScheme();

  // Resolve color scheme: if 'system', use device setting, otherwise use the app setting
  const resolved = setting === 'system' ? (systemScheme ?? 'light') : setting;
  const isDark = resolved === 'dark';
  const colors = getThemeColors(resolved);

  return {
    isDark,
    colors,
    theme: resolved,
  };
}
