import { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
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

  // 3-second polling: keep group + sessions fresh while on this screen
  useEffect(() => {
    if (!selectedLocationId) return;
    const poll = () => {
      useGroupStore.getState().fetchGroup(selectedLocationId);
      useChargingSessionsStore.getState().fetchSessions({
        payload: { location_ids: [selectedLocationId] },
        pagination: { page: 1, per_page: 20 },
      });
    };
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [selectedLocationId]);

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
      return {
        id: String(groupCharger.charger_ID),
        name: chargerName || groupCharger.charger_name,
        location: chargerLocation || "",
        online: groupCharger.connectors.some(
          (c) => c.connector_status.toLowerCase() !== "offline"
        ),
        connectors: groupCharger.connectors.map((c) => {
          // Match active session for this connector
          const session = sessions.find(
            (s: any) =>
              s.connector_id === c.connector_id ||
              (s.charger_id === String(groupCharger.charger_ID) &&
                String(s.connector_number) === String(c.connector_number))
          );
          const energyFromSession = session?.delivered_energy
            ? parseFloat(session.delivered_energy)
            : undefined;
          return {
            id: c.connector_id,
            connectorId: c.connector_number,
            status: c.connector_status.toLowerCase(),
            soc: c.soc_pct != null ? c.soc_pct : (c.last_charging_record?.soc ?? undefined),
            vehicleId: c.vehicle_alias || undefined,
            power: c.connector_max_power ? c.connector_max_power / 1000 : undefined,
            energyDelivered:
              energyFromSession ??
              (c.last_charging_record?.energy != null
                ? c.last_charging_record.energy
                : undefined),
            // Live energy variables from last meter record
            voltage: c.last_charging_record?.voltage ?? undefined,
            current: c.last_charging_record?.current ?? undefined,
            livePower: c.last_charging_record?.power != null
              ? +(c.last_charging_record.power).toFixed(1)
              : undefined,
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
