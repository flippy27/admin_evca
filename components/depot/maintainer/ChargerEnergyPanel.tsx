import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { TouchableOpacity, View } from "react-native";
import { ConnectorEnergyRow } from "./ConnectorEnergyRow";

interface Connector {
  id: string;
  connectorId: number;
  status: string;
  voltage?: number;
  current?: number;
  power?: number;
  energy?: number;
}

interface ChargerEnergyPanelProps {
  charger: {
    id: string;
    name: string;
    online: boolean;
    connectors?: Connector[];
  };
  statusConfigMap: Record<string, { label: string; color: string }>;
  onPress?: () => void;
}

export function ChargerEnergyPanel({ charger, statusConfigMap, onPress }: ChargerEnergyPanelProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const faultedCount = charger.connectors?.filter((c) => c.status?.toLowerCase() === "faulted").length || 0;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        style={{
          padding: spacing.md,
          backgroundColor: colors.card,
          borderColor: faultedCount > 0 ? themeColors.light.destructive : colors.border,
          borderWidth: faultedCount > 0 ? 0.5 : 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>{charger.name}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View
              style={{
                backgroundColor: charger.online ? themeColors.connectorStatus.online : colors.mutedForeground,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 20,
              }}
            >
              <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>{charger.online ? "Online" : "Offline"}</Text>
            </View>
            {faultedCount > 0 && (
              <View style={{ backgroundColor: themeColors.light.destructive, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
                <Text style={{ fontSize: 10, color: "white", fontWeight: "600" }}>
                  {faultedCount} falla{faultedCount > 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          {charger.connectors?.map((connector) => {
            const statusLabel = statusConfigMap[connector.status] ?? statusConfigMap[connector.status?.toLowerCase()];
            return (
              <ConnectorEnergyRow
                key={connector.id}
                connectorId={connector.connectorId}
                status={connector.status}
                statusLabel={statusLabel?.label || connector.status}
                statusColor={statusLabel?.color || colors.mutedForeground}
                energyData={{
                  voltage: connector.voltage ?? 0,
                  current: connector.current ?? 0,
                  power: connector.power ?? 0,
                  energy: connector.energy ?? 0,
                }}
              />
            );
          })}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
