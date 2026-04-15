import { SafeAreaView, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getThemeColors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface ChargingSession {
  id: string;
  vehicle: string;
  startTime: string;
  duration: string;
  energy: number;
  cost: number;
  status: 'completed' | 'cancelled';
}

const MOCK_SESSIONS: ChargingSession[] = [
  { id: '1', vehicle: 'Tesla Model 3', startTime: '2024-04-14 14:30', duration: '1h 45m', energy: 32.5, cost: 9.75, status: 'completed' },
  { id: '2', vehicle: 'BMW i3', startTime: '2024-04-14 12:15', duration: '0h 58m', energy: 18.2, cost: 5.46, status: 'completed' },
  { id: '3', vehicle: 'Nissan Leaf', startTime: '2024-04-14 10:00', duration: '1h 12m', energy: 25.0, cost: 7.50, status: 'completed' },
  { id: '4', vehicle: 'Audi e-tron', startTime: '2024-04-13 18:45', duration: '2h 30m', energy: 48.5, cost: 14.55, status: 'completed' },
  { id: '5', vehicle: 'VW ID.4', startTime: '2024-04-13 16:20', duration: '0h 42m', energy: 15.0, cost: 4.50, status: 'cancelled' },
  { id: '6', vehicle: 'Tesla Model Y', startTime: '2024-04-13 14:00', duration: '1h 35m', energy: 38.2, cost: 11.46, status: 'completed' },
];

export default function ChargerHistoryScreen() {
  const { id } = useLocalSearchParams();
  const colors = getThemeColors('light');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {MOCK_SESSIONS.map(session => (
          <Card key={session.id}>
            <CardContent style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="bold">
                    {session.vehicle}
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: spacing.xs }}>
                    {session.startTime}
                  </Text>
                </View>
                <Badge
                  label={session.status === 'completed' ? 'Done' : 'Cancelled'}
                  variant={session.status === 'completed' ? 'secondary' : 'outline'}
                />
              </View>

              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Duration
                    </Text>
                    <Text variant="body" weight="bold">
                      {session.duration}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Energy
                    </Text>
                    <Text variant="body" weight="bold">
                      {session.energy} kWh
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Cost
                    </Text>
                    <Text variant="body" weight="bold">
                      €{session.cost.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
