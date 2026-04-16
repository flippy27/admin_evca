import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, getThemeColors } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';

interface SeparatorProps {
  vertical?: boolean;
  style?: ViewStyle;
}

export const Separator = ({
  vertical = false,
  style,
}: SeparatorProps) => {
  const resolvedScheme = useResolvedColorScheme();
  const themeColors = getThemeColors(resolvedScheme);

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
