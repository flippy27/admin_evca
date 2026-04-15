import { useEffect } from 'react';
import { FlatList, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '../../../components/ui/Text';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useChargersStore } from '../../../lib/stores/chargers.store';
import { getThemeColors, spacing } from '../../../theme';
import type { Charger } from '../../../lib/api/chargers.api';

// Mock chargers data for now
const MOCK_CHARGERS: Charger[] = [
  {
    id: '1',
    name: 'Charger-001',
    status: 'charging',
    power: 22.5,
    siteId: 'site-1',
    connectors: [
      { id: 'c1', status: 'occupied', power: 22.5, sessionId: 'session-1' },
      { id: 'c2', status: 'available', power: 0 },
    ],
  },
  {
    id: '2',
    name: 'Charger-002',
    status: 'available',
    power: 0,
    siteId: 'site-1',
    connectors: [
      { id: 'c1', status: 'available', power: 0 },
      { id: 'c2', status: 'available', power: 0 },
    ],
  },
  {
    id: '3',
    name: 'Charger-003',
    status: 'faulted',
    power: 0,
    siteId: 'site-2',
    connectors: [
      { id: 'c1', status: 'faulted', power: 0 },
      { id: 'c2', status: 'faulted', power: 0 },
    ],
  },
  {
    id: '4',
    name: 'Charger-004',
    status: 'charging',
    power: 11.0,
    siteId: 'site-2',
    connectors: [
      { id: 'c1', status: 'available', power: 0 },
      { id: 'c2', status: 'occupied', power: 11.0, sessionId: 'session-2' },
    ],
  },
];

const STATUS_COLORS: Record<string, string> = {
  available: '#22c55e',
  charging: '#8b5cf6',
  faulted: '#ef4444',
  offline: '#6b7280',
};

export default function ChargersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  const handleChargerPress = (chargerId: string) => {
    // Navigate to charger detail screen
    router.push({
      pathname: '/chargers/[id]/live' as any,
      params: { id: chargerId },
    });
  };

  const renderChargerItem = ({ item }: { item: Charger }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => handleChargerPress(item.id)}
      style={{ marginBottom: spacing.md }}
    >
      <Card>
        <CardContent style={{ gap: spacing.md }}>
          {/* Header: Name & Status */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text variant="h4" weight="bold">
              {item.name}
            </Text>
            <Badge
              label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              variant={
                item.status === 'available'
                  ? 'secondary'
                  : item.status === 'charging'
                    ? 'default'
                    : 'outline'
              }
            />
          </View>

          {/* Power & Connectors */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Power Output
              </Text>
              <Text variant="body" weight="bold">
                {item.power.toFixed(1)} kW
              </Text>
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                Connectors
              </Text>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {item.connectors.map((connector) => (
                  <View
                    key={connector.id}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: STATUS_COLORS[connector.status] || colors.muted,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={
                        connector.status === 'occupied'
                          ? 'flash-sharp'
                          : connector.status === 'faulted'
                            ? 'alert-circle'
                            : 'checkmark'
                      }
                      size={12}
                      color="white"
                    />
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Location */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.sm,
              paddingTop: spacing.sm,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <Ionicons name="location" size={14} color={colors.mutedForeground} />
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              Site {item.siteId}
            </Text>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={MOCK_CHARGERS}
        renderItem={renderChargerItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        ListHeaderComponent={
          <View style={{ marginBottom: spacing.md }}>
            <Text variant="h2" weight="bold">
              {t('common.ui.pageTitles.chargers') || 'Chargers'}
            </Text>
            <Text
              variant="body"
              style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
            >
              {MOCK_CHARGERS.length} chargers
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              No chargers found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
