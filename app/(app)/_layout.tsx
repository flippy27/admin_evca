import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
/**
 * App layout — authenticated screens
 * Tab navigation for main features only
 * Additional routes (reporting, credentials, energy) accessed via sidebar
 */

import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useAuthStore } from "@/lib/stores/auth.store";
import { AppContainer } from "@/components/layout/AppContainer";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";

export default function AppLayout() {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const { accessToken } = useAuthStore();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  // Verify token exists - redirect to login if missing
  useEffect(() => {
    if (!accessToken) {
      router.replace("/(auth)/login");
    }
  }, [accessToken]);

  return (
    <AppContainer>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: spacing.sm,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
        }}
      >
        {/* Dashboard */}
        {hasPermission(AuthPermissionsEnum.DASHBOARD_VIEW) && (
          <Tabs.Screen
            name="dashboard"
            options={{
              title: "Dashboard",
              tabBarIcon: ({ color }) => (
                <Ionicons name="home" size={24} color={color} />
              ),
            }}
          />
        )}

        {/* Chargers */}
        {hasPermission(AuthPermissionsEnum.CHARGERS_VIEW) && (
          <Tabs.Screen
            name="chargers"
            options={{
              title: "Chargers",
              tabBarIcon: ({ color }) => (
                <Ionicons name="flash-sharp" size={24} color={color} />
              ),
            }}
          />
        )}

        {/* Sites */}
        {hasPermission(AuthPermissionsEnum.SITES_VIEW) && (
          <Tabs.Screen
            name="sites"
            options={{
              title: "Sites",
              tabBarIcon: ({ color }) => (
                <Ionicons name="location" size={24} color={color} />
              ),
            }}
          />
        )}

        {/* Profile */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => (
              <Ionicons name="person" size={24} color={color} />
            ),
          }}
        />

        {/* Showcase */}
        <Tabs.Screen
          name="showcase"
          options={{
            title: "Showcase",
            tabBarIcon: ({ color }) => (
              <Ionicons name="sparkles" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AppContainer>
  );
}
