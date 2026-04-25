import { ScrollView, TouchableOpacity, View, SafeAreaView } from "react-native";
import { useNavigation } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/layout/AppHeader";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  preparing:   { label: "Preparando",    bg: "#f3f4f6",  color: "#0ACDA9" },
  charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  occupied:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  offline:     { label: "Offline",       bg: "#f3f4f6",  color: "#9ca3af" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status?.toLowerCase()] || { label: status, bg: "#f3f4f6", color: "#9ca3af" };
}

function isCharging(status: string) {
  return status === "Charging" || status === "charging" || status === "occupied";
}

export function SupervisorChargerDetail({ charger }: { charger: any }) {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const location = charger.location || charger.site?.name || charger.siteName || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader hideRoleSelector={true} />

      {/* Page header */}
      <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, lineHeight: 28 }}>
              {charger.name}
            </Text>
            {!!location && (
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>{location}</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#dcfce7", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Ionicons name="eye" size={11} color="#16a34a" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#16a34a" }}>Vista Supervisor</Text>
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
              style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
                  Conector {connector.connectorId}
                </Text>
                <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: sc.color }}>{sc.label}</Text>
                </View>
              </View>

              {connector.vehicleId && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Vehículo</Text>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                      {String(connector.vehicleId).toUpperCase()}
                    </Text>
                  </View>

                  {soc !== undefined && (
                    <View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Estado de Carga</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="battery-half" size={16} color="#2563eb" />
                          <Text style={{ fontSize: 18, fontWeight: "700", color: "#2563eb" }}>{soc}%</Text>
                        </View>
                      </View>
                      <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" }}>
                        <View style={{ height: 8, width: `${soc}%`, backgroundColor: "#3b82f6", borderRadius: 4 }} />
                      </View>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontStyle: "italic", marginTop: 4 }}>
                        SoC parcial — sin ETA (API no disponible)
                      </Text>
                    </View>
                  )}

                  {connector.power !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Potencia</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{connector.power} kW</Text>
                    </View>
                  )}

                  {energy !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Energía Entregada</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{energy} kWh</Text>
                    </View>
                  )}
                </View>
              )}

              {charging && (
                <View style={{ backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 8, padding: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <Ionicons name="time" size={13} color="#16a34a" />
                    <Text style={{ fontSize: 12, fontWeight: "600", color: "#16a34a" }}>Sesión en curso</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 24 }}>
                    <Text style={{ fontSize: 12, color: "#16a34a" }}>
                      Potencia: <Text style={{ fontWeight: "700" }}>{connector.power || 0} kW</Text>
                    </Text>
                    <Text style={{ fontSize: 12, color: "#16a34a" }}>
                      Entregado: <Text style={{ fontWeight: "700" }}>{energy || 0} kWh</Text>
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Información del Cargador */}
        <View style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            Información del Cargador
          </Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => router.push(`/(app)/charger/${id}/ocpp` as any)}
              style={{ backgroundColor: colors.muted, paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="chatbubble-ellipses" size={17} color={colors.foreground} />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>Ver Mensajes OCPP</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/(app)/sessions" as any)}
              style={{ backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="time" size={17} color="#16a34a" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#16a34a" }}>Ver Historial de Sesiones</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
