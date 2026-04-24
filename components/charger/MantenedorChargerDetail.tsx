import { useState } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "@/components/ui/Toast";
import { AppHeader } from "@/components/layout/AppHeader";

const mockEnergyData: Record<string, { voltage: number; current: number; power: number; temperature: number; frequency: number }> = {
  "cb-01-c01":   { voltage: 230.5, current: 16.2, power: 3.734, temperature: 42.5, frequency: 50.01 },
  "cb-01-c02":   { voltage: 228.1, current: 20.1, power: 4.6,   temperature: 35.2, frequency: 50.0  },
  "cb-02-c01":   { voltage: 231.0, current: 18.5, power: 4.27,  temperature: 28.0, frequency: 50.0  },
  "cb-02-c02":   { voltage: 229.3, current: 0,    power: 0,     temperature: 38.1, frequency: 50.0  },
  "cb-01-b-c01": { voltage: 226.2, current: 25.0, power: 5.65,  temperature: 42.0, frequency: 50.0  },
  "cb-01-b-c02": { voltage: 230.0, current: 0,    power: 0,     temperature: 31.0, frequency: 50.0  },
  "cb-03-c01":   { voltage: 229.8, current: 0,    power: 0,     temperature: 25.0, frequency: 50.0  },
  "cb-03-c02":   { voltage: 230.1, current: 0,    power: 0,     temperature: 24.5, frequency: 50.0  },
};

// Handles both lowercase (API) and PascalCase (mock)
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

export function MantenedorChargerDetail({ charger }: { charger: any }) {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const executeCommand = async (command: string) => {
    setActionLoading(command);
    await new Promise((r) => setTimeout(r, 1500));
    setActionLoading(null);
    useToastStore.getState().show(`${command} ejecutado`, "success", "Comando OK");
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ccfbf1", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Ionicons name="construct" size={11} color="#0d9488" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#0d9488" }}>Vista Mantenedor</Text>
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
          const connectorKey = `${charger.id}-c0${connector.connectorId}`;
          const energy = mockEnergyData[connectorKey];
          const soc = connector.soc !== undefined ? Number(connector.soc) : undefined;
          const connEnergy = connector.energyDelivered ?? connector.energy;
          const tempHigh = energy && energy.temperature > 45;

          return (
            <View
              key={connector.id}
              style={{ backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 16, marginBottom: 16 }}
            >
              {/* Connector header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
                  Conector {connector.connectorId}
                </Text>
                <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: sc.color }}>{sc.label}</Text>
                </View>
              </View>

              {/* Vehicle & charging info */}
              {connector.vehicleId && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 14, color: "#6b7280" }}>Vehículo</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                      {String(connector.vehicleId).toUpperCase()}
                    </Text>
                  </View>

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

                  {connEnergy !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: "#6b7280" }}>Energía Entregada</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>{connEnergy} kWh</Text>
                    </View>
                  )}
                </View>
              )}

              {/* VARIABLES ENERGÉTICAS — separator + grid */}
              <View style={{ borderTopWidth: connector.vehicleId ? 1 : 0, borderTopColor: "#f3f4f6", paddingTop: connector.vehicleId ? 12 : 0 }}>
                {energy ? (
                  <View>
                    {/* Section header with "Ver curvas" */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="pulse" size={13} color="#0d9488" />
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#0d9488", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          Variables Energéticas
                        </Text>
                      </View>
                      <TouchableOpacity style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ccfbf1", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Ionicons name="bar-chart" size={11} color="#0d9488" />
                        <Text style={{ fontSize: 11, fontWeight: "500", color: "#0d9488" }}>Ver curvas</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 2x2 energy grid */}
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {/* Voltaje */}
                        <TouchableOpacity style={{ flex: 1, backgroundColor: "#f0fdfa", borderRadius: 8, padding: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <Ionicons name="speedometer" size={12} color="#0d9488" />
                            <Text style={{ fontSize: 11, color: "#0d9488" }}>Voltaje</Text>
                          </View>
                          <Text style={{ fontSize: 17, fontWeight: "700", color: "#0f766e" }}>
                            {energy.voltage} V
                          </Text>
                        </TouchableOpacity>
                        {/* Corriente */}
                        <TouchableOpacity style={{ flex: 1, backgroundColor: "#eff6ff", borderRadius: 8, padding: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <Ionicons name="flash" size={12} color="#2563eb" />
                            <Text style={{ fontSize: 11, color: "#2563eb" }}>Corriente</Text>
                          </View>
                          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1d4ed8" }}>
                            {energy.current} A
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {/* Potencia */}
                        <TouchableOpacity style={{ flex: 1, backgroundColor: "#faf5ff", borderRadius: 8, padding: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <Ionicons name="pulse" size={12} color="#9333ea" />
                            <Text style={{ fontSize: 11, color: "#9333ea" }}>Potencia</Text>
                          </View>
                          <Text style={{ fontSize: 17, fontWeight: "700", color: "#7e22ce" }}>
                            {energy.power} kW
                          </Text>
                        </TouchableOpacity>
                        {/* Temperatura */}
                        <TouchableOpacity style={{ flex: 1, backgroundColor: tempHigh ? "#fef2f2" : "#fff7ed", borderRadius: 8, padding: 10 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                            <Ionicons name="thermometer" size={12} color={tempHigh ? "#dc2626" : "#ea580c"} />
                            <Text style={{ fontSize: 11, color: tempHigh ? "#dc2626" : "#ea580c" }}>Temperatura</Text>
                          </View>
                          <Text style={{ fontSize: 17, fontWeight: "700", color: tempHigh ? "#b91c1c" : "#c2410c" }}>
                            {energy.temperature} °C
                          </Text>
                          {tempHigh && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
                              <Ionicons name="alert-circle" size={10} color="#dc2626" />
                              <Text style={{ fontSize: 9, color: "#dc2626", fontWeight: "600" }}>Temperatura alta</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Frecuencia row */}
                    <View style={{ backgroundColor: "#f9fafb", borderRadius: 8, padding: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <Text style={{ fontSize: 12, color: "#6b7280" }}>Frecuencia</Text>
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827" }}>{energy.frequency} Hz</Text>
                    </View>

                    {/* Hint */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 }}>
                      <Ionicons name="bar-chart" size={10} color="#0d9488" />
                      <Text style={{ fontSize: 11, color: "#0d9488" }}>Toca las variables para ver gráfico de curvas</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ backgroundColor: "#f9fafb", borderRadius: 8, padding: 16, alignItems: "center" }}>
                    <Ionicons name="pulse" size={20} color="#9ca3af" />
                    <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Sin datos energéticos para este conector</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Herramientas Técnicas */}
        <View style={{ backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 12 }}>
            Herramientas Técnicas
          </Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => executeCommand("reboot")}
              disabled={actionLoading === "reboot"}
              style={{ backgroundColor: "#f97316", paddingVertical: 14, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: actionLoading === "reboot" ? 0.5 : 1 }}
            >
              {actionLoading === "reboot" ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="reload" size={17} color="white" />}
              <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>Reiniciar Cargador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(app)/charger/${id}/ocpp` as any)}
              style={{ backgroundColor: "#f3f4f6", paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="chatbubble-ellipses" size={17} color="#374151" />
              <Text style={{ fontSize: 14, fontWeight: "500", color: "#374151" }}>Ver Mensajes OCPP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(app)/charger/${id}/config` as any)}
              style={{ backgroundColor: "#f0fdfa", borderWidth: 1, borderColor: "#99f6e4", paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="settings" size={17} color="#0d9488" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#0d9488" }}>Configuración OCPP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
