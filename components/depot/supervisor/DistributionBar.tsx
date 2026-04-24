import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { View } from "react-native";

const COLORS = themeColors.connectorStatus;

interface DistributionBarProps {
  charging: number;
  finishing: number;
  available: number;
  faulted: number;
  suspended: number;
  total: number;
}

export function DistributionBar({ charging, finishing, available, faulted, suspended, total }: DistributionBarProps) {
  const hasData = total > 0 && charging + finishing + available + faulted + suspended > 0;

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: "#6b7280",
          marginBottom: spacing.md,
          textTransform: "uppercase",
        }}
      >
        Distribución de Conectores
      </Text>

      <View
        style={{
          height: 16,
          backgroundColor: "#e5e7eb",
          borderRadius: 999,
          overflow: "hidden",
          flexDirection: "row",
          marginBottom: spacing.md,
        }}
      >
        {hasData && (
          <>
            {charging > 0 && <View style={{ flex: charging, backgroundColor: COLORS.charging }} />}
            {finishing > 0 && <View style={{ flex: finishing, backgroundColor: COLORS.finishing }} />}
            {available > 0 && <View style={{ flex: available, backgroundColor: COLORS.available }} />}
            {faulted > 0 && <View style={{ flex: faulted, backgroundColor: themeColors.light.destructive }} />}
            {suspended > 0 && <View style={{ flex: suspended, backgroundColor: COLORS.suspended }} />}
          </>
        )}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", columnGap: spacing.md, rowGap: spacing.sm }}>
        <LegendDot color={hasData ? COLORS.charging : "#9ca3af"} label={`Cargando (${charging})`} />
        <LegendDot color={hasData ? COLORS.finishing : "#9ca3af"} label={`Finalizando (${finishing})`} />
        <LegendDot color={hasData ? COLORS.available : "#9ca3af"} label={`Disponible (${available})`} />
        <LegendDot color={hasData ? themeColors.light.destructive : "#9ca3af"} label={`Falla (${faulted})`} />
        <LegendDot color={hasData ? COLORS.suspended : "#9ca3af"} label={`Suspendido (${suspended})`} />
      </View>
    </View>
  );
}
function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 6,
          backgroundColor: color,
        }}
      />
      <Text style={{ fontSize: 13, color: "#4b5563" }}>{label}</Text>
    </View>
  );
}
