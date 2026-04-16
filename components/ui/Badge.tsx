import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { spacing, radius, typography, getThemeColors } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge = ({
  label,
  variant = 'default',
  style,
}: BadgeProps) => {
  const resolvedScheme = useResolvedColorScheme();
  const themeColors = getThemeColors(resolvedScheme);

  const getVariantStyle = (): { background: ViewStyle; text: { color: string } } => {
    const styles: Record<BadgeVariant, { background: ViewStyle; text: { color: string } }> = {
      default: {
        background: {
          backgroundColor: themeColors.primary,
        },
        text: {
          color: themeColors.primaryForeground,
        },
      },
      secondary: {
        background: {
          backgroundColor: themeColors.secondary,
        },
        text: {
          color: themeColors.secondaryForeground,
        },
      },
      destructive: {
        background: {
          backgroundColor: themeColors.destructive,
        },
        text: {
          color: themeColors.destructiveForeground,
        },
      },
      outline: {
        background: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: themeColors.border,
        },
        text: {
          color: themeColors.foreground,
        },
      },
    };
    return styles[variant];
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.badge,
        variantStyle.background,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variantStyle.text,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600' as const,
  },
});
