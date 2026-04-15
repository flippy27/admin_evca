import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';
import 'react-native-reanimated';

import i18n from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores/auth.store';
import { useAppStore } from '@/lib/stores/app.store';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ToastContainer } from '@/components/ui/Toast';
import { LoadingOverlayComponent } from '@/components/ui/LoadingOverlay';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * Root layout with auth state management
 */
export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();

  // Auth state
  const sessionState = useAuthStore((state) => state.sessionState);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const restoreSettings = useAppStore((state) => state.restoreSettings);

  // Bootstrap: restore session and settings on app start
  useEffect(() => {
    const bootstrap = async () => {
      await restoreSettings();
      await restoreSession();
    };

    bootstrap();
  }, []);

  // Redirect logic based on auth state
  useEffect(() => {
    if (sessionState === 'restoring' || sessionState === 'idle') {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inAppGroup = segments[0] === '(app)';

    if (sessionState === 'authenticated' && inAuthGroup) {
      // Authenticated but in auth screens → go to app
      router.replace('/(app)');
    } else if (sessionState !== 'authenticated' && inAppGroup) {
      // Not authenticated but in app screens → go to login
      router.replace('/(auth)/login');
    } else if (sessionState !== 'authenticated' && !inAuthGroup && !inAppGroup) {
      // Not authenticated and not in a group → go to login
      router.replace('/(auth)/login');
    }
  }, [sessionState, segments]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <ToastContainer />
        <LoadingOverlayComponent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </I18nextProvider>
  );
}
