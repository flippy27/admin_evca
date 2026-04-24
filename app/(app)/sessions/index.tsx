import { useState, useMemo, useCallback } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, TextInput } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { SessionCard } from "@/components/sessions/SessionCard";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppHeader } from "@/components/layout/AppHeader";

export default function SessionHistory() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const { user } = useAuthStore();
  const { selectedLocationId } = useChargersStore();
  const { sessions, fetchSessions, sessionsLoading } = useChargingSessionsStore();

  const [tab, setTab] = useState<"active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch sessions on mount
  useFocusEffect(
    useCallback(() => {
      if (user?.companyExternalId) {
        fetchSessions({
          payload: {
            location_ids: selectedLocationId ? [selectedLocationId] : undefined,
          },
          pagination: { page: 1, per_page: 50 },
        });
      }
    }, [user?.companyExternalId, selectedLocationId, fetchSessions])
  );

  const activeSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.connector_status === "Charging" || s.connector_status === "Preparing"
      ),
    [sessions]
  );

  const completedSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.connector_status !== "Charging" &&
          s.connector_status !== "Preparing"
      ),
    [sessions]
  );

  const filteredCompleted = useMemo(() => {
    if (!searchQuery.trim()) return completedSessions;
    const q = searchQuery.toLowerCase();
    return completedSessions.filter((s) =>
      s.charger_id?.toLowerCase().includes(q) ||
      s.license_plate?.toLowerCase().includes(q) ||
      s.session_start_datetime?.toLowerCase().includes(q)
    );
  }, [completedSessions, searchQuery]);

  const displaySessions = tab === "active" ? activeSessions : filteredCompleted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* App Header */}
      <AppHeader />

      {/* Page Header (Sesiones de Carga) */}
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
        <TouchableOpacity onPress={() => (navigation as any).goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: colors.foreground,
              marginBottom: spacing.xs,
            }}
          >
            Sesiones de Carga
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
            }}
          >
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
          paddingHorizontal: spacing.lg,
        }}
      >
        <TouchableOpacity
          onPress={() => setTab("active")}
          style={{
            flex: 1,
            paddingVertical: spacing.md,
            borderBottomWidth: 2,
            borderBottomColor: tab === "active" ? "#22c55e" : "transparent",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              justifyContent: "center",
            }}
          >
            {activeSessions.length > 0 && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#22c55e",
                }}
              />
            )}
            <Text
              style={{
                fontSize: 14,
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
            borderBottomWidth: 2,
            borderBottomColor:
              tab === "completed" ? colors.foreground : "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: tab === "completed" ? "600" : "400",
              color:
                tab === "completed"
                  ? colors.foreground
                  : colors.mutedForeground,
              textAlign: "center",
            }}
          >
            Completadas ({completedSessions.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
        }}
        scrollEnabled={!sessionsLoading}
      >
        {/* Search bar for completed sessions */}
        {tab === "completed" && completedSessions.length > 5 && (
          <View style={{ marginBottom: spacing.md, position: "relative" }}>
            <Ionicons
              name="search"
              size={16}
              color={colors.mutedForeground}
              style={{
                position: "absolute",
                left: spacing.md,
                top: "50%",
                zIndex: 10,
              }}
            />
            <TextInput
              style={{
                paddingLeft: 36,
                paddingRight: searchQuery ? 36 : spacing.md,
                paddingVertical: spacing.sm,
                fontSize: 13,
                backgroundColor: colors.input || colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                color: colors.foreground,
              }}
              placeholder="Buscar por cargador, vehículo o fecha..."
              placeholderTextColor={colors.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: spacing.md,
                  top: "50%",
                  zIndex: 10,
                }}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sessions list */}
        {displaySessions.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            {displaySessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={tab === "active"}
              />
            ))}
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 48 }}>
            <Ionicons
              name={tab === "active" ? "flash" : "calendar"}
              size={48}
              color={colors.mutedForeground}
              style={{ marginBottom: spacing.md, opacity: 0.3 }}
            />
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                textAlign: "center",
              }}
            >
              {tab === "active"
                ? "No hay sesiones activas"
                : searchQuery
                ? `No se encontraron sesiones para "${searchQuery}"`
                : "No hay sesiones completadas"}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
