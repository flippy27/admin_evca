import { EnergyVariable, EnergyVariablesModal } from "@/components/charger/EnergyVariablesModal";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { getAllChargerIdsFromGroup, parsePanelPowerKw, useChargerPanelStore } from "@/lib/stores/charger-panel.store";
import { ChargerPanel } from "@/lib/types/charger-panel.types";
import { GroupCharger, GroupData } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, RefreshControl, ScrollView, View } from "react-native";
import { useTranslation } from "react-i18next";

import { ChargerEnergyPanel } from "./ChargerEnergyPanel";
import { EnergyOverview } from "./EnergyOverview";
import { HealthStatusGrid } from "./HealthStatusGrid";

function mapCharger(gc: GroupCharger, panel?: ChargerPanel) {
  return {
    id: String(gc.charger_ID),
    name: gc.charger_name,
    online: gc.connectors.some((c) => {
      const pc = panel?.connectors.find((p) => p.connector_id === c.connector_id);
      return (pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase()) !== "offline";
    }),
    connectors: gc.connectors.map((c) => {
      const pc = panel?.connectors.find((p) => p.connector_id === c.connector_id);
      // Live power_kw from panel; fall back to last_charging_record
      const livePower = parsePanelPowerKw(pc?.session?.power_kw);
      return {
        id: c.connector_id,
        connectorId: c.connector_number,
        status: pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase(),
        voltage: +Number(c.last_charging_record?.voltage ?? 0).toFixed(1),
        current: +Number(c.last_charging_record?.current ?? 0).toFixed(1),
        power: livePower != null ? +livePower.toFixed(1) : +Number(c.last_charging_record?.power ?? 0).toFixed(1),
        energy: +Number(pc?.session?.energy_kwh ?? c.last_charging_record?.energy ?? 0).toFixed(1),
        temperature: 0, // API no provee temperatura aún
      };
    }),
  };
}

function buildGroups(data: GroupData, panels: Record<string, ChargerPanel>) {
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
        chargers: chargers
          .sort((a, b) => a.charger_order - b.charger_order)
          .map((gc) => mapCharger(gc, panels[String(gc.charger_ID)])),
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
            .map((gc) => mapCharger(gc, panels[String(gc.charger_ID)])),
        },
      ],
    },
  ];
}

export default function MantenedorView() {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId);

  const statusConfigMap: Record<string, { label: string; color: string }> = {
    available:   { label: t("mobile.status.available"),   color: "#0ACDA9" },
    preparing:   { label: t("mobile.status.preparing"),   color: "#0ACDA9" },
    charging:    { label: t("mobile.status.charging"),    color: "#8b5cf6" },
    finishing:   { label: t("mobile.status.finishing"),   color: "#a855f7" },
    faulted:     { label: t("mobile.status.faulted"),     color: "#ef4444" },
    suspended:   { label: t("mobile.status.suspended"),   color: "#eab308" },
    unavailable: { label: t("mobile.status.unavailable"), color: "#9ca3af" },
    offline:     { label: t("mobile.status.offline"),     color: "#9ca3af" },
  };
  const groupData = useGroupStore((s) => s.groupData);
  const groupLoading = useGroupStore((s) => s.groupLoading);
  const groupError = useGroupStore((s) => s.groupError);
  const panels = useChargerPanelStore((s) => s.panels);
  const [refreshing, setRefreshing] = useState(false);
  const [siteModalKey, setSiteModalKey] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedInitialPanels = useRef(false);

  const silentFetch = useCallback(() => {
    if (!selectedLocationId) return;
    useGroupStore.getState().fetchGroup(selectedLocationId, true);
    const gd = useGroupStore.getState().groupData;
    if (gd) {
      useChargerPanelStore.getState().fetchPanelsForGroup(
        gd.site.site_ID,
        getAllChargerIdsFromGroup(gd)
      );
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (!selectedLocationId) return;
    silentFetch();
    intervalRef.current = setInterval(silentFetch, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedLocationId, silentFetch]);

  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && selectedLocationId) {
        silentFetch();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [selectedLocationId, silentFetch]);

  useEffect(() => {
    if (!groupData || !selectedLocationId || hasFetchedInitialPanels.current) return;
    hasFetchedInitialPanels.current = true;
    const ids = getAllChargerIdsFromGroup(groupData);
    if (ids.length > 0) {
      useChargerPanelStore.getState().fetchPanelsForGroup(groupData.site.site_ID, ids);
    }
  }, [groupData, selectedLocationId]);

  useEffect(() => {
    hasFetchedInitialPanels.current = false;
    useChargerPanelStore.getState().clearPanels();
  }, [selectedLocationId]);

  const handleRefresh = useCallback(async () => {
    if (!selectedLocationId) return;
    setRefreshing(true);
    try {
      await useGroupStore.getState().fetchGroup(selectedLocationId);
    } finally {
      setRefreshing(false);
    }
  }, [selectedLocationId]);

  const groups = useMemo(() => (groupData ? buildGroups(groupData, panels) : []), [groupData, panels]);

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
        label: t("mobile.depot.overview.avgVoltage"),
        unit: "V",
        icon: "speedometer",
        color: "#8b5cf6",
        bg: "#faf5ff",
        value: parseFloat(energyStats.avgVoltage) || 0,
      },
      {
        key: "current",
        label: t("mobile.depot.overview.avgCurrent"),
        unit: "A",
        icon: "flash",
        color: "#2563eb",
        bg: "#eff6ff",
        value: parseFloat(energyStats.avgCurrent) || 0,
      },
      {
        key: "power",
        label: t("mobile.depot.overview.totalPower"),
        unit: "kW",
        icon: "pulse",
        color: "#8b5cf6",
        bg: "#faf5ff",
        value: parseFloat(energyStats.totalPower) || 0,
      },
      {
        key: "energy",
        label: t("mobile.depot.overview.totalEnergy"),
        unit: "kWh",
        icon: "battery-charging",
        color: "#06b6d4",
        bg: "#ecfeff",
        value: parseFloat(energyStats.totalEnergy) || 0,
      },
    ],
    [energyStats, t],
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
        title={t("mobile.depot.overview.energySummaryTitle")}
        subtitle={t("mobile.depot.overview.allConnectorsSubtitle")}
        variables={siteModalVars}
        initialKey={siteModalKey ?? undefined}
      />
    </View>
  );
}
