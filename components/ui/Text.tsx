import React from 'react';
import { Text as RNText, StyleSheet, TextProps, TextStyle, StyleProp } from 'react-native';
import { colors, typography } from '../../theme';

export type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';

interface CustomTextProps extends TextProps {
  variant?: TextVariant;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  isDark?: boolean;
  style?: StyleProp<TextStyle>;
}

export const Text = React.forwardRef<RNText, CustomTextProps>(
  ({
    variant = 'body',
    weight,
    isDark = false,
    style,
    children,
    ...props
  }, ref) => {
    const themeColors = isDark ? colors.dark : colors.light;

    const getVariantStyle = (): TextStyle => {
      const variantStyles: Record<TextVariant, TextStyle> = {
        h1: {
          fontSize: typography.fontSize['3xl'],
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.fontSize['3xl'] * typography.lineHeight.tight,
        },
        h2: {
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
        },
        h3: {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize.xl * typography.lineHeight.tight,
        },
        h4: {
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize.lg * typography.lineHeight.tight,
        },
        body: {
          fontSize: typography.fontSize.base,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.fontSize.base * typography.lineHeight.normal,
        },
        caption: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.normal,
          lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
        },
      };
      return variantStyles[variant];
    };

    return (
      <RNText
        ref={ref}
        style={[
          styles.text,
          {
            color: themeColors.foreground,
          },
          getVariantStyle(),
          weight && {
            fontWeight: typography.fontWeight[weight],
          },
          style,
        ]}
        {...props}
      >
        {children}
      </RNText>
    );
  },
);

Text.displayName = 'Text';

const styles = StyleSheet.create({
  text: {
    color: '#000',
  },
});
