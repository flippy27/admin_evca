import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppStore } from '@/lib/stores/app.store';

/**
 * Get colorScheme preference from app store, with fallback to device preference for 'system'
 * Returns 'light' | 'dark' | 'system'
 */
export function useColorScheme() {
  return useAppStore((state) => state.colorScheme);
}

/**
 * Get resolved colorScheme that is always 'light' or 'dark' (never 'system')
 * Use this for getting theme colors in views
 */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const appColorScheme = useAppStore((state) => state.colorScheme);
  const rnColorScheme = useRNColorScheme();

  // If user selected 'system', use device preference
  if (appColorScheme === 'system') {
    return (rnColorScheme === 'dark' ? 'dark' : 'light');
  }

  // Otherwise return user's selection
  return appColorScheme as 'light' | 'dark';
}
