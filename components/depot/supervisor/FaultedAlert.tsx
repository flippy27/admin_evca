import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { TouchableOpacity, View } from "react-native";

interface FaultedAlertProps {
  chargerName: string;
  connectorId: number;
  onPress?: () => void;
}

export function FaultedAlert({ chargerName, connectorId, onPress }: FaultedAlertProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        style={{
          padding: spacing.md,
          backgroundColor: `${themeColors.destructive}10`,
          borderColor: themeColors.destructive,
          borderWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontWeight: "600", color: themeColors.destructive, fontSize: 13 }}>
              {chargerName} · C{connectorId}
            </Text>
            <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: spacing.xs }}>
              Conector con falla
            </Text>
          </View>
          <Text style={{ color: "#8b5cf6", fontSize: 12 }}>Ver →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
