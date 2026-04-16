import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useApiErrorToast } from "@/lib/hooks/useApiErrorToast";
import { useSitesStore } from "@/lib/stores/sites.store";
import { useLocationsStore } from "@/lib/stores/locations.store";
import { useAuthStore } from "@/lib/stores/auth.store";
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
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  // Show error toast when API fails
  useApiErrorToast(sitesError, "Failed to load sites. Try again.");

  // Get locations
  const { user } = useAuthStore();
  const { selectedLocationIds, fetchLocations } = useLocationsStore();

  useEffect(() => {
    if (user?.userId && user?.companyId) {
      fetchLocations(user.userId, user.companyId);
    }
  }, [user?.userId, user?.companyId]);

  useEffect(() => {
    fetchSites(1, 20, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  }, [selectedLocationIds]);

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
    setSelectedSiteId(siteId);
    setActionModalOpen(true);
  };

  const handleEditSite = () => {
    if (selectedSiteId) {
      setActionModalOpen(false);
      router.push({
        pathname: "/sites/[id]" as any,
        params: { id: selectedSiteId },
      });
    }
  };

  const handleEnergyManagement = () => {
    if (selectedSiteId) {
      setActionModalOpen(false);
      router.push({
        pathname: "/energy" as any,
        params: { siteId: selectedSiteId },
      });
    }
  };

  const handleRefresh = () => {
    clearError("sites");
    const { selectedLocationIds } = useLocationsStore.getState();
    fetchSites(1, 20, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const { selectedLocationIds } = useLocationsStore.getState();
      fetchSites(page + 1, 20, {
        siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
      });
    }
  };

  const handleCreatePress = () => {
    router.push("/sites/create");
  };

  const renderSiteItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleSitePress(item.location_ID)}
      style={{ marginBottom: spacing.md }}
    >
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          {/* Header: Name */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text variant="h4" weight="bold">
              {item.location_name}
            </Text>
          </View>

          {/* Details Row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Número de conectores
              </Text>
              <Text variant="body" weight="bold">
                {item.location_connectors_count || 0}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Dirección
              </Text>
              <Text variant="body" weight="bold" numberOfLines={1}>
                {item.location_address || "Unknown"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Comuna
              </Text>
              <Text variant="body" weight="bold" numberOfLines={1}>
                {item.location_commune || "Unknown"}
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

              {/* Location Selector */}
              <LocationSelector />

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
                <TouchableOpacity
                  onPress={handleCreatePress}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="add" size={20} color="white" />
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
              keyExtractor={(item) => String(item.location_ID)}
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

        {/* Site Actions Modal */}
        <BottomDrawer
          visible={actionModalOpen}
          onClose={() => setActionModalOpen(false)}
          title="Site Options"
          height={200}
        >
          <ScrollView style={{ paddingBottom: spacing.lg }}>
            <View style={{ gap: spacing.md }}>
              <TouchableOpacity
                onPress={handleEnergyManagement}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                }}
              >
                <Ionicons name="flash" size={20} color={colors.primary} />
                <Text variant="body" weight="semibold">
                  Gestión energética
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleEditSite}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: spacing.md,
                  gap: spacing.md,
                }}
              >
                <Ionicons name="pencil" size={20} color={colors.primary} />
                <Text variant="body" weight="semibold">
                  Editar
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </BottomDrawer>
      </View>
    </SafeAreaView>
  );
}
