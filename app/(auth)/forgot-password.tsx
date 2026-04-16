import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { Text } from "@/components/ui/Text";
import { getThemeColors } from "@/theme";
import { View } from "react-native";

export default function ForgotPasswordScreen() {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text variant="h2">Forgot Password</Text>
      <Text
        variant="caption"
        style={{ color: colors.mutedForeground, marginTop: 8 }}
      >
        Coming soon...
      </Text>
    </View>
  );
}
