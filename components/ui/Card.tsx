import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isDark?: boolean;
  shadow?: 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<View, CardProps>(
  ({ children, style, isDark = false, shadow = 'sm' }, ref) => {
    const themeColors = isDark ? colors.dark : colors.light;
    const shadowStyle = shadows[shadow];

    return (
      <View
        ref={ref}
        style={[
          styles.card,
          {
            backgroundColor: themeColors.card,
            borderColor: themeColors.border,
          },
          shadowStyle,
          style,
        ]}
      >
        {children}
      </View>
    );
  },
);

Card.displayName = 'Card';

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardHeader = ({ children, style }: CardHeaderProps) => (
  <View style={[styles.header, style]}>{children}</View>
);

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardContent = ({ children, style }: CardContentProps) => (
  <View style={[styles.content, style]}>{children}</View>
);

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const CardFooter = ({ children, style }: CardFooterProps) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
