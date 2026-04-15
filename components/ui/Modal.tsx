import React from 'react';
import {
  Modal as RNModal,
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { getThemeColors, spacing } from '../../theme';
import { Text } from './Text';
import { Button } from './Button';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: Array<{
    label: string;
    onPress: () => void;
    variant?: 'default' | 'secondary' | 'destructive';
  }>;
  closeOnBackdropPress?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  actions,
  closeOnBackdropPress = true,
}: ModalProps) {
  const colors = getThemeColors('light');

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      hardwareAccelerated
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
        onPress={() => closeOnBackdropPress && onClose()}
      >
        <Pressable
          style={[
            styles.content,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {title && (
            <View style={styles.header}>
              <Text variant="h3" weight="bold">
                {title}
              </Text>
            </View>
          )}

          <View style={styles.body}>{children}</View>

          {actions && actions.length > 0 && (
            <View style={styles.footer}>
              {actions.map((action, idx) => (
                <View key={idx} style={{ flex: 1 }}>
                  <Button
                    label={action.label}
                    onPress={() => {
                      action.onPress();
                      onClose();
                    }}
                    variant={action.variant || 'primary'}
                    fullWidth
                  />
                </View>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    borderRadius: 12,
    borderWidth: 1,
    minWidth: '80%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  body: {
    padding: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
    borderTopWidth: 1,
  },
});
