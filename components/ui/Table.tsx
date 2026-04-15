import React from 'react';
import { View, ScrollView, StyleSheet, FlatList } from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { Text } from './Text';

interface TableColumn {
  key: string;
  label: string;
  width?: number | string;
  render?: (value: any, row: any, idx: number) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  keyExtractor?: (item: any, idx: number) => string;
  onRowPress?: (row: any, idx: number) => void;
}

export function Table({ columns, data, keyExtractor, onRowPress }: TableProps) {
  const colors = getThemeColors('light');

  const getCellWidth = (col: TableColumn) => {
    if (!col.width) return `${100 / columns.length}%`;
    return col.width;
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: '100%' }}>
        {/* Header */}
        <View
          style={[
            styles.row,
            styles.header,
            { backgroundColor: colors.muted, borderBottomColor: colors.border },
          ]}
        >
          {columns.map((col) => (
            <View
              key={col.key}
              style={[
                styles.cell,
                {
                  width: getCellWidth(col),
                  minWidth: getCellWidth(col),
                },
              ]}
            >
              <Text variant="caption" weight="bold">
                {col.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Rows */}
        {data.length === 0 ? (
          <View style={[styles.row, { justifyContent: 'center' }]}>
            <Text style={{ color: colors.mutedForeground }}>No data</Text>
          </View>
        ) : (
          data.map((row, idx) => (
            <View
              key={keyExtractor?.(row, idx) ?? idx}
              style={[
                styles.row,
                {
                  backgroundColor: idx % 2 === 0 ? colors.background : colors.muted,
                  borderBottomColor: colors.border,
                },
              ]}
              onTouchEnd={() => onRowPress?.(row, idx)}
            >
              {columns.map((col) => (
                <View
                  key={col.key}
                  style={[
                    styles.cell,
                    {
                      width: getCellWidth(col),
                      minWidth: getCellWidth(col),
                    },
                  ]}
                >
                  {col.render ? (
                    col.render(row[col.key], row, idx)
                  ) : (
                    <Text variant="body">{String(row[col.key] ?? '-')}</Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  header: {
    height: 48,
  },
  cell: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
});
