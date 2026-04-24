import { useMemo, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useSidebar } from "./AppContainer";
import { usePermissions } from "@/lib/hooks/use-permissions";

type Role = "operator" | "supervisor" | "maintainer";

interface AppHeaderProps {
  hideRoleSelector?: boolean;
  selectedRole?: Role;
  onRoleChange?: (role: Role) => void;
}

export function AppHeader({
  hideRoleSelector = false,
  selectedRole: controlledRole,
  onRoleChange,
}: AppHeaderProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { openSidebar } = useSidebar();
  const { roles } = usePermissions();

  const [localSelectedRole, setLocalSelectedRole] = useState<Role>("operator");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const selectedRole = controlledRole || localSelectedRole;

  const availableRoles = useMemo(() => {
    const available: Role[] = [];
    if (roles.includes("supervisor")) available.push("supervisor");
    if (roles.includes("maintainer")) available.push("maintainer");
    if (roles.includes("operator")) available.push("operator");
    return available.length > 0 ? available : (["operator"] as Role[]);
  }, [roles]);

  const roleConfig: Record<Role, { label: string; color: string }> = {
    operator: { label: "Operador", color: themeColors.roles.operador },
    supervisor: { label: "Supervisor", color: themeColors.roles.supervisor },
    maintainer: { label: "Mantenedor", color: themeColors.roles.mantenedor },
  };

  const handleRoleChange = (role: Role) => {
    if (onRoleChange) {
      onRoleChange(role);
    } else {
      setLocalSelectedRole(role);
    }
    setShowRoleDropdown(false);
  };

  return (
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
      <TouchableOpacity onPress={openSidebar} style={{ width: 24 }}>
        <Ionicons name="menu" size={24} color={colors.foreground} />
      </TouchableOpacity>

      <View style={{ flex: 1, alignItems: "flex-start", paddingHorizontal: spacing.lg }}>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          Workforce App
        </Text>
        <Text style={{ fontSize: 11, color: colors.mutedForeground }}>PoC v1</Text>
      </View>

      {!hideRoleSelector && availableRoles.length > 1 && (
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
                  onPress={() => handleRoleChange(role)}
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderBottomWidth:
                      role !== availableRoles[availableRoles.length - 1] ? 1 : 0,
                    borderBottomColor: colors.border,
                    backgroundColor:
                      selectedRole === role ? colors.primary + "10" : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: selectedRole === role ? "600" : "400",
                      color:
                        selectedRole === role
                          ? roleConfig[role].color
                          : colors.foreground,
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
  );
}
