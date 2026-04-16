import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/Text";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getThemeColors, spacing } from "@/theme";

export default function SupervisorScreen() {
  const router = useRouter();
  const colors = getThemeColors("light");
  const [selectedLocation, setSelectedLocation] = useState("Terminal Maipú");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        {/* Header */}
        <View style={{ gap: spacing.sm }}>
          <Text variant="h2" weight="bold">
            Supervisor
          </Text>
          <Text variant="body" style={{ color: colors.mutedForeground }}>
            PoC v1
          </Text>
        </View>

        {/* Location Selector */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.md,
            backgroundColor: colors.primary,
            borderRadius: 8,
          }}
        >
          <Text variant="body" weight="bold" style={{ color: "white" }}>
            {selectedLocation}
          </Text>
          <Ionicons name="chevron-down" size={20} color="white" />
        </TouchableOpacity>

        {/* Location Info */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <Ionicons name="flash" size={20} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Conectores activos
                </Text>
                <Text variant="h4" weight="bold">
                  3/10
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Supervisor Status */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons name="eye" size={24} color="white" />
            <Text variant="body" weight="bold" style={{ color: "white" }}>
              Supervisor
            </Text>
          </View>
          <Text
            variant="body"
            style={{ color: "white", opacity: 0.9, lineHeight: 22 }}
          >
            Estado general del patio • KPIs operacionales • Alertas y monitoreo
          </Text>
        </View>

        {/* Dashboard del Patio */}
        <View style={{ gap: spacing.md }}>
          <Text variant="h4" weight="bold">
            Dashboard del Patio
          </Text>

          {/* Utilización */}
          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  padding: spacing.md,
                  backgroundColor: "#E8F5E9",
                  borderRadius: 8,
                  gap: spacing.sm,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name="trending-up" size={20} color="#2E7D32" />
                  <Text variant="caption" style={{ color: "#2E7D32" }}>
                    Utilización
                  </Text>
                </View>
                <Text variant="h2" weight="bold" style={{ color: "#2E7D32" }}>
                  30%
                </Text>
                <Text variant="caption" style={{ color: "#558B2F" }}>
                  3 de 10 conectores
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Energía Total */}
          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  padding: spacing.md,
                  backgroundColor: "#E3F2FD",
                  borderRadius: 8,
                  gap: spacing.sm,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Ionicons name="flash" size={20} color={colors.primary} />
                  <Text variant="caption" style={{ color: colors.primary }}>
                    Energía Total
                  </Text>
                </View>
                <Text variant="h2" weight="bold" style={{ color: colors.primary }}>
                  245.0
                </Text>
                <Text variant="caption" style={{ color: "#1565C0" }}>
                  kWh entregados hoy
                </Text>
              </View>
            </CardContent>
          </Card>

          {/* Cargadores y Alertas */}
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ gap: spacing.md }}>
                <View
                  style={{
                    padding: spacing.md,
                    backgroundColor: "#F3E5F5",
                    borderRadius: 8,
                    gap: spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="flash" size={20} color="#6A1B9A" />
                  <Text variant="h3" weight="bold" style={{ color: "#6A1B9A" }}>
                    5/5
                  </Text>
                  <Text variant="caption" style={{ color: "#6A1B9A" }}>
                    online
                  </Text>
                </View>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ gap: spacing.md }}>
                <View
                  style={{
                    padding: spacing.md,
                    backgroundColor: "#FFEBEE",
                    borderRadius: 8,
                    gap: spacing.sm,
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="alert" size={20} color="#C62828" />
                  <Text variant="h3" weight="bold" style={{ color: "#C62828" }}>
                    1
                  </Text>
                  <Text variant="caption" style={{ color: "#C62828" }}>
                    con falla activa
                  </Text>
                </View>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* Distribución de Conectores */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="body" weight="bold">
              Distribución de Conectores
            </Text>
            {/* Status bar */}
            <View
              style={{
                height: 8,
                borderRadius: 4,
                flexDirection: "row",
                overflow: "hidden",
                gap: 2,
              }}
            >
              <View style={{ flex: 3, backgroundColor: "#2196F3" }} />
              <View style={{ flex: 2, backgroundColor: "#9C27B0" }} />
              <View style={{ flex: 3, backgroundColor: "#00BCD4" }} />
              <View style={{ flex: 1, backgroundColor: "#F44336" }} />
              <View style={{ flex: 1, backgroundColor: "#FFC107" }} />
            </View>
            <View style={{ gap: spacing.sm }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: "#2196F3",
                  }}
                />
                <Text variant="caption">Cargando (3)</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: "#9C27B0",
                  }}
                />
                <Text variant="caption">Finalizando (2)</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: "#00BCD4",
                  }}
                />
                <Text variant="caption">Disponible (3)</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: "#F44336",
                  }}
                />
                <Text variant="caption">Falla (1)</Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.sm,
                }}
              >
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 2,
                    backgroundColor: "#FFC107",
                  }}
                />
                <Text variant="caption">Suspendido (1)</Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Alertas Activas */}
        <View style={{ gap: spacing.md }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons name="alert" size={24} color="#C62828" />
            <Text variant="h4" weight="bold" style={{ color: "#C62828" }}>
              Alertas Activas
            </Text>
          </View>

          <Card>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  padding: spacing.md,
                  backgroundColor: "#FFEBEE",
                  borderRadius: 8,
                  flexDirection: "row",
                  gap: spacing.md,
                  alignItems: "center",
                }}
              >
                <Ionicons name="alert-circle" size={32} color="#C62828" />
                <View style={{ flex: 1, gap: spacing.sm }}>
                  <Text variant="body" weight="bold" style={{ color: "#C62828" }}>
                    Cargador CB-02 • C2
                  </Text>
                  <Text variant="caption" style={{ color: "#C62828" }}>
                    Conector con falla
                  </Text>
                </View>
                <Text variant="body" weight="bold" style={{ color: colors.primary }}>
                  Ver →
                </Text>
              </View>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
