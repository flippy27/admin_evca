import React, { useEffect, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, spacing } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (text: string) => void;
  debounceMs?: number;
  style?: ViewStyle;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  style,
}: SearchBarProps) {
  const [text, setText] = useState('');
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(text);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [text, debounceMs, onSearch]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.input,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      <Ionicons
        name="search"
        size={18}
        color={colors.mutedForeground}
        style={{ marginRight: spacing.sm }}
      />
      <TextInput
        style={[
          styles.input,
          {
            color: colors.foreground,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        value={text}
        onChangeText={setText}
      />
      {text && (
        <Pressable onPress={() => setText('')}>
          <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
});
