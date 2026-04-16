import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { getThemeColors } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  marginBottom?: number;
}

interface SkeletonLineProps extends SkeletonProps {
  numberOfLines?: number;
}

const colors = getThemeColors('light');
const baseColor = colors.muted;
const highlightColor = colors.background;

/**
 * Animated shimmer effect
 */
const ShimmerAnimation = ({ children }: { children: React.ReactNode }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 1, 0.3],
  });

  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};

/**
 * Skeleton Line - for text content
 */
export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = '100%',
  height = 12,
  borderRadius = 4,
  marginBottom = 8,
  numberOfLines = 1,
}) => {
  return (
    <View style={{ marginBottom: marginBottom * numberOfLines }}>
      {Array.from({ length: numberOfLines }).map((_, i) => (
        <ShimmerAnimation key={i}>
          <View
            style={{
              width,
              height,
              backgroundColor: baseColor,
              borderRadius,
              marginBottom: i < numberOfLines - 1 ? marginBottom : 0,
            }}
          />
        </ShimmerAnimation>
      ))}
    </View>
  );
};

/**
 * Skeleton Circle - for avatars
 */
export const SkeletonCircle: React.FC<{ size?: number; marginBottom?: number }> = ({
  size = 40,
  marginBottom = 0,
}) => {
  return (
    <ShimmerAnimation>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: baseColor,
          marginBottom,
        }}
      />
    </ShimmerAnimation>
  );
};

/**
 * Skeleton Rectangle - for images or cards
 */
export const SkeletonRectangle: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 200,
  borderRadius = 8,
  marginBottom = 0,
}) => {
  return (
    <ShimmerAnimation>
      <View
        style={{
          width,
          height,
          backgroundColor: baseColor,
          borderRadius,
          marginBottom,
        }}
      />
    </ShimmerAnimation>
  );
};

/**
 * Skeleton Card - for card content
 */
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      <SkeletonLine width="60%" height={16} />
      <View style={{ gap: 8 }}>
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === lines - 1 ? '80%' : '100%'}
            height={12}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * Skeleton List Item - for list entries
 */
export const SkeletonListItem: React.FC = () => {
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}>
      <SkeletonCircle size={48} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonLine width="70%" height={14} />
        <SkeletonLine width="100%" height={12} />
      </View>
    </View>
  );
};

/**
 * Skeleton Grid - for grid layouts
 */
export const SkeletonGrid: React.FC<{ columns?: number; items?: number }> = ({
  columns = 2,
  items = 4,
}) => {
  return (
    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
      {Array.from({ length: items }).map((_, i) => (
        <View key={i} style={{ width: `${100 / columns - 3}%` }}>
          <SkeletonRectangle height={150} borderRadius={8} marginBottom={8} />
          <SkeletonLine width="80%" height={12} />
        </View>
      ))}
    </View>
  );
};

/**
 * Skeleton Chart - for dashboard charts
 */
export const SkeletonChart: React.FC<{ height?: number }> = ({ height = 200 }) => {
  return (
    <View style={{ gap: 12 }}>
      <SkeletonLine width="40%" height={14} />
      <SkeletonRectangle height={height} borderRadius={8} />
    </View>
  );
};
