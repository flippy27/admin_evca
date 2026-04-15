import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Alert } from '@/components/ui/Alert';
import { BottomDrawer } from '@/components/ui/BottomDrawer';
import { useReportingStore } from '@/lib/stores/reporting.store';
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard';
import { AuthPermissionsEnum } from '@/lib/config/permissions';
import { getThemeColors, spacing } from '@/theme';

type ReportingTab = 'all' | 'pending' | 'completed';

export default function ReportingScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.REPORTS_VIEW],
  });

  // Store
  const {
    reports,
    reportsLoading,
    reportsError,
    fetchReports,
    clearError,
  } = useReportingStore();

  // UI State
  const [activeTab, setActiveTab] = useState<ReportingTab>('all');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Fetch on mount
  useEffect(() => {
    fetchReports(1, 20);
  }, []);

  if (!hasAccess) return null;

  const handleRefresh = () => {
    clearError('reports');
    fetchReports(1, 20);
  };

  const statusColors: Record<string, string> = {
    pending: colors.primary,
    completed: '#22c55e',
    failed: '#ef4444',
  };

  // Filter reports by tab
  const filteredReports = reports.filter((report) => {
    if (activeTab === 'all') return true;
    return report.status === activeTab;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Tabs */}
        <View
          style={{
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            backgroundColor: colors.card,
            paddingHorizontal: spacing.lg,
          }}
        >
          {(['all', 'pending', 'completed'] as ReportingTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderBottomWidth: activeTab === tab ? 2 : 0,
                borderBottomColor: colors.primary,
              }}
            >
              <Text
                variant="body"
                weight={activeTab === tab ? 'semibold' : 'normal'}
                style={{
                  color: activeTab === tab ? colors.primary : colors.mutedForeground,
                }}
              >
                {tab === 'all' ? 'All' : tab === 'pending' ? 'Pending' : 'Completed'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
          refreshControl={
            <RefreshControl refreshing={reportsLoading} onRefresh={handleRefresh} />
          }
        >
          {/* Header */}
          <View>
            <Text variant="h2" weight="bold">
              {t('common.ui.pageTitles.reporting') || 'Reporting'}
            </Text>
            <Text
              variant="body"
              style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
            >
              {filteredReports.length} reports
            </Text>
          </View>

          {reportsError && (
            <Alert variant="destructive" title="Error" message={reportsError} />
          )}

          {/* Reports List */}
          {filteredReports?.map((report) => (
          <Card key={report.id}>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="bold">
                    {report.name}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
                  >
                    {report.type}
                  </Text>
                </View>
                <Badge
                  label={report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  variant={
                    report.status === 'completed'
                      ? 'secondary'
                      : report.status === 'failed'
                        ? 'destructive'
                        : 'outline'
                  }
                />
              </View>

              {report.description && (
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
                    {report.description}
                  </Text>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                  paddingTop: spacing.md,
                }}
              >
                <Text
                  variant="caption"
                  style={{ color: colors.mutedForeground }}
                >
                  {new Date(report.createdAt).toLocaleDateString()}
                </Text>
                <Ionicons
                  name={
                    report.status === 'completed'
                      ? 'checkmark-circle'
                      : report.status === 'failed'
                        ? 'alert-circle'
                        : 'hourglass'
                  }
                  size={16}
                  color={statusColors[report.status]}
                />
              </View>
            </CardContent>
          </Card>
        ))}

          {filteredReports.length === 0 && !reportsLoading && (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <Text variant="body" style={{ color: colors.mutedForeground }}>
                No {activeTab === 'all' ? 'reports' : activeTab} reports found. Pull to refresh.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Filter Drawer */}
        <BottomDrawer
          visible={filterDrawerOpen}
          onClose={() => setFilterDrawerOpen(false)}
          title="Filter Reports"
          height={200}
        >
          <ScrollView style={{ paddingBottom: spacing.lg }}>
            <Text variant="body" weight="semibold" style={{ marginBottom: spacing.md }}>
              Status
            </Text>
          </ScrollView>
        </BottomDrawer>
      </View>
    </SafeAreaView>
  );
}
