import { Text } from "@/components/ui/Text";
import { spacing, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";
import { EnergyCard } from "../shared/EnergyCard";

interface EnergyOverviewProps {
  avgVoltage: string;
  avgCurrent: string;
  totalPower: string;
  totalEnergy: string;
  onPressVariable?: (key: "voltage" | "current" | "power" | "energy") => void;
}

export function EnergyOverview({
  avgVoltage,
  avgCurrent,
  totalPower,
  totalEnergy,
  onPressVariable,
}: EnergyOverviewProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        Resumen Energético del Patio
      </Text>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <EnergyCard
            icon="speedometer"
            iconColor="#8b5cf6"
            label="Voltaje Prom."
            value={avgVoltage}
            unit="V"
            onPress={onPressVariable ? () => onPressVariable("voltage") : undefined}
          />
          <EnergyCard
            icon="flash"
            iconColor="#2563eb"
            label="Corriente Prom."
            value={avgCurrent}
            unit="A"
            onPress={onPressVariable ? () => onPressVariable("current") : undefined}
          />
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <EnergyCard
            icon="pulse"
            iconColor="#8b5cf6"
            label="Potencia Total"
            value={totalPower}
            unit="kW"
            onPress={onPressVariable ? () => onPressVariable("power") : undefined}
          />
          <EnergyCard
            icon="battery-charging"
            iconColor="#06b6d4"
            label="Energía Total"
            value={totalEnergy}
            unit="kWh"
            onPress={onPressVariable ? () => onPressVariable("energy") : undefined}
          />
        </View>
      </View>
    </View>
  );
}
