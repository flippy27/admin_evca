import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface ConnectorBadgeProps {
  connectorId?: number;
  connectorName?: string;
  status: "available" | "charging" | "finishing" | "faulted" | "suspended" | "unavailable" | "offline" | "preparing";
  soc?: number | string;
  vehicleId?: string;
  showVehicle?: boolean;
  power?: number | string;
  evccid?: string;
}

const statusConfig: Record<string, { bg: string; border: string; text: string }> = {
  available:   { bg: "#f9fafb", border: "#0ACDA9", text: "#0ACDA9" },
  charging:    { bg: "#eff6ff", border: "#1477FF", text: "#1477FF" },
  finishing:   { bg: "#faf5ff", border: "#a855f7", text: "#a855f7" },
  faulted:     { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
  suspended:   { bg: "#fefce8", border: "#eab308", text: "#ca8a04" },
  preparing:   { bg: "#fefce8", border: "#eab308", text: "#ca8a04" },
  unavailable: { bg: "#f3f4f6", border: "#d1d5db", text: "#9ca3af" },
  offline:     { bg: "#f3f4f6", border: "#d1d5db", text: "#9ca3af" },
};

export default function ConnectorBadge({
  connectorId,
  connectorName,
  status,
  soc,
  vehicleId,
  showVehicle,
}: ConnectorBadgeProps) {
  const statusLower = status?.toLowerCase() ?? "unavailable";
  const config = statusConfig[statusLower] || statusConfig.unavailable;
  const socValue = soc !== undefined && soc !== null ? Number(soc) : undefined;
  const label = connectorName || `C${connectorId}`;

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: config.border,
        backgroundColor: config.bg,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {socValue !== undefined ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Ionicons name="battery-half" size={14} color={config.text} />
            <Text style={{ fontSize: 12, fontWeight: "600", color: config.text }}>
              {socValue}%
            </Text>
          </View>
        ) : (
          <Text style={{ fontSize: 12, fontWeight: "500", color: config.text }}>
            {label}
          </Text>
        )}
      </View>

      {showVehicle && vehicleId && (
        <Text style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase" }}>
          {vehicleId}
        </Text>
      )}
    </View>
  );
}
