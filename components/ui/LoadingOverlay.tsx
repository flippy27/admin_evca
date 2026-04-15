/**
 * LoadingOverlay — full-screen loading indicator with Zustand state
 * Replaces Angular's overlay-loader service
 */

import React from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';
import { create } from 'zustand';
import { getThemeColors } from '@/theme';

interface LoadingStore {
  isVisible: boolean;
  show: () => void;
  hide: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  isVisible: false,
  show: () => set({ isVisible: true }),
  hide: () => set({ isVisible: false }),
}));

export function useLoadingOverlay() {
  const show = useLoadingStore((state) => state.show);
  const hide = useLoadingStore((state) => state.hide);

  return { show, hide };
}

/**
 * LoadingOverlayComponent — renders the actual modal
 * Add this to your root layout
 */
export function LoadingOverlayComponent() {
  const isVisible = useLoadingStore((state) => state.isVisible);
  const colors = getThemeColors('light'); // Loading doesn't need to follow theme

  return (
    <Modal visible={isVisible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 32,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    </Modal>
  );
}
