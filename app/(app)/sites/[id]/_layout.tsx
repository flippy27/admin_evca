import { getThemeColors } from "@/theme";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export default function SiteDetailLayout() {
  const colors = getThemeColors("light");
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
        name="index"
        options={{
          title: "Site Details",
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Site Profile",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: "Edit Site",
        }}
      />
    </Stack>
  );
}
