import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { Text } from './Text';

interface DataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  type: 'bar' | 'line';
  data: DataPoint[];
  title?: string;
  height?: number;
}

export function Chart({ type, data, title, height = 200 }: ChartProps) {
  const colors = getThemeColors('light');
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={{ padding: spacing.lg }}>
      {title && (
        <Text variant="h4" weight="bold" style={{ marginBottom: spacing.md }}>
          {title}
        </Text>
      )}

      <View style={[styles.chartContainer, { height, backgroundColor: colors.muted }]}>
        <View style={styles.barsContainer}>
          {data.map((point, idx) => {
            const barHeight = (point.value / maxValue) * (height - 40);

            return (
              <View key={idx} style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
                <Text
                  variant="caption"
                  style={{
                    color: colors.mutedForeground,
                    textAlign: 'center',
                    marginTop: spacing.sm,
                  }}
                >
                  {point.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Legend / Stats */}
      <View style={{ marginTop: spacing.md, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" style={{ color: colors.mutedForeground }}>
          Min: {Math.min(...data.map((d) => d.value))}
        </Text>
        <Text variant="caption" style={{ color: colors.mutedForeground }}>
          Max: {Math.max(...data.map((d) => d.value))}
        </Text>
        <Text variant="caption" style={{ color: colors.mutedForeground }}>
          Avg: {(data.reduce((a, d) => a + d.value, 0) / data.length).toFixed(1)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    borderRadius: 8,
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '100%',
    gap: spacing.sm,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 4,
  },
});
