import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getThemeColors, spacing } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';
import { Text } from './Text';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  const pages = [];
  const maxVisible = 5;
  const half = Math.floor(maxVisible / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) pages.push(1, '...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) pages.push('...', totalPages);

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.button,
          {
            backgroundColor: currentPage > 1 ? colors.muted : colors.border,
          },
        ]}
        onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <Ionicons name="chevron-back" size={18} color={colors.foreground} />
      </Pressable>

      {pages.map((p, idx) => (
        <Pressable
          key={idx}
          style={[
            styles.page,
            {
              backgroundColor: p === currentPage ? colors.primary : colors.muted,
            },
          ]}
          onPress={() => typeof p === 'number' && onPageChange(p)}
          disabled={p === '...'}
        >
          <Text
            weight={p === currentPage ? 'bold' : 'normal'}
            style={{
              color: p === currentPage ? colors.background : colors.foreground,
            }}
          >
            {p}
          </Text>
        </Pressable>
      ))}

      <Pressable
        style={[
          styles.button,
          {
            backgroundColor:
              currentPage < totalPages ? colors.muted : colors.border,
          },
        ]}
        onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <Ionicons name="chevron-forward" size={18} color={colors.foreground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  page: {
    width: 36,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
