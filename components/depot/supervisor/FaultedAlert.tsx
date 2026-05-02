import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors, getThemeColors } from "@/theme";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";

interface FaultedAlertProps {
  chargerName: string;
  connectorId: number;
  onPress?: () => void;
}

export function FaultedAlert({ chargerName, connectorId, onPress }: FaultedAlertProps) {
  const { t } = useTranslation();
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  return (
    <TouchableOpacity onPress={onPress}>
      <Card
        style={{
          padding: spacing.md,
          backgroundColor: `${themeColors.light.destructive}10`,
          borderColor: themeColors.light.destructive,
          borderWidth: 1,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontWeight: "600", color: themeColors.light.destructive, fontSize: 13 }}>
              {chargerName} · C{connectorId}
            </Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: spacing.xs }}>
              {t("mobile.supervisor.faultedAlert.connectorFault")}
            </Text>
          </View>
          <Text style={{ color: "#8b5cf6", fontSize: 12 }}>{t("mobile.supervisor.faultedAlert.view")} →</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
