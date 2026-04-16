import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Text } from "@/components/ui/Text";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { getThemeColors, spacing } from "@/theme";

export default function ChargerHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  const {
    selectedCharger,
    sessions,
    sessionsLoading,
    sessionsError,
    fetchChargerDetail,
    fetchHistory,
    clearError,
  } = useChargersStore();

  const [timeRange, setTimeRange] = useState("24h");

  useEffect(() => {
    if (id) {
      fetchChargerDetail(id);
      fetchHistory(id, { dateRange: timeRange });
    }
  }, [id, timeRange]);

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
            refreshing={sessionsLoading}
            onRefresh={() => {
              clearError("sessions");
              fetchHistory(id!);
            }}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {selectedCharger.name}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            History
          </Text>
        </View>

        {/* Time Range */}
        <Select
          label="Time Range"
          options={[
            { label: "Last 24h", value: "24h" },
            { label: "Last 7 days", value: "7d" },
            { label: "Last 30 days", value: "30d" },
          ]}
          value={timeRange}
          onChange={(val) => setTimeRange(String(val))}
        />

        {sessionsError && (
          <Alert variant="destructive" title="Error" message={sessionsError} />
        )}

        {/* Sessions */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h3" weight="bold">
              Sessions
            </Text>
            {sessions.length === 0 ? (
              <Text style={{ color: colors.mutedForeground }}>
                No sessions found
              </Text>
            ) : (
              sessions.map((s) => (
                <View
                  key={s.id}
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
                      Session {s.id}
                    </Text>
                    <Badge
                      label={s.status}
                      variant={
                        s.status === "completed" ? "secondary" : "outline"
                      }
                    />
                  </View>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {new Date(s.startTime).toLocaleString()}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      gap: spacing.md,
                    }}
                  >
                    <Text variant="caption">
                      Energy: {s.energyDelivered.toFixed(1)} kWh
                    </Text>
                    <Text variant="caption">
                      Duration: {Math.floor(s.duration / 3600)}h{" "}
                      {Math.floor((s.duration % 3600) / 60)}m
                    </Text>
                  </View>
                </View>
              ))
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {sessions.length > 0 && (
          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <Text variant="h3" weight="bold">
                Summary
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Total Sessions
                </Text>
                <Text variant="body" weight="bold">
                  {sessions.length}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Total Energy
                </Text>
                <Text variant="body" weight="bold">
                  {sessions
                    .reduce((sum, s) => sum + s.energyDelivered, 0)
                    .toFixed(1)}{" "}
                  kWh
                </Text>
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
