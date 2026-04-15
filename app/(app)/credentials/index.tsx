import React, { useEffect } from 'react';
import { SafeAreaView, ScrollView, View, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { Alert } from '@/components/ui/Alert';
import { useCredentialsStore } from '@/lib/stores/credentials.store';
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard';
import { AuthPermissionsEnum } from '@/lib/types/auth.types';
import { getThemeColors, spacing } from '@/theme';

export default function CredentialsScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors('light');

  // Permission guard
  const hasAccess = usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.CREDENTIALS_VIEW],
  });

  // Store
  const {
    credentials,
    credentialsLoading,
    credentialsError,
    revokeLoading,
    revokeError,
    fetchCredentials,
    revokeCredential,
    clearError,
  } = useCredentialsStore();

  // Fetch on mount
  useEffect(() => {
    fetchCredentials(1, 20);
  }, []);

  if (!hasAccess) return null;

  const handleRefresh = () => {
    clearError('credentials');
    fetchCredentials(1, 20);
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeCredential(id);
    } catch {
      // Error handled by store
    }
  };

  const typeLabels: Record<string, string> = {
    api_key: 'API Key',
    token: 'Token',
    other: 'Other',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={credentialsLoading}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.credentials') || 'Credentials'}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            Manage API credentials
          </Text>
        </View>

        {credentialsError && (
          <Alert variant="destructive" title="Error" message={credentialsError} />
        )}
        {revokeError && (
          <Alert variant="destructive" title="Error" message={revokeError} />
        )}

        {/* Credentials List */}
        {credentials.map((credential) => (
          <Card key={credential.id}>
            <CardContent style={{ gap: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="bold">
                    {credential.name}
                  </Text>
                  <Text
                    variant="caption"
                    style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
                  >
                    {typeLabels[credential.type]}
                  </Text>
                </View>
                <Badge
                  label={credential.isActive ? 'Active' : 'Inactive'}
                  variant={credential.isActive ? 'secondary' : 'outline'}
                />
              </View>

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
                  Created: {new Date(credential.createdAt).toLocaleDateString()}
                </Text>
                <Button
                  label={revokeLoading ? 'Revoking...' : 'Revoke'}
                  variant="destructive"
                  size="sm"
                  onPress={() => handleRevoke(credential.id)}
                  disabled={revokeLoading}
                />
              </View>

              {credential.lastUsedAt && (
                <View style={{ paddingTop: spacing.sm }}>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    Last used: {new Date(credential.lastUsedAt).toLocaleDateString()}
                  </Text>
                </View>
              )}
            </CardContent>
          </Card>
        ))}

        {credentials.length === 0 && !credentialsLoading && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text variant="body" style={{ color: colors.mutedForeground }}>
              No credentials found. Pull to refresh.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
