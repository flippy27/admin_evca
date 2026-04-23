import { useState, useMemo } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useChargersStore } from "@/lib/stores/chargers.store";

// Mock OCPP messages
const mockOCPPMessages = [
  {
    id: "1",
    type: "BootNotification",
    direction: "request",
    timestamp: new Date(Date.now() - 3600000),
    status: "success",
    payload: {
      chargePointModel: "CP-01",
      chargePointVendor: "EVCA",
      chargePointSerialNumber: "SN001",
    },
  },
  {
    id: "2",
    type: "Heartbeat",
    direction: "request",
    timestamp: new Date(Date.now() - 1800000),
    status: "success",
    payload: { currentTime: new Date().toISOString() },
  },
  {
    id: "3",
    type: "StatusNotification",
    direction: "request",
    timestamp: new Date(Date.now() - 900000),
    status: "success",
    payload: {
      connectorId: 1,
      errorCode: "NoError",
      status: "Available",
    },
  },
  {
    id: "4",
    type: "RemoteStartTransaction",
    direction: "request",
    timestamp: new Date(Date.now() - 600000),
    status: "pending",
    payload: {
      connectorId: 1,
      idTag: "BUS-001",
    },
  },
];

export default function OCPPMessages() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chargers = useChargersStore((state) => state.chargers || []);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const charger = useMemo(() => {
    return chargers.find((c: any) => c.id === id);
  }, [chargers, id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#22c55e";
      case "error":
        return colors.destructive;
      case "pending":
        return "#eab308";
      default:
        return colors.mutedForeground;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "success":
        return "Exitoso";
      case "error":
        return "Error";
      case "pending":
        return "Pendiente";
      default:
        return "Desconocido";
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.md,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
            Mensajes OCPP
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            {charger?.name}
          </Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {mockOCPPMessages.map((message) => (
            <TouchableOpacity
              key={message.id}
              onPress={() =>
                setExpandedId(expandedId === message.id ? null : message.id)
              }
              activeOpacity={0.7}
            >
              <Card
                style={{
                  padding: spacing.md,
                  backgroundColor:
                    message.status === "error" ? `${colors.destructive}10` : colors.card,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: spacing.sm,
                  }}
                >
                  <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                    <Ionicons name="chatbubbles" size={16} color={colors.foreground} />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "600",
                          color: colors.foreground,
                        }}
                      >
                        {message.type}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: spacing.xs }}>
                        <Ionicons name="time" size={10} color={colors.mutedForeground} />
                        <Text
                          style={{
                            fontSize: 10,
                            color: colors.mutedForeground,
                          }}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <View
                      style={{
                        backgroundColor: getStatusColor(message.status) + "20",
                        paddingHorizontal: spacing.xs,
                        paddingVertical: spacing.xs / 2,
                        borderRadius: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "600",
                          color: getStatusColor(message.status),
                        }}
                      >
                        {getStatusLabel(message.status)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-down"
                      size={16}
                      color={colors.mutedForeground}
                      style={{
                        transform: [
                          {
                            rotate: expandedId === message.id ? "180deg" : "0deg",
                          },
                        ],
                      }}
                    />
                  </View>
                </View>

                {/* Payload Details */}
                {expandedId === message.id && (
                  <View
                    style={{
                      marginTop: spacing.md,
                      paddingTop: spacing.md,
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      gap: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: colors.mutedForeground,
                      }}
                    >
                      PAYLOAD
                    </Text>
                    {Object.entries(message.payload).map(([key, value]) => (
                      <View
                        key={key}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          paddingVertical: spacing.xs,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            color: colors.mutedForeground,
                          }}
                        >
                          {key}:
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {String(value)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
