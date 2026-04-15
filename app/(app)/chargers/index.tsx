import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useApiErrorToast } from "@/lib/hooks/useApiErrorToast";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { getThemeColors, spacing } from "@/theme";

type ChargersTab = "list" | "sessions";

const STATUS_COLORS: Record<string, string> = {
  available: "#22c55e",
  charging: "#8b5cf6",
  faulted: "#ef4444",
  offline: "#6b7280",
};

export default function ChargersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = getThemeColors("light");

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  });

  // Store
  const {
    chargers,
    chargersLoading,
    chargersError,
    page,
    totalPages,
    fetchChargers,
    clearError,
  } = useChargersStore();

  // UI State
  const [searchText, setSearchText] = useState("");
  const [filteredChargers, setFilteredChargers] = useState<typeof chargers>([]);
  const [activeTab, setActiveTab] = useState<ChargersTab>("list");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [guideDrawerOpen, setGuideDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Show error toast when API fails
  useApiErrorToast(chargersError, "Failed to load chargers. Try again.");

  // Fetch on mount
  useEffect(() => {
    fetchChargers(1, 20);
  }, []);

  // Filter on search & status
  useEffect(() => {
    let filtered = chargers;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchText.toLowerCase()) ||
          c.id.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    setFilteredChargers(filtered);
  }, [searchText, chargers, statusFilter]);

  if (!hasAccess) return null;

  const handleChargerPress = (chargerId: string) => {
    router.push({
      pathname: "/chargers/[id]/live" as any,
      params: { id: chargerId },
    });
  };

  const handleRefresh = () => {
    clearError("chargers");
    fetchChargers(1, 20);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchChargers(page + 1, 20);
    }
  };

  const renderChargerItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleChargerPress(item.id)}
      style={{ marginBottom: spacing.md }}
    >
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          {/* Header: Name & Status */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="h4" weight="bold">
              {item.name}
            </Text>
            <Badge
              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              variant={
                item.status === "available"
                  ? "secondary"
                  : item.status === "charging"
                    ? "default"
                    : "outline"
              }
            />
          </View>

          {/* Power & Connectors */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: spacing.md,
            }}
          >
            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Power Output
              </Text>
              <Text variant="body" weight="bold">
                {item.power?.toFixed(1) || 0} kW
              </Text>
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Connectors
              </Text>
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                {item.connectors?.slice(0, 3).map((connector: any) => (
                  <View
                    key={connector.id}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor:
                        STATUS_COLORS[connector.status] || colors.muted,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={
                        connector.status === "occupied"
                          ? "flash-sharp"
                          : connector.status === "faulted"
                            ? "alert-circle"
                            : "checkmark"
                      }
                      size={12}
                      color="white"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Ionicons
              name="location"
              size={14}
              color={colors.mutedForeground}
            />
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              {item.siteName || item.siteId || "Unknown site"}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: spacing.lg,
          }}
        >
          {(["list", "sessions"] as ChargersTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                variant="body"
                weight={activeTab === tab ? "semibold" : "normal"}
                style={{
                  color:
                    activeTab === tab ? colors.primary : colors.mutedForeground,
                }}
              >
                {tab === "list" ? "Chargers" : "Sessions"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "list" ? (
          <>
            {/* Header */}
            <View style={{ padding: spacing.lg, gap: spacing.md }}>
              <View>
                <Text variant="h2" weight="bold">
                  {t("common.ui.pageTitles.chargers") || "Chargers"}
                </Text>
                <Text
                  variant="body"
                  style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
                >
                  {filteredChargers?.length || 0} chargers
                </Text>
              </View>

              {/* Controls */}
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <SearchBar
                    placeholder="Search chargers..."
                    onSearch={setSearchText}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => setFilterDrawerOpen(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    justifyContent: "center",
                    alignItems: "center",
                    borderWidth: statusFilter ? 2 : 1,
                    borderColor: statusFilter ? colors.primary : colors.border,
                  }}
                >
                  <Ionicons name="funnel" size={20} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGuideDrawerOpen(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="information-circle" size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              {/* Error Alert */}
              {chargersError && (
                <Alert variant="destructive" title="Error" message={chargersError} />
              )}
            </View>

            {/* List */}
            <FlatList
              data={filteredChargers}
              renderItem={renderChargerItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{
                paddingHorizontal: spacing.lg,
                paddingBottom: spacing.xl,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={chargersLoading}
                  onRefresh={handleRefresh}
                />
              }
              ListEmptyComponent={
                chargersLoading ? (
                  <View
                    style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}
                  >
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <SkeletonCard key={idx} lines={2} style={{ marginBottom: spacing.md }} />
                    ))}
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                    <Text variant="body" style={{ color: colors.mutedForeground }}>
                      {searchText
                        ? "No chargers found"
                        : "No data. Pull to refresh."}
                    </Text>
                  </View>
                )
              }
              onEndReached={() => {
                if (page < totalPages) handleNextPage();
              }}
              onEndReachedThreshold={0.1}
            />
          </>
        ) : (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              Charge sessions — coming soon
            </Text>
          </View>
        )}

        {/* Filter Drawer */}
        <BottomDrawer
          visible={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Filter Chargers"
          height={300}
        >
          <ScrollView style={{ paddingBottom: spacing.lg }}>
            <View style={{ gap: spacing.md }}>
              <Text variant="body" weight="semibold">
                Status
              </Text>
              {["available", "charging", "faulted", "offline"].map((status) => (
                <TouchableOpacity
                  key={status}
                  onPress={() =>
                    setStatusFilter(statusFilter === status ? null : status)
                  }
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: spacing.sm,
                    gap: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderColor:
                        statusFilter === status ? colors.primary : colors.border,
                      backgroundColor:
                        statusFilter === status ? colors.primary : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {statusFilter === status && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: STATUS_COLORS[status],
                      marginRight: spacing.sm,
                    }}
                  />
                  <Text variant="body">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </BottomDrawer>

        {/* Guide Drawer */}
        <BottomDrawer
          visible={guideDrawerOpen}
          onClose={() => setGuideDrawerOpen(false)}
          title="Charger Status Guide"
          height={350}
        >
          <ScrollView style={{ paddingBottom: spacing.lg }}>
            {["available", "charging", "faulted", "offline"].map((status) => (
              <View key={status} style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                <View style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: STATUS_COLORS[status],
                    }}
                  />
                  <Text variant="body" weight="semibold">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </View>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground, marginLeft: spacing.xl }}
                >
                  {status === "available"
                    ? "Ready for charging sessions"
                    : status === "charging"
                      ? "Currently delivering power to a vehicle"
                      : status === "faulted"
                        ? "Equipment malfunction detected"
                        : "No power or communication"}
                </Text>
              </View>
            ))}
          </ScrollView>
        </BottomDrawer>
      </View>
    </SafeAreaView>
  );
}
