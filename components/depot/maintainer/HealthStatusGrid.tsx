import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface HealthStatusGridProps {
  healthy: number;
  faulted: number;
  suspended: number;
}

export function HealthStatusGrid({ healthy, faulted, suspended }: HealthStatusGridProps) {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground, marginBottom: spacing.md }}>
        {t("mobile.depot.health.title")}
      </Text>
      <View style={{ flexDirection: "row", gap: spacing.sm, marginBottom: spacing.lg }}>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.online, marginBottom: spacing.xs }}>
            {healthy}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{t("mobile.depot.health.healthy")}</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: themeColors.connectorStatus.faulted, marginBottom: spacing.xs }}>
            {faulted}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{t("mobile.depot.health.faulted")}</Text>
        </Card>
        <Card style={{ flex: 1, padding: spacing.md, alignItems: "center" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#eab308", marginBottom: spacing.xs }}>{suspended}</Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>{t("mobile.depot.health.suspended")}</Text>
        </Card>
      </View>
    </View>
  );
}
