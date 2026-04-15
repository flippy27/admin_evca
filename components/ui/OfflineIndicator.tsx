/**
 * OfflineIndicator — shows when device is offline
 * Displays at top of screen when no network connection
 */

import React from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { getThemeColors, spacing } from '@/theme';
import { useNetworkStatus } from '@/lib/hooks/useNetworkStatus';
import { Ionicons } from '@expo/vector-icons';

export function OfflineIndicator() {
  const { isOnline } = useNetworkStatus();
  const colors = getThemeColors('light');
  const fadeAnim = React.useRef(new Animated.Value(isOnline ? 0 : 1)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline, fadeAnim]);

  if (isOnline) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors.destructive,
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="wifi-off" size={16} color="white" />
        <Text
          variant="body"
          weight="bold"
          style={{
            color: 'white',
            marginLeft: spacing.sm,
          }}
        >
          No connection
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
