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
import { Text } from "@/components/ui/Text";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useSitesStore } from "@/lib/stores/sites.store";
import { AuthPermissionsEnum } from "@/lib/types/auth.types";
import { getThemeColors, spacing } from "@/theme";

export default function SitesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = getThemeColors("light");

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.SITES_VIEW],
  });

  if (!hasAccess) return null;

  // Store
  const {
    sites,
    sitesLoading,
    sitesError,
    page,
    totalPages,
    fetchSites,
    clearError,
  } = useSitesStore();

  const [searchText, setSearchText] = useState("");
  const [filteredSites, setFilteredSites] = useState(sites);

  // Fetch on mount
  useEffect(() => {
    fetchSites(1, 20);
  }, []);

  // Filter on search
  useEffect(() => {
    if (searchText) {
      setFilteredSites(
        sites.filter(
          (s) =>
            s.name.toLowerCase().includes(searchText.toLowerCase()) ||
            (s.city &&
              s.city.toLowerCase().includes(searchText.toLowerCase())) ||
            s.id.toLowerCase().includes(searchText.toLowerCase()),
        ),
      );
    } else {
      setFilteredSites(sites);
    }
  }, [searchText, sites]);

  const handleSitePress = (siteId: string) => {
    router.push({
      pathname: "/sites/[id]/profile" as any,
      params: { id: siteId },
    });
  };

  const handleRefresh = () => {
    clearError("sites");
    fetchSites(1, 20);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchSites(page + 1, 20);
    }
  };

  const renderSiteItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleSitePress(item.id)}
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
              label={item.status === "active" ? "Active" : "Inactive"}
              variant={item.status === "active" ? "secondary" : "outline"}
            />
          </View>

          {/* Location & Chargers */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Location
              </Text>
              <Text variant="body" weight="bold">
                {item.city || item.address || "Unknown"}
              </Text>
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Chargers
              </Text>
              <Text variant="body" weight="bold">
                {item.chargerCount || 0}
              </Text>
            </View>
          </View>

          {/* Power Info */}
          {item.totalPower && (
            <View
              style={{
                flexDirection: "row",
                gap: spacing.sm,
                paddingTop: spacing.sm,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <Ionicons name="flash" size={14} color={colors.mutedForeground} />
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                {item.totalPower.toFixed(1)} kW
              </Text>
            </View>
          )}
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
            {t("common.ui.pageTitles.sites") || "Sites"}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            {filteredSites.length} sites
          </Text>
        </View>

        {/* Search */}
        <SearchBar placeholder="Search sites..." onSearch={setSearchText} />

        {/* Error Alert */}
        {sitesError && (
          <Alert variant="destructive" title="Error" message={sitesError} />
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredSites}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
        }}
        refreshControl={
          <RefreshControl refreshing={sitesLoading} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !sitesLoading ? (
            <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
              <Text variant="body" style={{ color: colors.mutedForeground }}>
                {searchText ? "No sites found" : "No data. Pull to refresh."}
              </Text>
            </View>
          ) : null
        }
        onEndReached={() => {
          if (page < totalPages) handleNextPage();
        }}
        onEndReachedThreshold={0.1}
      />
    </SafeAreaView>
  );
}
