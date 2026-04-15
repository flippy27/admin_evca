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
} from "react-native";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useApiErrorToast } from "@/lib/hooks/useApiErrorToast";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { AuthPermissionsEnum } from "@/lib/types/auth.types";
import { getThemeColors, spacing } from "@/theme";

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

  const [searchText, setSearchText] = useState("");
  const [filteredChargers, setFilteredChargers] = useState<typeof chargers>([]);

  // Show error toast when API fails
  useApiErrorToast(chargersError, "Failed to load chargers. Try again.");

  // Fetch on mount
  useEffect(() => {
    fetchChargers(1, 20);
  }, []);

  // Filter on search
  useEffect(() => {
    if (searchText) {
      setFilteredChargers(
        chargers.filter(
          (c) =>
            c.name.toLowerCase().includes(searchText.toLowerCase()) ||
            c.id.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    } else {
      setFilteredChargers(chargers);
    }
  }, [searchText, chargers]);

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
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {t("common.ui.pageTitles.chargers") || "Chargers"}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            {filteredChargers.length} chargers
          </Text>
        </View>

        {/* Search */}
        <SearchBar placeholder="Search chargers..." onSearch={setSearchText} />

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
            <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
              {Array.from({ length: 3 }).map((_, idx) => (
                <SkeletonCard key={idx} lines={2} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <Text variant="body" style={{ color: colors.mutedForeground }}>
                {searchText ? "No chargers found" : "No data. Pull to refresh."}
              </Text>
            </View>
          )
        }
        onEndReached={() => {
          if (page < totalPages) handleNextPage();
        }}
        onEndReachedThreshold={0.1}
      />
    </SafeAreaView>
  );
}
