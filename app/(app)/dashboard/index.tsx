import { useEffect } from 'react';
import { ScrollView, View, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '../../../components/ui/Text';
import { Card, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { useAuthStore } from '../../lib/stores/auth.store';
import { getThemeColors, spacing } from '../../../theme';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const colors = getThemeColors('light');

  // Mock statistics
  const stats = {
    totalChargers: 24,
    activeCharging: 8,
    available: 12,
    faulted: 4,
    totalSites: 6,
    energyToday: 1250.5,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.dashboard') || 'Dashboard'}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            Welcome back, {user?.fullName || 'User'}
          </Text>
        </View>

        {/* Quick Stats Grid */}
        <View style={{ gap: spacing.lg }}>
          {/* Row 1: Chargers Overview */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h3" weight="bold">
                  {stats.totalChargers}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Total Chargers
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h3" weight="bold" style={{ color: colors.roles?.supervisor }}>
                  {stats.activeCharging}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Charging
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Row 2: Status Distribution */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h3" weight="bold" style={{ color: colors.primary }}>
                  {stats.available}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Available
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h3" weight="bold" style={{ color: colors.destructive }}>
                  {stats.faulted}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Faulted
                </Text>
              </CardContent>
            </Card>
          </View>

          {/* Row 3: Sites & Energy */}
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h3" weight="bold">
                  {stats.totalSites}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Sites
                </Text>
              </CardContent>
            </Card>

            <Card style={{ flex: 1 }}>
              <CardContent style={{ alignItems: 'center', gap: spacing.sm }}>
                <Text variant="h4" weight="bold">
                  {stats.energyToday.toFixed(1)} kWh
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Today
                </Text>
              </CardContent>
            </Card>
          </View>
        </View>

        {/* User Role & Permissions */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Your Permissions
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {user?.roles.map((role) => (
                <Badge key={role} label={role} variant="secondary" />
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardContent style={{ gap: spacing.md }}>
            <Text variant="h4" weight="bold">
              Quick Links
            </Text>
            <View style={{ gap: spacing.sm }}>
              <View
                style={{
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text variant="body">📊 View Charging Sessions</Text>
              </View>
              <View
                style={{
                  paddingVertical: spacing.sm,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text variant="body">⚡ Check Charger Status</Text>
              </View>
              <View style={{ paddingVertical: spacing.sm }}>
                <Text variant="body">📍 Manage Sites</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
