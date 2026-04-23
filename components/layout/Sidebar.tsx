/**
 * Sidebar Navigation — mobile-optimized drawer menu
 * Main navigation for Depot View and Sessions
 */

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
import { useAuthStore } from "@/lib/stores/auth.store";
import { getThemeColors, spacing } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const segments = useSegments();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const logout = useAuthStore((state) => state.logout);

  const navItems: NavItem[] = [
    {
      label: "Depot View",
      icon: "home",
      route: "depot",
    },
    {
      label: "Sesiones de Carga",
      icon: "time",
      route: "sessions",
    },
  ];

  const currentRoute = segments[segments.length - 1];
  const isActive = (route: string) => currentRoute === route;

  const handleNavPress = (route: string) => {
    router.push(`/(app)/${route}` as any);
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
          <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>
            Menu
          </Text>
        </View>

        {/* Navigation Items */}
        <ScrollView style={{ flex: 1, paddingVertical: spacing.sm }}>
          {navItems.map((item) => {
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
                  color={active ? colors.primary : colors.foreground}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? "600" : "400",
                    color: active ? colors.primary : colors.foreground,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Footer - Logout */}
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
            <Text style={{ fontSize: 14, color: colors.destructive }}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
