/**
 * Sidebar Navigation — mobile-optimized drawer menu
 * Shows app sections with permission-based visibility
 */

import { Ionicons } from "@expo/vector-icons";
import { useRouter, useSegments } from "expo-router";
import React from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useAuthStore } from "@/lib/stores/auth.store";
import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { getThemeColors, spacing } from "@/theme";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
  permission?: AuthPermissionsEnum;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const segments = useSegments();
  const colors = getThemeColors("light");
  const { hasPermission } = usePermissions();
  const logout = useAuthStore((state) => state.logout);

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      icon: "home",
      route: "dashboard",
      permission: AuthPermissionsEnum.DASHBOARD_VIEW,
    },
    {
      label: "Chargers",
      icon: "flash-sharp",
      route: "chargers",
      permission: AuthPermissionsEnum.CHARGERS_VIEW,
    },
    {
      label: "Sites",
      icon: "location",
      route: "sites",
      permission: AuthPermissionsEnum.SITES_VIEW,
    },
    {
      label: "Reports",
      icon: "bar-chart",
      route: "reporting",
      permission: AuthPermissionsEnum.REPORTS_VIEW,
    },
    {
      label: "Credentials",
      icon: "key",
      route: "credentials",
      permission: AuthPermissionsEnum.CHARGERS_VIEW,
    },
    {
      label: "Energy",
      icon: "leaf",
      route: "energy-resources",
    },
    {
      label: "Supervisor",
      icon: "eye",
      route: "supervisor",
    },
    {
      label: "Showcase",
      icon: "sparkles",
      route: "showcase",
    },
    {
      label: "Profile",
      icon: "person",
      route: "profile",
    },
  ];

  const currentRoute = segments[segments.length - 1];
  const isActive = (route: string) => currentRoute === route;

  const handleNavPress = (route: string) => {
    const externalRoutes = ["reporting", "credentials", "energy-resources"];
    const path = externalRoutes.includes(route) ? `/${route}` : `/(app)/${route}`;
    router.push(path as any);
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: Math.min(280, Dimensions.get("window").width * 0.8),
        backgroundColor: colors.card,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        zIndex: 1000,
        display: isOpen ? "flex" : "none",
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text variant="h3" weight="bold">
            Menu
          </Text>
        </View>

        {/* Navigation Items */}
        <ScrollView style={{ flex: 1, paddingVertical: spacing.md }}>
          {navItems.map((item) => {
            const hasAccess =
              !item.permission || hasPermission(item.permission);
            if (!hasAccess) return null;

            const active = isActive(item.route);

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => handleNavPress(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                  backgroundColor: active ? colors.primary + "15" : "transparent",
                  borderLeftWidth: active ? 3 : 0,
                  borderLeftColor: active ? colors.primary : "transparent",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={active ? colors.primary : colors.mutedForeground}
                />
                <Text
                  variant="body"
                  weight={active ? "semibold" : "normal"}
                  style={{
                    color: active ? colors.primary : colors.foreground,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Logout Button */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.md,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
            }}
          >
            <Ionicons name="log-out" size={20} color={colors.destructive} />
            <Text variant="body" style={{ color: colors.destructive }}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
