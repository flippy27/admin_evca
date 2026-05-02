import { TouchableOpacity, View } from "react-native";
import { Text } from "@/components/ui/Text";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

interface TecleButtonProps {
  onPress: () => void;
}

export function TecleButton({ onPress }: TecleButtonProps) {
  const { t } = useTranslation();
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
        <Feather name="chevrons-up" size={20} color="white" />
        <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>
          {t("mobile.tecle.button")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
