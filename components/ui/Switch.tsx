import React from 'react';
import {
  Switch as RNSwitch,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  isDark?: boolean;
}

export const Switch = React.forwardRef<RNSwitch, SwitchProps>(
  ({
    value,
    onValueChange,
    label,
    disabled = false,
    containerStyle,
    isDark = false,
  }, ref) => {
    const themeColors = isDark ? colors.dark : colors.light;

    return (
      <View
        style={[
          styles.container,
          containerStyle,
        ]}
      >
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
        <RNSwitch
          ref={ref}
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: themeColors.switchBackground,
            true: colors.roles.operador,
          }}
          thumbColor={value ? '#ffffff' : '#e5e5e5'}
          ios_backgroundColor={themeColors.switchBackground}
        />
      </View>
    );
  },
);

Switch.displayName = 'Switch';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
  },
});
