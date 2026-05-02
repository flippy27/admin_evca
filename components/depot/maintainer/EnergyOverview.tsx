import { Text } from "@/components/ui/Text";
import { spacing, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";
import { EnergyCard } from "../shared/EnergyCard";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <View style={{ padding: spacing.lg, gap: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
        {t("mobile.depot.overview.energySummaryTitle")}
      </Text>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <EnergyCard
            icon="speedometer"
            iconColor="#8b5cf6"
            label={t("mobile.depot.overview.avgVoltage")}
            value={avgVoltage}
            unit="V"
            onPress={onPressVariable ? () => onPressVariable("voltage") : undefined}
          />
          <EnergyCard
            icon="flash"
            iconColor="#2563eb"
            label={t("mobile.depot.overview.avgCurrent")}
            value={avgCurrent}
            unit="A"
            onPress={onPressVariable ? () => onPressVariable("current") : undefined}
          />
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <EnergyCard
            icon="pulse"
            iconColor="#8b5cf6"
            label={t("mobile.depot.overview.totalPower")}
            value={totalPower}
            unit="kW"
            onPress={onPressVariable ? () => onPressVariable("power") : undefined}
          />
          <EnergyCard
            icon="battery-charging"
            iconColor="#06b6d4"
            label={t("mobile.depot.overview.totalEnergy")}
            value={totalEnergy}
            unit="kWh"
            onPress={onPressVariable ? () => onPressVariable("energy") : undefined}
          />
        </View>
      </View>
    </View>
  );
}
