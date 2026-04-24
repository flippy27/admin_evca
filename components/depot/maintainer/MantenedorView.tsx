import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useGroupStore } from "@/lib/stores/group.store";
import { GroupCharger, GroupData } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { Text } from "@/components/ui/Text";

import { ChargerEnergyPanel } from "./ChargerEnergyPanel";
import { EnergyOverview } from "./EnergyOverview";
import { HealthStatusGrid } from "./HealthStatusGrid";

const mockEnergyData: Record<string, { voltage: number; current: number; power: number; temperature: number; frequency: number }> = {
  "charger-1-c01": { voltage: 230, current: 16, power: 3.7, temperature: 32, frequency: 50 },
  "charger-1-c02": { voltage: 228, current: 20, power: 4.6, temperature: 35, frequency: 50 },
  "charger-2-c01": { voltage: 231, current: 0, power: 0, temperature: 28, frequency: 50 },
  "charger-2-c02": { voltage: 229, current: 18, power: 4.1, temperature: 38, frequency: 50 },
  "charger-3-c01": { voltage: 226, current: 25, power: 5.7, temperature: 42, frequency: 50 },
  "charger-3-c02": { voltage: 230, current: 24, power: 5.5, temperature: 41, frequency: 50 },
};

const statusConfigMap: Record<string, { label: string; color: string }> = {
  available:   { label: "Disponible",    color: "#1f2937" },
  preparing:   { label: "Preparando",   color: "#3b82f6" },
  charging:    { label: "Cargando",     color: "#8b5cf6" },
  finishing:   { label: "Finalizando",  color: "#a855f7" },
  faulted:     { label: "Falla",        color: "#ef4444" },
  suspended:   { label: "Suspendido",   color: "#eab308" },
  unavailable: { label: "No disponible",color: "#9ca3af" },
  offline:     { label: "Offline",      color: "#9ca3af" },
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
    })),
  };
}

function buildGroups(data: GroupData) {
  if (data.areas.length > 0) {
    // Merge duplicate areas by area_name, then lines by line_name
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
          .map(mapCharger),
      })),
    }));
  }
  // No areas — flat list under site name
  return [{
    areaName: data.site.site_name,
    lines: [{
      lineName: "",
      chargers: data.chargers
        .slice()
        .sort((a, b) => a.charger_order - b.charger_order)
        .map(mapCharger),
    }],
  }];
}

export default function MantenedorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();

  const { groupData, groupLoading, groupError } = useGroupStore();

  const groups = useMemo(() => (groupData ? buildGroups(groupData) : []), [groupData]);

  const allChargers = useMemo(
    () => groups.flatMap((a) => a.lines.flatMap((l) => l.chargers)),
    [groups]
  );

  const stats = useMemo(() => {
    const total = allChargers.reduce((sum, c) => sum + (c.connectors?.length || 0), 0);
    const faulted = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "faulted").length || 0), 0);
    const suspended = allChargers.reduce((sum, c) => sum + (c.connectors?.filter((cn) => cn.status === "suspended").length || 0), 0);
    return { total, faulted, suspended, healthy: total - faulted - suspended };
  }, [allChargers]);

  const energyStats = useMemo(() => {
    const entries = Object.values(mockEnergyData);
    const avg = (fn: (d: typeof entries[0]) => number) =>
      entries.length ? entries.reduce((s, d) => s + fn(d), 0) / entries.length : 0;
    return {
      avgVoltage: avg((d) => d.voltage).toFixed(1),
      avgTemp: avg((d) => d.temperature).toFixed(1),
      totalPower: entries.reduce((s, d) => s + d.power, 0).toFixed(2),
      maxTemp: entries.length ? Math.max(...entries.map((d) => d.temperature)).toFixed(1) : "0",
    };
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <EnergyOverview
        avgVoltage={energyStats.avgVoltage}
        maxTemp={energyStats.maxTemp}
        totalPower={energyStats.totalPower}
        avgTemp={energyStats.avgTemp}
      />
      <HealthStatusGrid healthy={stats.healthy} faulted={stats.faulted} suspended={stats.suspended} />

      {/* Loading */}
      {groupLoading && (
        <View style={{ padding: spacing.xl, alignItems: "center" }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}

      {/* Error */}
      {groupError && !groupLoading && (
        <View style={{ padding: spacing.lg }}>
          <Text style={{ color: colors.destructive, fontSize: 13 }}>{groupError}</Text>
        </View>
      )}

      {/* Areas → Lines → Chargers */}
      {!groupLoading && !groupError && (
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

                  {/* Chargers */}
                  <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.sm }}>
                    {line.chargers.map((charger) => (
                      <ChargerEnergyPanel
                        key={charger.id}
                        charger={charger}
                        energyDataMap={mockEnergyData}
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
  );
}
