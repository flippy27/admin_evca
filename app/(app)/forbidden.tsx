import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { getThemeColors, spacing } from '@/theme';

/**
 * Access Denied / Forbidden screen
 * Shown when user tries to access a route without required permissions
 */
export default function ForbiddenScreen() {
  const router = useRouter();
  const colors = getThemeColors('light');

  const handleGoBack = () => {
    router.back();
  };

  const handleGoDashboard = () => {
    router.replace('/(app)/dashboard');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.destructive + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.lg,
          }}
        >
          <Ionicons
            name="lock-closed"
            size={40}
            color={colors.destructive}
          />
        </View>

        <Text
          variant="h2"
          weight="bold"
          style={{ textAlign: 'center', marginBottom: spacing.md }}
        >
          Access Denied
        </Text>

        <Text
          variant="body"
          style={{
            textAlign: 'center',
            color: colors.mutedForeground,
            marginBottom: spacing.lg,
          }}
        >
          You don't have permission to access this resource. Please contact your administrator if you need access.
        </Text>

        <View style={{ width: '100%', gap: spacing.md }}>
          <Button
            label="Go Back"
            onPress={handleGoBack}
            variant="secondary"
            fullWidth
          />
          <Button
            label="Go to Dashboard"
            onPress={handleGoDashboard}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
