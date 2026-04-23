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
import ConnectorBadge from "./ConnectorBadge";
import { mockChargers, mockSessions } from "@/lib/data/mockData";

const COLORS = themeColors.connectorStatus;

export default function OperadorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const storeChargers = useChargersStore((state) => state.chargers || []);
  const storeSessions = useChargingSessionsStore((state: any) => state.sessions || []);

  // Use store data or mock data as fallback
  const chargers = storeChargers.length > 0 ? storeChargers : mockChargers;
  const sessions = storeSessions.length > 0 ? storeSessions : mockSessions;

  useEffect(() => {
    useChargersStore.getState().fetchChargers();
    useChargingSessionsStore.getState().fetchSessions({});
  }, []);

  // Stats from chargers
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
    return sessions.filter((s: any) => s.status === "Active" || s.status === "active").slice(0, 4);
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
      {/* Stats */}
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.mutedForeground, marginBottom: spacing.md, textTransform: "uppercase" }}>
          Conectores del Patio
        </Text>
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.charging }}>
                {stats.charging}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
                Cargando
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.available }}>
                {stats.available}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
                Disponible
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.finishing }}>
                {stats.finishing}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
                Finalizando
              </Text>
            </View>
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text style={{ fontSize: 28, fontWeight: "bold", color: COLORS.faulted }}>
                {stats.faulted}
              </Text>
              <Text style={{ color: colors.mutedForeground, fontSize: 12, marginTop: spacing.xs }}>
                Falla
              </Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Sessions */}
      {activeSessions.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.available }} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                Sesiones Activas ({activeSessions.length})
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("(app)" as any, { screen: "sessions" } as any)}>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "500" }}>
                Ver todas →
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
            {activeSessions.map((s: any) => (
              <Card key={s.id} style={{ padding: spacing.md }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View>
                    <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
                      {s.charger?.name || s.chargerId} · C{s.connectorId}
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                      BUS {s.vehicleId}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: COLORS.charging, fontWeight: "bold", fontSize: 13 }}>
                      {s.energy?.toFixed(1) || 0} kWh
                    </Text>
                    <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                      {s.duration ? Math.floor(s.duration / 60) : 0} min
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Chargers by location */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        {chargersByLocation.map(([location, locs]) => (
          <View key={location} style={{ marginBottom: spacing.lg }}>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
              {location}
            </Text>
            <View style={{ gap: spacing.sm }}>
              {(locs as any[]).map((charger: any) => (
                <Card key={charger.id} style={{ padding: spacing.md }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm }}>
                    <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
                      {charger.name}
                    </Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
                      <Ionicons name="flash" size={12} color={charger.online ? COLORS.online : colors.mutedForeground} />
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
