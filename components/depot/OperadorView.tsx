import { ScrollView, View, TouchableOpacity } from "react-native";
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

// Color palette - all colors unified in one place
const COLORS = {
  charging: "#1477FF",
  available: "#0ACDA9",
  finishing: "#a855f7",
  faulted: "#ef4444",
  online: "#22c55e",
};

const SessionCard = ({
  chargerName,
  connectorId,
  busId,
  energy,
  duration,
  colors,
}: {
  chargerName: string;
  connectorId?: number;
  busId?: string;
  energy: number;
  duration?: number;
  colors: ReturnType<typeof getThemeColors>;
}) => {
  const durationMin = duration ? Math.floor(duration / 60) : 0;

  return (
    <Card style={{ padding: spacing.md, marginBottom: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.xs }}>
            <Ionicons name="battery-charging" size={14} color={COLORS.charging} />
            <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
              {chargerName}
              {connectorId ? ` · C${connectorId}` : ""}
            </Text>
          </View>
          {busId && (
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
              BUS {busId}
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ color: COLORS.charging, fontWeight: "bold", fontSize: 13 }}>
            {energy.toFixed(1)} kWh
          </Text>
          {durationMin > 0 && (
            <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
              {durationMin} min
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};

interface OperadorViewProps {
  selectedLocation?: { location_id: string; location_name: string } | null;
}

export default function OperadorView({ selectedLocation }: OperadorViewProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const chargers = useChargersStore((state) => state.chargers || []);
  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);

  // TODO: Filter chargers by selected location after verifying data loads
  // For now, show all chargers to debug data loading

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
      {/* Conectores del Patio Section */}
      <View style={{ padding: spacing.lg }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.mutedForeground, marginBottom: spacing.md, textTransform: "uppercase" }}>
          Conectores del Patio
        </Text>
        <Card style={{ padding: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around", gap: spacing.sm }}>
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

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md }}>
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
            {activeSessions.map((item: any) => (
              <SessionCard
                key={item.id}
                chargerName={item.charger?.name || "Charger"}
                connectorId={item.connectorId}
                busId={item.vehicleId}
                energy={item.energy || 0}
                duration={item.duration}
                colors={colors}
              />
            ))}
          </View>
        </View>
      )}

      {/* Chargers by Location */}
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
