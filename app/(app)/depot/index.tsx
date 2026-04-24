import MantenedorView from "@/components/depot/maintainer/MantenedorView";
import OperadorView from "@/components/depot/operador/OperadorView";
import RoleBanner from "@/components/depot/RoleBanner";
import SupervisorView from "@/components/depot/supervisor/SupervisorView";
import { TecleButton } from "@/components/depot/TecleButton";
import { TecleControl } from "@/components/depot/TecleControl";
import { AppHeader } from "@/components/layout/AppHeader";
import { useSidebar } from "@/components/layout/AppContainer";
import { useGroupStore } from "@/lib/stores/group.store";
import { SkeletonCard } from "@/components/ui/SkeletonLoader";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { mockChargers } from "@/lib/data/mockData";
import { useLocations } from "@/lib/hooks/use-locations";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { logger } from "@/lib/services/logger";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from "react-native";

type Role = "operator" | "supervisor" | "maintainer";

export default function DepotView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { roles } = usePermissions();
  const { activeRole: selectedRole, setActiveRole: setSelectedRole } = useSidebar();

  // Derive available roles
  const availableRoles = useMemo(() => {
    const available: Role[] = [];
    if (roles.includes("supervisor")) available.push("supervisor" as Role);
    if (roles.includes("maintainer")) available.push("maintainer" as Role);
    if (roles.includes("operator")) available.push("operator" as Role);
    return available.length > 0 ? available : (["operator"] as Role[]);
  }, [roles]);

  // Sync initial role from permissions
  useEffect(() => {
    if (availableRoles.length > 0) {
      setSelectedRole(availableRoles[0] as Role);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableRoles[0]]);
  const [showTerminalDropdown, setShowTerminalDropdown] = useState(false);
  const [searchLocationQuery, setSearchLocationQuery] = useState<string>("");
  const [showTecleControl, setShowTecleControl] = useState(false);

  // Fetch locations from backend
  const { locations, fetchLocations } = useLocations();
  const { user } = useAuthStore();
  const { fetchChargers, chargersLoading, chargersError, clearError, selectedLocationId, setSelectedLocationId } = useChargersStore();
  const [selectedTerminal, setSelectedTerminal] = useState<string>("");

  // Restore selected location from AsyncStorage on mount
  useEffect(() => {
    const restoreLocation = async () => {
      try {
        const saved = await AsyncStorage.getItem("selectedLocationId");
        if (saved) {
          setSelectedLocationId(saved);
        }
      } catch (error) {
        logger.error("[DepotView] Failed to restore location", error);
      }
    };
    restoreLocation();
  }, []);

  // Fetch locations from backend
  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Set default terminal to first available
  useEffect(() => {
    if (locations.length > 0 && !selectedTerminal) {
      const firstLocation = locations[0];
      setSelectedTerminal(firstLocation.location_name);
      setSelectedLocationId(firstLocation.location_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // When selected location changes, fetch chargers + group and persist
  useEffect(() => {
    if (selectedLocationId) {
      const selectedLoc = locations.find((loc) => loc.location_id === selectedLocationId);
      if (selectedLoc) {
        setSelectedTerminal(selectedLoc.location_name);
      }
      // Fetch chargers for this location
      fetchChargers(1, 10, {
        siteId: selectedLocationId,
        companyId: user?.companyExternalId,
      });
      // Fetch group grid for this location
      useGroupStore.getState().fetchGroup(selectedLocationId);
      // Save to AsyncStorage
      AsyncStorage.setItem("selectedLocationId", selectedLocationId).catch((err) =>
        logger.error("[DepotView] Failed to save location", err),
      );
    }
  }, [selectedLocationId]);

  // Get chargers from store or use mock
  const storeChargers = useChargersStore((state) => state.chargers || []);
  const chargers = storeChargers.length > 0 ? storeChargers : mockChargers;

  // Filter locations by search query
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => loc.location_name.toLowerCase().includes(searchLocationQuery.toLowerCase()));
  }, [locations, searchLocationQuery]);

  // Calculate stats from chargers
  const stats = useMemo(() => {
    const charging = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Charging").length || 0), 0);
    const available = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Available").length || 0), 0);
    const finishing = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Finishing").length || 0), 0);
    const faulted = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0), 0);
    const suspended = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Suspended").length || 0), 0);

    // Total connectors (all except Offline/Unavailable)
    const total = chargers.reduce((sum, c: any) => {
      const activeCount = c.connectors?.filter((cn: any) => cn.status !== "Offline" && cn.status !== "Unavailable").length || 0;
      return sum + activeCount;
    }, 0);

    // Active connectors = non-offline count
    const active = charging + available + finishing + faulted + suspended;

    return {
      total,
      charging,
      available,
      finishing,
      faulted,
      suspended,
      active,
    };
  }, [chargers]);

  useEffect(() => {
    useChargersStore.getState().fetchChargers();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* App Header */}
      <AppHeader
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      {/* ScrollView contains Terminal Selector, Banner, and Content */}
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }} scrollEnabled={!showTerminalDropdown}>
        {/* Terminal Selector */}
        <View
          style={{
            backgroundColor: colors.card,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            position: "relative",
          }}
        >
          <TouchableOpacity onPress={() => setShowTerminalDropdown(!showTerminalDropdown)}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.xs,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {selectedTerminal}
              </Text>
              <Ionicons name={showTerminalDropdown ? "chevron-up" : "chevron-down"} size={14} color={colors.foreground} />
            </View>
          </TouchableOpacity>
          {showTerminalDropdown && (
            <View
              style={{
                position: "absolute",
                top: 50,
                left: spacing.lg,
                right: spacing.lg,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                elevation: 5,
                zIndex: 10,
              }}
            >
              <TextInput
                style={{
                  padding: spacing.md,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  color: colors.foreground,
                  fontSize: 12,
                }}
                placeholder="Buscar terminal..."
                placeholderTextColor={colors.mutedForeground}
                value={searchLocationQuery}
                onChangeText={setSearchLocationQuery}
              />
              <ScrollView style={{ maxHeight: 250 }}>
                {filteredLocations.length > 0 ? (
                  filteredLocations.map((location, idx) => (
                    <TouchableOpacity
                      key={location.location_id}
                      onPress={() => {
                        setSelectedLocationId(location.location_id);
                        setShowTerminalDropdown(false);
                        setSearchLocationQuery("");
                      }}
                      style={{
                        paddingHorizontal: spacing.md,
                        paddingVertical: spacing.sm,
                        borderBottomWidth: idx !== filteredLocations.length - 1 ? 1 : 0,
                        borderBottomColor: colors.border,
                        backgroundColor: selectedLocationId === location.location_id ? colors.primary + "10" : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: selectedLocationId === location.location_id ? "600" : "400",
                          color: selectedLocationId === location.location_id ? colors.primary : colors.foreground,
                        }}
                      >
                        {location.location_name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text
                    style={{
                      padding: spacing.md,
                      color: colors.mutedForeground,
                      fontSize: 12,
                    }}
                  >
                    Sin resultados
                  </Text>
                )}
              </ScrollView>
            </View>
          )}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Ionicons name="flash" size={14} color={themeColors.connectorStatus.online} />
            <Text
              style={{
                fontSize: 12,
                color: themeColors.connectorStatus.online,
                fontWeight: "500",
              }}
            >
              {stats.charging}/{stats.total}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>conectores activos</Text>
          </View>
        </View>

        {/* Role Banner */}
        <RoleBanner role={selectedRole} />

        {/* Error Banner */}
        {chargersError && (
          <View
            style={{
              backgroundColor: colors.destructive + "20",
              borderBottomWidth: 1,
              borderBottomColor: colors.destructive,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.md,
              }}
            >
              <Ionicons name="alert-circle" size={20} color={colors.destructive} />
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: colors.destructive,
                  fontWeight: "500",
                }}
              >
                {chargersError}
              </Text>
            </View>
            <TouchableOpacity onPress={() => clearError("chargers")}>
              <Ionicons name="close" size={20} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}

        {/* Loading Skeletons */}
        {chargersLoading ? (
          <View style={{ padding: spacing.lg, gap: spacing.md }}>
            <SkeletonCard lines={2} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={2} />
          </View>
        ) : (
          <>
            {/* Role-specific Content */}
            {selectedRole === "operator" && <OperadorView />}
            {selectedRole === "supervisor" && <SupervisorView />}
            {selectedRole === "maintainer" && <MantenedorView />}
          </>
        )}
      </ScrollView>

      {/* Tecle Button - Operador only */}
      {selectedRole === "operator" && (
        <TecleButton onPress={() => setShowTecleControl(true)} />
      )}

      {/* Tecle Control Modal */}
      <TecleControl visible={showTecleControl} onClose={() => setShowTecleControl(false)} />
    </SafeAreaView>
  );
}
