import { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { getAllChargerIdsFromGroup, parsePanelPowerKw, useChargerPanelStore } from "@/lib/stores/charger-panel.store";
import { mockChargers } from "@/lib/data/mockData";
import { OperadorChargerDetail } from "@/components/charger/OperadorChargerDetail";
import { SupervisorChargerDetail } from "@/components/charger/SupervisorChargerDetail";
import { MantenedorChargerDetail } from "@/components/charger/MantenedorChargerDetail";

export default function ChargerDetail() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { id, role, chargerName, chargerLocation } = useLocalSearchParams<{
    id: string;
    role: string;
    chargerName?: string;
    chargerLocation?: string;
  }>();

  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);
  const storeChargers = useChargersStore((state) => state.chargers || []);
  const { groupData } = useGroupStore();
  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const panels = useChargerPanelStore((s) => s.panels);

  // 3-second silent polling: group + sessions + panel for this charger
  useEffect(() => {
    if (!selectedLocationId) return;
    const poll = () => {
      useGroupStore.getState().fetchGroup(selectedLocationId, true);
      useChargingSessionsStore.getState().fetchSessions({
        payload: { location_ids: [selectedLocationId] },
        pagination: { page: 1, per_page: 20 },
      });
      const gd = useGroupStore.getState().groupData;
      if (gd && id) {
        useChargerPanelStore.getState().fetchPanel(gd.site.site_ID, String(id));
      }
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [selectedLocationId, id]);

  // Find charger from group store, enriched with active session data
  const groupCharger = useMemo(() => {
    if (!groupData) return null;
    const flat = [
      ...groupData.chargers,
      ...groupData.areas.flatMap((a) => a.lines.flatMap((l) => l.chargers)),
    ];
    return flat.find((c) => String(c.charger_ID) === id) ?? null;
  }, [groupData, id]);

  const charger = useMemo(() => {
    // Prefer group store (live data)
    if (groupCharger) {
      const panel = panels[String(groupCharger.charger_ID)];
      return {
        id: String(groupCharger.charger_ID),
        name: chargerName || groupCharger.charger_name,
        location: chargerLocation || "",
        online: groupCharger.connectors.some(
          (c) => c.connector_status.toLowerCase() !== "offline"
        ),
        connectors: groupCharger.connectors.map((c) => {
          const pc = panel?.connectors?.find((p) => p.connector_id === c.connector_id);

          // Live power: panel session.power_kw → last_charging_record.power
          const livePower = parsePanelPowerKw(pc?.session?.power_kw)
            ?? (c.last_charging_record?.power != null ? +c.last_charging_record.power.toFixed(2) : undefined);

          // Live energy: panel session.energy_kwh → last_charging_record.energy
          const liveEnergy = pc?.session?.energy_kwh != null
            ? parseFloat(String(pc.session.energy_kwh))
            : (c.last_charging_record?.energy ?? undefined);

          // Live SoC: panel → group soc_pct → last_charging_record
          const liveSoc = pc?.session?.soc_current_pct
            ?? (c.soc_pct != null ? c.soc_pct : (c.last_charging_record?.soc ?? undefined));

          return {
            id: c.connector_id,
            connectorId: c.connector_number,
            status: (pc?.state_code.toLowerCase() ?? c.connector_status.toLowerCase()),
            soc: liveSoc,
            vehicleId: pc?.vehicle_alias ?? c.vehicle_alias ?? undefined,
            // Live power for top info row (not max power)
            power: livePower,
            energyDelivered: liveEnergy,
            // Energy variables
            voltage: c.last_charging_record?.voltage ?? undefined,
            current: c.last_charging_record?.current ?? undefined,
            livePower,
          };
        }),
      };
    }

    // Fallback: chargers store or mock
    const allChargers = storeChargers.length > 0 ? storeChargers : mockChargers;
    return allChargers.find((c: any) => c.id === id) ?? null;
  }, [groupCharger, storeChargers, sessions, id, chargerName, chargerLocation]);

  if (!charger) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
          Cargador no encontrado
        </Text>
      </SafeAreaView>
    );
  }

  if (role === "supervisor") {
    return <SupervisorChargerDetail charger={charger} />;
  }

  if (role === "maintainer") {
    return <MantenedorChargerDetail charger={charger} />;
  }

  return <OperadorChargerDetail charger={charger} />;
}
