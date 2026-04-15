/**
 * Toast — notification component with Zustand state
 * Replaces ngx-toastr
 * Auto-dismisses after 3 seconds
 */

import React, { useEffect } from 'react';
import { Animated, View, TouchableOpacity } from 'react-native';
import { create } from 'zustand';
import { Alert } from './Alert';
import { spacing, radius } from '../../theme';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning' | 'default';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, variant?: ToastVariant, title?: string) => void;
  hide: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  show: (message: string, variant: ToastVariant = 'default', title?: string) => {
    const id = Date.now().toString();
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          message,
          variant,
          title,
        },
      ],
    }));

    // Auto-dismiss after 3s
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },

  hide: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

export function useToast() {
  const show = useToastStore((state) => state.show);
  const hide = useToastStore((state) => state.hide);

  return { show, hide };
}

/**
 * ToastContainer — renders all active toasts at the top of screen
 * Add this to your root layout
 */
export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const hide = useToastStore((state) => state.hide);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: spacing.lg,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => hide(toast.id)}
        />
      ))}
    </View>
  );
}

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        marginBottom: spacing.md,
        borderRadius: radius.md,
        overflow: 'hidden',
      }}
    >
      <TouchableOpacity activeOpacity={0.9} onPress={onDismiss}>
        <Alert
          message={toast.message}
          title={toast.title}
          variant={
            toast.variant === 'error' || toast.variant === 'warning'
              ? 'destructive'
              : toast.variant === 'default'
              ? 'default'
              : (toast.variant as 'success' | 'info')
          }
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
