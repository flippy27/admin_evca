/**
 * Auth layout — unauthenticated screens
 * Blank background, no header
 */

import { getThemeColors } from "@/theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const colors = getThemeColors("light");

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
