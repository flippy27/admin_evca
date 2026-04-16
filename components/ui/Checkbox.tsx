import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, spacing } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';
import { Text } from './Text';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Checkbox({ checked, onChange, label, disabled, style }: CheckboxProps) {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? colors.primary : colors.input,
            borderColor: checked ? colors.primary : colors.border,
            borderWidth: 1,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {checked && (
          <Ionicons name="checkmark" size={16} color={colors.background} />
        )}
      </View>
      {label && <Text style={{ marginLeft: spacing.md }}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
