import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import ConnectorBadge from "@/components/depot/ConnectorBadge";
import { useRouter } from "expo-router";

interface Connector {
  id: string;
  connectorId: number;
  name?: string;
  alias?: string;
  status: "available" | "charging" | "finishing" | "faulted" | "suspended" | "unavailable" | "offline";
  soc?: number | string;
  vehicleId?: string;
  power?: number | string;
  evccid?: string;
}

interface Charger {
  id: string;
  name: string;
  online: boolean;
  connectors?: Connector[];
}

interface ChargersGridProps {
  chargers: Charger[];
}

export function ChargersGrid({ chargers }: ChargersGridProps) {
  const router = useRouter();
  const colors = getThemeColors(useResolvedColorScheme());

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md, justifyContent: "space-between" }}>
        {chargers.map((charger) => {
          const activeCount = charger.connectors?.filter(
            (c) => c.status === "charging" || c.status === "finishing"
          ).length || 0;
          const totalCount = charger.connectors?.length || 0;
          const hasFinishing = charger.connectors?.some((c) => c.status === "finishing");

          return (
            <TouchableOpacity
              key={charger.id}
              onPress={() => router.push({
                pathname: `/charger/${charger.id}`,
                params: { chargerName: charger.name, chargerLocation: (charger as any).location, role: "operator" }
              })}
              style={{ width: "48%" }}
            >
              <Card
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: hasFinishing ? "#d8b4fe" : colors.border,
                  backgroundColor: hasFinishing ? "#faf5ff" : colors.card,
                }}
              >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                  {charger.name}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons
                    name="flash"
                    size={12}
                    color={activeCount > 0 ? "#22c55e" : "#d1d5db"}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: activeCount > 0 ? "#22c55e" : "#d1d5db",
                    }}
                  >
                    {activeCount}/{totalCount}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 6 }}>
                {charger.connectors?.map((connector) => (
                  <ConnectorBadge
                    key={connector.id}
                    connectorId={connector.connectorId}
                    connectorName={connector.name || connector.alias}
                    status={connector.status}
                    soc={connector.soc}
                    vehicleId={connector.vehicleId}
                    power={connector.power}
                    evccid={connector.evccid}
                    showVehicle={connector.status === "charging" || connector.status === "finishing"}
                  />
                ))}
              </View>

              {hasFinishing && (
                <View
                  style={{
                    marginTop: 8,
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#e9d5ff",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={12} color="#a855f7" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#a855f7" }}>
                    Listo para desconectar
                  </Text>
                </View>
              )}
              </Card>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
