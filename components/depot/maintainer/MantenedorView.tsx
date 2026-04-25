import { EnergyVariable, EnergyVariablesModal } from "@/components/charger/EnergyVariablesModal";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { GroupCharger, GroupData } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";

import { ChargerEnergyPanel } from "./ChargerEnergyPanel";
import { EnergyOverview } from "./EnergyOverview";
import { HealthStatusGrid } from "./HealthStatusGrid";

const statusConfigMap: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "#0ACDA9" },
  preparing: { label: "Preparando", color: "#0ACDA9" },
  charging: { label: "Cargando", color: "#8b5cf6" },
  finishing: { label: "Finalizando", color: "#a855f7" },
  faulted: { label: "Falla", color: "#ef4444" },
  suspended: { label: "Suspendido", color: "#eab308" },
  unavailable: { label: "No disponible", color: "#9ca3af" },
  offline: { label: "Offline", color: "#9ca3af" },
};

function mapCharger(gc: GroupCharger) {
  return {
    id: String(gc.charger_ID),
    name: gc.charger_name,
    online: gc.connectors.some((c) => c.connector_status.toLowerCase() !== "offline"),
    connectors: gc.connectors.map((c) => ({
      id: c.connector_id,
      connectorId: c.connector_number,
      status: c.connector_status.toLowerCase(),
      // Energy from last recorded values
      voltage: +(c.last_charging_record?.voltage ?? c.connector_max_voltage ?? 0).toFixed(1),
      current: +(c.last_charging_record?.current ?? 0).toFixed(1),
      power: +(c.last_charging_record?.power ?? 0).toFixed(1),
      energy: +(c.last_charging_record?.energy ?? 0).toFixed(1),
    })),
  };
}

function buildGroups(data: GroupData) {
  if (data.areas.length > 0) {
    const areaMap = new Map<string, Map<string, GroupCharger[]>>();
    for (const area of data.areas) {
      if (!areaMap.has(area.area_name)) areaMap.set(area.area_name, new Map());
      const lineMap = areaMap.get(area.area_name)!;
      for (const line of area.lines ?? []) {
        if (!lineMap.has(line.line_name)) lineMap.set(line.line_name, []);
        lineMap.get(line.line_name)!.push(...line.chargers);
      }
    }
    return Array.from(areaMap.entries()).map(([areaName, lineMap]) => ({
      areaName,
      lines: Array.from(lineMap.entries()).map(([lineName, chargers]) => ({
        lineName,
        chargers: chargers.sort((a, b) => a.charger_order - b.charger_order).map(mapCharger),
      })),
    }));
  }
  return [
    {
      areaName: data.site.site_name,
      lines: [
        {
          lineName: "",
          chargers: data.chargers
            .slice()
            .sort((a, b) => a.charger_order - b.charger_order)
            .map(mapCharger),
        },
      ],
    },
  ];
}

