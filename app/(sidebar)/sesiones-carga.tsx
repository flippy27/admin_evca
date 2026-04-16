import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { Text } from "@/components/ui/Text";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";

type TabType = "activas" | "completadas";

export default function SesionesCargarScreen() {
  const router = useRouter();
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  const [selectedTab, setSelectedTab] = useState<TabType>("activas");

  const activeSessions = [
    {
      id: "CB-01",
      connector: "Conector 1",
      vehicle: "12345678",
      start: "14 abr, 12:01",
      energy: "45.3 kWh",
      duration: "47h 14min",
      status: "En curso",
    },
    {
      id: "CB-01",
      connector: "Conector 2",
      vehicle: "87654321",
      start: "14 abr, 11:01",
      energy: "78.2 kWh",
      duration: "48h 14min",
      status: "En curso",
    },
    {
      id: "CB-01-B",
      connector: "Conector 1",
      vehicle: "55667788",
      start: "14 abr, 12:16",
      energy: "32.1 kWh",
      duration: "46h 59min",
      status: "En curso",
    },
    {
      id: "CB-02-B",
      connector: "Conector 1",
      vehicle: "99887766",
      start: "14 abr, 10:30",
      energy: "51.5 kWh",
      duration: "49h 45min",
      status: "En curso",
    },
  ];

  const completedSessions = [
    {
      id: "CB-03",
      connector: "Conector 1",
      vehicle: "11223344",
      start: "13 abr, 08:00",
      energy: "62.1 kWh",
      duration: "52h 30min",
      status: "Completada",
    },
  ];

  const sessions =
    selectedTab === "activas" ? activeSessions : completedSessions;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.lg,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color={colors.foreground} />
        </TouchableOpacity>
        <View>
          <Text variant="h3" weight="bold">
            Sesiones de Carga
          </Text>
          <Text variant="caption" style={{ color: colors.mutedForeground }}>
            Historial y sesiones activas
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.card,
        }}
      >
        <TouchableOpacity
          onPress={() => setSelectedTab("activas")}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: selectedTab === "activas" ? 3 : 0,
            borderBottomColor: "#4CAF50",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            variant="body"
            weight={selectedTab === "activas" ? "bold" : "normal"}
            style={{
              color:
                selectedTab === "activas" ? "#4CAF50" : colors.mutedForeground,
              textAlign: "center",
            }}
          >
            Activas ({activeSessions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedTab("completadas")}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: selectedTab === "completadas" ? 3 : 0,
            borderBottomColor: "#4CAF50",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            variant="body"
            weight={selectedTab === "completadas" ? "bold" : "normal"}
            style={{
              color:
                selectedTab === "completadas"
                  ? "#4CAF50"
                  : colors.mutedForeground,
              textAlign: "center",
            }}
          >
            Completadas ({completedSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sessions List */}
      <ScrollView style={{ flex: 1, padding: spacing.lg }}>
        <View style={{ gap: spacing.md, paddingBottom: spacing.xl }}>
          {sessions.map((session, idx) => (
            <View
              key={idx}
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: spacing.md,
                gap: spacing.md,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text variant="body" weight="bold">
                    {session.id}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    {session.connector}
                  </Text>
                </View>
                <View
                  style={{
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    backgroundColor: "#E8F5E9",
                    borderRadius: 16,
                  }}
                >
                  <Text
                    variant="caption"
                    style={{ color: "#4CAF50", fontWeight: "600" }}
                  >
                    {session.status}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View style={{ gap: spacing.sm }}>
                {/* Vehicle */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons
                    name="square"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    Vehículo: <Text weight="bold">{session.vehicle}</Text>
                  </Text>
                </View>

                {/* Start Time */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons
                    name="time"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    Inicio: <Text weight="bold">{session.start}</Text>
                  </Text>
                </View>

                {/* Energy */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons
                    name="flash"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    Energía: <Text weight="bold">{session.energy}</Text>
                  </Text>
                </View>

                {/* Duration */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.sm,
                  }}
                >
                  <Ionicons
                    name="time"
                    size={16}
                    color={colors.mutedForeground}
                  />
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground }}
                  >
                    Duración: <Text weight="bold">{session.duration}</Text>
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
