import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { StatusBadge } from "./StatusBadge";

interface Connector {
  id: string;
  connectorId: number;
  status: string;
  soc?: number;
  vehicleId?: string;
  power?: number;
  energyDelivered?: number;
}

interface ConnectorCardProps {
  connector: Connector;
  showActions?: boolean;
  onStartCharge?: () => void;
  onStopCharge?: () => void;
  onUnlock?: () => void;
  actionLoading?: string | null;
}

export function ConnectorCard({
  connector,
  showActions = false,
  onStartCharge,
  onStopCharge,
  onUnlock,
  actionLoading,
}: ConnectorCardProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <Card style={{ padding: spacing.md }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: spacing.md,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          Conector {connector.connectorId}
        </Text>
        <StatusBadge status={connector.status} />
      </View>

      {/* Info Section */}
      {connector.vehicleId && (
        <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
              Vehículo
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {connector.vehicleId.toUpperCase()}
            </Text>
          </View>

          {/* SoC */}
          {connector.soc !== undefined && (
            <View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                  Estado de Carga
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Ionicons name="battery-half" size={14} color="#3b82f6" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#3b82f6",
                    }}
                  >
                    {connector.soc}%
                  </Text>
                </View>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    backgroundColor: "#3b82f6",
                    width: `${connector.soc}%`,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: colors.mutedForeground,
                  marginTop: spacing.xs,
                  fontStyle: "italic",
                }}
              >
                SoC parcial — sin ETA (API no disponible)
              </Text>
            </View>
          )}

          {/* Power */}
          {connector.power !== undefined && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                Potencia
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {connector.power} kW
              </Text>
            </View>
          )}

          {/* Energy */}
          {connector.energyDelivered !== undefined && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                Energía Entregada
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {connector.energyDelivered} kWh
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: "#a855f7",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Controles Remotos
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
            }}
          >
            {connector.status !== "Charging" && onStartCharge && (
              <TouchableOpacity
                onPress={onStartCharge}
                disabled={actionLoading === `start-${connector.connectorId}`}
                style={{
                  flex: 1,
                  backgroundColor: "#22c55e",
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: actionLoading === `start-${connector.connectorId}` ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {actionLoading === `start-${connector.connectorId}`
                    ? "..."
                    : "Iniciar"}
                </Text>
              </TouchableOpacity>
            )}

            {connector.status === "Charging" && onStopCharge && (
              <TouchableOpacity
                onPress={onStopCharge}
                disabled={actionLoading === `stop-${connector.connectorId}`}
                style={{
                  flex: 1,
                  backgroundColor: "#3b82f6",
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: actionLoading === `stop-${connector.connectorId}` ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {actionLoading === `stop-${connector.connectorId}`
                    ? "..."
                    : "Detener"}
                </Text>
              </TouchableOpacity>
            )}

            {onUnlock && (
              <TouchableOpacity
                onPress={onUnlock}
                disabled={actionLoading === `unlock-${connector.connectorId}`}
                style={{
                  flex: 1,
                  backgroundColor: "#4b5563",
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  borderRadius: 8,
                  alignItems: "center",
                  opacity: actionLoading === `unlock-${connector.connectorId}` ? 0.5 : 1,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: 12,
                  }}
                >
                  {actionLoading === `unlock-${connector.connectorId}`
                    ? "..."
                    : "Desbloquear"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </Card>
  );
}
