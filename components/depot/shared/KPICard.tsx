import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface KPICardProps {
  icon: string;
  iconColor: string;
  label: string;
  value: string | number;
  subtitle?: string;
  backgroundColor?: string;
}

export function KPICard({
  icon,
  iconColor,
  label,
  value,
  subtitle,
  backgroundColor,
}: KPICardProps) {
  return (
    <Card
      style={{
        padding: spacing.md,
        backgroundColor,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm }}>
        <Ionicons name={icon as any} size={16} color={iconColor} />
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: iconColor, marginBottom: spacing.xs }}>
        {value}
      </Text>
      {subtitle && (
        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}
