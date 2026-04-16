import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { RefreshControl, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { getThemeColors, spacing } from "@/theme";

export default function ChargerLiveScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = getThemeColors("light");

  const {
    selectedCharger,
    liveData,
    liveLoading,
    liveError,
    fetchChargerDetail,
    fetchLiveData,
    clearError,
  } = useChargersStore();

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (id) {
      fetchChargerDetail(id);
      fetchLiveData(id);
      refreshIntervalRef.current = setInterval(() => {
        fetchLiveData(id);
      }, 5000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [id]);

  if (!selectedCharger) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={liveLoading}
            onRefresh={() => {
              clearError("live");
              fetchLiveData(id!);
            }}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {selectedCharger.name}
          </Text>
          <Badge
            label={
              selectedCharger.status.charAt(0).toUpperCase() +
              selectedCharger.status.slice(1)
            }
            variant={
              selectedCharger.status === "charging" ? "default" : "outline"
            }
            style={{ alignSelf: "flex-start", marginTop: spacing.sm }}
          />
        </View>

        {liveError && (
          <Alert variant="destructive" title="Error" message={liveError} />
        )}

        {liveData && (
          <>
            {/* Power */}
            <Card>
              <CardContent style={{ gap: spacing.lg }}>
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: colors.muted,
                    borderRadius: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <Ionicons name="flash" size={48} color={colors.primary} />
                  <Text variant="h2" weight="bold">
                    {liveData.totalPower?.toFixed(1) || 0} kW
                  </Text>
                  <Text
                    variant="body"
                    style={{ color: colors.mutedForeground }}
                  >
                    Current Power
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    gap: spacing.md,
                    justifyContent: "space-around",
                  }}
                >
                  <View style={{ alignItems: "center" }}>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Current
                    </Text>
                    <Text variant="h4" weight="bold">
                      {liveData.totalCurrent?.toFixed(1) || 0} A
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Voltage
                    </Text>
                    <Text variant="h4" weight="bold">
                      {liveData.totalVoltage?.toFixed(0) || 0} V
                    </Text>
                  </View>
                  <View style={{ alignItems: "center" }}>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      Energy
                    </Text>
                    <Text variant="h4" weight="bold">
                      {liveData.energy?.toFixed(1) || 0} kWh
                    </Text>
                  </View>
                </View>
              </CardContent>
            </Card>

            {/* Connectors */}
            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text variant="h3" weight="bold">
                  Connectors
                </Text>
                {liveData.connectors?.map((conn, idx) => (
                  <View
                    key={idx}
                    style={{
                      padding: spacing.md,
                      backgroundColor: colors.muted,
                      borderRadius: 8,
                      gap: spacing.sm,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Text variant="body" weight="bold">
                        Connector {conn.connectorId || idx + 1}
                      </Text>
                      <Badge label={conn.status} variant="secondary" />
                    </View>
                    {conn.power !== undefined && (
                      <Text variant="caption">
                        Power: {conn.power.toFixed(1)} kW
                      </Text>
                    )}
                    {conn.current !== undefined && (
                      <Text variant="caption">
                        Current: {conn.current.toFixed(1)} A
                      </Text>
                    )}
                    {conn.sessionId && (
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        Session: {conn.sessionId}
                      </Text>
                    )}
                  </View>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Nav */}
        <View style={{ flexDirection: "row", gap: spacing.md }}>
          <Button
            label="History"
            variant="secondary"
            onPress={() => router.push(`/chargers/${id}/history`)}
            style={{ flex: 1 }}
          />
          <Button
            label="Config"
            variant="secondary"
            onPress={() => router.push(`/chargers/${id}/configuration`)}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
