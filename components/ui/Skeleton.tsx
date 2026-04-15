/**
 * Skeleton — loading placeholder component
 * Shows animated placeholder while content loads
 */

import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { getThemeColors, spacing } from '@/theme';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius_ = 4,
  style,
}: SkeletonProps) {
  const colors = getThemeColors('light');
  const fadeAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();

    return () => animation.stop();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius_,
          backgroundColor: colors.muted,
          opacity: fadeAnim,
        },
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  lines?: number;
  style?: ViewStyle;
}

export function SkeletonCard({ lines = 3, style }: SkeletonCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getThemeColors('light').background,
        },
        style,
      ]}
    >
      <Skeleton height={16} style={{ marginBottom: spacing.md }} />
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          height={12}
          style={{
            marginBottom: idx < lines - 1 ? spacing.sm : 0,
            width: idx === lines - 1 ? '80%' : '100%',
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    borderRadius: 4,
  },
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 8,
  },
});
