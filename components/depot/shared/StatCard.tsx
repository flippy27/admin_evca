import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme";
import { ReactNode } from "react";
import { View } from "react-native";

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
  minHeight?: number;
}

export function StatCard({ value, label, color, minHeight = 80 }: StatCardProps) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: spacing.md }}>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          color,
          lineHeight: 35,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          color: "#9ca3af",
          fontSize: 12,
          marginTop: spacing.xs,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
