import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../../theme';

interface SeparatorProps {
  vertical?: boolean;
  style?: ViewStyle;
  isDark?: boolean;
}

export const Separator = ({
  vertical = false,
  style,
  isDark = false,
}: SeparatorProps) => {
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <View
      style={[
        vertical ? styles.vertical : styles.horizontal,
        {
          backgroundColor: themeColors.border,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  horizontal: {
    height: 1,
    width: '100%',
    marginVertical: spacing.md,
  },
  vertical: {
    width: 1,
    height: '100%',
    marginHorizontal: spacing.md,
  },
});
