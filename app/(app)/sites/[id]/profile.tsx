import { View, SafeAreaView, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getThemeColors, spacing } from '@/theme';

export default function SiteProfileScreen() {
  const { id } = useLocalSearchParams();
  const colors = getThemeColors('light');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Card>
          <CardHeader>
            <Text variant="h3" weight="bold">
              Site Details
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Site ID
              </Text>
              <Text variant="body" weight="bold">
                {id}
              </Text>
            </View>
            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Coming soon...
              </Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
