import { SafeAreaView, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getThemeColors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ChargerLiveScreen() {
  const { id } = useLocalSearchParams();
  const colors = getThemeColors('light');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Card>
          <CardHeader>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text variant="h3" weight="bold">
                Charger {id}
              </Text>
              <Badge label="Active" variant="secondary" />
            </View>
          </CardHeader>
          <CardContent style={{ gap: spacing.lg }}>
            <View
              style={{
                padding: spacing.lg,
                backgroundColor: colors.card,
                borderRadius: 12,
                justifyContent: 'center',
                alignItems: 'center',
                gap: spacing.md,
              }}
            >
              <Ionicons name="flash" size={48} color={colors.primary} />
              <Text variant="h2" weight="bold">
                22 kW
              </Text>
              <Text variant="body" style={{ color: colors.mutedForeground }}>
                Power Output
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Status
                </Text>
                <Badge label="Charging" variant="secondary" />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Temperature
                </Text>
                <Text variant="body" weight="bold">
                  42°C
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Current
                </Text>
                <Text variant="body" weight="bold">
                  32 A
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Voltage
                </Text>
                <Text variant="body" weight="bold">
                  400 V
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="body" style={{ color: colors.mutedForeground }}>
                  Session Duration
                </Text>
                <Text variant="body" weight="bold">
                  1h 23m
                </Text>
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
              <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
                Active Session
              </Text>
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ color: colors.mutedForeground }}>
                    Vehicle
                  </Text>
                  <Text variant="body" weight="bold">
                    Tesla Model 3
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ color: colors.mutedForeground }}>
                    Energy Delivered
                  </Text>
                  <Text variant="body" weight="bold">
                    28.5 kWh
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="body" style={{ color: colors.mutedForeground }}>
                    Cost
                  </Text>
                  <Text variant="body" weight="bold">
                    €8.55
                  </Text>
                </View>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
