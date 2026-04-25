import ConnectorDot from "@/components/depot/ConnectorDot";
import { Text } from "@/components/ui/Text";
import { spacing, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";

interface Charger {
  id: string;
  name: string;
  online: boolean;
  connectors?: Array<{
    id: string;
    connectorId: number;
    status: string;
    power?: number;
  }>;
}

interface ChargersListProps {
  chargers: Charger[];
}

export function ChargersList({ chargers }: ChargersListProps) {
  const router = useRouter();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
      <View style={{ gap: spacing.sm }}>
        {chargers.map((charger: any) => {
          const chargingCount = charger.connectors?.filter((c: any) => c.status?.toLowerCase() === "charging").length || 0;
          const faultedCount = charger.connectors?.filter((c: any) => c.status?.toLowerCase() === "faulted").length || 0;
          const totalPower = charger.connectors?.reduce((sum: number, c: any) => sum + (c.power || 0), 0) || 0;
          const totalCount = charger.connectors?.length || 0;
          const dotColor = !charger.online ? colors.mutedForeground : faultedCount > 0 ? "#ef4444" : chargingCount > 0 ? "#22c55e" : colors.muted;

          return (
            <TouchableOpacity
              key={charger.id}
              onPress={() =>
                router.push({
                  pathname: `/charger/${charger.id}` as any,
                  params: { chargerName: charger.name, role: "supervisor" },
                })
              }
              style={{
                backgroundColor: colors.card,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: faultedCount > 0 ? "#fca5a5" : colors.border,
                padding: spacing.md,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dotColor }} />
                <View>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{charger.name}</Text>
                  <View style={{ flexDirection: "row", gap: spacing.xs, marginTop: 4 }}>
                    {charger.connectors?.map((conn: any) => (
                      <ConnectorDot key={conn.id} status={conn.status} size={8} />
                    ))}
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                {totalPower > 0 && <Text style={{ fontSize: 13, fontWeight: "600", color: "#3b82f6" }}>{totalPower} kW</Text>}
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  {chargingCount}/{totalCount} activos
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
