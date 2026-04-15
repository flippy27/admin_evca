import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "react-native-reanimated";

import { LoadingOverlayComponent } from "@/components/ui/LoadingOverlay";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { ToastContainer } from "@/components/ui/Toast";
import { useColorScheme } from "@/hooks/use-color-scheme";
import i18n from "@/lib/i18n";
import { useAppStore } from "@/lib/stores/app.store";
import { useAuthStore } from "@/lib/stores/auth.store";

export const unstable_settings = {
  anchor: "(tabs)",
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
    if (sessionState === "restoring" || sessionState === "idle") {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";
    const inRoot = segments.length === 0;

    if (sessionState === "authenticated") {
      // Authenticated → go to dashboard (main app entry point)
      if (inAuthGroup || inRoot) {
        router.replace("/(app)/dashboard");
      }
    } else {
      // Not authenticated → go to login
      if (inAppGroup || inRoot) {
        router.replace("/(auth)/login");
      }
    }
  }, [sessionState, segments]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
        </Stack>
        <OfflineIndicator />
        <ToastContainer />
        <LoadingOverlayComponent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </I18nextProvider>
  );
}
