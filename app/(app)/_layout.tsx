import { AppContainer } from "@/components/layout/AppContainer";
import { useAuthStore } from "@/lib/stores/auth.store";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { accessToken, hydrated: authReady } = useAuthStore();

  if (!authReady) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!accessToken) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <AppContainer>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="depot/index" options={{ title: "Depot" }} />
        <Stack.Screen name="sessions/index" options={{ title: "Sessions" }} />
        <Stack.Screen name="charger/[id]/index" options={{ title: "Charger" }} />
        <Stack.Screen name="charger/[id]/ocpp" options={{ title: "OCPP Messages" }} />
        <Stack.Screen name="charger/[id]/config" options={{ title: "Configuration" }} />
        <Stack.Screen name="profile" />
      </Stack>
    </AppContainer>
  );
}
