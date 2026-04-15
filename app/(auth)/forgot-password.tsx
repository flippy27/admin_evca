import { View } from 'react-native';
import { Text } from '../../components/ui/Text';
import { getThemeColors } from '../../theme';

export default function ForgotPasswordScreen() {
  const colors = getThemeColors('light');
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <Text variant="h2">Forgot Password</Text>
      <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: 8 }}>Coming soon...</Text>
    </View>
  );
}
