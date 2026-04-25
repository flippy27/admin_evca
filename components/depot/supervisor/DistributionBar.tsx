import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
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
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const hasData = total > 0 && charging + finishing + available + faulted + suspended > 0;

  return (
    <View
      style={{
        marginHorizontal: spacing.lg,
        marginTop: spacing.md,
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          fontWeight: "700",
          color: colors.mutedForeground,
          marginBottom: spacing.md,
          textTransform: "uppercase",
        }}
      >
        Distribución de Conectores
      </Text>

      <View
        style={{
          height: 16,
          backgroundColor: colors.muted,
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
        <LegendDot color={hasData ? COLORS.charging : colors.mutedForeground} label={`Cargando (${charging})`} textColor={colors.foreground} />
        <LegendDot color={hasData ? COLORS.finishing : colors.mutedForeground} label={`Finalizando (${finishing})`} textColor={colors.foreground} />
        <LegendDot color={hasData ? COLORS.available : colors.mutedForeground} label={`Disponible (${available})`} textColor={colors.foreground} />
        <LegendDot color={hasData ? themeColors.light.destructive : colors.mutedForeground} label={`Falla (${faulted})`} textColor={colors.foreground} />
        <LegendDot color={hasData ? COLORS.suspended : colors.mutedForeground} label={`Suspendido (${suspended})`} textColor={colors.foreground} />
      </View>
    </View>
  );
}

function LegendDot({ color, label, textColor }: { color: string; label: string; textColor: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
      <View style={{ width: 10, height: 10, borderRadius: 6, backgroundColor: color }} />
      <Text style={{ fontSize: 13, color: textColor }}>{label}</Text>
    </View>
  );
}
