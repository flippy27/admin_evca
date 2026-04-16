import React, { useState } from "react";
import { SafeAreaView, View, ScrollView, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getThemeColors, spacing } from "@/theme";

export default function EnergyManagementScreen() {
  const { siteId } = useLocalSearchParams<{ siteId: string }>();
  const router = useRouter();
  const colors = getThemeColors("light");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header with back button */}
        <View
          style={{
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              position: "absolute",
              left: spacing.md,
              top: spacing.md,
              zIndex: 10,
            }}
          >
            <Ionicons name="chevron-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text variant="h3" weight="bold">
            Gestión energética
          </Text>
        </View>

        {/* Content */}
        <ScrollView
          contentContainerStyle={{
            padding: spacing.lg,
            gap: spacing.lg,
          }}
        >
          {/* Info Card */}
          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text variant="h4" weight="bold">
                  Energy Management
                </Text>
                <Badge label="Active" variant="default" />
              </View>
              <Text
                variant="body"
                style={{ color: colors.mutedForeground, lineHeight: 22 }}
              >
                Manage energy allocation, set power limits, and configure smart
                charging schedules for this location.
              </Text>
            </CardContent>
          </Card>

          {/* Intervals Section */}
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text variant="h4" weight="bold">
                Intervalos horarios de potencia
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: 8,
                }}
              >
                <Text variant="body" weight="bold" style={{ color: "white" }}>
                  + Crear
                </Text>
              </TouchableOpacity>
            </View>

            <Card>
              <CardContent style={{ gap: spacing.md }}>
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  Define power time intervals for smart energy management
                </Text>
                <View
                  style={{
                    padding: spacing.lg,
                    backgroundColor: colors.muted,
                    borderRadius: 12,
                    alignItems: "center",
                    gap: spacing.md,
                  }}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={48}
                    color={colors.mutedForeground}
                  />
                  <Text
                    variant="body"
                    style={{ color: colors.mutedForeground }}
                  >
                    No intervals created yet
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>

          {/* Report Types */}
          <View style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Tipos de reporte
            </Text>
            <Card>
              <CardContent style={{ gap: spacing.lg }}>
                <View style={{ gap: spacing.md }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: spacing.md,
                    }}
                  >
                    <Ionicons
                      name="shield-checkmark"
                      size={24}
                      color={colors.primary}
                      style={{ marginTop: spacing.sm }}
                    />
                    <View style={{ flex: 1, gap: spacing.sm }}>
                      <Text variant="body" weight="bold">
                        Inicio protegido
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        Restrict new charging when max power is reached
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      paddingTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <Ionicons
                      name="balance-scale"
                      size={24}
                      color={colors.primary}
                      style={{ marginTop: spacing.sm }}
                    />
                    <View style={{ flex: 1, gap: spacing.sm }}>
                      <Text variant="body" weight="bold">
                        Reparto equitativo
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        Distribute power equally across active charges
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: spacing.md,
                      paddingTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                    }}
                  >
                    <Ionicons
                      name="calendar"
                      size={24}
                      color={colors.primary}
                      style={{ marginTop: spacing.sm }}
                    />
                    <View style={{ flex: 1, gap: spacing.sm }}>
                      <Text variant="body" weight="bold">
                        Plan de carga
                      </Text>
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        Prioritize power allocation by vehicle SoC
                      </Text>
                    </View>
                  </View>
                </View>
              </CardContent>
            </Card>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
