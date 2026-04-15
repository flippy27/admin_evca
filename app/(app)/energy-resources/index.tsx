import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView, View } from "react-native";

interface EnergyResource {
  id: string;
  name: string;
  type: "solar" | "battery" | "grid" | "wind";
  capacity: number;
  available: number;
  unit: string;
  status: "active" | "inactive";
}

const MOCK_RESOURCES: EnergyResource[] = [
  {
    id: "1",
    name: "Solar Array - Roof",
    type: "solar",
    capacity: 50,
    available: 45,
    unit: "kW",
    status: "active",
  },
  {
    id: "2",
    name: "Battery Storage - Main",
    type: "battery",
    capacity: 200,
    available: 165,
    unit: "kWh",
    status: "active",
  },
  {
    id: "3",
    name: "Grid Connection",
    type: "grid",
    capacity: 500,
    available: 500,
    unit: "kW",
    status: "active",
  },
  {
    id: "4",
    name: "Wind Turbine - North",
    type: "wind",
    capacity: 100,
    available: 0,
    unit: "kW",
    status: "inactive",
  },
];

const getResourceIcon = (type: string) => {
  switch (type) {
    case "solar":
      return "sunny";
    case "battery":
      return "battery";
    case "grid":
      return "flash";
    case "wind":
      return "leaf";
    default:
      return "help";
  }
};

const getResourceColor = (type: string) => {
  switch (type) {
    case "solar":
      return "#f59e0b";
    case "battery":
      return "#3b82f6";
    case "grid":
      return "#ef4444";
    case "wind":
      return "#10b981";
    default:
      return "#6b7280";
  }
};

export default function EnergyResourcesScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors("light");

  const utilizationPercent = (available: number, capacity: number) => {
    const used = capacity - available;
    return Math.round((used / capacity) * 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
      >
        <View>
          <Text variant="h2" weight="bold">
            {t("common.ui.pageTitles.energyResources") || "Energy Resources"}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            Monitor available energy sources
          </Text>
        </View>

        {MOCK_RESOURCES.map((resource) => {
          const utilization = utilizationPercent(
            resource.available,
            resource.capacity,
          );
          const iconColor = getResourceColor(resource.type);

          return (
            <Card key={resource.id}>
              <CardContent style={{ gap: spacing.md }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${iconColor}20`,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name={getResourceIcon(resource.type) as any}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h4" weight="bold">
                      {resource.name}
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      {resource.type.toUpperCase()}
                    </Text>
                  </View>
                  <Badge
                    label={resource.status === "active" ? "Online" : "Offline"}
                    variant={
                      resource.status === "active" ? "secondary" : "outline"
                    }
                  />
                </View>

                <View style={{ gap: spacing.sm }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Capacity
                    </Text>
                    <Text variant="body" weight="bold">
                      {resource.available} / {resource.capacity} {resource.unit}
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: colors.border,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${100 - utilizationPercent(resource.available, resource.capacity)}%`,
                        backgroundColor: iconColor,
                      }}
                    />
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {utilization}% in use
                  </Text>
                </View>
              </CardContent>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
