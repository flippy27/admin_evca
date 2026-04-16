import React, { useState } from 'react';
import { View, Pressable, FlatList, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, spacing } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';
import { Text } from './Text';
import { Modal } from './Modal';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  style?: ViewStyle;
}

export function Select({
  options,
  value,
  onChange,
  placeholder,
  label,
  style,
}: SelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  const selectedLabel = options.find((opt) => opt.value === value)?.label ?? placeholder ?? 'Select';

  return (
    <View style={style}>
      {label && (
        <Text variant="caption" weight="bold" style={{ marginBottom: spacing.sm }}>
          {label}
        </Text>
      )}

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: colors.input,
            borderColor: colors.border,
            borderWidth: 1,
          },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={{ color: colors.foreground }}>{selectedLabel}</Text>
        <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
      </Pressable>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={label}
        closeOnBackdropPress
      >
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.value)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.option,
                {
                  backgroundColor:
                    item.value === value ? colors.muted : colors.background,
                },
              ]}
              onPress={() => {
                onChange(item.value);
                setModalVisible(false);
              }}
            >
              <Text weight={item.value === value ? 'bold' : 'normal'}>
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  option: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
});
