/**
 * App layout — authenticated screens
 * Tab navigation for main features only
 * Additional routes (reporting, credentials, energy) accessed via sidebar
 */

import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { AppContainer } from "@/components/layout/AppContainer";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  const { hasPermission } = usePermissions();
  const colors = getThemeColors("light");

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
      </Tabs>
    </AppContainer>
  );
}
