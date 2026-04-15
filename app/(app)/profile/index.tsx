import { SafeAreaView, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/Text';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { getThemeColors, spacing } from '@/theme';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = getThemeColors('light');
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);
  const language = useAppStore(s => s.language);
  const colorScheme = useAppStore(s => s.colorScheme);
  const setLanguage = useAppStore(s => s.setLanguage);
  const setColorScheme = useAppStore(s => s.setColorScheme);

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }}>
        <View>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.profile') || 'Profile'}
          </Text>
          <Text variant="body" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
            {t('common.ui.labels.manageAccount') || 'Manage your account'}
          </Text>
        </View>

        {user && (
          <Card>
            <CardHeader>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Ionicons name="person-circle" size={48} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="h4" weight="bold">
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text variant="body" style={{ color: colors.mutedForeground }}>
                    {user.email}
                  </Text>
                </View>
              </View>
            </CardHeader>
            <CardContent style={{ gap: spacing.md }}>
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
                <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                  {t('common.ui.labels.role') || 'Role'}
                </Text>
                <View style={{ gap: spacing.sm }}>
                  {user.roles && user.roles.map(role => (
                    <Badge key={role} label={role} variant="secondary" />
                  ))}
                </View>
              </View>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              {t('common.ui.labels.preferences') || 'Preferences'}
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">
                  {t('common.ui.labels.language') || 'Language'}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  {language === 'es' ? 'Español' : 'English'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button
                  label="ES"
                  size="sm"
                  variant={language === 'es' ? 'primary' : 'outline'}
                  onPress={() => setLanguage('es')}
                />
                <Button
                  label="EN"
                  size="sm"
                  variant={language === 'en' ? 'primary' : 'outline'}
                  onPress={() => setLanguage('en')}
                />
              </View>
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    {t('common.ui.labels.theme') || 'Theme'}
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    {colorScheme === 'light' ? 'Light' : colorScheme === 'dark' ? 'Dark' : 'System'}
                  </Text>
                </View>
                <View style={{ gap: spacing.xs }}>
                  {['light', 'dark', 'system'].map(scheme => (
                    <Button
                      key={scheme}
                      label={scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      size="sm"
                      variant={colorScheme === scheme ? 'primary' : 'outline'}
                      onPress={() => setColorScheme(scheme as any)}
                    />
                  ))}
                </View>
              </View>
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              {t('common.ui.labels.security') || 'Security'}
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <Button
              label={t('common.ui.actions.changePassword') || 'Change Password'}
              variant="outline"
              onPress={() => {
                // TODO: navigate to change password screen
              }}
            />
          </CardContent>
        </Card>

        <Button
          label={t('common.ui.actions.logout') || 'Logout'}
          variant="destructive"
          onPress={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