export default function MantenedorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId);
  const { groupData, groupLoading, groupError } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);
  const [siteModalKey, setSiteModalKey] = useState<string | null>(null);

  const silentFetch = useCallback(() => {
    if (!selectedLocationId) return;
    useGroupStore.getState().fetchGroup(selectedLocationId);
  }, [selectedLocationId]);

  useEffect(() => {
    if (!selectedLocationId) return;
    silentFetch();
    const interval = setInterval(silentFetch, 3000);
    return () => clearInterval(interval);
  }, [selectedLocationId, silentFetch]);

  const handleRefresh = useCallback(async () => {
    if (!selectedLocationId) return;
    setRefreshing(true);
    try {
      await useGroupStore.getState().fetchGroup(selectedLocationId);
    } finally {
      setRefreshing(false);
    }
  }, [selectedLocationId]);

  const groups = useMemo(() => (groupData ? buildGroups(groupData) : []), [groupData]);

  const allChargers = useMemo(() => groups.flatMap((a) => a.lines.flatMap((l) => l.chargers)), [groups]);

  const stats = useMemo(() => {
    const total = allChargers.reduce((sum, c) => sum + (c.connectors?.length || 0), 0);
    const faulted = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "faulted").length || 0), 0);
    const suspended = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "suspended").length || 0), 0);
    return { total, faulted, suspended, healthy: total - faulted - suspended };
  }, [allChargers]);

  const energyStats = useMemo(() => {
    const allConnectors = allChargers.flatMap((c) => c.connectors ?? []);
    const active = allConnectors.filter((c) => c.status !== "offline" && c.status !== "unavailable");
    const n = active.length || 1;
    const avgVoltage = (active.reduce((s, c) => s + (c.voltage ?? 0), 0) / n).toFixed(1);
    const avgCurrent = (active.reduce((s, c) => s + (c.current ?? 0), 0) / n).toFixed(1);
    const totalPower = allConnectors.reduce((s, c) => s + (c.power ?? 0), 0).toFixed(1);
    const totalEnergy = allConnectors.reduce((s, c) => s + (c.energy ?? 0), 0).toFixed(1);
    return { avgVoltage, avgCurrent, totalPower, totalEnergy };
  }, [allChargers]);

  const siteModalVars = useMemo(
    (): EnergyVariable[] => [
      {
        key: "voltage",
        label: "Voltaje Prom.",
        unit: "V",
        icon: "speedometer",
        color: "#8b5cf6",
        bg: "#faf5ff",
        value: parseFloat(energyStats.avgVoltage) || 0,
      },
      {
        key: "current",
        label: "Corriente Prom.",
        unit: "A",
        icon: "flash",
        color: "#2563eb",
        bg: "#eff6ff",
        value: parseFloat(energyStats.avgCurrent) || 0,
      },
      {
        key: "power",
        label: "Potencia Total",
        unit: "kW",
        icon: "pulse",
        color: "#8b5cf6",
        bg: "#faf5ff",
        value: parseFloat(energyStats.totalPower) || 0,
      },
      {
        key: "energy",
        label: "Energía Total",
        unit: "kWh",
        icon: "battery-charging",
        color: "#06b6d4",
        bg: "#ecfeff",
        value: parseFloat(energyStats.totalEnergy) || 0,
      },
    ],
    [energyStats],
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
        <EnergyOverview
          avgVoltage={energyStats.avgVoltage}
          avgCurrent={energyStats.avgCurrent}
          totalPower={energyStats.totalPower}
          totalEnergy={energyStats.totalEnergy}
          onPressVariable={(key) => setSiteModalKey(key)}
        />
        <HealthStatusGrid healthy={stats.healthy} faulted={stats.faulted} suspended={stats.suspended} />

        {/* Initial load spinner */}
        {!groupData && groupLoading && (
          <View style={{ padding: spacing.xl, alignItems: "center" }}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {/* Error — only when no data */}
        {groupError && !groupData && (
          <View style={{ padding: spacing.lg }}>
            <Text style={{ color: colors.destructive, fontSize: 13 }}>{groupError}</Text>
          </View>
        )}

        {/* Areas → Lines → Chargers */}
        {groups.length > 0 && (
          <View style={{ paddingBottom: spacing.xl }}>
            {groups.map((area) => (
              <View key={area.areaName}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.xs,
                    paddingHorizontal: spacing.lg,
                    paddingTop: spacing.md,
                    paddingBottom: spacing.xs,
                  }}
                >
                  <Ionicons name="location-outline" size={13} color={colors.mutedForeground} />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      letterSpacing: 0.8,
                    }}
                  >
                    {area.areaName}
                  </Text>
                </View>

                {area.lines.map((line) => (
                  <View key={line.lineName || "__flat__"}>
                    {line.lineName ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.xs,
                          paddingHorizontal: spacing.lg + spacing.md,
                          paddingTop: spacing.xs,
                          paddingBottom: spacing.xs,
                        }}
                      >
                        <Ionicons name="git-branch-outline" size={11} color={colors.mutedForeground} />
                        <Text style={{ fontSize: 10, color: colors.mutedForeground }}>{line.lineName}</Text>
                      </View>
                    ) : null}

                    <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm }}>
                      {line.chargers.map((charger) => (
                        <ChargerEnergyPanel
                          key={charger.id}
                          charger={charger}
                          statusConfigMap={statusConfigMap}
                          onPress={() =>
                            router.push({
                              pathname: `/charger/${charger.id}` as any,
                              params: { chargerName: charger.name, role: "maintainer" },
                            })
                          }
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <EnergyVariablesModal
        visible={!!siteModalKey}
        onClose={() => setSiteModalKey(null)}
        title="Resumen Energético del Patio"
        subtitle="Todos los conectores activos — Últimos 30 min"
        variables={siteModalVars}
        initialKey={siteModalKey ?? undefined}
      />
    </View>
  );
}
