import { useState, useMemo, useEffect } from "react";
import { TouchableOpacity, View, SafeAreaView, ScrollView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import RoleBanner from "@/components/depot/RoleBanner";
import OperadorView from "@/components/depot/OperadorView";
import SupervisorView from "@/components/depot/SupervisorView";
import MantenedorView from "@/components/depot/MantenedorView";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useSidebar } from "@/components/layout/AppContainer";
import { useLocations } from "@/lib/hooks/use-locations";

type Role = "operator" | "supervisor" | "maintainer";

export default function DepotView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { openSidebar } = useSidebar();
  const { roles } = usePermissions();

  // Derive available roles from user permissions (hierarchy: supervisor > maintainer > operator)
  const availableRoles = useMemo(() => {
    const available: Role[] = [];
    if (roles.includes("supervisor")) available.push("supervisor" as Role);
    if (roles.includes("maintainer")) available.push("maintainer" as Role);
    if (roles.includes("operator")) available.push("operator" as Role);
    return available.length > 0 ? available : (["operator"] as Role[]);
  }, [roles]);

  // Init selectedRole to highest available role
  const [selectedRole, setSelectedRole] = useState<Role>(availableRoles[0] as Role || "operator");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Locations
  const { locations, loading: locationsLoading, fetchLocations } = useLocations();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Set default location
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].location_id);
    }
  }, [locations, selectedLocationId]);

  const selectedLocation = locations.find((l) => l.location_id === selectedLocationId);

  // Calculate active connectors for selected location
  const chargers = useChargersStore((state) => state.chargers || []);
  const activeConnectorStats = useMemo(() => {
    if (!selectedLocation) return { active: 0, total: 0 };

    const locationChargers = chargers.filter((c: any) => {
      const locName = c.site?.name || c.location || "Unknown";
      return locName === selectedLocation.location_name;
    });

    const total = locationChargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0);
    const charging = locationChargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Charging").length || 0),
      0
    );

    return { active: charging, total };
  }, [selectedLocation, chargers]);

  const roleConfig: Record<Role, { label: string; color: string }> = {
    operator: { label: "Operador de Patio", color: "#8b5cf6" },
    supervisor: { label: "Supervisor", color: "#22c55e" },
    maintainer: { label: "Mantenedor", color: "#06b6d4" },
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={openSidebar}>
          <Ionicons name="menu" size={24} color={colors.foreground} />
        </TouchableOpacity>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            Workforce App
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Admin EVCA</Text>
        </View>

        {/* Role Selector Dropdown */}
        {availableRoles.length > 1 && (
          <View style={{ position: "relative" }}>
            <TouchableOpacity
              onPress={() => setShowRoleDropdown(!showRoleDropdown)}
              style={{
                backgroundColor: roleConfig[selectedRole].color,
                paddingHorizontal: spacing.sm,
                paddingVertical: spacing.xs,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: "white" }}>
                {roleConfig[selectedRole].label.split(" ")[0]}
              </Text>
              <Ionicons name="chevron-down" size={14} color="white" />
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showRoleDropdown && (
              <View
                style={{
                  position: "absolute",
                  top: 36,
                  right: 0,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 5,
                  zIndex: 10,
                  minWidth: 140,
                }}
              >
                {availableRoles.map((role) => (
                  <TouchableOpacity
                    key={role}
                    onPress={() => {
                      setSelectedRole(role);
                      setShowRoleDropdown(false);
                    }}
                    style={{
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      borderBottomWidth: role !== availableRoles[availableRoles.length - 1] ? 1 : 0,
                      borderBottomColor: colors.border,
                      backgroundColor: selectedRole === role ? colors.primary + "10" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: selectedRole === role ? "600" : "400",
                        color: selectedRole === role ? roleConfig[role].color : colors.foreground,
                      }}
                    >
                      {roleConfig[role].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ width: 24 }} />
      </View>

      {/* Terminal Selector */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowLocationDropdown(!showLocationDropdown)}
          style={{
            flex: 1,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.xs }}>
            {selectedLocation?.location_name || "Cargando..."}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <Ionicons name="flash" size={14} color="#22c55e" />
            <Text style={{ fontSize: 12, color: "#22c55e", fontWeight: "500" }}>
              {activeConnectorStats.active}/{activeConnectorStats.total}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>conectores activos</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowLocationDropdown(!showLocationDropdown)}>
          <Ionicons
            name={showLocationDropdown ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.mutedForeground}
          />
        </TouchableOpacity>

        {/* Location Dropdown Menu */}
        {showLocationDropdown && (
          <View
            style={{
              position: "absolute",
              top: 60,
              left: spacing.lg,
              right: spacing.lg,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
              zIndex: 10,
              maxHeight: 200,
            }}
          >
            <ScrollView scrollEnabled={locations.length > 5}>
              {locations.map((location) => (
                <TouchableOpacity
                  key={location.location_id}
                  onPress={() => {
                    setSelectedLocationId(location.location_id);
                    setShowLocationDropdown(false);
                  }}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderBottomWidth: location.location_id !== locations[locations.length - 1].location_id ? 1 : 0,
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
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Role Banner */}
      <RoleBanner role={selectedRole} />

      {/* Role-specific Content */}
      {selectedRole === "operator" && <OperadorView selectedLocation={selectedLocation} />}
      {selectedRole === "supervisor" && <SupervisorView selectedLocation={selectedLocation} />}
      {selectedRole === "maintainer" && <MantenedorView selectedLocation={selectedLocation} />}
    </SafeAreaView>
  );
}
