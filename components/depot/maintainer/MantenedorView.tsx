import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { getThemeColors, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, View } from "react-native";

import { ChargerEnergyPanel } from "./ChargerEnergyPanel";
import { EnergyOverview } from "./EnergyOverview";
import { HealthStatusGrid } from "./HealthStatusGrid";

// Mock energy data per connector
const mockEnergyData: Record<string, { voltage: number; current: number; power: number; temperature: number; frequency: number }> = {
  "charger-1-c01": { voltage: 230, current: 16, power: 3.7, temperature: 32, frequency: 50 },
  "charger-1-c02": { voltage: 228, current: 20, power: 4.6, temperature: 35, frequency: 50 },
  "charger-2-c01": { voltage: 231, current: 0, power: 0, temperature: 28, frequency: 50 },
  "charger-2-c02": { voltage: 229, current: 18, power: 4.1, temperature: 38, frequency: 50 },
  "charger-3-c01": { voltage: 226, current: 25, power: 5.7, temperature: 42, frequency: 50 },
  "charger-3-c02": { voltage: 230, current: 24, power: 5.5, temperature: 41, frequency: 50 },
};

const statusConfigMap: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "#1f2937" },
  charging: { label: "Cargando", color: "#8b5cf6" },
  finishing: { label: "Finalizando", color: "#a855f7" },
  faulted: { label: "Falla", color: "#ef4444" },
  suspended: { label: "Suspendido", color: "#eab308" },
  unavailable: { label: "No disponible", color: "#9ca3af" },
};

export default function MantenedorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();

  const chargers = useChargersStore((state) => state.chargers || []);

  const stats = useMemo(() => {
    const total = chargers.reduce((sum, c: any) => sum + (c.connectors?.length || 0), 0);
    const faulted = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Faulted").length || 0), 0);
    const suspended = chargers.reduce((sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "Suspended").length || 0), 0);

    return {
      total,
      faulted,
      suspended,
      healthy: total - faulted - suspended,
    };
  }, [chargers]);

  const energyStats = useMemo(() => {
    const energyEntries = Object.values(mockEnergyData);
    const avgVoltage = energyEntries.length > 0 ? energyEntries.reduce((sum, d) => sum + d.voltage, 0) / energyEntries.length : 0;
    const avgTemp = energyEntries.length > 0 ? energyEntries.reduce((sum, d) => sum + d.temperature, 0) / energyEntries.length : 0;
    const totalPower = energyEntries.reduce((sum, d) => sum + d.power, 0);
    const maxTemp = energyEntries.length > 0 ? Math.max(...energyEntries.map((d) => d.temperature)) : 0;

    return {
      avgVoltage: avgVoltage.toFixed(1),
      avgTemp: avgTemp.toFixed(1),
      totalPower: totalPower.toFixed(2),
      maxTemp: maxTemp.toFixed(1),
    };
  }, []);

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
      <EnergyOverview
        avgVoltage={energyStats.avgVoltage}
        maxTemp={energyStats.maxTemp}
        totalPower={energyStats.totalPower}
        avgTemp={energyStats.avgTemp}
      />

      <HealthStatusGrid healthy={stats.healthy} faulted={stats.faulted} suspended={stats.suspended} />

      {/* Chargers with Energy Data */}
      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xl }}>
        <View style={{ gap: spacing.sm }}>
          {chargersByLocation.map((charger: any) => (
            <ChargerEnergyPanel
              key={charger.id}
              charger={charger}
              energyDataMap={mockEnergyData}
              statusConfigMap={statusConfigMap}
              onPress={() =>
                router.push({
                  pathname: `/charger/${charger.id}`,
                  params: {
                    chargerName: charger.name,
                    role: "maintainer",
                  },
                })
              }
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
