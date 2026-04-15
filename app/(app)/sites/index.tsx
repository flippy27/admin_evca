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
import { useSitesStore } from "@/lib/stores/sites.store";
import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { getThemeColors, spacing } from "@/theme";

type SitesTab = "list" | "activity";

export default function SitesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = getThemeColors("light");

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.SITES_VIEW],
  });

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
  const [filteredSites, setFilteredSites] = useState<typeof sites>([]);
  const [activeTab, setActiveTab] = useState<SitesTab>("list");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Show error toast when API fails
  useApiErrorToast(sitesError, "Failed to load sites. Try again.");

  // Fetch on mount
  useEffect(() => {
    fetchSites(1, 20);
  }, []);

  // Filter on search & status
  useEffect(() => {
    let filtered = sites;

    // Search filter
    if (searchText) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (s.city &&
            s.city.toLowerCase().includes(searchText.toLowerCase())) ||
          s.id.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((s) => s.status === statusFilter);
    }

    setFilteredSites(filtered);
  }, [searchText, sites, statusFilter]);

  if (!hasAccess) return null;

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
          {(["list", "activity"] as SitesTab[]).map((tab) => (
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
                {tab === "list" ? "Sites" : "Activity"}
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
                  {t("common.ui.pageTitles.sites") || "Sites"}
                </Text>
                <Text
                  variant="body"
                  style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
                >
                  {filteredSites?.length || 0} sites
                </Text>
              </View>

              {/* Controls */}
              <View style={{ flexDirection: "row", gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <SearchBar placeholder="Search sites..." onSearch={setSearchText} />
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
              </View>

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
                sitesLoading ? (
                  <View
                    style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}
                  >
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <SkeletonCard key={idx} lines={3} style={{ marginBottom: spacing.md }} />
                    ))}
                  </View>
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                    <Text variant="body" style={{ color: colors.mutedForeground }}>
                      {searchText ? "No sites found" : "No data. Pull to refresh."}
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
              Activity view — coming soon
            </Text>
          </View>
        )}

        {/* Filter Drawer */}
        <BottomDrawer
          visible={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Filter Sites"
          height={250}
        >
          <ScrollView style={{ paddingBottom: spacing.lg }}>
            <View style={{ gap: spacing.md }}>
              <Text variant="body" weight="semibold">
                Status
              </Text>
              {["active", "inactive"].map((status) => (
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
                  <Text variant="body">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </BottomDrawer>
      </View>
    </SafeAreaView>
  );
}
