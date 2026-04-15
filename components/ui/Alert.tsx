import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

export type AlertVariant = 'default' | 'destructive' | 'success' | 'info';

interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  style?: ViewStyle;
  isDark?: boolean;
  icon?: React.ReactNode;
}

export const Alert = ({
  title,
  message,
  variant = 'default',
  style,
  isDark = false,
  icon,
}: AlertProps) => {
  const themeColors = isDark ? colors.dark : colors.light;

  const getVariantStyle = (): {
    background: string;
    border: string;
    text: string;
    title: string;
  } => {
    const variantStyles: Record<
      AlertVariant,
      { background: string; border: string; text: string; title: string }
    > = {
      default: {
        background: isDark ? 'oklch(0.2 0 0)' : '#f3f4f6',
        border: themeColors.border,
        text: themeColors.foreground,
        title: themeColors.foreground,
      },
      destructive: {
        background: isDark ? 'oklch(0.2 0.1 25)' : 'oklch(0.96 0.05 25)',
        border: themeColors.destructive,
        text: themeColors.destructive,
        title: themeColors.destructive,
      },
      success: {
        background: isDark ? 'oklch(0.25 0.1 120)' : 'oklch(0.95 0.08 120)',
        border: '#16a34a',
        text: '#16a34a',
        title: '#16a34a',
      },
      info: {
        background: isDark ? 'oklch(0.2 0.1 200)' : 'oklch(0.95 0.08 200)',
        border: '#3b82f6',
        text: '#3b82f6',
        title: '#3b82f6',
      },
    };
    return variantStyles[variant];
  };

  const variantStyle = getVariantStyle();

  return (
    <View
      style={[
        styles.alert,
        {
          backgroundColor: variantStyle.background,
          borderColor: variantStyle.border,
        },
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.textContainer}>
          {title && (
            <Text
              style={[
                styles.title,
                {
                  color: variantStyle.title,
                },
              ]}
            >
              {title}
            </Text>
          )}
          <Text
            style={[
              styles.message,
              {
                color: variantStyle.text,
              },
            ]}
          >
            {message}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  icon: {
    marginTop: spacing.xs,
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  message: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
});
