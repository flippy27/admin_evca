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
import { useSidebar } from "@/components/layout/AppContainer";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { BottomDrawer } from "@/components/ui/BottomDrawer";
import { LocationSelector } from "@/components/ui/LocationSelector";
import { SearchBar } from "@/components/ui/SearchBar";
import { SkeletonCard, SkeletonListItem } from "@/components/ui/SkeletonLoader";
import { Text } from "@/components/ui/Text";
import { OCPPModal } from "@/components/ui/OCPPModal";
import { usePermissionGuard } from "@/lib/hooks/usePermissionGuard";
import { useApiErrorToast } from "@/lib/hooks/useApiErrorToast";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useLocationsStore } from "@/lib/stores/locations.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useOCPPStore } from "@/lib/stores/ocpp.store";
import { AuthPermissionsEnum } from "@/lib/config/permissions";
import { getThemeColors, spacing } from "@/theme";
import { useToast } from "@/components/ui/Toast";

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
  const { show: showToast } = useToast();
  const { openSidebar } = useSidebar();

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  });

  // Chargers Store
  const {
    chargers,
    chargersLoading,
    chargersError,
    page,
    totalPages,
    fetchChargers,
    clearError,
  } = useChargersStore();

  // Sessions Store
  const {
    sessions,
    sessionsLoading,
    sessionsError,
    fetchSessions,
    clearError: clearSessionsError,
  } = useChargingSessionsStore();

  // OCPP Store
  const {
    executing: ocppExecuting,
    startCharge,
    stopCharge,
    disableCharger,
    enableCharger,
    unlockConnector,
    rebootCharger,
  } = useOCPPStore();

  // UI State
  const [searchText, setSearchText] = useState("");
  const [filteredChargers, setFilteredChargers] = useState<typeof chargers>([]);
  const [activeTab, setActiveTab] = useState<ChargersTab>("list");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [guideDrawerOpen, setGuideDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [ocppModalOpen, setOCPPModalOpen] = useState(false);
  const [selectedChargerForOCPP, setSelectedChargerForOCPP] = useState<any>(null);

  // Show error toast when API fails
  useApiErrorToast(chargersError, "Failed to load chargers. Try again.");

  // Get locations and chargers
  const { user } = useAuthStore();
  const { selectedLocationIds, fetchLocations } = useLocationsStore();

  useEffect(() => {
    if (user?.userId && user?.companyId) {
      fetchLocations(user.userId, user.companyId);
    }
  }, [user?.userId, user?.companyId]);

  useEffect(() => {
    fetchChargers(1, 20, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  }, [selectedLocationIds]);

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

  // Load sessions when tab changes to sessions
  useEffect(() => {
    if (activeTab === "sessions") {
      const { selectedLocationIds } = useLocationsStore.getState();
      fetchSessions({
        payload: {
          location_ids: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
        },
        pagination: {
          page: 1,
          per_page: 20,
        },
        sort: {
          by: 'session_start_datetime',
          order: 'DESC',
        },
      });
    }
  }, [activeTab]);

  if (!hasAccess) return null;

  const handleChargerPress = (chargerId: string) => {
    router.push({
      pathname: "/chargers/[id]/live" as any,
      params: { id: chargerId },
    });
  };

  const handleRefresh = () => {
    clearError("chargers");
    const { selectedLocationIds } = useLocationsStore.getState();
    fetchChargers(1, 20, {
      siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
    });
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const { selectedLocationIds } = useLocationsStore.getState();
      fetchChargers(page + 1, 20, {
        siteId: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
      });
    }
  };

  const handleCreatePress = () => {
    router.push("/chargers/create");
  };

  const handleChargerLongPress = (charger: any) => {
    setSelectedChargerForOCPP(charger);
    setOCPPModalOpen(true);
  };

  const handleOCPPStartCharge = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await startCharge(
      selectedChargerForOCPP.id,
      selectedChargerForOCPP.connectors?.[0]?.id || "1"
    );
    if (success) {
      showToast("Charge started", "success");
    } else {
      showToast("Failed to start charge", "error");
    }
  };

  const handleOCPPStopCharge = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await stopCharge(selectedChargerForOCPP.id, 0);
    if (success) {
      showToast("Charge stopped", "success");
    } else {
      showToast("Failed to stop charge", "error");
    }
  };

  const handleOCPPDisable = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await disableCharger(selectedChargerForOCPP.id);
    if (success) {
      showToast("Charger disabled", "success");
    } else {
      showToast("Failed to disable", "error");
    }
  };

  const handleOCPPEnable = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await enableCharger(selectedChargerForOCPP.id);
    if (success) {
      showToast("Charger enabled", "success");
    } else {
      showToast("Failed to enable", "error");
    }
  };

  const handleOCPPUnlock = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await unlockConnector(
      selectedChargerForOCPP.id,
      selectedChargerForOCPP.connectors?.[0]?.id || "1"
    );
    if (success) {
      showToast("Connector unlocked", "success");
    } else {
      showToast("Failed to unlock", "error");
    }
  };

  const handleOCPPReboot = async () => {
    if (!selectedChargerForOCPP) return;
    const success = await rebootCharger(selectedChargerForOCPP.id);
    if (success) {
      showToast("Reboot initiated", "success");
    } else {
      showToast("Failed to reboot", "error");
    }
  };

  const handleOCPPEdit = () => {
    setOCPPModalOpen(false);
    if (selectedChargerForOCPP) {
      router.push(`/chargers/${selectedChargerForOCPP.id}/edit`);
    }
  };

  const renderChargerItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleChargerPress(item.id)}
      onLongPress={() => handleChargerLongPress(item)}
      delayLongPress={500}
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
    <SafeAreaView edges={["bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header with Hamburger */}
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
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
            }}
          >
            <View style={{ gap: 4 }}>
              <View style={{ width: 20, height: 2, backgroundColor: colors.foreground, borderRadius: 1 }} />
              <View style={{ width: 20, height: 2, backgroundColor: colors.foreground, borderRadius: 1 }} />
              <View style={{ width: 20, height: 2, backgroundColor: colors.foreground, borderRadius: 1 }} />
            </View>
          </TouchableOpacity>

          {/* Title Section */}
          <View style={{ flex: 1 }}>
            <Text variant="h2" weight="bold">
              {t("common.ui.pageTitles.chargers") || "Chargers"}
            </Text>
          </View>
        </View>

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
            {/* List Header */}
            <View style={{ padding: spacing.lg, gap: spacing.md }}>
              <View>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  {filteredChargers?.length || 0} chargers
                </Text>
              </View>

              {/* Location Selector */}
              <LocationSelector />

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
                    style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.md }}
                  >
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <SkeletonCard key={idx} lines={2} />
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
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}
            refreshControl={
              <RefreshControl
                refreshing={sessionsLoading}
                onRefresh={() => {
                  clearSessionsError();
                  const { selectedLocationIds } = useLocationsStore.getState();
                  fetchSessions({
                    payload: {
                      location_ids: selectedLocationIds.length > 0 ? selectedLocationIds : undefined,
                    },
                    pagination: {
                      page: 1,
                      per_page: 20,
                    },
                  });
                }}
              />
            }
          >
            {sessionsError && (
              <Alert variant="destructive" title="Error" message={sessionsError} />
            )}

            {sessions.length > 0 ? (
              <View style={{ gap: spacing.md, paddingTop: spacing.lg }}>
                {sessions.map((session) => (
                  <Card key={session.session_id || session.id}>
                    <CardContent style={{ gap: spacing.md }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Text variant="h4" weight="bold" style={{ flex: 1 }}>
                          {session.license_plate || session.rfid || "N/A"}
                        </Text>
                        <Badge
                          label={session.status?.charAt(0).toUpperCase() + (session.status?.slice(1) || "") || "Active"}
                          variant="secondary"
                        />
                      </View>

                      <View style={{ gap: spacing.sm }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text variant="caption" style={{ color: colors.mutedForeground }}>
                            Energy
                          </Text>
                          <Text variant="body" weight="bold">
                            {session.energy_kwh?.toFixed(2) || "0"} kWh
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text variant="caption" style={{ color: colors.mutedForeground }}>
                            Duration
                          </Text>
                          <Text variant="body" weight="bold">
                            {Math.floor((session.duration_minutes || 0) / 60)}h {(session.duration_minutes || 0) % 60}m
                          </Text>
                        </View>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text variant="caption" style={{ color: colors.mutedForeground }}>
                            Power
                          </Text>
                          <Text variant="body" weight="bold">
                            {session.max_power_kw?.toFixed(1) || "0"} kW
                          </Text>
                        </View>
                      </View>

                      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }}>
                        <Text variant="caption" style={{ color: colors.mutedForeground }}>
                          {new Date(session.session_start_datetime || "").toLocaleString()}
                        </Text>
                      </View>
                    </CardContent>
                  </Card>
                ))}
              </View>
            ) : sessionsLoading ? (
              <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.lg }}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <SkeletonCard key={idx} lines={3} style={{ marginBottom: spacing.md }} />
                ))}
              </View>
            ) : (
              <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  No sessions found. Pull to refresh.
                </Text>
              </View>
            )}
          </ScrollView>
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

        {/* OCPP Commands Modal */}
        {selectedChargerForOCPP && (
          <OCPPModal
            visible={ocppModalOpen}
            chargerId={selectedChargerForOCPP.id}
            chargerName={selectedChargerForOCPP.name}
            chargerStatus={selectedChargerForOCPP.status}
            isActive={selectedChargerForOCPP.status === "charging"}
            executing={ocppExecuting}
            onStartCharge={handleOCPPStartCharge}
            onStopCharge={handleOCPPStopCharge}
            onDisable={handleOCPPDisable}
            onEnable={handleOCPPEnable}
            onUnlock={handleOCPPUnlock}
            onReboot={handleOCPPReboot}
            onEdit={handleOCPPEdit}
            onClose={() => setOCPPModalOpen(false)}
          />
        )}

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
