import { useState, useMemo } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, TextInput } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useRouter } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";

export default function SessionHistory() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();

  const sessions = useChargingSessionsStore((state: any) => state.sessions || []);
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const activeSessions = useMemo(
    () => sessions.filter((s: any) => s.status === "Active" || s.status === "active"),
    [sessions]
  );

  const completedSessions = useMemo(
    () => sessions.filter((s: any) => s.status === "Completed" || s.status === "completed"),
    [sessions]
  );

  const filteredCompleted = useMemo(() => {
    return completedSessions.filter((s: any) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const chargerName = s.charger?.name || s.chargerId || "";
      const vehicleId = s.vehicleId || "";
      return (
        chargerName.toLowerCase().includes(q) ||
        vehicleId.toLowerCase().includes(q)
      );
    });
  }, [completedSessions, searchQuery]);

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
            Sesiones de Carga
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
            Historial y sesiones activas
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={{
          backgroundColor: colors.card,
          flexDirection: "row",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => setTab("active")}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: tab === "active" ? 2 : 0,
            borderBottomColor: tab === "active" ? "#22c55e" : colors.border,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
            {activeSessions.length > 0 && (
              <Ionicons name="ellipse" size={8} color="#22c55e" />
            )}
            <Text
              style={{
                fontSize: 13,
                fontWeight: tab === "active" ? "600" : "400",
                color: tab === "active" ? "#22c55e" : colors.mutedForeground,
              }}
            >
              Activas ({activeSessions.length})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setTab("completed")}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
            borderBottomWidth: tab === "completed" ? 2 : 0,
            borderBottomColor: tab === "completed" ? colors.foreground : colors.border,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: tab === "completed" ? "600" : "400",
              color: tab === "completed" ? colors.foreground : colors.mutedForeground,
            }}
          >
            Completadas ({completedSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          {tab === "active" && (
            <>
              {activeSessions.length > 0 ? (
                <View style={{ gap: spacing.md }}>
                  {activeSessions.map((session: any) => (
                    <SessionCard key={session.id} session={session} colors={colors} />
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                  <Ionicons name="flash" size={48} color={colors.muted} style={{ marginBottom: spacing.md }} />
                  <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                    No hay sesiones activas
                  </Text>
                </View>
              )}
            </>
          )}

          {tab === "completed" && (
            <>
              {completedSessions.length > 5 && (
                <View style={{ marginBottom: spacing.md, position: "relative" }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      paddingHorizontal: spacing.md,
                      paddingVertical: spacing.sm,
                      gap: spacing.sm,
                    }}
                  >
                    <Ionicons name="search" size={16} color={colors.mutedForeground} />
                    <TextInput
                      placeholder="Buscar por cargador..."
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      style={{
                        flex: 1,
                        fontSize: 13,
                        color: colors.foreground,
                      }}
                      placeholderTextColor={colors.mutedForeground}
                    />
                    {searchQuery ? (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close" size={16} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              )}

              {filteredCompleted.length > 0 ? (
                <View style={{ gap: spacing.md }}>
                  {filteredCompleted.map((session: any) => (
                    <SessionCard key={session.id} session={session} colors={colors} />
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
                  {searchQuery ? (
                    <>
                      <Ionicons name="search" size={48} color={colors.muted} style={{ marginBottom: spacing.md }} />
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        No se encontraron sesiones
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="time" size={48} color={colors.muted} style={{ marginBottom: spacing.md }} />
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        No hay sesiones completadas
                      </Text>
                    </>
                  )}
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SessionCard({ session, colors }: { session: any; colors: any }) {
  const duration = session.endTime
    ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
    : Math.floor((Date.now() - new Date(session.startTime).getTime()) / 60000);

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  const chargerName = session.charger?.name || session.chargerId || "Unknown";
  const isActive = session.status === "Active" || session.status === "active";

  return (
    <Card style={{ padding: spacing.md }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.sm }}>
        <View>
          <Text style={{ fontWeight: "600", color: colors.foreground, fontSize: 13 }}>
            {chargerName}
          </Text>
          <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: spacing.xs }}>
            Conector {session.connectorId || "?"}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: isActive ? "#22c55e20" : colors.muted,
            paddingHorizontal: spacing.xs,
            paddingVertical: spacing.xs / 2,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: isActive ? "#22c55e" : colors.foreground,
            }}
          >
            {isActive ? "En curso" : "Completada"}
          </Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        {session.vehicleId && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons name="battery-half" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Vehículo:</Text>
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>
              {session.vehicleId.toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Ionicons name="time" size={12} color={colors.mutedForeground} />
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Inicio:</Text>
          <Text style={{ fontSize: 11, color: colors.foreground }}>
            {new Date(session.startTime).toLocaleDateString("es-CL")} {new Date(session.startTime).toLocaleTimeString()}
          </Text>
        </View>

        {session.energy && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Ionicons name="flash" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Energía:</Text>
            <Text style={{ fontSize: 11, fontWeight: "600", color: colors.foreground }}>
              {session.energy} kWh
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
          <Ionicons name="time" size={12} color={colors.mutedForeground} />
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Duración:</Text>
          <Text style={{ fontSize: 11, color: colors.foreground }}>
            {hours > 0 ? `${hours}h ` : ""}{minutes}min
          </Text>
        </View>

        {session.startSoc !== undefined && session.endSoc !== undefined && (
          <View
            style={{
              marginTop: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
              SoC inicial: {session.startSoc}%
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
              SoC final: {session.endSoc}%
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
