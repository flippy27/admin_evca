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
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: "#1f2937",
          marginBottom: spacing.md,
        }}
      >
        Distribución de Conectores
      </Text>

      <View
        style={{
          height: 16,
          backgroundColor: "#e5e7eb",
          borderRadius: 8,
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
            {faulted > 0 && (
              <View
                style={{
                  flex: faulted,
                  backgroundColor: themeColors.light.destructive,
                }}
              />
            )}
            {suspended > 0 && <View style={{ flex: suspended, backgroundColor: COLORS.suspended }} />}
          </>
        )}
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
        {!hasData && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#9ca3af",
              }}
            />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Sin conectores activos</Text>
          </View>
        )}

        {hasData && charging > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.charging }} />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Cargando ({charging})</Text>
          </View>
        )}

        {hasData && finishing > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.finishing }} />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Finalizando ({finishing})</Text>
          </View>
        )}

        {hasData && available > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.available }} />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Disponible ({available})</Text>
          </View>
        )}

        {hasData && faulted > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: themeColors.light.destructive }} />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Falla ({faulted})</Text>
          </View>
        )}

        {hasData && suspended > 0 && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.suspended }} />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>Suspendido ({suspended})</Text>
          </View>
        )}
      </View>
    </View>
  );
}
