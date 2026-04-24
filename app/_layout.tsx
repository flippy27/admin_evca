import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { I18nextProvider } from "react-i18next";
import { useColorScheme as useRNColorScheme } from "react-native";
import "react-native-reanimated";

import { LoadingOverlayComponent } from "@/components/ui/LoadingOverlay";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { ToastContainer } from "@/components/ui/Toast";
import { onRefreshFailed } from "@/lib/api/client";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useTokenRefresh } from "@/lib/hooks/use-token-refresh";
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

  // Proactive token refresh (check every 10 seconds, refresh 1 min before expiry)
  useTokenRefresh();

  // Get theme preference from app store
  const appColorScheme = useAppStore((state) => state.colorScheme);
  const rnColorScheme = useRNColorScheme();

  // Resolve theme: if 'system', use device preference, otherwise use user's selection
  const colorScheme = useMemo(() => {
    if (appColorScheme === "system") {
      return rnColorScheme;
    }
    return appColorScheme;
  }, [appColorScheme, rnColorScheme]);

  // console.log("[RootLayout] colorScheme:", {
  //   appColorScheme,
  //   rnColorScheme,
  //   resolved: colorScheme,
  // });

  // Auth state
  const sessionState = useAuthStore((state) => state.sessionState);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const restoreSettings = useAppStore((state) => state.restoreSettings);

  // Register token refresh failure callback
  useEffect(() => {
    const logout = useAuthStore.getState().logout;
    onRefreshFailed(async () => {
      console.log("[App] Token refresh failed - logging out");
      await logout();
      router.replace("/(auth)/login");
    });
  }, [router]);

  // Bootstrap: restore session and settings on app start
  useEffect(() => {
    const bootstrap = async () => {
      await restoreSettings();
      await restoreSession();
    };

    bootstrap();
  }, []);

  // Redirect logic based on auth state
  const { hasRole, hydrated: permissionsReady } = usePermissions();

  useEffect(() => {
    if (sessionState === "restoring" || sessionState === "idle") {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inAppGroup = segments[0] === "(app)";
    const inSidebarGroup = segments[0] === "(sidebar)";

    if (sessionState === "authenticated") {
      // Authenticated → go to depot view (role selection happens inside depot)
      if (!inAppGroup && !inSidebarGroup) {
        router.replace("/(app)/depot");
      }
    } else {
      // Not authenticated → go to login
      if (!inAuthGroup) {
        router.replace("/(auth)/login");
      }
    }
  }, [sessionState, segments, hasRole, permissionsReady]);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="(sidebar)" options={{ headerShown: false }} />
        </Stack>
        <OfflineIndicator />
        <ToastContainer />
        <LoadingOverlayComponent />
        <StatusBar style="auto" />
      </ThemeProvider>
    </I18nextProvider>
  );
}
