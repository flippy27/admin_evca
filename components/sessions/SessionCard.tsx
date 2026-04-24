import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { spacing, getThemeColors } from "@/theme";
import { ChargingSession } from "@/lib/types/charging-session.types";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

interface SessionCardProps {
  session: ChargingSession;
  isActive: boolean;
}

export function SessionCard({ session, isActive }: SessionCardProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  // Calculate duration
  const startTime = session.session_start_datetime
    ? new Date(session.session_start_datetime).getTime()
    : Date.now();

  const endTime = session.session_stop_datetime
    ? new Date(session.session_stop_datetime).getTime()
    : Date.now();

  const durationMinutes = Math.floor((endTime - startTime) / 60000);
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  // Parse energy delivered
  const energy = session.delivered_energy
    ? parseFloat(session.delivered_energy.toString())
    : 0;

  // Format start time
  const startDate = session.session_start_datetime
    ? new Date(session.session_start_datetime)
    : new Date();

  const formattedDate = startDate.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
  });

  const formattedTime = startDate.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });

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
              fontWeight: "600",
              color: colors.foreground,
              fontSize: 13,
            }}
          >
            {session.charger_name || session.charger_id || "Unknown"}
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: colors.mutedForeground,
              marginTop: spacing.xs,
            }}
          >
            Conector {session.connector_number || "?"}
          </Text>
        </View>

        {/* Status badge */}
        <View
          style={{
            backgroundColor: isActive ? "#22c55e20" : colors.border,
            paddingHorizontal: spacing.xs,
            paddingVertical: 4,
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

      {/* Session details */}
      <View style={{ gap: spacing.sm }}>
        {/* Vehicle */}
        {session.license_plate && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.sm,
            }}
          >
            <Ionicons
              name="battery-half"
              size={12}
              color={colors.mutedForeground}
            />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
              Vehículo:
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: colors.foreground,
              }}
            >
              {session.license_plate.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Start time */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <Ionicons name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            Inicio:
          </Text>
          <Text style={{ fontSize: 11, color: colors.foreground }}>
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
            <Ionicons name="flash" size={12} color={colors.mutedForeground} />
            <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
              Energía:
            </Text>
            <Text
              style={{
                fontSize: 11,
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
          <Ionicons name="timer" size={12} color={colors.mutedForeground} />
          <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
            Duración:
          </Text>
          <Text style={{ fontSize: 11, color: colors.foreground }}>
            {hours > 0 ? `${hours}h ` : ""}
            {minutes}min
          </Text>
        </View>

        {/* SoC Range */}
        {(session.first_soc !== undefined ||
          session.last_soc !== undefined) && (
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
              SoC inicial: {session.first_soc || "—"}%
            </Text>
            <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
              SoC final: {session.last_soc || "—"}%
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
