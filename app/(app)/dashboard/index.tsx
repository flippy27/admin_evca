import { useSidebar } from "@/components/layout/AppContainer";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { LocationSelector } from "@/components/ui/LocationSelector";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonLine,
} from "@/components/ui/SkeletonLoader";
import { Text } from "@/components/ui/Text";
import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useLocationsStore } from "@/lib/stores/locations.store";
import { useSitesStore } from "@/lib/stores/sites.store";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { openSidebar } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const colors = getThemeColors("light");

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.DASHBOARD_VIEW],
  });

  // Chargers store
  const { chargers, chargersLoading, fetchChargers } = useChargersStore();

  // Sites store
  const { sites, sitesLoading, fetchSites } = useSitesStore();

  // Get locations and chargers/sites data
  const { selectedLocationIds, fetchLocations } = useLocationsStore();

  useEffect(() => {
    console.log("[Dashboard] User data:", {
      userId: user?.userId,
      companyId: user?.companyId,
      fullName: user?.fullName,
      email: user?.email,
    });

    if (user?.userId && user?.companyId) {
      console.log("[Dashboard] Calling fetchLocations...");
      fetchLocations(user.userId, user.companyId);
    } else {
      console.log("[Dashboard] Missing userId or companyId");
    }
  }, [user?.userId, user?.companyId]);

  // Fetch chargers and sites when selected locations change
  useEffect(() => {
    fetchChargers(1, 100, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
    fetchSites(1, 100, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  }, [selectedLocationIds]);

  if (!hasAccess) return null;

  // Calculate statistics from real data (with defaults for loading state)
  const chargingCount =
    chargers?.filter((c) => c.status === "charging").length || 0;
  const availableCount =
    chargers?.filter((c) => c.status === "available").length || 0;
  const faultedCount =
    chargers?.filter((c) => c.status === "faulted").length || 0;
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
    fetchChargers(1, 100, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
    fetchSites(1, 100, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.sm,
          paddingBottom: spacing.lg,
          gap: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={chargersLoading || sitesLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            gap: spacing.md,
          }}
        >
          {/* Hamburger Menu Button */}
          <TouchableOpacity
            onPress={openSidebar}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              marginTop: 4,
            }}
          >
            <View style={{ gap: 4 }}>
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
              <View
                style={{
                  width: 20,
                  height: 2,
                  backgroundColor: colors.foreground,
                  borderRadius: 1,
                }}
              />
            </View>
          </TouchableOpacity>

          {/* Title Section */}
          <View style={{ flex: 1 }}>
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
        </View>

        {/* Location Selector */}
        <LocationSelector />

        {/* Quick Stats Grid */}
        {chargersLoading || sitesLoading ? (
          <View style={{ gap: spacing.lg }}>
            {/* Row 1 Skeleton */}
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
            </View>

            {/* Row 2 Skeleton */}
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
            </View>

            {/* Row 3 Skeleton */}
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
              <View style={{ flex: 1 }}>
                <SkeletonCard lines={3} />
              </View>
            </View>

            {/* Total Power Skeleton */}
            <SkeletonChart height={120} />
          </View>
        ) : (
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
                  <Ionicons name="flash-sharp" size={24} color="#8b5cf6" />
                  <Text variant="h3" weight="bold" style={{ color: "#8b5cf6" }}>
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
                  <Text variant="h3" weight="bold" style={{ color: "#22c55e" }}>
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
                  <Text variant="h3" weight="bold" style={{ color: "#ef4444" }}>
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
                  <Text variant="h3" weight="bold" style={{ color: "#22c55e" }}>
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
                style={{
                  alignItems: "center",
                  gap: spacing.md,
                  padding: spacing.lg,
                }}
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
        )}

        {/* Charts Section */}
        {chargersLoading || sitesLoading ? (
          <View style={{ gap: spacing.lg }}>
            <SkeletonChart height={200} />
            <SkeletonChart height={200} />
          </View>
        ) : stats.totalChargers > 0 ? (
          <View style={{ gap: spacing.lg }}>
            {/* Conectores - Pie Chart */}
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text variant="h4" weight="bold">
                  Conectores
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Estado actual
                </Text>
                <PieChart
                  data={[
                    {
                      name: "Charging",
                      population: stats.activeCharging,
                      color: "#8b5cf6",
                      legendFontColor: colors.foreground,
                      legendFontSize: 12,
                    },
                    {
                      name: "Available",
                      population: stats.available,
                      color: "#22c55e",
                      legendFontColor: colors.foreground,
                      legendFontSize: 12,
                    },
                    {
                      name: "Faulted",
                      population: stats.faulted,
                      color: "#ef4444",
                      legendFontColor: colors.foreground,
                      legendFontSize: 12,
                    },
                  ]}
                  width={Dimensions.get("window").width - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: colors.background,
                    backgroundGradientFrom: colors.background,
                    backgroundGradientTo: colors.background,
                    color: () => colors.mutedForeground,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                />
              </CardContent>
            </Card>

            {/* Power Distribution - Bar Chart */}
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text variant="h4" weight="bold">
                  Potencia por Sitio
                </Text>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  kW
                </Text>
                <BarChart
                  data={{
                    labels: [
                      "Sitio 1",
                      "Sitio 2",
                      "Sitio 3",
                      "Sitio 4",
                      "Sitio 5",
                    ],
                    datasets: [
                      {
                        data: [
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                        ],
                      },
                    ],
                  }}
                  width={Dimensions.get("window").width - 64}
                  height={200}
                  chartConfig={{
                    backgroundColor: colors.background,
                    backgroundGradientFrom: colors.background,
                    backgroundGradientTo: colors.background,
                    color: () => "#46A3B5",
                    barPercentage: 0.6,
                  }}
                  verticalLabelRotation={0}
                />
              </CardContent>
            </Card>
          </View>
        ) : null}

        {/* User Info */}
        {!user ? (
          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <SkeletonLine width="40%" height={16} />
              <View style={{ gap: spacing.sm }}>
                <SkeletonLine width="100%" height={14} />
                <SkeletonLine width="100%" height={14} />
                <SkeletonLine width="60%" height={14} />
              </View>
            </CardContent>
          </Card>
        ) : (
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
                  <Text variant="body">{user?.fullName}</Text>
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
                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: spacing.sm,
                      }}
                    >
                      {user.roles.map((role) => (
                        <Badge key={role} label={role} variant="secondary" />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
