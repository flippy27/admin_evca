import { Stack } from "expo-router";

export default function ForbiddenLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
