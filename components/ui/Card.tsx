import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { getThemeColors, spacing, radius, shadows } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  shadow?: 'sm' | 'md' | 'lg';
}

export const Card = React.forwardRef<View, CardProps>(
  ({ children, style, shadow = 'sm' }, ref) => {
    const resolvedScheme = useResolvedColorScheme();
    const themeColors = getThemeColors(resolvedScheme);
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

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
});
