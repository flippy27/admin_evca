import { Text } from "@/components/ui/Text";
import { spacing, colors as themeColors } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity, View } from "react-native";
import { SessionCard } from "./SessionCard";

const COLORS = themeColors.connectorStatus;

interface Session {
  id: string;
  charger_name: string;
  charger_id: string;
  connector_number: number;
  vehicleId: string;
  energy?: number;
  duration?: number;
}

interface ActiveSessionsListProps {
  sessions: Session[];
}

export function ActiveSessionsList({ sessions }: ActiveSessionsListProps) {
  const navigation = useNavigation();

  if (sessions.length === 0) return null;

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.available,
            }}
          />
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: "#1f2937",
            }}
          >
            Sesiones Activas ({sessions.length})
          </Text>
        </View>
        <TouchableOpacity onPress={() => (navigation as any).navigate("sessions/index")}>
          <Text
            style={{
              color: "#8b5cf6",
              fontSize: 12,
              fontWeight: "500",
            }}
          >
            Ver todas →
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
        {sessions.map((s) => (
          <SessionCard
            key={s.id}
            chargerName={s.charger_name}
            chargerId={s.charger_id}
            connectorNumber={s.connector_number}
            vehicleId={s.vehicleId}
            energy={s.energy || 0}
            duration={s.duration || 0}
          />
        ))}
      </View>
    </View>
  );
}
