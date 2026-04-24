import { View } from "react-native";
import { spacing, colors as themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface RoleBannerProps {
  role: "operator" | "supervisor" | "maintainer";
}

const roleConfig = {
  operator: {
    iconName: "flash",
    title: "Operador de Patio",
    description: "Gestión de conectores • Inicio/Parada de carga • Control en tiempo real",
    color1: "#a855f7", // purple-500
    color2: "#4f46e5", // indigo-600
  },
  supervisor: {
    iconName: "eye",
    title: "Supervisor",
    description: "Estado general del patio • KPIs operacionales • Alertas y monitoreo",
    color1: "#22c55e", // green-500
    color2: "#059669", // emerald-600
  },
  maintainer: {
    iconName: "hammer",
    title: "Mantenedor",
    description: "Variables energéticas • Diagnóstico técnico • Configuración OCPP",
    color1: "#14b8a6", // teal-500
    color2: "#0891b2", // cyan-600
  },
};

export default function RoleBanner({ role }: RoleBannerProps) {
  const config = roleConfig[role];

  return (
    <LinearGradient
      colors={[config.color1, config.color2]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        gap: spacing.sm,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <Ionicons name={config.iconName as any} size={16} color="white" style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "600",
            }}
          >
            {config.title}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              lineHeight: 18,
              marginTop: 2,
            }}
          >
            {config.description}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
