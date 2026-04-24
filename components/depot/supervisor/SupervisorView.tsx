import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { getThemeColors, spacing } from "@/theme";
import { useEffect, useMemo } from "react";
import { ScrollView, View } from "react-native";

import { KPICard } from "../shared/KPICard";
import { AlertsSection } from "./AlertsSection";
import { ChargersList } from "./ChargersList";
import { DistributionBar } from "./DistributionBar";

export default function SupervisorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const chargers = useChargersStore((state) => state.chargers || []);
  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);

  useEffect(() => {
    if (selectedLocationId) {
      useChargingSessionsStore.getState().fetchSessions({
        payload: {
          location_ids: [selectedLocationId],
        },
        pagination: {
          page: 1,
          per_page: 20,
        },
      });
    }
  }, [selectedLocationId]);

  const stats = useMemo(() => {
    const charging = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "charging").length || 0), 0);
    const faulted = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "faulted").length || 0), 0);
    const finishing = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "finishing").length || 0), 0);
    const available = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "available").length || 0), 0);
    const suspended = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "suspended").length || 0), 0);
    const online = chargers.filter((c: any) => c.online).length;
    const totalEnergy = sessions
      .filter((s: any) => s.status === "Active" || s.status === "active")
      .reduce((sum: number, s: any) => sum + (s.energy || 0), 0);

    const total = chargers.reduce((sum, c: any) => {
      const activeCount = c.connectors?.filter((cn: any) => cn.status !== "offline" && cn.status !== "unavailable").length || 0;
      return sum + activeCount;
    }, 0);

    const unavailable = total - charging - faulted - finishing - available - suspended;

    return {
      utilization: total > 0 ? Math.round((charging / total) * 100) : 0,
      totalEnergy: totalEnergy.toFixed(1),
      online,
      totalChargers: chargers.length,
      faulted,
      charging,
      finishing,
      available,
      suspended,
      unavailable: Math.max(0, unavailable),
      total,
    };
  }, [chargers, sessions]);

  // const chargersByLocation = useMemo(() => {
  //   const map = new Map();
  //   chargers.forEach((c: any) => {
  //     const loc = c.site?.name || c.location || "Unknown";
  //     if (!map.has(loc)) map.set(loc, []);
  //     map.get(loc).push(c);
  //   });
  //   return Array.from(map.entries());
  // }, [chargers]);
  const chargersByLocation = useMemo(() => {
    return chargers;
  }, [chargers]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* KPI Cards */}
      <View style={{ padding: spacing.lg }}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "space-between",
            rowGap: spacing.md,
          }}
        >
          <View style={{ width: "48%", minHeight: 140 }}>
            <KPICard
              icon="trending-up"
              iconColor={colors.secondary}
              label="Utilización"
              value={`${stats.utilization}%`}
              subtitle={`${stats.charging} de ${stats.total} conectores`}
            />
          </View>

          <View style={{ width: "48%", minHeight: 140 }}>
            <KPICard
              icon="flash"
              iconColor={colors.primary}
              label="Energía Total"
              value={`${stats.totalEnergy} kWh`}
              subtitle="entregados hoy"
            />
          </View>

          <View style={{ width: "48%", minHeight: 140 }}>
            <KPICard
              icon="pulse"
              iconColor={colors.primary}
              label="Cargadores"
              value={`${stats.online}/${stats.totalChargers}`}
              subtitle="online"
            />
          </View>

          <View style={{ width: "48%", minHeight: 140 }}>
            <KPICard
              icon="alert-circle"
              iconColor={stats.faulted > 0 ? colors.destructive : "#9ca3af"}
              label="Alertas"
              value={stats.faulted}
              subtitle={stats.faulted > 0 ? "con falla activa" : "sin alertas"}
              backgroundColor={stats.faulted > 0 ? `${colors.destructive}10` : colors.card}
            />
          </View>
        </View>
      </View>

      <DistributionBar
        charging={stats.charging}
        finishing={stats.finishing}
        available={stats.available}
        faulted={stats.faulted}
        suspended={stats.suspended}
        total={stats.total}
      />

      <AlertsSection chargers={chargers} />

      <ChargersList chargersByLocation={chargersByLocation} />
    </ScrollView>
  );
}
