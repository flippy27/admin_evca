import { ScrollView, View, TouchableOpacity } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useEffect, useMemo } from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Mock energy data per connector
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

interface MantenedorViewProps {
  selectedLocation?: { location_id: string; location_name: string } | null;
}

export default function MantenedorView({ selectedLocation }: MantenedorViewProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const chargers = useChargersStore((state) => state.chargers || []);

  useEffect(() => {
    useChargersStore.getState().fetchChargers();
  }, []);

  const stats = useMemo(() => {
    const total = chargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0);
    const faulted = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0),
      0
    );
    const suspended = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Suspended").length || 0),
      0
    );

    return {
      total,
      faulted,
      suspended,
      healthy: total - faulted - suspended,
    };
  }, [chargers]);

  const energyStats = useMemo(() => {
    const energyEntries = Object.values(mockEnergyData);
    const avgVoltage =
      energyEntries.length > 0
        ? energyEntries.reduce((sum, d) => sum + d.voltage, 0) / energyEntries.length
        : 0;
    const avgTemp =
      energyEntries.length > 0
        ? energyEntries.reduce((sum, d) => sum + d.temperature, 0) / energyEntries.length
        : 0;
    const totalPower = energyEntries.reduce((sum, d) => sum + d.power, 0);
    const maxTemp =
      energyEntries.length > 0 ? Math.max(...energyEntries.map((d) => d.temperature)) : 0;

    return {
      avgVoltage: avgVoltage.toFixed(1),
      avgTemp: avgTemp.toFixed(1),
      totalPower: totalPower.toFixed(2),
      maxTemp: maxTemp.toFixed(1),
    };
  }, []);

  const chargersByLocation = useMemo(() => {
    const map = new Map();
    chargers.forEach((c: any) => {
      const loc = c.site?.name || c.location || "Unknown";
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc).push(c);
    });
    return Array.from(map.entries());
  }, [chargers]);

  const getEnergyData = (chargerId: string, connectorId: number) => {
    return mockEnergyData[`${chargerId}-c0${connectorId}`] || {
      voltage: 230,
      current: 0,
      power: 0,
      temperature: 25,
      frequency: 50,
    };
  };

  const getConnectorStatusLabel = (status: string) => {
    const config: Record<string, { label: string; color: string }> = {
      Available: { label: "Disponible", color: colors.text },
      Charging: { label: "Cargando", color: colors.primary },
      Finishing: { label: "Finalizando", color: "#a855f7" },
      Faulted: { label: "Falla", color: colors.destructive },
      Suspended: { label: "Suspendido", color: "#eab308" },
      Unavailable: { label: "No disponible", color: colors.mutedForeground },
    };
    return config[status] || config.Available;
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Energy Overview */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
          Resumen Energético del Patio
        </Text>
        <View style={{ gap: spacing.sm }}>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Card style={{ flex: 1, padding: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
                <Ionicons name="speedometer" size={14} color="#14b8a6" />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Voltaje Prom.</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#14b8a6" }}>
                {energyStats.avgVoltage} V
              </Text>
            </Card>
            <Card style={{ flex: 1, padding: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
                <Ionicons name="thermometer" size={14} color={parseInt(energyStats.maxTemp) > 45 ? colors.destructive : "#ea580c"} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Temp. Máx.</Text>
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: parseInt(energyStats.maxTemp) > 45 ? colors.destructive : "#ea580c",
                }}
              >
                {energyStats.maxTemp} °C
              </Text>
              {parseInt(energyStats.maxTemp) > 45 && (
                <Text style={{ fontSize: 9, color: colors.destructive, marginTop: spacing.xs }}>
                  ⚠️ Alta
                </Text>
              )}
            </Card>
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Card style={{ flex: 1, padding: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
                <Ionicons name="flash" size={14} color={colors.primary} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Potencia Total</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.primary }}>
                {energyStats.totalPower} kW
              </Text>
            </Card>
            <Card style={{ flex: 1, padding: spacing.md }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
                <Ionicons name="pulse" size={14} color="#06b6d4" />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Temp. Prom.</Text>
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#06b6d4" }}>
                {energyStats.avgTemp} °C
              </Text>
            </Card>
          </View>
        </View>
      </View>

      {/* Health Status */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
          Salud de Conectores
        </Text>
        <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#22c55e", marginBottom: spacing.xs }}>
              {stats.healthy}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Operativos</Text>
          </Card>
          <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.destructive, marginBottom: spacing.xs }}>
              {stats.faulted}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Con Falla</Text>
          </Card>
          <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#eab308", marginBottom: spacing.xs }}>
              {stats.suspended}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Suspendidos</Text>
          </Card>
        </View>
      </View>

      {/* Chargers with Energy Data */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {chargersByLocation.map(([location, locationChargers]) => (
          <View key={location} style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
              {location}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {(locationChargers as any[]).map((charger: any) => {
                const faultedCount = charger.connectors?.filter((c: any) => c.status === "Faulted").length || 0;

                return (
                  <TouchableOpacity
                    key={charger.id}
                    onPress={() =>
                      navigation.navigate("(app)" as any, { screen: "charger", params: { id: charger.id } } as any)
                    }
                  >
                    <Card
                      style={{
                        padding: spacing.md,
                        backgroundColor: faultedCount > 0 ? `${colors.destructive}10` : colors.card,
                      }}
                    >
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
                        <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
                          {charger.name}
                        </Text>
                        <View style={{ flexDirection: "row", gap: spacing.sm }}>
                          <View
                            style={{
                              backgroundColor: charger.online ? "#22c55e" : colors.mutedForeground,
                              paddingHorizontal: spacing.xs,
                              paddingVertical: spacing.xs / 2,
                              borderRadius: 4,
                            }}
                          >
                            <Text style={{ fontSize: 10, color: "white", fontWeight: "500" }}>
                              {charger.online ? "Online" : "Offline"}
                            </Text>
                          </View>
                          {faultedCount > 0 && (
                            <View style={{ backgroundColor: colors.destructive, paddingHorizontal: spacing.xs, paddingVertical: spacing.xs / 2, borderRadius: 4 }}>
                              <Text style={{ fontSize: 10, color: "white", fontWeight: "600" }}>
                                {faultedCount}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* Energy readings per connector */}
                      <View style={{ gap: spacing.sm }}>
                        {charger.connectors?.map((connector: any) => {
                          const energy = getEnergyData(charger.id, connector.connectorId);
                          const statusLabel = getConnectorStatusLabel(connector.status);

                          return (
                            <View
                              key={connector.id}
                              style={{
                                borderWidth: 1,
                                borderColor: connector.status === "Faulted" ? colors.destructive : colors.border,
                                borderRadius: 6,
                                padding: spacing.sm,
                                backgroundColor:
                                  connector.status === "Faulted"
                                    ? `${colors.destructive}10`
                                    : `${colors.muted}20`,
                              }}
                            >
                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: spacing.xs,
                                }}
                              >
                                <Text style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}>
                                  C{connector.connectorId}
                                </Text>
                                <View
                                  style={{
                                    backgroundColor: statusLabel.color + "20",
                                    paddingHorizontal: spacing.xs,
                                    paddingVertical: spacing.xs / 2,
                                    borderRadius: 4,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 10,
                                      fontWeight: "500",
                                      color: statusLabel.color,
                                    }}
                                  >
                                    {statusLabel.label}
                                  </Text>
                                </View>
                              </View>

                              <View
                                style={{
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  gap: spacing.xs,
                                }}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 9, color: colors.mutedForeground }}>V</Text>
                                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>
                                    {energy.voltage}
                                  </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 9, color: colors.mutedForeground }}>A</Text>
                                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>
                                    {energy.current}
                                  </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 9, color: colors.mutedForeground }}>kW</Text>
                                  <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>
                                    {energy.power}
                                  </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={{ fontSize: 9, color: colors.mutedForeground }}>°C</Text>
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      fontWeight: "600",
                                      color: energy.temperature > 45 ? colors.destructive : colors.foreground,
                                    }}
                                  >
                                    {energy.temperature}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </Card>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
