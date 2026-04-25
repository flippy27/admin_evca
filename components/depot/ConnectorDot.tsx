import { View } from "react-native";
import { colors as themeColors } from "@/theme";

interface ConnectorDotProps {
  status: "Available" | "Charging" | "Finishing" | "Faulted" | "Suspended" | "Unavailable";
  size?: number;
}

const statusColors: Record<string, string> = {
  available: themeColors.connectorStatus.available,
  charging: themeColors.connectorStatus.charging,
  finishing: themeColors.connectorStatus.finishing,
  faulted: themeColors.connectorStatus.faulted,
  suspended: themeColors.connectorStatus.suspended,
  preparing: themeColors.connectorStatus.available,
  unavailable: "#e5e7eb",
  offline: "#e5e7eb",
};

export default function ConnectorDot({ status, size = 12 }: ConnectorDotProps) {
  const color = statusColors[status?.toLowerCase()] ?? "#e5e7eb";

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  );
}
