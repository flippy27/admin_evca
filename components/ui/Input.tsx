import React from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  Text,
} from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  containerStyle?: ViewStyle;
  isDark?: boolean;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({
    label,
    placeholder,
    value,
    onChangeText,
    error,
    disabled = false,
    multiline = false,
    containerStyle,
    isDark = false,
    ...props
  }, ref) => {
    const themeColors = isDark ? colors.dark : colors.light;

    return (
      <View style={containerStyle}>
        {label && (
          <Text
            style={[
              styles.label,
              {
                color: themeColors.foreground,
              },
            ]}
          >
            {label}
          </Text>
        )}
        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              backgroundColor: themeColors.card,
              borderColor: error ? themeColors.destructive : themeColors.border,
              color: themeColors.foreground,
            },
            error && styles.errorBorder,
            disabled && styles.disabled,
            multiline && styles.multiline,
          ]}
          placeholder={placeholder}
          placeholderTextColor={themeColors.mutedForeground}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          {...props}
        />
        {error && (
          <Text
            style={[
              styles.error,
              {
                color: themeColors.destructive,
              },
            ]}
          >
            {error}
          </Text>
        )}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  input: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
  },
  errorBorder: {
    borderWidth: 2,
  },
  error: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  disabled: {
    opacity: 0.5,
  },
  multiline: {
    minHeight: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
});
