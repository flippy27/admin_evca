import { SafeAreaView, ScrollView, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui/Text';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getThemeColors, spacing } from '../../theme';

const REPORT_TYPES = [
  { id: '1', name: 'User Activity Logs', count: 1250 },
  { id: '2', name: 'Charger Alarms', count: 45 },
  { id: '3', name: 'Energy Consumption', count: 890 },
  { id: '4', name: 'Charging Sessions', count: 3120 },
  { id: '5', name: 'OCPP Messages', count: 15400 },
];

export default function ReportingScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.reporting') || 'Reporting'}
          </Text>
          <Text variant="body" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
            View and export detailed reports
          </Text>
        </View>

        {REPORT_TYPES.map((report) => (
          <Card key={report.id}>
            <CardContent style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text variant="h4" weight="bold">
                  {report.name}
                </Text>
              </View>
              <Badge label={`${report.count} records`} variant="default" />
            </CardContent>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
