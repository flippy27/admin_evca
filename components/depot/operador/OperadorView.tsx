import { ActivityIndicator, AppState, AppStateStatus, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { getAllChargerIdsFromGroup, parsePanelPowerKw, useChargerPanelStore } from "@/lib/stores/charger-panel.store";
import { ChargerPanel } from "@/lib/types/charger-panel.types";
import { GroupCharger } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";

import { StatsGrid } from "../shared/StatsGrid";
import { ActiveSessionsList } from "./ActiveSessionsList";
import { ChargersGrid } from "./ChargersGrid";

function parseDuration(d?: string): number {
  if (!d) return 0;
  const parts = d.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseInt(d) || 0;
}

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
        name: c.connector_name,
        alias: c.connector_alias ?? undefined,
        // Panel state_code is most up-to-date; fall back to group status
        status: (pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase()) as any,
        // Panel SOC is real-time; fall back to group soc_pct, then last record
        soc: pc?.session?.soc_current_pct ?? (c.soc_pct != null ? c.soc_pct : (c.last_charging_record?.soc ?? undefined)),
        vehicleId: pc?.vehicle_alias ?? c.vehicle_alias ?? undefined,
        // Panel power_kw is live delivered power; fall back to connector max
        power: parsePanelPowerKw(pc?.session?.power_kw) ?? (c.connector_max_power ? c.connector_max_power / 1000 : undefined),
        capabilities: pc?.capabilities,
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

export default function OperadorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);
  const groupData = useGroupStore((s) => s.groupData);
  const groupLoading = useGroupStore((s) => s.groupLoading);
  const groupError = useGroupStore((s) => s.groupError);
  const panels = useChargerPanelStore((s) => s.panels);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFetchedInitialPanels = useRef(false);

  // Silent background fetch (no loading state)
  const silentFetch = useCallback(() => {
    if (!selectedLocationId) return;
    useGroupStore.getState().fetchGroup(selectedLocationId, true);
    useChargingSessionsStore.getState().fetchSessions({
      payload: { location_ids: [selectedLocationId] },
      pagination: { page: 1, per_page: 20 },
    });
    // Overlay: fetch live panel for each charger using current group data
    const gd = useGroupStore.getState().groupData;
    if (gd) {
      useChargerPanelStore.getState().fetchPanelsForGroup(
        gd.site.site_ID,
        getAllChargerIdsFromGroup(gd)
      );
    }
  }, [selectedLocationId]);

  // 3-second polling — silent, keeps content visible
  useEffect(() => {
    if (!selectedLocationId) return;
    silentFetch();
    intervalRef.current = setInterval(silentFetch, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedLocationId, silentFetch]);

  // Resume polling immediately when app returns to foreground
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === "active" && selectedLocationId) {
        silentFetch();
      }
    };
    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, [selectedLocationId, silentFetch]);

  // Initial panel fetch — fires once when group data first arrives
  useEffect(() => {
    if (!groupData || !selectedLocationId || hasFetchedInitialPanels.current) return;
    hasFetchedInitialPanels.current = true;
    const ids = getAllChargerIdsFromGroup(groupData);
    if (ids.length > 0) {
      useChargerPanelStore.getState().fetchPanelsForGroup(groupData.site.site_ID, ids);
    }
  }, [groupData, selectedLocationId]);

  // Clear panel data and reset flag on location change
  useEffect(() => {
    hasFetchedInitialPanels.current = false;
    useChargerPanelStore.getState().clearPanels();
  }, [selectedLocationId]);

  // Pull-to-refresh — shows RefreshControl spinner
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
    const charging = allChargers.reduce(
      (sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "charging").length || 0),
      0
    );
    const available = allChargers.reduce(
      (sum, c) =>
        sum + (c.connectors?.filter((cn) => cn.status === "available" || cn.status === "preparing").length || 0),
      0
    );
    const finishing = allChargers.reduce(
      (sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "finishing").length || 0),
      0
    );
    const faulted = allChargers.reduce(
      (sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "faulted").length || 0),
      0
    );
    return { charging, available, finishing, faulted };
  }, [allChargers]);

  const activeSessions = useMemo(() => {
    if (!groupData) return [];
    const result: { id: string; charger_name: string; charger_id: string; connector_number: number; vehicleId: string; energy: number; duration: number }[] = [];

    const processCharger = (gc: GroupCharger) => {
      for (const conn of gc.connectors) {
        if (!conn.is_charging) continue;

        const panel = panels[String(gc.charger_ID)];
        const pc = panel?.connectors?.find((p) => p.connector_id === conn.connector_id);

        // kWh: panel session > last_charging_record
        const energy = pc?.session?.energy_kwh != null
          ? parseFloat(String(pc.session.energy_kwh))
          : (conn.last_charging_record?.energy ?? 0);

        // Duration: now - connector_status_timestamp (when it entered Charging state)
        const startMs = conn.connector_status_timestamp
          ? new Date(conn.connector_status_timestamp).getTime()
          : null;
        const durationSec = startMs && !isNaN(startMs)
          ? Math.floor((Date.now() - startMs) / 1000)
          : 0;

        result.push({
          id: conn.last_charging_record?.transaction_id || conn.connector_id,
          charger_name: conn.connector_alias || conn.connector_name,
          charger_id: String(gc.charger_ID),
          connector_number: conn.connector_number,
          vehicleId: conn.licence_plate || conn.vehicle_alias || "",
          energy,
          duration: durationSec,
        });
      }
    };

    if (groupData.areas.length > 0) {
      for (const area of groupData.areas)
        for (const line of area.lines)
          for (const gc of line.chargers) processCharger(gc);
    } else {
      for (const gc of groupData.chargers) processCharger(gc);
    }

    return result;
  }, [groupData, panels]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <StatsGrid
        charging={stats.charging}
        available={stats.available}
        finishing={stats.finishing}
        faulted={stats.faulted}
      />
      <ActiveSessionsList sessions={activeSessions.slice(0, 3)} totalCount={activeSessions.length} />

      {/* Initial load spinner — only when no data yet */}
      {!groupData && groupLoading && (
        <View style={{ padding: spacing.xl, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* Error — only when no data to show */}
      {groupError && !groupData && (
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: colors.destructive, fontSize: 13 }}>{groupError}</Text>
        </View>
      )}

      {/* Areas → Lines → Chargers — always visible once data loaded */}
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

                  <ChargersGrid chargers={line.chargers} />
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
