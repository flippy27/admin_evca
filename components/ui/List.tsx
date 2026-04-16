import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  ListRenderItem,
  ViewStyle,
} from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';
import { Text } from './Text';

interface ListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor?: (item: T, idx: number) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  loading?: boolean;
  error?: string;
  empty?: string;
  style?: ViewStyle;
}

export function List<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold,
  loading,
  error,
  empty,
  style,
}: ListProps<T>) {
  const resolvedScheme = useResolvedColorScheme();
  const colors = getThemeColors(resolvedScheme);

  if (error) {
    return (
      <View
        style={[
          styles.state,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={{ color: colors.destructive }}>{error}</Text>
      </View>
    );
  }

  if (data.length === 0 && !loading) {
    return (
      <View
        style={[
          styles.state,
          {
            backgroundColor: colors.background,
          },
        ]}
      >
        <Text style={{ color: colors.mutedForeground }}>
          {empty || 'No items'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor ?? ((_item, idx) => idx.toString())}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold ?? 0.1}
      ListFooterComponent={
        loading ? (
          <View style={styles.loader}>
            <Text style={{ color: colors.mutedForeground }}>Loading...</Text>
          </View>
        ) : null
      }
      style={[
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  state: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loader: {
    padding: spacing.lg,
    alignItems: 'center',
  },
});
