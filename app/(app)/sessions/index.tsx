import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Animated, ScrollView, TouchableOpacity, View, SafeAreaView, TextInput } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useChargingSessionsStore } from "@/lib/stores/charging-session.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { SessionCard } from "@/components/sessions/SessionCard";
import { ChargingSession } from "@/lib/types/charging-session.types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppHeader } from "@/components/layout/AppHeader";

export default function SessionHistory() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const navigation = useNavigation();

  const { user } = useAuthStore();
  const { selectedLocationId } = useChargersStore();
  const { sessions, fetchSessions, sessionsLoading } = useChargingSessionsStore();
  const groupData = useGroupStore((s) => s.groupData);

  const [tab, setTab] = useState<"active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");

  // Pulse animation for active dot
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Fetch completed sessions on focus
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

  // Derive active sessions from groupData — connectors with is_charging === true
  const activeSessions = useMemo((): ChargingSession[] => {
    if (!groupData) return [];

    const result: ChargingSession[] = [];

    const processCharger = (gc: typeof groupData.chargers[number]) => {
      for (const conn of gc.connectors) {
        if (!conn.is_charging) continue;
        result.push({
          transaction_id: conn.last_charging_record?.transaction_id,
          charger_id: String(gc.charger_ID),
          charger_name: gc.charger_name,
          connector_id: conn.connector_id,
          connector_number: conn.connector_number,
          connector_status: conn.connector_status,
          license_plate: conn.licence_plate ?? undefined,
          // connector_status_timestamp = when status changed to Charging ≈ session start
          session_start_datetime: conn.connector_status_timestamp,
          delivered_energy: conn.last_charging_record?.energy != null
            ? String(conn.last_charging_record.energy)
            : undefined,
          last_soc: conn.soc_pct ?? undefined,
        });
      }
    };

    if (groupData.areas.length > 0) {
      for (const area of groupData.areas) {
        for (const line of area.lines) {
          for (const gc of line.chargers) {
            processCharger(gc);
          }
        }
      }
    } else {
      for (const gc of groupData.chargers) {
        processCharger(gc);
      }
    }

    return result;
  }, [groupData]);

  // All sessions from API are completed
  const completedSessions = sessions;

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

      {/* Page Header */}
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
              <View style={{ width: 10, height: 10, alignItems: "center", justifyContent: "center" }}>
                {/* Pulse ring */}
                <Animated.View
                  style={{
                    position: "absolute",
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#22c55e",
                    opacity: pulseAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.5, 0] }),
                    transform: [{ scale: pulseAnim }],
                  }}
                />
                {/* Core dot */}
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#22c55e" }} />
              </View>
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
            borderBottomColor: tab === "completed" ? colors.foreground : "transparent",
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: tab === "completed" ? "600" : "400",
              color: tab === "completed" ? colors.foreground : colors.mutedForeground,
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
              style={{ position: "absolute", left: spacing.md, top: "50%", zIndex: 10 }}
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
                style={{ position: "absolute", right: spacing.md, top: "50%", zIndex: 10 }}
              >
                <Ionicons name="close" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Sessions list */}
        {displaySessions.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            {displaySessions.map((session, i) => (
              <SessionCard
                key={session.transaction_id ?? session.connector_id ?? session.id ?? String(i)}
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
              style={{ fontSize: 14, color: colors.mutedForeground, textAlign: "center" }}
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
