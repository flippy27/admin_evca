/**
 * Sidebar Navigation — mobile-optimized drawer menu
 * Main navigation for Depot View and Sessions
 */

import { useRouter, useSegments } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Text } from "@/components/ui/Text";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAppStore } from "@/lib/stores/app.store";
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
  const { colorScheme, setColorScheme } = useAppStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

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

        {/* Footer - Theme & Logout */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          {/* Theme Toggle */}
          <TouchableOpacity
            onPress={() => setShowThemeMenu(!showThemeMenu)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              marginBottom: spacing.md,
              backgroundColor: colors.muted,
              borderRadius: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <Ionicons
                name={colorScheme === "dark" ? "moon" : colorScheme === "light" ? "sunny" : "settings"}
                size={20}
                color={colors.primary}
              />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                {colorScheme === "dark" ? "Oscuro" : colorScheme === "light" ? "Claro" : "Sistema"}
              </Text>
            </View>
            <Ionicons
              name={showThemeMenu ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>

          {/* Theme Options */}
          {showThemeMenu && (
            <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
              {(["light", "dark", "system"] as const).map((theme) => (
                <TouchableOpacity
                  key={theme}
                  onPress={async () => {
                    await setColorScheme(theme);
                    setShowThemeMenu(false);
                  }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 6,
                    backgroundColor:
                      colorScheme === theme ? colors.primary + "20" : "transparent",
                    borderLeftWidth: colorScheme === theme ? 3 : 0,
                    borderLeftColor: colors.primary,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: colorScheme === theme ? "600" : "400",
                      color: colorScheme === theme ? colors.primary : colors.foreground,
                    }}
                  >
                    {theme === "light"
                      ? "🌞 Claro"
                      : theme === "dark"
                        ? "🌙 Oscuro"
                        : "⚙️ Sistema"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Logout */}
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
