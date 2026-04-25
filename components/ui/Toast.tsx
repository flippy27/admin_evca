/**
 * Toast — stackable notification system
 * Collapsed by default (iPhone-style peek); tap to expand all.
 * Auto-dismisses each toast after 4s.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { Text } from './Text';
import { spacing } from '../../theme';

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
      toasts: [{ id, message, variant, title }, ...state.toasts],
    }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },

  hide: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export function useToast() {
  const show = useToastStore((s) => s.show);
  const hide = useToastStore((s) => s.hide);
  return { show, hide };
}

// ─── Container ───────────────────────────────────────────────────────────────

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const hide = useToastStore((s) => s.hide);
  const [expanded, setExpanded] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toasts.length <= 1) setExpanded(false);
  }, [toasts.length]);

  if (toasts.length === 0) return null;

  const isMultiple = toasts.length > 1;
  const showAll = expanded || !isMultiple;
  const peekCount = Math.min(toasts.length - 1, 2);

  const dismissAll = () => {
    useToastStore.getState().toasts.forEach((t) => hide(t.id));
    setExpanded(false);
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: insets.top + spacing.sm,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 9999,
      }}
    >
      {/* Close all × */}
      <TouchableOpacity
        onPress={dismissAll}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10001,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: 'rgba(0,0,0,0.18)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 15, lineHeight: 17, fontWeight: '700' }}>×</Text>
      </TouchableOpacity>

      {showAll ? (
        // Expanded — all toasts as a list
        <View style={{ gap: 8 }}>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => hide(t.id)} />
          ))}
        </View>
      ) : (
        // Collapsed — top toast + peek strips below
        <TouchableOpacity activeOpacity={0.92} onPress={() => setExpanded(true)}>
          <ToastItem toast={toasts[0]} onDismiss={() => hide(toasts[0].id)} />
          {Array.from({ length: peekCount }).map((_, i) => {
            const depth = i + 1;
            return (
              <View
                key={i}
                style={{
                  height: 10,
                  marginTop: -2,
                  marginHorizontal: depth * 7,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  backgroundColor: variantColors(toasts[0].variant).bg,
                  opacity: 1 - depth * 0.3,
                }}
              />
            );
          })}
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Single toast item ────────────────────────────────────────────────────────

interface ToastItemProps {
  toast: Toast;
  onDismiss: () => void;
}

function variantColors(variant: ToastVariant) {
  switch (variant) {
    case 'success': return { bg: '#dcfce7', icon: '#16a34a', title: '#166534', subtitle: '#15803d', iconName: 'checkmark-circle' as const };
    case 'error':   return { bg: '#fee2e2', icon: '#dc2626', title: '#7f1d1d', subtitle: '#991b1b', iconName: 'close-circle' as const };
    case 'warning': return { bg: '#fef3c7', icon: '#d97706', title: '#78350f', subtitle: '#92400e', iconName: 'alert-circle' as const };
    case 'info':    return { bg: '#dbeafe', icon: '#2563eb', title: '#1e3a8a', subtitle: '#1e40af', iconName: 'information-circle' as const };
    default:        return { bg: '#f3f4f6', icon: '#374151', title: '#111827', subtitle: '#6b7280', iconName: 'notifications' as const };
  }
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const vc = variantColors(toast.variant);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onDismiss}
        style={{
          backgroundColor: vc.bg,
          borderRadius: 14,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <Ionicons name={vc.iconName} size={22} color={vc.icon} style={{ marginTop: 1 }} />
        <View style={{ flex: 1 }}>
          {toast.title ? (
            <>
              <Text style={{ fontSize: 13, fontWeight: '700', color: vc.title, lineHeight: 18 }}>
                {toast.title}
              </Text>
              <Text style={{ fontSize: 12, color: vc.subtitle, marginTop: 1 }}>
                {toast.message}
              </Text>
            </>
          ) : (
            <Text style={{ fontSize: 13, fontWeight: '600', color: vc.title }}>
              {toast.message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
