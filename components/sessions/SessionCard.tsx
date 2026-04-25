import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { ChargingSession } from "@/lib/types/charging-session.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View } from "react-native";

interface SessionCardProps {
  session: ChargingSession;
  isActive: boolean;
}

/** Robust date parser: handles ISO strings and "YYYY-MM-DD HH:MM:SS" (iOS rejects space separator) */
function parseDate(str?: string | null): Date | null {
  if (!str) return null;
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d;
  const d2 = new Date(str.replace(" ", "T"));
  if (!isNaN(d2.getTime())) return d2;
  return null;
}

export function SessionCard({ session, isActive }: SessionCardProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  // Live ticker — updates every second for active sessions
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isActive]);

  const startDate = parseDate(session.session_start_datetime);
  const stopDate = parseDate(session.session_stop_datetime);

  // Duration: for active use live `now`, for completed use stop - start
  const startMs = startDate?.getTime() ?? null;
  const endMs = isActive ? now : (stopDate?.getTime() ?? null);
  const durationMinutes = startMs != null && endMs != null ? Math.floor((endMs - startMs) / 60000) : null;
  const hours = durationMinutes != null ? Math.floor(durationMinutes / 60) : null;
  const minutes = durationMinutes != null ? durationMinutes % 60 : null;

  // Parse energy delivered
  const energy = session.delivered_energy ? parseFloat(session.delivered_energy.toString()) : 0;

  const formattedDate =
    startDate?.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
    }) ?? "—";

  const formattedTime =
    startDate?.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    }) ?? "—";

  const showSoC = !isActive && (session.first_soc !== undefined || session.last_soc !== undefined);

  return (
    <Card style={{ padding: spacing.md }}>
      {/* Header: Charger info + Status badge */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "700",
              color: colors.foreground,
              fontSize: 16,
            }}
          >
            {session.charger_name || session.charger_id || "Unknown"}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.mutedForeground,
              marginTop: 2,
            }}
          >
            Conector {session.connector_number || "?"}
          </Text>
        </View>

        {/* Status badge */}
        <View
          style={{
            backgroundColor: isActive ? "#22c55e20" : colors.muted,
            paddingHorizontal: 10,
            paddingVertical: 2,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: isActive ? "#157e3c" : colors.mutedForeground,
            }}
          >
            {isActive ? "En curso" : "Completada"}
          </Text>
        </View>
      </View>

      {/* Session details */}
      <View style={{ gap: spacing.sm }}>
        {/* Vehicle — always shown */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Ionicons name="battery-half" size={13} color={colors.mutedForeground} />
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Vehículo:</Text>
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {session.license_plate?.toUpperCase() || "--"}
          </Text>
        </View>

        {/* Start time */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Ionicons name="calendar" size={13} color={colors.mutedForeground} />
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Inicio:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground }}>
            {formattedDate}, {formattedTime}
          </Text>
        </View>

        {/* Energy */}
        {energy > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons name="flash" size={13} color={colors.mutedForeground} />
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Energía:</Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {energy.toFixed(2)} kWh
            </Text>
          </View>
        )}

        {/* Duration */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Ionicons name="timer" size={13} color={colors.mutedForeground} />
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Duración:</Text>
          <Text style={{ fontSize: 12, color: colors.foreground }}>
            {durationMinutes != null ? `${hours! > 0 ? `${hours}h ` : ""}${minutes}min` : "—"}
          </Text>
        </View>

        {/* SoC Range — completed sessions only */}
        {showSoC && (
          <View
            style={{
              marginTop: spacing.xs,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>SoC inicial: {session.first_soc ?? "—"}%</Text>
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>SoC final: {session.last_soc ?? "—"}%</Text>
          </View>
        )}
      </View>
    </Card>
  );
}
