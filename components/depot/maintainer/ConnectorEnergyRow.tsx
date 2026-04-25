import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";

interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  energy: number;
}

interface ConnectorEnergyRowProps {
  connectorId: number;
  status: string;
  statusLabel: string;
  statusColor: string;
  energyData: EnergyData;
}

export function ConnectorEnergyRow({ connectorId, status, statusLabel, statusColor, energyData }: ConnectorEnergyRowProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const statusLower = status?.toLowerCase();
  const isFaulted = statusLower === "faulted";

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isFaulted ? themeColors.connectorStatus.faulted : colors.border,
        borderRadius: 6,
        padding: spacing.sm,
        backgroundColor: isFaulted ? `${themeColors.connectorStatus.faulted}10` : colors.muted,
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.xs }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>C{connectorId}</Text>
        <View style={{ backgroundColor: statusColor + "20", paddingHorizontal: spacing.xs, paddingVertical: spacing.xs / 3, borderRadius: 10 }}>
          <Text style={{ fontSize: 10, fontWeight: "500", color: statusColor }}>{statusLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.xs }}>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: colors.mutedForeground }}>V</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>{Number(energyData.voltage).toFixed(1)}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: colors.mutedForeground }}>A</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>{Number(energyData.current).toFixed(1)}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: colors.mutedForeground }}>kW</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>{Number(energyData.power).toFixed(1)}</Text>
        </View>
        <View style={{ flex: 1, flexDirection: "row", gap: spacing.xs }}>
          <Text style={{ fontSize: 9, color: colors.mutedForeground }}>kWh</Text>
          <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>{Number(energyData.energy).toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
}
