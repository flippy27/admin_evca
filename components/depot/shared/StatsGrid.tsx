import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { colors as themeColors, spacing } from "@/theme";
import { View } from "react-native";

const COLORS = themeColors.connectorStatus;

interface StatsGridProps {
  charging: number;
  available: number;
  finishing: number;
  faulted: number;
  title?: string;
}

export function StatsGrid({
  charging,
  available,
  finishing,
  faulted,
  title = "Conectores del Patio",
}: StatsGridProps) {
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Card
        style={{
          padding: spacing.lg,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#e5e7eb",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "#6b7280",
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {title}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.charging }}>
              {charging}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Cargando
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.available }}>
              {available}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Disponible
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.finishing }}>
              {finishing}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Finalizando
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: themeColors.destructive }}>
              {faulted}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Falla
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
