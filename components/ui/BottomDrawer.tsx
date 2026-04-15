/**
 * Bottom Drawer/Bottom Sheet — slides up from bottom
 * Used for filters, guides, and bottom actions
 */

import React, { ReactNode } from "react";
import { Modal, View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { getThemeColors, spacing } from "@/theme";
import { Text } from "./Text";

interface BottomDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  height?: number;
  children: ReactNode;
}

export function BottomDrawer({
  visible,
  onClose,
  title,
  height = 300,
  children,
}: BottomDrawerProps) {
  const colors = getThemeColors("light");
  const screenHeight = Dimensions.get("window").height;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      />

      <View
        style={{
          height: Math.min(height, screenHeight * 0.8),
          backgroundColor: colors.card,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
        }}
      >
        {/* Handle */}
        <View
          style={{
            width: 40,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.border,
            alignSelf: "center",
            marginBottom: spacing.md,
          }}
        />

        {/* Title */}
        {title && (
          <Text
            variant="h4"
            weight="bold"
            style={{ marginBottom: spacing.md }}
          >
            {title}
          </Text>
        )}

        {/* Content */}
        {children}
      </View>
    </Modal>
  );
}
