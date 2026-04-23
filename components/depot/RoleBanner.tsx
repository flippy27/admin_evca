import { View } from "react-native";
import { spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";

interface RoleBannerProps {
  role: "operator" | "supervisor" | "maintainer";
}

const roleConfig = {
  operator: {
    iconName: "flash",
    title: "Operador de Patio",
    description: "Gestión de conectores • Inicio/Parada de carga • Control en tiempo real",
    bgColor: "#8b5cf6", // purple
  },
  supervisor: {
    iconName: "eye",
    title: "Supervisor",
    description: "Estado general del patio • KPIs operacionales • Alertas y monitoreo",
    bgColor: "#22c55e", // green
  },
  maintainer: {
    iconName: "settings",
    title: "Mantenedor",
    description: "Variables energéticas • Diagnóstico técnico • Configuración OCPP",
    bgColor: "#06b6d4", // cyan
  },
};

export default function RoleBanner({ role }: RoleBannerProps) {
  const config = roleConfig[role];

  return (
    <View
      style={{
        backgroundColor: config.bgColor,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
        <Ionicons name={config.iconName as any} size={16} color="white" />
        <Text
          style={{
            color: "white",
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {config.title}
        </Text>
      </View>
      <Text
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 12,
          lineHeight: 18,
        }}
      >
        {config.description}
      </Text>
    </View>
  );
}
