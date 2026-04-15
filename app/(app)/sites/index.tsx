import { FlatList, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '../../components/ui/Text';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { getThemeColors, spacing } from '../../../theme';

interface Site {
  id: string;
  name: string;
  location: string;
  chargers: number;
  status: 'active' | 'inactive';
}

const MOCK_SITES: Site[] = [
  { id: 'site-1', name: 'Downtown Station', location: 'Madrid', chargers: 8, status: 'active' },
  { id: 'site-2', name: 'Airport Hub', location: 'Madrid-Barajas', chargers: 6, status: 'active' },
  { id: 'site-3', name: 'Mall Charging', location: 'Barcelona', chargers: 4, status: 'inactive' },
  { id: 'site-4', name: 'Highway Rest', location: 'A-7', chargers: 6, status: 'active' },
];

export default function SitesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  const handleSitePress = (siteId: string) => {
    router.push({
      pathname: '/sites/[id]/profile' as any,
      params: { id: siteId },
    });
  };

  const renderSiteItem = ({ item }: { item: Site }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleSitePress(item.id)}
      style={{ marginBottom: spacing.md }}
    >
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text variant="h4" weight="bold">
                {item.name}
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
                <Ionicons name="location" size={12} color={colors.mutedForeground} />
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  {item.location}
                </Text>
              </View>
            </View>
            <Badge
              label={item.status === 'active' ? 'Active' : 'Inactive'}
              variant={item.status === 'active' ? 'secondary' : 'outline'}
            />
          </View>
          <View style={{ paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              {item.chargers} chargers
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={MOCK_SITES}
        renderItem={renderSiteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text variant="h2" weight="bold">
              {t('common.ui.pageTitles.sites') || 'Sites'}
            </Text>
            <Text variant="body" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
              {MOCK_SITES.length} sites
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
