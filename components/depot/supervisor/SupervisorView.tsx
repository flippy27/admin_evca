import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { getAllChargerIdsFromGroup, parsePanelPowerKw, useChargerPanelStore } from "@/lib/stores/charger-panel.store";
import { ChargerPanel } from "@/lib/types/charger-panel.types";
import { GroupCharger } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, AppState, AppStateStatus, RefreshControl, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { useTranslation } from "react-i18next";

import { KPICard } from "../shared/KPICard";
import { AlertsSection } from "./AlertsSection";
import { ChargersList } from "./ChargersList";
import { DistributionBar } from "./DistributionBar";

function mapGroupCharger(gc: GroupCharger, panel?: ChargerPanel) {
  return {
    id: String(gc.charger_ID),
    name: gc.charger_name,
    online: gc.connectors.some((c) => {
      const pc = panel?.connectors.find((p) => p.connector_id === c.connector_id);
      return (pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase()) !== "offline";
    }),
    connectors: gc.connectors.map((c) => {
      const pc = panel?.connectors.find((p) => p.connector_id === c.connector_id);
      return {
        id: c.connector_id,
        connectorId: c.connector_number,
        status: pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase(),
        power: parsePanelPowerKw(pc?.session?.power_kw) ?? (c.connector_max_power ? c.connector_max_power / 1000 : undefined),
      };
    }),
  };
}

function buildGroups(
  data: import("@/lib/types/group.types").GroupData,
  panels: Record<string, ChargerPanel>
) {
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
          .map((gc) => mapGroupCharger(gc, panels[String(gc.charger_ID)])),
      })),
    }));
  }
  return [{
    areaName: data.site.site_name,
    lines: [{
      lineName: "",
      chargers: data.chargers
        .slice()
        .sort((a, b) => a.charger_order - b.charger_order)
        .map((gc) => mapGroupCharger(gc, panels[String(gc.charger_ID)])),
    }],
  }];
}

export default function SupervisorView() {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);
  const groupData = useGroupStore((s) => s.groupData);
  const groupLoading = useGroupStore((s) => s.groupLoading);
  const groupError = useGroupStore((s) => s.groupError);
  const panels = useChargerPanelStore((s) => s.panels);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedInitialPanels = useRef(false);

  const silentFetch = useCallback(() => {
    if (!selectedLocationId) return;
    useGroupStore.getState().fetchGroup(selectedLocationId, true);
    useChargingSessionsStore.getState().fetchSessions({
      payload: { location_ids: [selectedLocationId] },
      pagination: { page: 1, per_page: 20 },
    });
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
      await Promise.all([
        useGroupStore.getState().fetchGroup(selectedLocationId),
        useChargingSessionsStore.getState().fetchSessions({
          payload: { location_ids: [selectedLocationId] },
          pagination: { page: 1, per_page: 20 },
        }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [selectedLocationId]);

  const groups = useMemo(
    () => (groupData ? buildGroups(groupData, panels) : []),
    [groupData, panels]
  );

  const allChargers = useMemo(
    () => groups.flatMap((a) => a.lines.flatMap((l) => l.chargers)),
    [groups]
  );

  const stats = useMemo(() => {
    const charging = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "charging").length || 0), 0);
    const faulted = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "faulted").length || 0), 0);
    const finishing = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "finishing").length || 0), 0);
    const available = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "available" || cn.status === "preparing").length || 0), 0);
    const suspended = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "suspended").length || 0), 0);
    const online = allChargers.filter((c) => c.online).length;
    const totalEnergy = sessions
      .filter((s: any) => s.status === "Active" || s.status === "active")
      .reduce((sum: number, s: any) => sum + (s.energy || 0), 0);

    const total = allChargers.reduce((sum, c) => {
      const activeCount = c.connectors?.filter((cn) => cn.status !== "offline" && cn.status !== "unavailable").length || 0;
      return sum + activeCount;
    }, 0);

    const unavailable = total - charging - faulted - finishing - available - suspended;

    return {
      utilization: total > 0 ? Math.round((charging / total) * 100) : 0,
      totalEnergy: totalEnergy.toFixed(1),
      online,
      totalChargers: allChargers.length,
      faulted,
      charging,
      finishing,
      available,
      suspended,
      unavailable: Math.max(0, unavailable),
      total,
    };
  }, [allChargers, sessions]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {/* KPI Cards */}
      <View style={{ padding: spacing.lg }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: spacing.lg }}>
          <View style={{ width: "48%" }}>
            <KPICard
              icon="trending-up"
              iconColor={colors.secondary}
              label={t("mobile.supervisor.kpi.utilization")}
              value={`${stats.utilization}%`}
              subtitle={t("mobile.supervisor.kpi.utilizationSubtitle", { charging: stats.charging, total: stats.total })}
            />
          </View>

          <View style={{ width: "48%" }}>
            <KPICard
              icon="flash"
              iconColor={colors.primary}
              label={t("mobile.supervisor.kpi.totalEnergy")}
              value={`${stats.totalEnergy} kWh`}
              subtitle={t("mobile.supervisor.kpi.energySubtitle")}
            />
          </View>

          <View style={{ width: "48%" }}>
            <KPICard
              icon="pulse"
              iconColor={colors.primary}
              label={t("mobile.supervisor.kpi.chargers")}
              value={`${stats.online}/${stats.totalChargers}`}
              subtitle={t("mobile.supervisor.kpi.chargersSubtitle")}
            />
          </View>

          <View style={{ width: "48%" }}>
            <KPICard
              icon="alert-circle"
              iconColor={stats.faulted > 0 ? colors.destructive : "#9ca3af"}
              label={t("mobile.supervisor.kpi.alerts")}
              value={stats.faulted}
              subtitle={stats.faulted > 0 ? t("mobile.supervisor.kpi.alertsActiveFault") : t("mobile.supervisor.kpi.noAlerts")}
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

      <AlertsSection chargers={allChargers} />

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
              {/* Area header */}
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
                <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
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
                  {/* Line sub-header */}
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
                      <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                        {line.lineName}
                      </Text>
                    </View>
                  ) : null}

                  <ChargersList chargers={line.chargers} />
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
