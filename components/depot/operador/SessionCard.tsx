import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
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
  vehicleId,
  energy,
  duration,
}: SessionCardProps) {
  const colors = getThemeColors(useResolvedColorScheme());
  const durationMin = Math.floor(duration / 60);

  return (
    <Card style={{ padding: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
            · {chargerName}
          </Text>
          {!!vehicleId && (
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>BUS {vehicleId}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: COLORS.charging, fontWeight: "bold", fontSize: 13 }}>
            {energy.toFixed(1)} kWh
          </Text>
          <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>{durationMin} min</Text>
        </View>
      </View>
    </Card>
  );
}
