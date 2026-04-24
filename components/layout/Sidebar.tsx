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
import { useSidebar } from "./AppContainer";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

interface RoleFocusItem {
  label: string;
  icon: string;
}

interface RoleFocusConfig {
  items: RoleFocusItem[];
  color: string;
  displayLabel: string;
}

const ROLE_FOCUS_MAP: Record<string, RoleFocusConfig> = {
  maintainer: {
    displayLabel: "Mantenedor",
    color: "#00B4B4",
    items: [
      { label: "Variables energéticas", icon: "construct" },
      { label: "Mensajes OCPP", icon: "construct" },
      { label: "Configuración OCPP", icon: "construct" },
    ],
  },
  operator: {
    displayLabel: "Operador",
    color: "#8B5CF6",
    items: [
      { label: "Iniciar / Detener carga", icon: "power" },
      { label: "Desbloquear conectores", icon: "power" },
      { label: "Tecles masivos", icon: "power" },
    ],
  },
  supervisor: {
    displayLabel: "Supervisor",
    color: "#10B981",
    items: [
      { label: "KPIs operacionales", icon: "eye" },
      { label: "Alertas y fallas", icon: "eye" },
      { label: "Estado general del patio", icon: "eye" },
    ],
  },
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const segments = useSegments();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const { activeRole } = useSidebar();

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

  const roleFocus = ROLE_FOCUS_MAP[activeRole] ?? null;

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
          }}
        >
          <TouchableOpacity
            onPress={onClose}
            style={{ marginBottom: spacing.sm }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
            Workforce App
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
            PoC v1
          </Text>
        </View>

        {/* Navigation Items */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {navItems.map((item) => {
            const active = isActive(item.route);

            return (
              <TouchableOpacity
                key={item.route}
                onPress={() => handleNavPress(item.route)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                  backgroundColor: active ? "#EBF3FF" : "transparent",
                  borderRadius: 10,
                  marginBottom: spacing.xs,
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={active ? "#2563EB" : colors.foreground}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? "600" : "400",
                    color: active ? "#2563EB" : colors.foreground,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Role Focus Section */}
          {roleFocus && (
            <>
              <View
                style={{
                  height: 1,
                  backgroundColor: colors.border,
                  marginVertical: spacing.md,
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.mutedForeground,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  paddingHorizontal: spacing.sm,
                  marginBottom: spacing.sm,
                }}
              >
                Foco del Rol
              </Text>
              {roleFocus.items.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                    paddingHorizontal: spacing.sm,
                    paddingVertical: 6,
                  }}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={16}
                    color={roleFocus.color}
                  />
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.foreground,
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
          }}
        >
          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: spacing.sm,
              paddingVertical: spacing.sm,
              marginBottom: spacing.sm,
            }}
          >
            <Ionicons name="log-out" size={18} color={colors.destructive} />
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.destructive }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>

          {/* User info */}
          {user && (
            <View style={{ alignItems: "center" }}>
              {user.company ? (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.mutedForeground,
                    textAlign: "center",
                  }}
                >
                  {user.company}
                </Text>
              ) : null}
              {roleFocus && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.foreground,
                    textAlign: "center",
                    marginTop: 2,
                  }}
                >
                  {"Rol: "}
                  <Text style={{ fontWeight: "700" }}>{roleFocus.displayLabel}</Text>
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}
