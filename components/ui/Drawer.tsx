import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { spacing, getThemeColors } from '../../theme';
import { useResolvedColorScheme } from '../../hooks/use-color-scheme';
import { Text } from './Text';
import { Separator } from './Separator';

interface DrawerItem {
  label: string;
  icon?: React.ReactNode;
  onPress: () => void;
  isDanger?: boolean;
}

interface DrawerProps {
  visible: boolean;
  onClose: () => void;
  items: DrawerItem[];
  header?: React.ReactNode;
}

export const Drawer = ({
  visible,
  onClose,
  items,
  header,
}: DrawerProps) => {
  const resolvedScheme = useResolvedColorScheme();
  const themeColors = getThemeColors(resolvedScheme);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Drawer panel */}
        <SafeAreaView
          style={[
            styles.drawer,
            {
              backgroundColor: themeColors.card,
            },
          ]}
        >
          {header && (
            <>
              {header}
              <Separator />
            </>
          )}

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {items.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={[
                    styles.item,
                    {
                      paddingVertical: spacing.md,
                      paddingHorizontal: spacing.lg,
                    },
                  ]}
                  onPress={() => {
                    item.onPress();
                    onClose();
                  }}
                >
                  <View style={styles.itemContent}>
                    {item.icon && <View style={styles.icon}>{item.icon}</View>}
                    <Text
                      weight="medium"
                      style={{
                        color: item.isDanger ? themeColors.destructive : themeColors.foreground,
                      }}
                    >
                      {item.label}
                    </Text>
                  </View>
                </TouchableOpacity>
                {index < items.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </ScrollView>
        </SafeAreaView>

        {/* Touch outside to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: '70%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
  item: {
    justifyContent: 'center',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  icon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
