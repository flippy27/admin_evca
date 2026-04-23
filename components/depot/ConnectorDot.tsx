import { View } from "react-native";

interface ConnectorDotProps {
  status: "Available" | "Charging" | "Finishing" | "Faulted" | "Suspended" | "Unavailable";
  size?: number;
}

const statusColors = {
  Available: "#0ACDA9", // teal
  Charging: "#1477FF", // blue
  Finishing: "#a855f7", // purple
  Faulted: "#ef4444", // red
  Suspended: "#eab308", // yellow
  Unavailable: "#e5e7eb", // gray
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
