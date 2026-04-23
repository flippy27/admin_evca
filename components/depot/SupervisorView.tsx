import { ScrollView, View, TouchableOpacity } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useEffect, useMemo } from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ConnectorDot from "./ConnectorDot";

const COLORS = themeColors.connectorStatus;

interface SupervisorViewProps {
  selectedLocation?: { location_id: string; location_name: string } | null;
}

export default function SupervisorView({ selectedLocation }: SupervisorViewProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const chargers = useChargersStore((state) => state.chargers || []);
  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);

  useEffect(() => {
    useChargersStore.getState().fetchChargers();
    useChargingSessionsStore.getState().fetchSessions({});
  }, []);

  const stats = useMemo(() => {
    const charging = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Charging").length || 0), 0);
    const total = chargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0);
    const faulted = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0), 0);
    const online = chargers.filter((c: any) => c.online).length;
    const totalEnergy = sessions.filter((s: any) => s.status === "Active" || s.status === "active").reduce((sum: number, s: any) => sum + (s.energy || 0), 0);

    return {
      utilization: total > 0 ? Math.round((charging / total) * 100) : 0,
      totalEnergy: totalEnergy.toFixed(1),
      online,
      totalChargers: chargers.length,
      faulted,
      charging,
      finishing: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Finishing").length || 0), 0),
      available: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Available").length || 0), 0),
      suspended: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Suspended").length || 0), 0),
      unavailable: total - charging - faulted - (chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Finishing").length || 0), 0)) - (chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Available").length || 0), 0)) - (chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Suspended").length || 0), 0)),
      total,
    };
  }, [chargers, sessions]);

  const chargersByLocation = useMemo(() => {
    const map = new Map();
    chargers.forEach((c: any) => {
      const loc = c.site?.name || c.location || "Unknown";
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc).push(c);
    });
    return Array.from(map.entries());
  }, [chargers]);

  const faultedChargers = useMemo(() => {
    return chargers.filter((c: any) => c.connectors?.some((cn: any) => cn.status === "Faulted"));
  }, [chargers]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* KPI Cards */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View style={{ gap: spacing.md }}>
          <Card style={{ padding: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="trending-up" size={16} color={colors.secondary} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Utilización</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.secondary, marginBottom: spacing.xs }}>
              {stats.utilization}%
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {stats.charging} de {stats.total} conectores
            </Text>
          </Card>

          <Card style={{ padding: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="flash" size={16} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Energía Total</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.primary, marginBottom: spacing.xs }}>
              {stats.totalEnergy} kWh
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              entregados hoy
            </Text>
          </Card>

          <Card style={{ padding: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="pulse" size={16} color={colors.primary} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Cargadores</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.primary, marginBottom: spacing.xs }}>
              {stats.online}/{stats.totalChargers}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              online
            </Text>
          </Card>

          <Card
            style={{
              padding: spacing.md,
              backgroundColor: stats.faulted > 0 ? `${colors.destructive}10` : colors.card,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
              <Ionicons name="alert-circle" size={16} color={stats.faulted > 0 ? colors.destructive : colors.mutedForeground} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Alertas</Text>
            </View>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: stats.faulted > 0 ? colors.destructive : colors.mutedForeground, marginBottom: spacing.xs }}>
              {stats.faulted}
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {stats.faulted > 0 ? "con falla activa" : "sin alertas"}
            </Text>
          </Card>
        </View>
      </View>

      {/* Distribution Bar */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
          Distribución de Conectores
        </Text>
        <View style={{ height: 16, backgroundColor: colors.muted, borderRadius: 8, overflow: "hidden", flexDirection: "row", marginBottom: spacing.md }}>
          {stats.charging > 0 && (
            <View style={{ flex: stats.charging, backgroundColor: COLORS.charging }} />
          )}
          {stats.finishing > 0 && (
            <View style={{ flex: stats.finishing, backgroundColor: COLORS.finishing }} />
          )}
          {stats.available > 0 && (
            <View style={{ flex: stats.available, backgroundColor: COLORS.available }} />
          )}
          {stats.faulted > 0 && (
            <View style={{ flex: stats.faulted, backgroundColor: colors.destructive }} />
          )}
          {stats.suspended > 0 && (
            <View style={{ flex: stats.suspended, backgroundColor: COLORS.suspended }} />
          )}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
          {stats.charging > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.charging }} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Cargando ({stats.charging})</Text>
            </View>
          )}
          {stats.finishing > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.finishing }} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Finalizando ({stats.finishing})</Text>
            </View>
          )}
          {stats.available > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.available }} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Disponible ({stats.available})</Text>
            </View>
          )}
          {stats.faulted > 0 && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.destructive }} />
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Falla ({stats.faulted})</Text>
            </View>
          )}
        </View>
      </View>

      {/* Faulted Alerts */}
      {faultedChargers.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.destructive, marginBottom: spacing.md }}>
            ⚠️ Alertas Activas
          </Text>
          <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
            {faultedChargers.map((charger: any) =>
              charger.connectors?.filter((c: any) => c.status === "Faulted").map((connector: any) => (
                <TouchableOpacity key={connector.id} onPress={() => navigation.navigate("(app)" as any, { screen: "charger", params: { id: charger.id } } as any)}>
                  <Card style={{ padding: spacing.md, backgroundColor: `${colors.destructive}10`, borderColor: colors.destructive, borderWidth: 1 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View>
                        <Text style={{ fontWeight: "600", color: colors.destructive, fontSize: 13 }}>
                          {charger.name} · C{connector.connectorId}
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: spacing.xs }}>
                          Conector con falla
                        </Text>
                      </View>
                      <Text style={{ color: colors.primary, fontSize: 12 }}>Ver →</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      )}

      {/* Chargers List */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {chargersByLocation.map(([location, locationChargers]) => (
          <View key={location} style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
              {location}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {(locationChargers as any[]).map((charger: any) => (
                <Card key={charger.id} style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <ConnectorDot status={charger.online ? "Available" : "Unavailable"} size={10} />
                      <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
                        {charger.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                      {charger.connectors?.filter((c: any) => c.status === "Charging").length > 0 && (
                        <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 12 }}>
                          {charger.connectors.reduce((sum: number, c: any) => sum + (c.power || 0), 0)} kW
                        </Text>
                      )}
                      <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                        {charger.connectors?.filter((c: any) => c.status === "Charging").length || 0}/{charger.connectors?.length || 0}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" }}>
                    {charger.connectors?.map((connector: any) => (
                      <ConnectorDot key={connector.id} status={connector.status} size={16} />
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
