import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  isDark?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<TouchableOpacity, ButtonProps>(
  ({
    label,
    variant = 'primary',
    size = 'md',
    onPress,
    disabled = false,
    loading = false,
    fullWidth = false,
    style,
    isDark = false,
    leftIcon,
    rightIcon,
  }, ref) => {
    const themeColors = isDark ? colors.dark : colors.light;
    const isDisabled = disabled || loading;

    const getVariantStyle = (): { background: ViewStyle; text: TextStyle } => {
      const styles: Record<ButtonVariant, { background: ViewStyle; text: TextStyle }> = {
        primary: {
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
        destructive: {
          background: {
            backgroundColor: themeColors.destructive,
          },
          text: {
            color: themeColors.destructiveForeground,
          },
        },
        ghost: {
          background: {
            backgroundColor: 'transparent',
          },
          text: {
            color: themeColors.primary,
          },
        },
      };
      return styles[variant];
    };

    const getSizeStyle = (): { container: ViewStyle; text: TextStyle } => {
      const sizes: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
        sm: {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
          text: {
            fontSize: typography.fontSize.sm,
          },
        },
        md: {
          container: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.lg,
          },
          text: {
            fontSize: typography.fontSize.base,
          },
        },
        lg: {
          container: {
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.xl,
          },
          text: {
            fontSize: typography.fontSize.lg,
          },
        },
      };
      return sizes[size];
    };

    const variantStyle = getVariantStyle();
    const sizeStyle = getSizeStyle();

    return (
      <TouchableOpacity
        ref={ref}
        onPress={onPress}
        disabled={isDisabled}
        style={[
          styles.button,
          variantStyle.background,
          sizeStyle.container,
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
        ]}
        activeOpacity={0.7}
      >
        {loading && <ActivityIndicator color={variantStyle.text.color as string} style={styles.loader} />}
        {!loading && leftIcon && leftIcon}
        <Text
          style={[
            styles.text,
            sizeStyle.text,
            variantStyle.text,
            { fontWeight: typography.fontWeight.medium },
          ]}
        >
          {label}
        </Text>
        {!loading && rightIcon && rightIcon}
      </TouchableOpacity>
    );
  },
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: typography.fontWeight.medium,
  },
  loader: {
    marginRight: spacing.sm,
  },
});
