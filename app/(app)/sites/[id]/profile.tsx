import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, RefreshControl } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '../../../../components/ui/Text';
import { Card, CardContent } from '../../../../components/ui/Card';
import { Badge } from '../../../../components/ui/Badge';
import { Alert } from '../../../../components/ui/Alert';
import { useSitesStore } from '../../../../lib/stores/sites.store';
import { getThemeColors, spacing } from '../../../../theme';

export default function SiteProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = getThemeColors('light');

  const {
    selectedSite,
    detailLoading,
    detailError,
    fetchSiteDetail,
    clearError,
  } = useSitesStore();

  useEffect(() => {
    if (id) {
      fetchSiteDetail(id);
    }
  }, [id]);

  if (!selectedSite) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl refreshing={detailLoading} onRefresh={() => {
            clearError('detail');
            fetchSiteDetail(id!);
          }} />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">{selectedSite.name}</Text>
          <Badge
            label={selectedSite.status === 'active' ? 'Active' : 'Inactive'}
            variant={selectedSite.status === 'active' ? 'secondary' : 'outline'}
            style={{ alignSelf: 'flex-start', marginTop: spacing.sm }}
          />
        </View>

        {detailError && <Alert variant="destructive" title="Error" message={detailError} />}

        {/* Location & Address */}
        <Card>
          <CardContent style={{ gap: spacing.lg }}>
            <Text variant="h3" weight="bold">Location</Text>

            <View style={{ gap: spacing.md }}>
              {selectedSite.address && (
                <View>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    Address
                  </Text>
                  <Text variant="body">{selectedSite.address}</Text>
                </View>
              )}

              {selectedSite.city && (
                <View>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    City
                  </Text>
                  <Text variant="body">{selectedSite.city}</Text>
                </View>
              )}

              {selectedSite.country && (
                <View>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    Country
                  </Text>
                  <Text variant="body">{selectedSite.country}</Text>
                </View>
              )}
            </View>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardContent style={{ gap: spacing.lg }}>
            <Text variant="h3" weight="bold">Statistics</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="flash" size={24} color={colors.primary} />
                <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
                  Total Power
                </Text>
                <Text variant="h4" weight="bold">
                  {selectedSite.totalPower?.toFixed(1) || '0'} kW
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="flash-outline" size={24} color={colors.primary} />
                <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
                  Chargers
                </Text>
                <Text variant="h4" weight="bold">
                  {selectedSite.chargerCount || 0}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Energy Usage */}
        {selectedSite.energyUsage && (
          <Card>
            <CardContent style={{ gap: spacing.lg }}>
              <Text variant="h3" weight="bold">Energy Usage</Text>

              <View style={{ gap: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text variant="body">Today</Text>
                  <Text variant="body" weight="bold">
                    {selectedSite.energyUsage.today?.toFixed(1) || 0} kWh
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text variant="body">This Week</Text>
                  <Text variant="body" weight="bold">
                    {selectedSite.energyUsage.week?.toFixed(1) || 0} kWh
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingBottom: spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text variant="body">This Month</Text>
                  <Text variant="body" weight="bold">
                    {selectedSite.energyUsage.month?.toFixed(1) || 0} kWh
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="body">This Year</Text>
                  <Text variant="body" weight="bold">
                    {selectedSite.energyUsage.year?.toFixed(1) || 0} kWh
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        {/* Chargers at Site */}
        {selectedSite.chargers && selectedSite.chargers.length > 0 && (
          <Card>
            <CardContent style={{ gap: spacing.lg }}>
              <Text variant="h3" weight="bold">Chargers ({selectedSite.chargers.length})</Text>

              <View style={{ gap: spacing.md }}>
                {selectedSite.chargers.slice(0, 5).map((charger: any) => (
                  <View
                    key={charger.id}
                    style={{
                      paddingBottom: spacing.md,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text variant="body" weight="bold">{charger.name}</Text>
                      <Badge
                        label={charger.status.charAt(0).toUpperCase() + charger.status.slice(1)}
                        variant={charger.status === 'available' ? 'secondary' : 'outline'}
                      />
                    </View>
                    <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
                      {charger.connectorCount || 0} connectors
                    </Text>
                  </View>
                ))}
              </View>

              {selectedSite.chargers.length > 5 && (
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.md }}
                >
                  +{selectedSite.chargers.length - 5} more chargers
                </Text>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contact Info */}
        {(selectedSite.contactPerson || selectedSite.contactEmail || selectedSite.contactPhone) && (
          <Card>
            <CardContent style={{ gap: spacing.lg }}>
              <Text variant="h3" weight="bold">Contact</Text>

              <View style={{ gap: spacing.md }}>
                {selectedSite.contactPerson && (
                  <View>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Contact Person
                    </Text>
                    <Text variant="body">{selectedSite.contactPerson}</Text>
                  </View>
                )}

                {selectedSite.contactEmail && (
                  <View>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Email
                    </Text>
                    <Text variant="body">{selectedSite.contactEmail}</Text>
                  </View>
                )}

                {selectedSite.contactPhone && (
                  <View>
                    <Text variant="caption" style={{ color: colors.mutedForeground }}>
                      Phone
                    </Text>
                    <Text variant="body">{selectedSite.contactPhone}</Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
