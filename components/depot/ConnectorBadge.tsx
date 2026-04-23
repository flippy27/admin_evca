import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { spacing, colors as themeColors } from "@/theme";

interface ConnectorBadgeProps {
  connectorId: number;
  status: "Available" | "Charging" | "Finishing" | "Faulted" | "Suspended" | "Unavailable";
  soc?: number;
  vehicleId?: string;
  power?: number;
  showVehicle?: boolean;
}

const statusColors: Record<string, string> = {
  Available: themeColors.connectorStatus.available,
  Charging: themeColors.connectorStatus.charging,
  Finishing: themeColors.connectorStatus.finishing,
  Faulted: themeColors.connectorStatus.faulted,
  Suspended: themeColors.connectorStatus.suspended,
  Unavailable: "#d1d5db",
};

const statusBorders: Record<string, string> = {
  Available: themeColors.connectorStatus.available,
  Charging: themeColors.connectorStatus.charging,
  Finishing: themeColors.connectorStatus.finishing,
  Faulted: themeColors.connectorStatus.faulted,
  Suspended: themeColors.connectorStatus.suspended,
  Unavailable: "#d1d5db",
};

export default function ConnectorBadge({
  connectorId,
  status,
  soc,
  vehicleId,
  power,
  showVehicle,
}: ConnectorBadgeProps) {
  const color = statusColors[status];
  const borderColor = statusBorders[status];

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: borderColor,
        borderRadius: 8,
        padding: spacing.sm,
        marginVertical: spacing.xs,
        backgroundColor: status === "Charging" || status === "Finishing" ? `${color}10` : undefined,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          {(status === "Charging" || status === "Finishing") && soc !== undefined ? (
            <>
              <Ionicons name="battery-half" size={14} color={color} />
              <Text style={{ color, fontWeight: "600", fontSize: 12 }}>
                {soc}%
              </Text>
            </>
          ) : (
            <Text style={{ color, fontWeight: "600", fontSize: 12 }}>
              C{connectorId}
            </Text>
          )}
        </View>
        {showVehicle && vehicleId && (
          <Text style={{ color, fontSize: 11, fontWeight: "500" }}>
            {vehicleId}
          </Text>
        )}
      </View>
      {(status === "Charging" || status === "Finishing") && power && (
        <Text style={{ color, fontSize: 11, marginTop: spacing.xs }}>
          {power} kW
        </Text>
      )}
    </View>
  );
}
