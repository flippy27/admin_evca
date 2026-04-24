import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";

interface TecleButtonProps {
  onPress: () => void;
}

export function TecleButton({ onPress }: TecleButtonProps) {
  return (
    <View
      style={{
        position: "absolute",
        bottom: 24,
        right: 24,
        zIndex: 30,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: "#a855f7",
          borderRadius: 9999,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <View style={{ flexDirection: "column", alignItems: "center" }}>
          <Ionicons name="arrow-up" size={20} color="white" />
          <Ionicons name="arrow-up" size={20} color="white" style={{ marginTop: -4 }} />
        </View>
        <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
          Tecle
        </Text>
      </TouchableOpacity>
    </View>
  );
}
