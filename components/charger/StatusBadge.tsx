import { Text } from "@/components/ui/Text";
import { View } from "react-native";

interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Available: { bg: "#dcfce7", text: "#22c55e", label: "Disponible" },
  Charging: { bg: "#dbeafe", text: "#3b82f6", label: "Cargando" },
  Finishing: { bg: "#f3e8ff", text: "#a855f7", label: "Finalizando" },
  Faulted: { bg: "#fee2e2", text: "#ef4444", label: "Falla" },
  Suspended: { bg: "#fef3c7", text: "#f59e0b", label: "Suspendido" },
  Unavailable: { bg: "#f3f4f6", text: "#9ca3af", label: "No disponible" },
  offline: { bg: "#f3f4f6", text: "#9ca3af", label: "Offline" },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.Available;

  return (
    <View
      style={{
        backgroundColor: config.bg,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: config.text,
        }}
      >
        {config.label}
      </Text>
    </View>
  );
}
