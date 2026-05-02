import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing, colors as themeColors } from "@/theme";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

const COLORS = themeColors.connectorStatus;

interface StatsGridProps {
  charging: number;
  available: number;
  finishing: number;
  faulted: number;
  title?: string;
}

export function StatsGrid({ charging, available, finishing, faulted, title }: StatsGridProps) {
  const { t } = useTranslation();
  const colors = getThemeColors(useResolvedColorScheme());
  const resolvedTitle = title ?? t("mobile.depot.connectors.title");

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Card
        style={{
          padding: spacing.lg,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: colors.mutedForeground,
            marginBottom: 12,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          {resolvedTitle}
        </Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.charging }}>{charging}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{t("mobile.status.charging")}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.available }}>{available}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{t("mobile.status.available")}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.finishing }}>{finishing}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{t("mobile.status.finishing")}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: themeColors.light.destructive }}>{faulted}</Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>{t("mobile.status.faulted")}</Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
