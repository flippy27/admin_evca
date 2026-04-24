import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme";
import { View } from "react-native";
import { EnergyCard } from "../shared/EnergyCard";

interface EnergyOverviewProps {
  avgVoltage: string;
  maxTemp: string;
  totalPower: string;
  avgTemp: string;
}

export function EnergyOverview({
  avgVoltage,
  maxTemp,
  totalPower,
  avgTemp,
}: EnergyOverviewProps) {
  const maxTempNum = parseInt(maxTemp);
  const isHighTemp = maxTempNum > 45;

  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937" }}>
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
          />
          <EnergyCard
            icon="thermometer"
            iconColor={isHighTemp ? "#ef4444" : "#ea580c"}
            label="Temp. Máx."
            value={maxTemp}
            unit="°C"
            warning={isHighTemp}
          />
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <EnergyCard
            icon="flash"
            iconColor="#8b5cf6"
            label="Potencia Total"
            value={totalPower}
            unit="kW"
          />
          <EnergyCard
            icon="pulse"
            iconColor="#06b6d4"
            label="Temp. Prom."
            value={avgTemp}
            unit="°C"
          />
        </View>
      </View>
    </View>
  );
}
