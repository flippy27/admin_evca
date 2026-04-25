import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";

interface HealthStatusGridProps {
  healthy: number;
  faulted: number;
  suspended: number;
}

export function HealthStatusGrid({ healthy, faulted, suspended }: HealthStatusGridProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
        Salud de Conectores
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.online, marginBottom: spacing.xs }}>
            {healthy}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Operativos</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.faulted, marginBottom: spacing.xs }}>
            {faulted}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Con Falla</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#eab308", marginBottom: spacing.xs }}>{suspended}</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Suspendidos</Text>
        </Card>
      </View>
    </View>
  );
}
