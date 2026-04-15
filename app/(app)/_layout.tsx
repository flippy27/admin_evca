/**
 * App layout — authenticated screens
 * Contains tab navigation with permission-based visibility + sidebar
 * Each tab routes to a feature module
 */

import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { AppContainer } from "@/components/layout/AppContainer";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  const { hasPermission, permissions, roles } = usePermissions();
  const colors = getThemeColors("light");

  console.log('[APP LAYOUT] Permissions check:', {
    hasPermissions: permissions.length > 0,
    permissionCount: permissions.length,
    firstFewPermissions: permissions.slice(0, 5),
    hasDashboardView: permissions.includes(AuthPermissionsEnum.DASHBOARD_VIEW),
    hasChargersView: permissions.includes(AuthPermissionsEnum.CHARGERS_VIEW),
    roles: roles,
  });

  return (
    <AppContainer>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: spacing.sm,
            height: 60,
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

      {/* Reporting */}
      {hasPermission(AuthPermissionsEnum.REPORTS_VIEW) && (
        <Tabs.Screen
          name="reporting"
          options={{
            title: "Reports",
            tabBarIcon: ({ color }) => (
              <Ionicons name="bar-chart" size={24} color={color} />
            ),
          }}
        />
      )}

      {/* Credentials */}
      {hasPermission(AuthPermissionsEnum.CHARGERS_VIEW) && (
        <Tabs.Screen
          name="credentials"
          options={{
            title: "Credentials",
            tabBarIcon: ({ color }) => (
              <Ionicons name="key" size={24} color={color} />
            ),
          }}
        />
      )}

      {/* Energy Resources */}
      <Tabs.Screen
        name="energy-resources"
        options={{
          title: "Energy",
          tabBarIcon: ({ color }) => (
            <Ionicons name="leaf" size={24} color={color} />
          ),
        }}
      />

      {/* Profile (always visible) */}
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
