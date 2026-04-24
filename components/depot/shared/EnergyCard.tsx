import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface EnergyCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  unit?: string;
  warning?: boolean;
}

export function EnergyCard({
  icon,
  iconColor,
  label,
  value,
  unit,
  warning,
}: EnergyCardProps) {
  return (
    <Card style={{ flex: 1, padding: spacing.md }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, marginBottom: spacing.sm }}>
        <Ionicons name={icon as any} size={14} color={iconColor} />
        <Text style={{ fontSize: 11, color: "#9ca3af" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 18, fontWeight: "bold", color: iconColor }}>
        {value} {unit}
      </Text>
      {warning && (
        <Text style={{ fontSize: 9, color: "#ef4444", marginTop: spacing.xs }}>
          ⚠️ Alta
        </Text>
      )}
    </Card>
  );
}
