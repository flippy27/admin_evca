import { ActivityIndicator, RefreshControl, ScrollView, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useGroupStore } from "@/lib/stores/group.store";
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

function mapGroupCharger(gc: GroupCharger) {
  return {
    id: String(gc.charger_ID),
    name: gc.charger_name,
    online: gc.connectors.some((c) => c.connector_status.toLowerCase() !== "offline"),
    connectors: gc.connectors.map((c) => ({
      id: c.connector_id,
      connectorId: c.connector_number,
      name: c.connector_name,
      alias: c.connector_alias ?? undefined,
      status: c.connector_status.toLowerCase() as any,
      // Use live SOC; fall back to last_charging_record when soc_pct is null
      soc: c.soc_pct != null ? c.soc_pct : (c.last_charging_record?.soc ?? undefined),
      vehicleId: c.vehicle_alias ?? undefined,
      power: c.connector_max_power ? c.connector_max_power / 1000 : undefined,
    })),
  };
}

function buildGroups(data: import("@/lib/types/group.types").GroupData) {
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
        chargers: chargers.sort((a, b) => a.charger_order - b.charger_order).map(mapGroupCharger),
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
        .map(mapGroupCharger),
    }],
  }];
}

export default function OperadorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const storeSessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);
  const { groupData, groupLoading, groupError } = useGroupStore();
  const [refreshing, setRefreshing] = useState(false);

  // Silent background fetch (no loading state)
  const silentFetch = useCallback(() => {
    if (!selectedLocationId) return;
    useGroupStore.getState().fetchGroup(selectedLocationId);
    useChargingSessionsStore.getState().fetchSessions({
      payload: { location_ids: [selectedLocationId] },
      pagination: { page: 1, per_page: 20 },
    });
  }, [selectedLocationId]);

  // 3-second polling — silent, keeps content visible
  useEffect(() => {
    if (!selectedLocationId) return;
    silentFetch(); // immediate first call
    const interval = setInterval(silentFetch, 3000);
    return () => clearInterval(interval);
  }, [selectedLocationId, silentFetch]);

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
    () => (groupData ? buildGroups(groupData) : []),
    [groupData]
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
    const raw = storeSessions
      .filter((s: any) =>
        s.connector_status?.toLowerCase() === "charging" ||
        s.status?.toLowerCase() === "active"
      )
      .slice(0, 3);

    return raw.map((s: any) => ({
      id: s.id || s.transaction_id || `${s.charger_id}-${s.connector_number}`,
      charger_name: s.connector_alias || s.connector_name || "C",
      charger_id: s.charger_id || "",
      connector_number: Number(s.connector_number) || 0,
      vehicleId: s.license_plate || s.evccid || s.vin || "",
      energy: parseFloat(s.delivered_energy ?? "0") || (s.energy_kwh ?? 0),
      duration: parseDuration(s.session_duration) || ((s.duration_minutes ?? 0) * 60),
    }));
  }, [storeSessions]);

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
      <ActiveSessionsList sessions={activeSessions} />

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
