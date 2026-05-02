import { View } from "react-native";
import { spacing, colors as themeColors } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

interface RoleBannerProps {
  role: "operator" | "supervisor" | "maintainer";
}

const roleVisuals = {
  operator:   { iconName: "flash",   color1: "#a855f7", color2: "#4f46e5" },
  supervisor: { iconName: "eye",     color1: "#22c55e", color2: "#059669" },
  maintainer: { iconName: "hammer",  color1: "#14b8a6", color2: "#0891b2" },
};

export default function RoleBanner({ role }: RoleBannerProps) {
  const { t } = useTranslation();
  const visuals = roleVisuals[role];
  const config = {
    ...visuals,
    title: t(`mobile.depot.roleBanner.${role}.title`),
    description: t(`mobile.depot.roleBanner.${role}.description`),
  };

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
