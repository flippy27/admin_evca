import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppStore } from '@/lib/stores/app.store';

/**
 * Get colorScheme preference from app store, with fallback to device preference for 'system'
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  return useAppStore((state) => state.colorScheme);
}

/**
 * Get resolved colorScheme that is always 'light' or 'dark' (never 'system')
 * Use this for getting theme colors in views
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const rnColorScheme = useRNColorScheme();
  const appColorScheme = useAppStore((state) => state.colorScheme);

  if (!hasHydrated) {
    return 'light';
  }

  // If user selected 'system', use device preference
  if (appColorScheme === 'system') {
    return rnColorScheme || 'light';
  }

  // Otherwise return user's selection
  return appColorScheme as 'light' | 'dark';
}
