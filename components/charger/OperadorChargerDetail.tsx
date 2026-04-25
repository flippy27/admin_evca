import { useState } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useNavigation } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "@/components/ui/Toast";
import { AppHeader } from "@/components/layout/AppHeader";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { chargerCommandsApi } from "@/lib/api/charger-commands.api";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  Available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  Charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  occupied:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  Finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  Faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  Suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  Unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  offline:     { label: "Offline",       bg: "#f3f4f6",  color: "#9ca3af" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] || { label: status, bg: "#f3f4f6", color: "#9ca3af" };
}

function isCharging(status: string) {
  return ["charging", "Charging", "occupied"].includes(status);
}

export function OperadorChargerDetail({ charger }: { charger: any }) {
  const colors = getThemeColors(useResolvedColorScheme());
  const navigation = useNavigation();
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId) ?? "";
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const runConnectorCmd = async (
    command: "start" | "stop" | "unlock",
    connectorUUID: string,
    connectorNumber: number,
  ) => {
    const key = `${command}-${connectorNumber}`;
    setActionLoading(key);
    try {
      await chargerCommandsApi.connectorCommand(selectedLocationId, charger.id, connectorUUID, command);
      useToastStore.getState().show(
        `Conector ${connectorNumber}`,
        "success",
        `Comando ${command} ejecutado exitosamente`,
      );
    } catch {
      useToastStore.getState().show(
        `Conector ${connectorNumber}`,
        "error",
        `Error al ejecutar ${command}`,
      );
    } finally {
      setActionLoading(null);
    }
  };

  const runReboot = async () => {
    setActionLoading("reboot");
    try {
      await chargerCommandsApi.reboot(selectedLocationId, charger.id);
      useToastStore.getState().show("Cargador reiniciado", "success", "Reiniciar Cargador");
    } catch {
      useToastStore.getState().show("Error al reiniciar", "error", "Reiniciar Cargador");
    } finally {
      setActionLoading(null);
    }
  };

  const location = charger.location || charger.site?.name || charger.siteName || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <AppHeader hideRoleSelector={true} />

      {/* Page header */}
      <View style={{ backgroundColor: "#ffffff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb", paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#111827", lineHeight: 28 }}>
              {charger.name}
            </Text>
            {!!location && (
              <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{location}</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ede9fe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Ionicons name="flash" size={11} color="#7c3aed" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#7c3aed" }}>Vista Operador</Text>
            </View>
            <View style={{ backgroundColor: charger.online ? "#dcfce7" : "#fee2e2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: charger.online ? "#15803d" : "#dc2626" }}>
                {charger.online ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {charger.connectors?.map((connector: any) => {
          const sc = getStatus(connector.status);
          const charging = isCharging(connector.status);
          const soc = connector.soc !== undefined ? Number(connector.soc) : undefined;
          const energy = connector.energyDelivered ?? connector.energy;

          return (
            <View
              key={connector.id}
              style={{ backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 16, marginBottom: 16 }}
            >
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                  Conector {connector.connectorId}
                </Text>
                <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: sc.color }}>{sc.label}</Text>
                </View>
              </View>

              {/* Vehicle + charging info — show whenever any data is available */}
              {(connector.vehicleId || soc !== undefined || connector.power !== undefined || energy !== undefined) && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  {connector.vehicleId && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>Vehículo</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                        {String(connector.vehicleId).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {soc !== undefined && (
                    <View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, color: "#6b7280" }}>Estado de Carga</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="battery-half" size={16} color="#2563eb" />
                          <Text style={{ fontSize: 18, fontWeight: "700", color: "#2563eb" }}>{soc}%</Text>
                        </View>
                      </View>
                      <View style={{ height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
                        <View style={{ height: 8, width: `${soc}%`, backgroundColor: "#3b82f6", borderRadius: 4 }} />
                      </View>
                      <Text style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic", marginTop: 4 }}>
                        SoC parcial — sin ETA (API no disponible)
                      </Text>
                    </View>
                  )}

                  {connector.power !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>Potencia</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{connector.power} kW</Text>
                    </View>
                  )}

                  {energy !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>Energía Entregada</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{Number(energy).toFixed(1)} kWh</Text>
                    </View>
                  )}
                </View>
              )}

              {/* CONTROLES REMOTOS */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#9333ea", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Controles Remotos
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {/* Start / Stop */}
                  {!charging ? (
                    <TouchableOpacity
                      onPress={() => runConnectorCmd("start", connector.id, connector.connectorId)}
                      disabled={actionLoading === `start-${connector.connectorId}`}
                      style={{ flex: 1, backgroundColor: "#22c55e", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading === `start-${connector.connectorId}` ? 0.5 : 1 }}
                    >
                      {actionLoading === `start-${connector.connectorId}` ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="play" size={15} color="white" />
                      )}
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>Iniciar Carga</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => runConnectorCmd("stop", connector.id, connector.connectorId)}
                      disabled={actionLoading === `stop-${connector.connectorId}`}
                      style={{ flex: 1, backgroundColor: "#3b82f6", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading === `stop-${connector.connectorId}` ? 0.5 : 1 }}
                    >
                      {actionLoading === `stop-${connector.connectorId}` ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="stop" size={15} color="white" />
                      )}
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>Detener Carga</Text>
                    </TouchableOpacity>
                  )}

                  {/* Unlock */}
                  <TouchableOpacity
                    onPress={() => runConnectorCmd("unlock", connector.id, connector.connectorId)}
                    disabled={actionLoading === `unlock-${connector.connectorId}`}
                    style={{ flex: 1, backgroundColor: "#4b5563", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: actionLoading === `unlock-${connector.connectorId}` ? 0.5 : 1 }}
                  >
                    {actionLoading === `unlock-${connector.connectorId}` ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="lock-open" size={15} color="white" />
                    )}
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>Desbloquear</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Acciones del Cargador */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 12 }}>
            Acciones del Cargador
          </Text>
          <TouchableOpacity
            onPress={runReboot}
            disabled={actionLoading === "reboot"}
            style={{ backgroundColor: "#f97316", paddingVertical: 14, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: actionLoading === "reboot" ? 0.5 : 1 }}
          >
            {actionLoading === "reboot" ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="reload" size={17} color="white" />
            )}
            <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>Reiniciar Cargador</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
