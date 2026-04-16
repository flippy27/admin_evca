import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppStore } from '@/lib/stores/app.store';

export function useColorScheme() {
  const appColorScheme = useAppStore((state) => state.colorScheme);
  const rnColorScheme = useRNColorScheme();

  console.log('[useColorScheme] App:', appColorScheme, 'Device:', rnColorScheme, 'Returning:', appColorScheme === 'system' ? rnColorScheme : appColorScheme);

  // If user selected 'system', use device preference
  if (appColorScheme === 'system') {
    return rnColorScheme;
  }

  // Otherwise return user's selection ('light' or 'dark')
  return appColorScheme as 'light' | 'dark';
}
