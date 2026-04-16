import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function ChargerDetailLayout() {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.primary,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerLeft: () => (
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
        ),
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
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Charger",
        }}
      />
    </Stack>
  );
}
