import { ScrollView, View, FlatList, TouchableOpacity } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useEffect, useMemo } from "react";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import ConnectorBadge from "./ConnectorBadge";

export default function OperadorView() {
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
    return {
      charging: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Charging").length || 0), 0),
      available: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Available").length || 0), 0),
      finishing: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Finishing").length || 0), 0),
      faulted: chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0), 0),
      total: chargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0),
    };
  }, [chargers]);

  const activeSessions = useMemo(() => {
    return sessions.filter((s: any) => s.status === "Active" || s.status === "active").slice(0, 3);
  }, [sessions]);

  const chargersByLocation = useMemo(() => {
    const map = new Map();
    chargers.forEach((c: any) => {
      const loc = c.site?.name || c.location || "Unknown";
      if (!map.has(loc)) map.set(loc, []);
      map.get(loc).push(c);
    });
    return Array.from(map.entries());
  }, [chargers]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Stats Grid */}
      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: spacing.md,
          }}
        >
          <Card
            style={{
              flex: 1,
              minWidth: "45%",
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#1477FF" }}>
              {stats.charging}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
              Cargando
            </Text>
          </Card>
          <Card
            style={{
              flex: 1,
              minWidth: "45%",
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0ACDA9" }}>
              {stats.available}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
              Disponible
            </Text>
          </Card>
          <Card
            style={{
              flex: 1,
              minWidth: "45%",
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#a855f7" }}>
              {stats.finishing}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
              Finalizando
            </Text>
          </Card>
          <Card
            style={{
              flex: 1,
              minWidth: "45%",
              padding: spacing.md,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "bold", color: "#ef4444" }}>
              {stats.faulted}
            </Text>
            <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
              Falla
            </Text>
          </Card>
        </View>
      </View>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: spacing.md,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              Sesiones Activas ({activeSessions.length})
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("(app)" as any, { screen: "sessions" } as any)}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "500" }}>
                Ver todas →
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            scrollEnabled={false}
            data={activeSessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 12 }}>
                      {item.charger?.name || "Charger"}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11, marginTop: spacing.xs }}>
                      Bus {item.vehicleId || "?"}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primary, fontWeight: "bold", fontSize: 13 }}>
                    {item.energy?.toFixed(1) || 0} kWh
                  </Text>
                </View>
              </Card>
            )}
          />
        </View>
      )}

      {/* Chargers by Location */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl }}>
        {chargersByLocation.map(([location, locationChargers]) => (
          <View key={location} style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
              {location}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {(locationChargers as any[]).map((charger: any) => (
                <Card key={charger.id} style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm }}>
                    <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
                      {charger.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: spacing.xs,
                      }}
                    >
                      <Ionicons name="flash" size={12} color={charger.online ? "#22c55e" : colors.mutedForeground} />
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                        {charger.connectors?.filter((c: any) => c.status === "Charging").length || 0}/{charger.connectors?.length || 0}
                      </Text>
                    </View>
                  </View>
                  {charger.connectors?.map((connector: any) => (
                    <ConnectorBadge
                      key={connector.id}
                      connectorId={connector.connectorId}
                      status={connector.status}
                      soc={connector.soc}
                      vehicleId={connector.vehicleId}
                      power={connector.power}
                      showVehicle={connector.status === "Charging" || connector.status === "Finishing"}
                    />
                  ))}
                </Card>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
