import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { View } from "react-native";

const COLORS = themeColors.connectorStatus;

interface SessionCardProps {
  chargerName: string;
  chargerId: string;
  connectorNumber: number;
  vehicleId: string;
  energy: number;
  duration: number;
}

export function SessionCard({
  chargerName,
  chargerId,
  connectorNumber,
  vehicleId,
  energy,
  duration,
}: SessionCardProps) {
  return (
    <Card style={{ padding: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text
            style={{
              fontWeight: "600",
              color: "#1f2937",
              fontSize: 13,
            }}
          >
            {chargerName} {chargerId} · C{connectorNumber}
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11 }}>BUS {vehicleId}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text
            style={{
              color: COLORS.charging,
              fontWeight: "bold",
              fontSize: 13,
            }}
          >
            {energy.toFixed(1)} kWh
          </Text>
          <Text style={{ color: "#9ca3af", fontSize: 11 }}>
            {Math.floor(duration / 60)} min
          </Text>
        </View>
      </View>
    </Card>
  );
}
