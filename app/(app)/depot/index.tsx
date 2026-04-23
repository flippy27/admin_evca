import { useState, useMemo } from "react";
import { TouchableOpacity, View, SafeAreaView } from "react-native";
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
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
            Terminal Maipú
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
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
