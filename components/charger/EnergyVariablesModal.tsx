import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Dimensions, Modal, ScrollView, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Text } from '@/components/ui/Text';
import { spacing, getThemeColors } from '@/theme';
import { useResolvedColorScheme } from '@/hooks/use-color-scheme';
import { energyVariablesApi } from '@/lib/api/energy-variables.api';

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
  connectorId?: string;
  frequency?: number;
}

// UI variable key → API variable_type
const API_TYPE_MAP: Record<string, string> = {
  voltage: 'power',
  current: 'voltage',
  power: 'energy',
  temperature: 'temperature',
};

// Parse European decimal format: "1.317.103" → 1317.103, "303.323" → 303.323
function parseEuroValue(s: string): number | null {
  if (!s) return null;
  const normalized = s.replace(',', '.');
  const parts = normalized.split('.');
  let val: number;
  if (parts.length <= 2) {
    val = parseFloat(normalized);
  } else {
    // multiple dots: last dot is decimal, rest are thousands separators
    const dec = parts[parts.length - 1];
    const int = parts.slice(0, -1).join('');
    val = parseFloat(`${int}.${dec}`);
  }
  if (isNaN(val) || val < 0 || val > 100_000) return null;
  return val;
}

// Downsample array to at most maxPts points (evenly spaced)
function downsample<T>(arr: T[], maxPts: number): T[] {
  if (arr.length <= maxPts) return arr;
  const step = arr.length / maxPts;
  return Array.from({ length: maxPts }, (_, i) => arr[Math.floor(i * step)]);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_CHART_PTS = 60;

export function EnergyVariablesModal({
  visible,
  onClose,
  title,
  subtitle,
  variables,
  initialKey,
  connectorId,
  frequency,
}: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colors = getThemeColors(useResolvedColorScheme());

  const [selectedKey, setSelectedKey] = useState(initialKey ?? variables[0]?.key ?? '');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartPoints, setChartPoints] = useState<number[]>([]);
  const [chartLabels, setChartLabels] = useState<string[]>([]);
  const [tooltip, setTooltip] = useState<{ index: number; value: number; x: number; y: number } | null>(null);

  // Sync selected key when modal re-opens
  useEffect(() => {
    if (visible && initialKey) setSelectedKey(initialKey);
  }, [visible, initialKey]);

  // Clear tooltip on variable change
  useEffect(() => { setTooltip(null); }, [selectedKey]);

  const effectiveKey = variables.find((v) => v.key === selectedKey)?.key ?? variables[0]?.key ?? '';
  const currentVar = variables.find((v) => v.key === effectiveKey) ?? variables[0];

  // Fetch real data when variable changes or modal opens
  const fetchChartData = useCallback(async () => {
    if (!connectorId || !effectiveKey) return;
    const apiType = API_TYPE_MAP[effectiveKey];
    if (!apiType) return;

    setChartLoading(true);
    setChartPoints([]);
    setChartLabels([]);
    try {
      const res = await energyVariablesApi.searchByConnector(connectorId, apiType);
      const raw = res.data?.payload?.data ?? [];

      // Parse and filter values
      const parsed = raw
        .map((pt) => ({ v: parseEuroValue(pt.value), dt: pt.datetime }))
        .filter((pt): pt is { v: number; dt: string } => pt.v !== null);

      if (parsed.length === 0) return;

      // Downsample for chart performance
      const sampled = downsample(parsed, MAX_CHART_PTS);
      const values = sampled.map((p) => p.v);
      const datetimes = sampled.map((p) => p.dt);

      // Build labels: 7 evenly spaced timestamps
      const labelCount = 7;
      const labelStep = Math.max(1, Math.floor(sampled.length / (labelCount - 1)));
      const labels = Array.from({ length: labelCount }, (_, i) => {
        const idx = Math.min(i * labelStep, sampled.length - 1);
        const d = new Date(datetimes[idx]);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      });

      setChartPoints(values);
      setChartLabels(labels);
    } catch {
      // silent — fall through to mock
    } finally {
      setChartLoading(false);
    }
  }, [connectorId, effectiveKey]);

  useEffect(() => {
    if (visible) fetchChartData();
  }, [visible, fetchChartData]);

  // Fallback to mock sparkline if no real data
  const fallbackData = useMemo(() => {
    if (!currentVar) return [0];
    const range = Math.max(currentVar.value * 0.04, 0.3);
    return Array.from({ length: 12 }, (_, i) => {
      const noise =
        Math.sin(currentVar.value + i * 1.7) * range * 0.5 +
        Math.cos(currentVar.value * 2 + i * 0.9) * range * 0.5;
      return Math.max(0, parseFloat((currentVar.value + noise).toFixed(2)));
    });
  }, [currentVar?.key, currentVar?.value]);

  const displayData = chartPoints.length > 0 ? chartPoints : fallbackData;
  const displayLabels = chartLabels.length > 0
    ? chartLabels
    : Array.from({ length: 7 }, (_, i) => {
        const now = new Date();
        const t = new Date(now.getTime() - (6 - i) * 5 * 60000);
        return `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
      });

  const min = Math.min(...displayData);
  const max = Math.max(...displayData);
  const avg = displayData.reduce((s, v) => s + v, 0) / displayData.length;

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
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />

        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '88%',
            paddingBottom: insets.bottom + spacing.md,
          }}
        >
          {/* Drag indicator */}
          <View
            style={{
              width: 36, height: 4, borderRadius: 2,
              backgroundColor: colors.border,
              alignSelf: 'center', marginTop: 10, marginBottom: 4,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
              paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground }}>{title}</Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{subtitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Variable selector tabs */}
            <View style={{ flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md }}>
              {variables.map((v) => {
                const isSel = v.key === effectiveKey;
                return (
                  <TouchableOpacity
                    key={v.key}
                    onPress={() => setSelectedKey(v.key)}
                    style={{
                      flex: 1, borderRadius: 12,
                      borderWidth: isSel ? 2 : 1,
                      borderColor: isSel ? v.color : colors.border,
                      backgroundColor: isSel ? v.bg : colors.muted,
                      alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4,
                    }}
                  >
                    <Ionicons name={v.icon as any} size={16} color={v.color} />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: v.color, marginTop: 3 }}>
                      {v.value.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 10, color: colors.mutedForeground, marginTop: 1 }}>
                      {v.unit}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Chart */}
            <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm }}>
                <Ionicons name={currentVar.icon as any} size={14} color={currentVar.color} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: currentVar.color }}>
                  {currentVar.label} ({currentVar.unit})
                </Text>
                {chartLoading && <ActivityIndicator size="small" color={currentVar.color} style={{ marginLeft: 6 }} />}
              </View>

              {chartLoading && chartPoints.length === 0 ? (
                <View style={{ height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted, borderRadius: 8 }}>
                  <ActivityIndicator color={currentVar.color} />
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 8 }}>{t('mobile.energyModal.loading')}</Text>
                </View>
              ) : (
                <View style={{ position: 'relative' }}>
                  <LineChart
                    data={{ labels: displayLabels, datasets: [{ data: displayData }] }}
                    width={SCREEN_WIDTH - spacing.lg * 2 + 10}
                    height={180}
                    chartConfig={{
                      backgroundColor: colors.card,
                      backgroundGradientFrom: colors.card,
                      backgroundGradientTo: colors.card,
                      decimalPlaces: 1,
                      color: (opacity = 1) =>
                        `${currentVar.color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                      labelColor: () => colors.mutedForeground,
                      propsForDots: { r: '3', fill: currentVar.color },
                      propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '' },
                    }}
                    bezier
                    style={{ borderRadius: 8, marginLeft: -10 }}
                    withInnerLines
                    withOuterLines={false}
                    withShadow={false}
                    onDataPointClick={({ index, value, x, y }) => {
                      setTooltip((prev) =>
                        prev?.index === index ? null : { index, value, x, y }
                      );
                    }}
                    decorator={() => null}
                  />
                  {/* Floating tooltip overlay */}
                  {tooltip !== null && (() => {
                    const tooltipW = 140;
                    const chartW = SCREEN_WIDTH - spacing.lg * 2 + 10;
                    const left = Math.max(0, Math.min(tooltip.x - 10 - tooltipW / 2, chartW - tooltipW - 10));
                    const top = Math.max(4, tooltip.y - 72);
                    const timeLabel = (() => {
                      const labels = chartLabels.length > 0 ? chartLabels : displayLabels;
                      const pts = chartLabels.length > 0 ? chartPoints : displayData;
                      const step = Math.max(1, Math.floor(pts.length / (labels.length - 1)));
                      const idx = Math.min(Math.round(tooltip.index / step), labels.length - 1);
                      return labels[idx] ?? '';
                    })();
                    return (
                      <View
                        pointerEvents="none"
                        style={{
                          position: 'absolute',
                          left,
                          top,
                          width: tooltipW,
                          backgroundColor: colors.card,
                          borderRadius: 8,
                          padding: 8,
                          borderWidth: 1,
                          borderColor: currentVar.color,
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.12,
                          shadowRadius: 4,
                          elevation: 4,
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '600', color: colors.mutedForeground }}>
                          {`${t('mobile.energyModal.tooltip.time')}: ${timeLabel}`}
                        </Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: currentVar.color, marginTop: 2 }}>
                          {`${currentVar.label}: ${tooltip.value.toFixed(2)} ${currentVar.unit}`}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
              )}
            </View>

            {/* Stats */}
            <View
              style={{
                marginHorizontal: spacing.lg, backgroundColor: colors.muted,
                borderRadius: 12, padding: spacing.md, marginBottom: spacing.sm,
              }}
            >
              <Text
                style={{
                  fontSize: 10, fontWeight: '700', color: colors.mutedForeground,
                  textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: spacing.sm,
                }}
              >
                {t('mobile.energyModal.stats.title', { label: currentVar.label.toUpperCase() })}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground }}>{min.toFixed(1)}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{t('mobile.energyModal.stats.min')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: currentVar.color }}>{avg.toFixed(1)}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{t('mobile.energyModal.stats.avg')}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground }}>{max.toFixed(1)}</Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>{t('mobile.energyModal.stats.max')}</Text>
                </View>
              </View>
            </View>

            {/* Frequency footer */}
            {frequency != null && (
              <View
                style={{
                  marginHorizontal: spacing.lg, backgroundColor: '#f0fdfa',
                  borderRadius: 10, padding: spacing.sm + spacing.xs, marginBottom: spacing.sm,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#0d9488' }}>
                  {t('mobile.energyModal.frequency', { value: frequency })}
                </Text>
                <Text style={{ fontSize: 12, color: '#0d9488', marginTop: 2 }}>
                  {t('mobile.energyModal.frequencyNote')}
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
