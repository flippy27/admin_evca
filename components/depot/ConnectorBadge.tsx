import { View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@/theme";

interface ConnectorBadgeProps {
  connectorId: number;
  status: "Available" | "Charging" | "Finishing" | "Faulted" | "Suspended" | "Unavailable";
  soc?: number;
  vehicleId?: string;
  power?: number;
  showVehicle?: boolean;
}

const statusColors = {
  Available: "#0ACDA9", // teal
  Charging: "#1477FF", // blue
  Finishing: "#a855f7", // purple
  Faulted: "#ef4444", // red
  Suspended: "#eab308", // yellow
  Unavailable: "#d1d5db", // gray
};

const statusBorders = {
  Available: "#0ACDA9",
  Charging: "#1477FF",
  Finishing: "#a855f7",
  Faulted: "#ef4444",
  Suspended: "#eab308",
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
