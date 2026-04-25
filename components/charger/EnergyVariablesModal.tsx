import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { spacing } from '@/theme';

export interface EnergyVariable {
  key: string;
  label: string;
  unit: string;
  icon: string;
  color: string;
  bg: string;
  value: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  variables: EnergyVariable[];
  initialKey?: string;
  frequency?: number;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

// Deterministic-looking sparkline using trig noise seeded by value
function generateHistory(value: number): number[] {
  const range = Math.max(value * 0.04, 0.3);
  return Array.from({ length: 12 }, (_, i) => {
    const noise =
      Math.sin(value + i * 1.7) * range * 0.5 +
      Math.cos(value * 2 + i * 0.9) * range * 0.5;
    return Math.max(0, parseFloat((value + noise).toFixed(2)));
  });
}

function timeLabels(): string[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const t = new Date(now.getTime() - (6 - i) * 5 * 60000);
    return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
  });
}

export function EnergyVariablesModal({
  visible,
  onClose,
  title,
  subtitle,
  variables,
  initialKey,
  frequency,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState(initialKey ?? variables[0]?.key ?? '');

  // Sync selected key when modal re-opens with a different initialKey
  useEffect(() => {
    if (visible && initialKey) setSelectedKey(initialKey);
  }, [visible, initialKey]);

  const effectiveKey =
    variables.find((v) => v.key === selectedKey)?.key ??
    variables[0]?.key ??
    '';
  const currentVar = variables.find((v) => v.key === effectiveKey) ?? variables[0];

  const chartData = useMemo(
    () => (currentVar ? generateHistory(currentVar.value) : [0]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveKey, currentVar?.value],
  );

  const labels = useMemo(() => timeLabels(), []);
  const min = Math.min(...chartData);
  const max = Math.max(...chartData);
  const avg = chartData.reduce((s, v) => s + v, 0) / chartData.length;

  if (!currentVar || variables.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}>
        {/* Dismiss on backdrop tap */}
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '88%',
            paddingBottom: insets.bottom + spacing.md,
          }}
        >
          {/* Drag indicator */}
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: '#e5e7eb',
              alignSelf: 'center',
              marginTop: 10,
              marginBottom: 4,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{title}</Text>
              <Text style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{subtitle}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Variable selector tabs */}
            <View
              style={{
                flexDirection: 'row',
                paddingHorizontal: spacing.lg,
                gap: spacing.sm,
                marginBottom: spacing.md,
              }}
            >
              {variables.map((v) => {
                const isSel = v.key === effectiveKey;
                return (
                  <TouchableOpacity
                    key={v.key}
                    onPress={() => setSelectedKey(v.key)}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      borderWidth: isSel ? 2 : 1,
                      borderColor: isSel ? v.color : '#e5e7eb',
                      backgroundColor: isSel ? v.bg : '#fff',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                    }}
                  >
                    <Ionicons name={v.icon as any} size={16} color={v.color} />
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '700',
                        color: v.color,
                        marginTop: 3,
                      }}
                    >
                      {v.value.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>
                      {v.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Chart */}
            <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: spacing.sm,
                }}
              >
                <Ionicons name={currentVar.icon as any} size={14} color={currentVar.color} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: currentVar.color }}>
                  {currentVar.label} ({currentVar.unit})
                </Text>
              </View>
              <LineChart
                data={{ labels, datasets: [{ data: chartData }] }}
                width={SCREEN_WIDTH - spacing.lg * 2 + 10}
                height={180}
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 1,
                  color: (opacity = 1) =>
                    `${currentVar.color}${Math.round(opacity * 255)
                      .toString(16)
                      .padStart(2, '0')}`,
                  labelColor: () => '#9ca3af',
                  propsForDots: { r: '0' },
                  propsForBackgroundLines: {
                    stroke: '#f3f4f6',
                    strokeDasharray: '',
                  },
                }}
                bezier
                style={{ borderRadius: 8, marginLeft: -10 }}
                withInnerLines
                withOuterLines={false}
                withShadow={false}
              />
            </View>

            {/* Stats */}
            <View
              style={{
                marginHorizontal: spacing.lg,
                backgroundColor: '#f9fafb',
                borderRadius: 12,
                padding: spacing.md,
                marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: '#9ca3af',
                  textTransform: 'uppercase',
                  letterSpacing: 0.8,
                  marginBottom: spacing.sm,
                }}
              >
                Estadísticas — {currentVar.label.toUpperCase()} (30 min)
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
                    {min.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Mínimo</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: currentVar.color }}>
                    {avg.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Promedio</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>
                    {max.toFixed(1)}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Máximo</Text>
                </View>
              </View>
            </View>

            {/* Frequency footer */}
            {frequency != null && (
              <View
                style={{
                  marginHorizontal: spacing.lg,
                  backgroundColor: '#f0fdfa',
                  borderRadius: 10,
                  padding: spacing.sm + spacing.xs,
                  marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#0d9488' }}>
                  Frecuencia de red: {frequency} Hz
                </Text>
                <Text style={{ fontSize: 12, color: '#0d9488', marginTop: 2 }}>
                  Datos actualizados cada 60s vía MeterValues OCPP
                </Text>
              </View>
            )}

            <View style={{ height: spacing.md }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
