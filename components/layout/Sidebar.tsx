/**
 * Sidebar Navigation — mobile-optimized drawer menu
 * Main navigation for Depot View and Sessions
 */

import { useRouter, useSegments } from "expo-router";
import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
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
import { useAppStore } from "@/lib/stores/app.store";
import { Ionicons } from "@expo/vector-icons";
import { useSidebar } from "./AppContainer";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n/languages";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const SIDEBAR_WIDTH = Math.min(280, Dimensions.get("window").width * 0.8);

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const segments = useSegments();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const { activeRole } = useSidebar();
  const isDark = resolvedScheme === "dark";
  const setColorScheme = useAppStore((s) => s.setColorScheme);
  const currentLanguage = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
      mass: 0.9,
    }).start();
  }, [isOpen]);

  const toggleTheme = () => setColorScheme(isDark ? "light" : "dark");

  // Role focus config — uses t() so it re-evaluates on language change
  const ROLE_FOCUS_MAP = {
    maintainer: {
      displayLabel: t("mobile.sidebar.roleFocus.roles.maintainer"),
      color: "#00B4B4",
      items: [
        { label: t("mobile.sidebar.roleFocus.maintainer.energyVariables"), icon: "construct" },
        { label: t("mobile.sidebar.roleFocus.maintainer.ocppMessages"), icon: "construct" },
        { label: t("mobile.sidebar.roleFocus.maintainer.ocppConfig"), icon: "construct" },
      ],
    },
    operator: {
      displayLabel: t("mobile.sidebar.roleFocus.roles.operator"),
      color: "#8B5CF6",
      items: [
        { label: t("mobile.sidebar.roleFocus.operator.startStop"), icon: "power" },
        { label: t("mobile.sidebar.roleFocus.operator.unlock"), icon: "power" },
        { label: t("mobile.sidebar.roleFocus.operator.bulkTecle"), icon: "power" },
      ],
    },
    supervisor: {
      displayLabel: t("mobile.sidebar.roleFocus.roles.supervisor"),
      color: "#10B981",
      items: [
        { label: t("mobile.sidebar.roleFocus.supervisor.kpis"), icon: "eye" },
        { label: t("mobile.sidebar.roleFocus.supervisor.alerts"), icon: "eye" },
        { label: t("mobile.sidebar.roleFocus.supervisor.generalStatus"), icon: "eye" },
      ],
    },
  };

  const navItems = [
    { label: t("mobile.sidebar.nav.depotView"), icon: "home", route: "depot" },
    { label: t("mobile.sidebar.nav.sessions"), icon: "time", route: "sessions" },
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

  const roleFocus = ROLE_FOCUS_MAP[activeRole as keyof typeof ROLE_FOCUS_MAP] ?? null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: SIDEBAR_WIDTH,
        backgroundColor: colors.card,
        borderRightWidth: 1,
        borderRightColor: colors.border,
        zIndex: 1000,
        transform: [{ translateX: slideAnim }],
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowRadius: 16,
        shadowOffset: { width: 4, height: 0 },
        elevation: 12,
      }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginBottom: spacing.sm }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
            {t("mobile.sidebar.appTitle")}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
            {t("mobile.sidebar.appVersion")}
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
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.md }} />
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
                {t("mobile.sidebar.roleFocus.title")}
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
                  <Ionicons name={item.icon as any} size={16} color={roleFocus.color} />
                  <Text style={{ fontSize: 13, color: colors.foreground }}>{item.label}</Text>
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
          {/* Language Picker */}
          <View style={{ marginBottom: spacing.md }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.mutedForeground,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                marginBottom: spacing.sm,
              }}
            >
              {t("mobile.sidebar.language")}
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
              {SUPPORTED_LANGUAGES.map((lang) => {
                const selected = currentLanguage === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => setLanguage(lang.code)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primary + "18" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: selected ? "700" : "400",
                        color: selected ? colors.primary : colors.foreground,
                      }}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Dark / Light mode toggle */}
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: spacing.sm,
              paddingHorizontal: spacing.xs,
              marginBottom: spacing.sm,
              borderRadius: 8,
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={18}
                color={isDark ? "#a78bfa" : "#f59e0b"}
              />
              <Text style={{ fontSize: 14, color: colors.foreground }}>
                {isDark ? t("mobile.sidebar.theme.dark") : t("mobile.sidebar.theme.light")}
              </Text>
            </View>
            <View
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                backgroundColor: isDark ? "#6d28d9" : "#d1d5db",
                justifyContent: "center",
                paddingHorizontal: 2,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#fff",
                  alignSelf: isDark ? "flex-end" : "flex-start",
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              />
            </View>
          </TouchableOpacity>

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
              {t("mobile.sidebar.logout")}
            </Text>
          </TouchableOpacity>

          {/* User info */}
          {user && (
            <View style={{ alignItems: "center" }}>
              {user.company ? (
                <Text style={{ fontSize: 11, color: colors.mutedForeground, textAlign: "center" }}>
                  {user.company}
                </Text>
              ) : null}
              {roleFocus && (
                <Text style={{ fontSize: 12, color: colors.foreground, textAlign: "center", marginTop: 2 }}>
                  {t("mobile.sidebar.role") + ": "}
                  <Text style={{ fontWeight: "700" }}>{roleFocus.displayLabel}</Text>
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
