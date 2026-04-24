import { useMemo } from "react";
import { SafeAreaView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { mockChargers } from "@/lib/data/mockData";
import { OperadorChargerDetail } from "@/components/charger/OperadorChargerDetail";
import { SupervisorChargerDetail } from "@/components/charger/SupervisorChargerDetail";
import { MantenedorChargerDetail } from "@/components/charger/MantenedorChargerDetail";

export default function ChargerDetail() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const { id, role } = useLocalSearchParams<{ id: string; role: string }>();

  const storeChargers = useChargersStore((state) => state.chargers || []);
  // Fallback to mock data when store is empty
  const allChargers = storeChargers.length > 0 ? storeChargers : mockChargers;

  const charger = useMemo(() => {
    return allChargers.find((c: any) => c.id === id);
  }, [allChargers, id]);

  if (!charger) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
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

  // Default: operator
  return <OperadorChargerDetail charger={charger} />;
}
