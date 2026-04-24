import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { View } from "react-native";

interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  frequency: number;
}

interface ConnectorEnergyRowProps {
  connectorId: number;
  status: string;
  statusLabel: string;
  statusColor: string;
  energyData: EnergyData;
}

export function ConnectorEnergyRow({ connectorId, status, statusLabel, statusColor, energyData }: ConnectorEnergyRowProps) {
  const isHighTemp = energyData.temperature > 45;

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: status === "faulted" ? themeColors.connectorStatus.faulted : "#e5e7eb",
        borderRadius: 6,
        padding: spacing.sm,
        backgroundColor: status === "faulted" ? `${themeColors.connectorStatus.faulted}10` : `#f3f4f6}20`,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.xs,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#1f2937" }}>C{connectorId}</Text>
        <View
          style={{
            backgroundColor: statusColor + "20",
            paddingHorizontal: spacing.xs,
            paddingVertical: spacing.xs / 3,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "500",
              color: statusColor,
            }}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: spacing.xs,
        }}
      >
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: "#9ca3af" }}>V</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#1f2937" }}>{energyData.voltage}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: "#9ca3af" }}>A</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#1f2937" }}>{energyData.current}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: "#9ca3af" }}>kW</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: "#1f2937" }}>{energyData.power}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: "#9ca3af" }}>°C</Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: isHighTemp ? themeColors.connectorStatus.faulted : "#1f2937",
            }}
          >
            {energyData.temperature}
          </Text>
        </View>
      </View>
    </View>
  );
}
