import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { TouchableOpacity, View } from "react-native";
import { ConnectorEnergyRow } from "./ConnectorEnergyRow";

interface EnergyData {
  voltage: number;
  current: number;
  power: number;
  temperature: number;
  frequency: number;
}

interface Connector {
  id: string;
  connectorId: number;
  status: string;
}

interface ChargerEnergyPanelProps {
  charger: {
    id: string;
    name: string;
    online: boolean;
    connectors?: Connector[];
  };
  energyDataMap: Record<string, EnergyData>;
  statusConfigMap: Record<string, { label: string; color: string }>;
  onPress?: () => void;
}

export function ChargerEnergyPanel({ charger, energyDataMap, statusConfigMap, onPress }: ChargerEnergyPanelProps) {
  const faultedCount = charger.connectors?.filter((c) => c.status === "Faulted").length || 0;

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        style={{
          padding: spacing.md,
          backgroundColor: faultedCount > 0 ? `${themeColors.light.destructive}10` : "#ffffff",
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
          <Text style={{ fontWeight: "600", color: "#1f2937", fontSize: 13 }}>{charger.name}</Text>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View
              style={{
                backgroundColor: charger.online ? themeColors.connectorStatus.online : "#9ca3af",
                paddingHorizontal: spacing.xs,
                paddingVertical: spacing.xs / 2,
                borderRadius: 4,
              }}
            >
              <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>{charger.online ? "Online" : "Offline"}</Text>
            </View>
            {faultedCount > 0 && (
              <View
                style={{
                  backgroundColor: themeColors.destructive,
                  paddingHorizontal: spacing.xs,
                  paddingVertical: spacing.xs / 2,
                  borderRadius: 4,
                }}
              >
                <Text style={{ fontSize: 10, color: "white", fontWeight: "600" }}>{faultedCount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ gap: spacing.sm }}>
          {charger.connectors?.map((connector) => {
            const energy = energyDataMap[`${charger.id}-c0${connector.connectorId}`];
            const statusLabel = statusConfigMap[connector.status];

            return (
              <ConnectorEnergyRow
                key={connector.id}
                connectorId={connector.connectorId}
                status={connector.status}
                statusLabel={statusLabel?.label || "Desconocido"}
                statusColor={statusLabel?.color || "#9ca3af"}
                energyData={
                  energy || {
                    voltage: 230,
                    current: 0,
                    power: 0,
                    temperature: 25,
                    frequency: 50,
                  }
                }
              />
            );
          })}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
