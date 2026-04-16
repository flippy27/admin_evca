import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { getThemeColors, spacing, radius, typography } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';

export type AlertVariant = 'default' | 'destructive' | 'success' | 'info';

interface AlertProps {
  title?: string;
  message: string;
  variant?: AlertVariant;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Alert = ({
  title,
  message,
  variant = 'default',
  style,
  icon,
}: AlertProps) => {
  const resolvedScheme = useResolvedColorScheme();
  const themeColors = getThemeColors(resolvedScheme);
  const isDark = resolvedScheme === 'dark';

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
        background: isDark ? 'oklch(0.3 0.1 29)' : '#fee2e2',
        border: '#dc2626',
        text: isDark ? '#fca5a5' : '#7f1d1d',
        title: isDark ? '#fca5a5' : '#b91c1c',
      },
      success: {
        background: isDark ? 'oklch(0.3 0.1 142)' : '#dcfce7',
        border: '#16a34a',
        text: isDark ? '#86efac' : '#15803d',
        title: isDark ? '#86efac' : '#166534',
      },
      info: {
        background: isDark ? 'oklch(0.3 0.1 255)' : '#dbeafe',
        border: '#2563eb',
        text: isDark ? '#93c5fd' : '#1e40af',
        title: isDark ? '#93c5fd' : '#1e3a8a',
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
      <View style={styles.content}>
        {title && (
          <Text
            style={[
              styles.title,
              { color: variantStyle.title, fontFamily: typography.bold },
            ]}
          >
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: variantStyle.text }]}>
          {message}
        </Text>
      </View>
      {icon && <View style={styles.icon}>{icon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 13,
  },
  icon: {
    marginTop: 2,
  },
});
