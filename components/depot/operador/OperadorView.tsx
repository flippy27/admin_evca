import { ScrollView } from "react-native";
import { useEffect, useMemo } from "react";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { mockChargers, mockSessions } from "@/lib/data/mockData";

import { StatsGrid } from "../shared/StatsGrid";
import { ActiveSessionsList } from "./ActiveSessionsList";
import { ChargersGrid } from "./ChargersGrid";

export default function OperadorView() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const storeChargers = useChargersStore((state) => state.chargers || []);
  const storeSessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const selectedLocationId = useChargersStore((state) => state.selectedLocationId);

  const chargers = storeChargers.length > 0 ? storeChargers : mockChargers;
  const sessions = storeSessions.length > 0 ? storeSessions : mockSessions;

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
    const charging = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "charging").length || 0),
      0
    );
    const available = chargers.reduce(
      (sum, c: any) =>
        sum +
        (c.connectors?.filter((cn: any) => cn.status === "available" || cn.status === "preparing").length || 0),
      0
    );
    const finishing = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "finishing").length || 0),
      0
    );
    const faulted = chargers.reduce(
      (sum, c: any) => sum + (c.connectors?.filter((cn: any) => cn.status === "faulted").length || 0),
      0
    );

    return { charging, available, finishing, faulted };
  }, [chargers]);

  const activeSessions = useMemo(() => {
    return sessions.filter((s: any) => s.connector_status != "offline").slice(0, 3);
  }, [sessions]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatsGrid
        charging={stats.charging}
        available={stats.available}
        finishing={stats.finishing}
        faulted={stats.faulted}
      />
      <ActiveSessionsList sessions={activeSessions} />
      <ChargersGrid chargers={chargers} />
    </ScrollView>
  );
}
