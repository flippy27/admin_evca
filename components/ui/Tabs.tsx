import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { Text } from './Text';

interface Tab {
  label: string;
  key: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultKey?: string;
  onChange?: (key: string) => void;
  lazy?: boolean;
}

export function Tabs({ tabs, defaultKey, onChange, lazy = false }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultKey || tabs[0]?.key);
  const colors = getThemeColors('light');

  const handlePress = (key: string) => {
    setActiveKey(key);
    onChange?.(key);
  };

  const activeTab = tabs.find((t) => t.key === activeKey);

  return (
    <View style={{ flex: 1 }}>
      {/* Tab headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[
          styles.tabBar,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tabButton,
              activeKey === tab.key && [
                styles.tabButtonActive,
                { borderBottomColor: colors.primary },
              ],
            ]}
            onPress={() => handlePress(tab.key)}
          >
            <Text
              variant="body"
              weight={activeKey === tab.key ? 'bold' : 'normal'}
              style={[
                { color: activeKey === tab.key ? colors.primary : colors.mutedForeground },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Tab content */}
      {activeTab && (
        <View style={{ flex: 1 }}>
          {activeTab.content}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderBottomWidth: 1,
  },
  tabButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 80,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
  },
});
