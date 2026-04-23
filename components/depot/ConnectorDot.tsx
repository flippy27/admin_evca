import { View } from "react-native";
import { colors as themeColors } from "@/theme";

interface ConnectorDotProps {
  status: "Available" | "Charging" | "Finishing" | "Faulted" | "Suspended" | "Unavailable";
  size?: number;
}

const statusColors: Record<string, string> = {
  Available: themeColors.connectorStatus.available,
  Charging: themeColors.connectorStatus.charging,
  Finishing: themeColors.connectorStatus.finishing,
  Faulted: themeColors.connectorStatus.faulted,
  Suspended: themeColors.connectorStatus.suspended,
  Unavailable: "#e5e7eb",
};

export default function ConnectorDot({ status, size = 12 }: ConnectorDotProps) {
  const color = statusColors[status];

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
