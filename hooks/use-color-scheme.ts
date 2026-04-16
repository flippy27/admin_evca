import { useColorScheme as useRNColorScheme } from 'react-native';
import { useAppStore } from '@/lib/stores/app.store';

export function useColorScheme() {
  const rnColorScheme = useRNColorScheme();
  const appColorScheme = useAppStore((state) => state.colorScheme);

  // If user selected 'system', use device preference
  if (appColorScheme === 'system') {
    return rnColorScheme;
  }

  // Otherwise return user's selection
  return appColorScheme;
}
