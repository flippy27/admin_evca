import { getThemeColors } from "@/theme";
import { Stack } from "expo-router";

export default function ChargerDetailLayout() {
  const colors = getThemeColors("light");

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: {
          backgroundColor: colors.card,
        },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="live"
        options={{
          title: "Live View",
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "History",
        }}
      />
      <Stack.Screen
        name="configuration"
        options={{
          title: "Configuration",
        }}
      />
    </Stack>
  );
}
