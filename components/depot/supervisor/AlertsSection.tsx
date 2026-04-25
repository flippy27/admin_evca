import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { FaultedAlert } from "./FaultedAlert";

interface Connector {
  id: string;
  connectorId: number;
  status: string;
}

interface Charger {
  id: string;
  name: string;
  connectors?: Connector[];
}

interface AlertsSectionProps {
  chargers: Charger[];
}

export function AlertsSection({ chargers }: AlertsSectionProps) {
  const router = useRouter();

  const faultedChargers = chargers.filter((c) => c.connectors?.some((cn) => cn.status?.toLowerCase() === "faulted"));

  if (faultedChargers.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: themeColors.light.destructive, marginBottom: spacing.md }}>
        ⚠️ Alertas Activas
      </Text>
      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        {faultedChargers.map((charger) =>
          charger.connectors
            ?.filter((c) => c.status?.toLowerCase() === "faulted")
            .map((connector) => (
              <FaultedAlert
                key={connector.id}
                chargerName={charger.name}
                connectorId={connector.connectorId}
                onPress={() =>
                  router.push({ pathname: `/charger/${charger.id}` as any, params: { chargerName: charger.name, role: "supervisor" } })
                }
              />
            )),
        )}
      </View>
    </View>
  );
}
