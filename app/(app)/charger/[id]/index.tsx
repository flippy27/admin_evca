import { useState, useMemo } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useToastStore } from "@/components/ui/Toast";

// Mock energy data
const mockEnergyData: Record<
  string,
  {
    voltage: number;
    current: number;
    power: number;
    temperature: number;
    frequency: number;
  }
> = {
  "charger-1-c01": { voltage: 230, current: 16, power: 3.7, temperature: 32, frequency: 50 },
  "charger-1-c02": { voltage: 228, current: 20, power: 4.6, temperature: 35, frequency: 50 },
  "charger-2-c01": { voltage: 231, current: 0, power: 0, temperature: 28, frequency: 50 },
  "charger-2-c02": { voltage: 229, current: 18, power: 4.1, temperature: 38, frequency: 50 },
  "charger-3-c01": { voltage: 226, current: 25, power: 5.7, temperature: 42, frequency: 50 },
  "charger-3-c02": { voltage: 230, current: 24, power: 5.5, temperature: 41, frequency: 50 },
};

type Role = "operator" | "supervisor" | "maintainer";

export default function ChargerDetail() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chargers = useChargersStore((state) => state.chargers || []);
  const { roles } = usePermissions();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Determine primary role to display (highest in hierarchy)
  const primaryRole: Role = useMemo(() => {
    if (roles.includes("supervisor")) return "supervisor";
    if (roles.includes("maintainer")) return "maintainer";
    return "operator";
  }, [roles]);

  const charger = useMemo(() => {
    return chargers.find((c: any) => c.id === id);
  }, [chargers, id]);

  const roleConfig: Record<Role, { label: string; color: string }> = {
    operator: { label: "Vista Operador", color: "#8b5cf6" },
    supervisor: { label: "Vista Supervisor", color: "#22c55e" },
    maintainer: { label: "Vista Mantenedor", color: "#06b6d4" },
  };

  const getStatusLabel = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      Available: { label: "Disponible", color: "#0ACDA9" },
      Charging: { label: "Cargando", color: "#1477FF" },
      Finishing: { label: "Finalizando", color: "#a855f7" },
      Faulted: { label: "Falla", color: "#ef4444" },
      Suspended: { label: "Suspendido", color: "#eab308" },
      Unavailable: { label: "No disponible", color: colors.mutedForeground },
    };
    return config[status] || config.Available;
  };

  const executeCommand = async (command: string) => {
    setActionLoading(command);
    // Simulate async command execution
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setActionLoading(null);
    const toastShow = useToastStore.getState().show;
    toastShow(`${command} ejecutado exitosamente`, "success", "Comando ejecutado");
  };

  if (!charger) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          Cargador no encontrado
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
            {charger.name}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {charger.location || charger.site?.name}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View
            style={{
              backgroundColor: roleConfig[primaryRole].color,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs / 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "600", color: "white" }}>
              {roleConfig[primaryRole].label}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: charger.online ? "#22c55e" : colors.destructive,
              paddingHorizontal: spacing.sm,
              paddingVertical: spacing.xs / 2,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: "600", color: "white" }}>
              {charger.online ? "Online" : "Offline"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, gap: spacing.lg }}>
          {/* Connectors */}
          {charger.connectors?.map((connector: any) => {
            const connectorKey = `${charger.id}-c0${connector.connectorId}`;
            const energyData = mockEnergyData[connectorKey];
            const statusLabel = getStatusLabel(connector.status);
            const isCharging = connector.status === "Charging" || connector.status === "Finishing";

            return (
              <Card key={connector.id} style={{ padding: spacing.md }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: spacing.md,
                  }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                    Conector {connector.connectorId}
                  </Text>
                  <View
                    style={{
                      backgroundColor: statusLabel.color + "20",
                      paddingHorizontal: spacing.sm,
                      paddingVertical: spacing.xs / 2,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: statusLabel.color,
                      }}
                    >
                      {statusLabel.label}
                    </Text>
                  </View>
                </View>

                {/* Vehicle & Charging Info - All roles */}
                {connector.vehicleId && (
                  <View style={{ gap: spacing.sm, marginBottom: spacing.md }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                        Vehículo
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: colors.foreground,
                        }}
                      >
                        {connector.vehicleId.toUpperCase()}
                      </Text>
                    </View>

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
                          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                            Estado de Carga
                          </Text>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                            <Ionicons name="battery-half" size={14} color={colors.primary} />
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "bold",
                                color: colors.primary,
                              }}
                            >
                              {connector.soc}%
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            height: 6,
                            backgroundColor: colors.muted,
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <View
                            style={{
                              height: "100%",
                              width: `${connector.soc}%`,
                              backgroundColor: colors.primary,
                            }}
                          />
                        </View>
                        <Text
                          style={{
                            fontSize: 10,
                            color: colors.mutedForeground,
                            marginTop: spacing.xs,
                            fontStyle: "italic",
                          }}
                        >
                          SoC parcial — sin ETA
                        </Text>
                      </View>
                    )}

                    {connector.power !== undefined && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                          Potencia
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {connector.power} kW
                        </Text>
                      </View>
                    )}

                    {connector.energy !== undefined && (
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                          Energía Entregada
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {connector.energy} kWh
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* === OPERADOR: Remote Commands === */}
                {primaryRole === "operator" && (
                  <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
                    <Text style={{ fontSize: 11, fontWeight: "600", color: "#8b5cf6" }}>
                      CONTROLES REMOTOS
                    </Text>
                    <View style={{ gap: spacing.sm }}>
                      {connector.status !== "Charging" && (
                        <TouchableOpacity
                          onPress={() => executeCommand("start")}
                          disabled={actionLoading === "start"}
                          style={{
                            backgroundColor: "#22c55e",
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: spacing.sm,
                            opacity: actionLoading === "start" ? 0.5 : 1,
                          }}
                        >
                          {actionLoading === "start" ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Ionicons name="play" size={16} color="white" />
                          )}
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>
                            Iniciar Carga
                          </Text>
                        </TouchableOpacity>
                      )}

                      {connector.status === "Charging" && (
                        <TouchableOpacity
                          onPress={() => executeCommand("stop")}
                          disabled={actionLoading === "stop"}
                          style={{
                            backgroundColor: colors.primary,
                            paddingHorizontal: spacing.md,
                            paddingVertical: spacing.sm,
                            borderRadius: 6,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: spacing.sm,
                            opacity: actionLoading === "stop" ? 0.5 : 1,
                          }}
                        >
                          {actionLoading === "stop" ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <Ionicons name="stop" size={16} color="white" />
                          )}
                          <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>
                            Detener Carga
                          </Text>
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        onPress={() => executeCommand("unlock")}
                        disabled={actionLoading === "unlock"}
                        style={{
                          backgroundColor: colors.mutedForeground,
                          paddingHorizontal: spacing.md,
                          paddingVertical: spacing.sm,
                          borderRadius: 6,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: spacing.sm,
                          opacity: actionLoading === "unlock" ? 0.5 : 1,
                        }}
                      >
                        {actionLoading === "unlock" ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Ionicons name="lock-open" size={16} color="white" />
                        )}
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>
                          Desbloquear
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* === SUPERVISOR: Session info === */}
                {primaryRole === "supervisor" && isCharging && (
                  <View
                    style={{
                      backgroundColor: "#22c55e20",
                      borderWidth: 1,
                      borderColor: "#22c55e",
                      borderRadius: 6,
                      padding: spacing.sm,
                      marginTop: spacing.md,
                      gap: spacing.xs,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Ionicons name="time" size={12} color="#22c55e" />
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#22c55e" }}>
                        Sesión en curso
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                      <View>
                        <Text style={{ fontSize: 10, color: "#22c55e" }}>Potencia:</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#22c55e",
                          }}
                        >
                          {connector.power || 0} kW
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 10, color: "#22c55e" }}>Entregado:</Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: "#22c55e",
                          }}
                        >
                          {connector.energy || 0} kWh
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* === MANTENEDOR: Energy data === */}
                {primaryRole === "maintainer" && energyData && (
                  <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Ionicons name="pulse" size={12} color="#06b6d4" />
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#06b6d4" }}>
                        VARIABLES ENERGÉTICAS
                      </Text>
                    </View>

                    <View style={{ gap: spacing.sm }}>
                      <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <Card style={{ flex: 1, padding: spacing.sm }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <Ionicons name="speedometer" size={12} color="#14b8a6" />
                            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>V</Text>
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: "bold", color: "#14b8a6" }}>
                            {energyData.voltage}
                          </Text>
                        </Card>

                        <Card style={{ flex: 1, padding: spacing.sm }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <Ionicons name="flash" size={12} color={colors.primary} />
                            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>A</Text>
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: "bold", color: colors.primary }}>
                            {energyData.current}
                          </Text>
                        </Card>
                      </View>

                      <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <Card style={{ flex: 1, padding: spacing.sm }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <Ionicons name="flash" size={12} color="#a855f7" />
                            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>kW</Text>
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: "bold", color: "#a855f7" }}>
                            {energyData.power}
                          </Text>
                        </Card>

                        <Card
                          style={{
                            flex: 1,
                            padding: spacing.sm,
                            backgroundColor:
                              energyData.temperature > 45 ? `${colors.destructive}10` : undefined,
                          }}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
                            <Ionicons
                              name="thermometer"
                              size={12}
                              color={
                                energyData.temperature > 45 ? colors.destructive : "#ea580c"
                              }
                            />
                            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>°C</Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "bold",
                              color:
                                energyData.temperature > 45
                                  ? colors.destructive
                                  : "#ea580c",
                            }}
                          >
                            {energyData.temperature}
                          </Text>
                          {energyData.temperature > 45 && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: spacing.xs }}>
                              <Ionicons name="alert-circle" size={10} color={colors.destructive} />
                              <Text style={{ fontSize: 9, color: colors.destructive, fontWeight: "600" }}>
                                Alta
                              </Text>
                            </View>
                          )}
                        </Card>
                      </View>

                      <Card style={{ padding: spacing.sm }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                            Frecuencia
                          </Text>
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: colors.foreground,
                            }}
                          >
                            {energyData.frequency} Hz
                          </Text>
                        </View>
                      </Card>
                    </View>
                  </View>
                )}
              </Card>
            );
          })}

          {/* Charger-level Actions */}
          <Card style={{ padding: spacing.md, gap: spacing.sm }}>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground, marginBottom: spacing.sm }}>
              {primaryRole === "maintainer"
                ? "Herramientas Técnicas"
                : primaryRole === "operator"
                ? "Acciones del Cargador"
                : "Información del Cargador"}
            </Text>

            <View style={{ gap: spacing.sm }}>
              {/* Reboot */}
              {(primaryRole === "operator" || primaryRole === "maintainer") && (
                <TouchableOpacity
                  onPress={() => executeCommand("reboot")}
                  disabled={actionLoading === "reboot"}
                  style={{
                    backgroundColor: "#ea580c",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.sm,
                    opacity: actionLoading === "reboot" ? 0.5 : 1,
                  }}
                >
                  {actionLoading === "reboot" ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="reload" size={16} color="white" />
                  )}
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>
                    Reiniciar Cargador
                  </Text>
                </TouchableOpacity>
              )}

              {/* OCPP Messages */}
              {(primaryRole === "maintainer" || primaryRole === "supervisor") && (
                <TouchableOpacity
                  onPress={() => router.push(`/(app)/charger/${id}/ocpp` as any)}
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons name="chatbubbles" size={16} color={colors.foreground} />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                    Ver Mensajes OCPP
                  </Text>
                </TouchableOpacity>
              )}

              {/* Configuration */}
              {primaryRole === "maintainer" && (
                <TouchableOpacity
                  onPress={() => router.push(`/(app)/charger/${id}/config` as any)}
                  style={{
                    backgroundColor: "#06b6d420",
                    borderWidth: 1,
                    borderColor: "#06b6d4",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons name="settings" size={16} color="#06b6d4" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#06b6d4" }}>
                    Configuración OCPP
                  </Text>
                </TouchableOpacity>
              )}

              {/* Sessions */}
              {primaryRole === "supervisor" && (
                <TouchableOpacity
                  onPress={() => router.push("/(app)/sessions" as any)}
                  style={{
                    backgroundColor: "#22c55e20",
                    borderWidth: 1,
                    borderColor: "#22c55e",
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    borderRadius: 6,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons name="time" size={16} color="#22c55e" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#22c55e" }}>
                    Ver Historial de Sesiones
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
