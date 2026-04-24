import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { View } from "react-native";

interface HealthStatusGridProps {
  healthy: number;
  faulted: number;
  suspended: number;
}

export function HealthStatusGrid({ healthy, faulted, suspended }: HealthStatusGridProps) {
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: "#1f2937", marginBottom: spacing.md }}>Salud de Conectores</Text>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.online, marginBottom: spacing.xs }}>
            {healthy}
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>Operativos</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.faulted, marginBottom: spacing.xs }}>
            {faulted}
          </Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>Con Falla</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#eab308", marginBottom: spacing.xs }}>{suspended}</Text>
          <Text style={{ fontSize: 11, color: "#9ca3af" }}>Suspendidos</Text>
        </Card>
      </View>
    </View>
  );
}
