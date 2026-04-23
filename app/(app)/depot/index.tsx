import { useState, useMemo, useEffect } from "react";
import { TouchableOpacity, View, SafeAreaView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import RoleBanner from "@/components/depot/RoleBanner";
import OperadorView from "@/components/depot/OperadorView";
import SupervisorView from "@/components/depot/SupervisorView";
import MantenedorView from "@/components/depot/MantenedorView";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useSidebar } from "@/components/layout/AppContainer";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useLocations } from "@/lib/hooks/use-locations";
import { mockChargers } from "@/lib/data/mockData";

type Role = "operator" | "supervisor" | "maintainer";

export default function DepotView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { openSidebar } = useSidebar();
  const { roles } = usePermissions();

  // Derive available roles
  const availableRoles = useMemo(() => {
    const available: Role[] = [];
    if (roles.includes("supervisor")) available.push("supervisor" as Role);
    if (roles.includes("maintainer")) available.push("maintainer" as Role);
    if (roles.includes("operator")) available.push("operator" as Role);
    return available.length > 0 ? available : (["operator"] as Role[]);
  }, [roles]);

  const [selectedRole, setSelectedRole] = useState<Role>(availableRoles[0] as Role || "operator");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showTerminalDropdown, setShowTerminalDropdown] = useState(false);

  // Fetch locations from backend
  const { locations, fetchLocations } = useLocations();
  const [selectedTerminal, setSelectedTerminal] = useState<string>("");

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Set default terminal to first available
  useEffect(() => {
    if (locations.length > 0 && !selectedTerminal) {
      setSelectedTerminal(locations[0].location_name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locations]);

  // Get chargers from store or use mock
  const storeChargers = useChargersStore((state) => state.chargers || []);
  const chargers = storeChargers.length > 0 ? storeChargers : mockChargers;

  // Calculate stats from chargers
  const stats = useMemo(() => {
    const total = chargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0);
    const charging = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Charging").length || 0),
      0
    );
    const available = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Available").length || 0),
      0
    );
    const finishing = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Finishing").length || 0),
      0
    );
    const faulted = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0),
      0
    );

    return { total, charging, available, finishing, faulted };
  }, [chargers]);

  const roleConfig: Record<Role, { label: string; color: string }> = {
    operator: { label: "Operador de Patio", color: themeColors.roles.operador },
    supervisor: { label: "Supervisor", color: themeColors.roles.supervisor },
    maintainer: { label: "Mantenedor", color: themeColors.roles.mantenedor },
  };

  useEffect(() => {
    useChargersStore.getState().fetchChargers();
  }, []);

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

        {/* Role Selector */}
        {availableRoles.length > 1 && (
          <View>
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
          position: "relative",
        }}
      >
        <TouchableOpacity onPress={() => setShowTerminalDropdown(!showTerminalDropdown)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
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
            {locations.map((location) => (
              <TouchableOpacity
                key={location.location_id}
                onPress={() => {
                  setSelectedTerminal(location.location_name);
                  setShowTerminalDropdown(false);
                }}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderBottomWidth: location !== locations[locations.length - 1] ? 1 : 0,
                  borderBottomColor: colors.border,
                  backgroundColor: selectedTerminal === location.location_name ? colors.primary + "10" : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: selectedTerminal === location.location_name ? "600" : "400",
                    color: selectedTerminal === location.location_name ? colors.primary : colors.foreground,
                  }}
                >
                  {location.location_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Ionicons name="flash" size={14} color={themeColors.connectorStatus.online} />
          <Text style={{ fontSize: 12, color: themeColors.connectorStatus.online, fontWeight: "500" }}>
            {stats.charging}/{stats.total}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>conectores activos</Text>
        </View>
      </View>

      {/* Role Banner */}
      <RoleBanner role={selectedRole} />

      {/* Role-specific Content */}
      {selectedRole === "operator" && <OperadorView />}
      {selectedRole === "supervisor" && <SupervisorView />}
      {selectedRole === "maintainer" && <MantenedorView />}
    </SafeAreaView>
  );
}
