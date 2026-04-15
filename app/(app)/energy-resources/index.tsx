import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Alert } from '@/components/ui/Alert';
import { useEnergyStore } from '@/lib/stores/energy.store';
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard';
import { AuthPermissionsEnum } from '@/lib/types/auth.types';
import { getThemeColors, spacing } from '@/theme';

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'solar':
      return 'sunny';
    case 'battery':
      return 'battery';
    case 'grid':
      return 'flash';
    case 'wind':
      return 'leaf';
    default:
      return 'help';
  }
};

const getResourceColor = (type: string) => {
  switch (type) {
    case 'solar':
      return '#f59e0b';
    case 'battery':
      return '#3b82f6';
    case 'grid':
      return '#ef4444';
    case 'wind':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

export default function EnergyResourcesScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.ENERGY_RESOURCES_VIEW],
  });

  // Store
  const {
    resources,
    resourcesLoading,
    resourcesError,
    fetchResources,
    clearError,
  } = useEnergyStore();

  // Fetch on mount
  useEffect(() => {
    fetchResources(1, 20);
  }, []);

  if (!hasAccess) return null;

  const handleRefresh = () => {
    clearError('resources');
    fetchResources(1, 20);
  };

  const getUtilization = (resource: any) => {
    if (!resource.capacity || resource.capacity === 0) return 0;
    const used = (resource.capacity - (resource.currentOutput || 0));
    return Math.round((used / resource.capacity) * 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={resourcesLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.energyResources') || 'Energy Resources'}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            Monitor available energy sources
          </Text>
        </View>

        {resourcesError && (
          <Alert variant="destructive" title="Error" message={resourcesError} />
        )}

        {/* Resources List */}
        {resources.map((resource) => {
          const iconColor = getResourceColor(resource.type);
          const utilization = getUtilization(resource);

          return (
            <Card key={resource.id}>
              <CardContent style={{ gap: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${iconColor}20`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Ionicons
                      name={getResourceIcon(resource.type) as any}
                      size={24}
                      color={iconColor}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="h4" weight="bold">
                      {resource.name}
                    </Text>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      {resource.type.toUpperCase()}
                    </Text>
                  </View>
                  <Badge
                    label={resource.status === 'active' ? 'Online' : 'Offline'}
                    variant={
                      resource.status === 'active' ? 'secondary' : 'outline'
                    }
                  />
                </View>

                {resource.capacity && (
                  <View style={{ gap: spacing.sm }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{ color: colors.mutedForeground }}
                      >
                        Capacity
                      </Text>
                      <Text variant="body" weight="bold">
                        {(resource.currentOutput || 0).toFixed(1)} / {resource.capacity.toFixed(1)} kW
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 6,
                        backgroundColor: colors.border,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: '100%',
                          width: `${100 - utilization}%`,
                          backgroundColor: iconColor,
                        }}
                      />
                    </View>
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      {utilization}% capacity
                    </Text>
                  </View>
                )}

                {resource.description && (
                  <View
                    style={{
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: spacing.md,
                    }}
                  >
                    <Text
                      variant="caption"
                      style={{ color: colors.mutedForeground }}
                    >
                      {resource.description}
                    </Text>
                  </View>
                )}
              </CardContent>
            </Card>
          );
        })}

        {resources.length === 0 && !resourcesLoading && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              No energy resources found. Pull to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
