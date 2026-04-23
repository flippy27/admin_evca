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
    bgColor: themeColors.roles.operador,
  },
  supervisor: {
    iconName: "eye",
    title: "Supervisor",
    description: "Estado general del patio • KPIs operacionales • Alertas y monitoreo",
    bgColor: themeColors.roles.supervisor,
  },
  maintainer: {
    iconName: "settings",
    title: "Mantenedor",
    description: "Variables energéticas • Diagnóstico técnico • Configuración OCPP",
    bgColor: themeColors.roles.mantenedor,
  },
};

export default function RoleBanner({ role }: RoleBannerProps) {
  const config = roleConfig[role];

  // Gradient: darker shade to lighter shade
  const darkerColor = config.bgColor + "CC"; // 80% opacity for darker effect
  const lighterColor = config.bgColor + "40"; // 25% opacity for lighter effect

  return (
    <LinearGradient
      colors={[darkerColor, lighterColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
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
    </LinearGradient>
  );
}
