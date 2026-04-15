import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView, View, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useSitesStore } from "@/lib/stores/sites.store";
import { AuthPermissionsEnum } from "@/lib/types/auth.types";
import { getThemeColors, spacing } from "@/theme";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const colors = getThemeColors("light");

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.DASHBOARD_VIEW],
  });

  // Chargers store
  const {
    chargers,
    chargersLoading,
    fetchChargers,
  } = useChargersStore();

  // Sites store
  const {
    sites,
    sitesLoading,
    fetchSites,
  } = useSitesStore();

  if (!hasAccess) return null;

  // Fetch data on mount
  useEffect(() => {
    fetchChargers(1, 100); // Fetch all chargers for stats
    fetchSites(1, 100); // Fetch all sites for stats
  }, []);

  // Calculate statistics from real data (with defaults for loading state)
  const chargingCount = chargers?.filter(
    (c) => c.status === "charging"
  ).length || 0;
  const availableCount = chargers?.filter(
    (c) => c.status === "available"
  ).length || 0;
  const faultedCount = chargers?.filter(
    (c) => c.status === "faulted"
  ).length || 0;
  const totalPower = chargers?.reduce((sum, c) => sum + (c.power || 0), 0) || 0;
  const activeSites = sites?.filter((s) => s.status === "active").length || 0;

  const stats = {
    totalChargers: chargers?.length || 0,
    activeCharging: chargingCount,
    available: availableCount,
    faulted: faultedCount,
    totalSites: sites?.length || 0,
    activeSites,
    totalPower: totalPower.toFixed(1),
  };

  const handleRefresh = () => {
    fetchChargers(1, 100);
    fetchSites(1, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={chargersLoading || sitesLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {t("common.ui.pageTitles.dashboard") || "Dashboard"}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            Welcome back, {user?.fullName?.split(" ")[0] || "User"}
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={{ gap: spacing.lg }}>
          {/* Row 1: Chargers Overview */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="flash" size={24} color={colors.primary} />
                <Text variant="h3" weight="bold">
                  {stats.totalChargers}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Total Chargers
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons
                  name="flash-sharp"
                  size={24}
                  color="#8b5cf6"
                />
                <Text
                  variant="h3"
                  weight="bold"
                  style={{ color: "#8b5cf6" }}
                >
                  {stats.activeCharging}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Charging
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Row 2: Status Distribution */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <Text
                  variant="h3"
                  weight="bold"
                  style={{ color: "#22c55e" }}
                >
                  {stats.available}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Available
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="alert-circle" size={24} color="#ef4444" />
                <Text
                  variant="h3"
                  weight="bold"
                  style={{ color: "#ef4444" }}
                >
                  {stats.faulted}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Faulted
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Row 3: Sites & Power */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="location" size={24} color={colors.primary} />
                <Text variant="h3" weight="bold">
                  {stats.totalSites}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Sites
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="checkmark-done" size={24} color="#22c55e" />
                <Text
                  variant="h3"
                  weight="bold"
                  style={{ color: "#22c55e" }}
                >
                  {stats.activeSites}
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Active
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Total Power */}
          <Card>
            <CardContent
              style={{ alignItems: "center", gap: spacing.md, padding: spacing.lg }}
            >
              <Ionicons name="flash" size={40} color={colors.primary} />
              <View style={{ alignItems: "center" }}>
                <Text variant="h2" weight="bold">
                  {stats.totalPower} kW
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Total Installed Power
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>

        {/* User Info */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Account
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Name
                </Text>
                <Text variant="body">
                  {user?.fullName}
                </Text>
              </View>
              <View>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Email
                </Text>
                <Text variant="body">{user?.email}</Text>
              </View>
              {user?.roles && user.roles.length > 0 && (
                <View>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    Roles
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {user.roles.map((role) => (
                      <Badge key={role} label={role} variant="secondary" />
                    ))}
                  </View>
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
