import { Text } from "@/components/ui/Text";
import { useToastStore } from "@/components/ui/Toast";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { chargerCommandsApi } from "@/lib/api/charger-commands.api";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useGroupStore } from "@/lib/stores/group.store";
import { GroupCharger, GroupConnector } from "@/lib/types/group.types";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Modal, ScrollView, TouchableOpacity, View } from "react-native";

interface TecleControlProps {
  visible: boolean;
  onClose: () => void;
}

type TecleStatus = "idle" | "moving_up" | "moving_down";

interface TecleEntry {
  id: string; // `${chargerId}-${connectorId}`
  name: string; // connector alias / name / "C{n}"
  chargerName: string;
  siteId: string;
  chargerId: string;
  connectorId: string;
}

const DURATION_OPTIONS = [3, 5, 10, 15, 20, 30];

export function TecleControl({ visible, onClose }: TecleControlProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const groupData = useGroupStore((s) => s.groupData);
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId) ?? "";

  const [statuses, setStatuses] = useState<Record<string, TecleStatus>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [executing, setExecuting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  // Smooth progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Build tecle entries grouped by area_name (or site_name when no areas)
  const { teclesByCharger, allTecles } = useMemo(() => {
    if (!groupData) return { teclesByCharger: {}, allTecles: [] };

    const map: Record<string, TecleEntry[]> = {};

    const addConnectors = (gc: GroupCharger, groupLabel: string) => {
      const chargerId = String(gc.charger_ID);
      const entries: TecleEntry[] = gc.connectors.map((c: GroupConnector) => ({
        id: `${chargerId}-${c.connector_id}`,
        name: c.connector_name,
        chargerName: gc.charger_name,
        siteId: selectedLocationId,
        chargerId,
        connectorId: c.connector_id,
      }));
      if (entries.length > 0) {
        if (!map[groupLabel]) map[groupLabel] = [];
        map[groupLabel].push(...entries);
      }
    };

    if (groupData.areas.length > 0) {
      for (const area of groupData.areas) {
        for (const line of area.lines) {
          for (const gc of line.chargers) {
            addConnectors(gc, area.area_name);
          }
        }
      }
    } else {
      const siteLabel = groupData.site.site_name;
      for (const gc of groupData.chargers) {
        addConnectors(gc, siteLabel);
      }
    }

    return { teclesByCharger: map, allTecles: Object.values(map).flat() };
  }, [groupData, selectedLocationId]);

  const activeTecle = allTecles.find((t) => t.id === selectedId) ?? null;
  const groupLabels = Object.keys(teclesByCharger);

  const getStatus = (id: string): TecleStatus => statuses[id] ?? "idle";
  const setStatus = (id: string, s: TecleStatus) => setStatuses((prev) => ({ ...prev, [id]: s }));

  const executeTecle = useCallback(async () => {
    if (!selectedId || !activeTecle) return;
    setExecuting(true);
    setCountdown(duration);
    setStatus(selectedId, direction === "up" ? "moving_up" : "moving_down");
    progressAnim.setValue(0);

    try {
      await chargerCommandsApi.ramp(activeTecle.siteId, activeTecle.chargerId, activeTecle.connectorId, {
        direction,
        preset_seconds: duration,
        step_kw: 5,
      });
      useToastStore
        .getState()
        .show(`${activeTecle.name} — ${direction === "up" ? "Subiendo" : "Bajando"}`, "success", `Tecle operando por ${duration}s`);
    } catch {
      useToastStore.getState().show(activeTecle.name, "error", "Error al ejecutar tecle");
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      setStatus(selectedId, "idle");
      setExecuting(false);
      setCountdown(null);
      return;
    }

    // Smooth bar fills over exactly duration seconds
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start();

    // Countdown display updates per second
    for (let i = duration; i > 0; i--) {
      await new Promise((r) => setTimeout(r, 1000));
      setCountdown(i - 1);
    }
    setStatus(selectedId, "idle");
    setExecuting(false);
    setCountdown(null);
    progressAnim.setValue(0);
  }, [selectedId, activeTecle, direction, duration]);

  if (!visible) return null;

  const SectionLabel = ({ children }: { children: string }) => (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: colors.mutedForeground,
        textTransform: "uppercase",
        letterSpacing: 0.8,
      }}
    >
      {children}
    </Text>
  );

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "82%",
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginBottom: 2, marginTop: 4 }}>
                Control de Tecle
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Selecciona tecle, dirección y duración</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ padding: spacing.xs, marginLeft: spacing.sm }}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl }}
          >
            {/* Step 1 */}
            <View style={{ marginBottom: 14 }}>
              <SectionLabel>1. Seleccionar Tecle</SectionLabel>

              {groupLabels.length === 0 ? (
                <Text style={{ fontSize: 13, color: colors.mutedForeground }}>Sin datos disponibles</Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {groupLabels.map((label) => (
                    <View key={label}>
                      <Text style={{ fontSize: 13, color: colors.mutedForeground, marginBottom: 6 }}>{label}</Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                        {teclesByCharger[label].map((tecle) => {
                          const st = getStatus(tecle.id);
                          const isSelected = selectedId === tecle.id;
                          return (
                            <TouchableOpacity
                              key={tecle.id}
                              onPress={() => !executing && setSelectedId(tecle.id)}
                              disabled={executing}
                              style={{
                                width: "48%",
                                padding: 12,
                                borderRadius: 12,
                                borderWidth: isSelected ? 0.5 : 1,
                                borderColor: isSelected ? colors.primary : colors.border,
                                backgroundColor: isSelected ? colors.primary + "12" : colors.card,
                                opacity: executing && !isSelected ? 0.5 : 1,
                              }}
                            >
                              <View
                                style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}
                              >
                                <Text style={{ fontSize: 14, fontWeight: "700", color: colors.foreground }}>{tecle.name}</Text>
                                <View
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: st === "idle" ? colors.mutedForeground : st === "moving_up" ? "#22c55e" : "#f97316",
                                  }}
                                />
                              </View>
                              <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
                                {st === "idle" ? "Disponible" : st === "moving_up" ? "Subiendo..." : "Bajando..."}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {selectedId && (
              <>
                {/* Step 2 */}
                <View style={{ marginBottom: 14 }}>
                  <SectionLabel>2. Dirección</SectionLabel>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    {(["up", "down"] as const).map((dir) => {
                      const isSel = direction === dir;
                      const activeColor = dir === "up" ? "#22c55e" : "#f97316";
                      const activeBg = dir === "up" ? "#dcfce7" : "#ffedd5";
                      return (
                        <TouchableOpacity
                          key={dir}
                          onPress={() => !executing && setDirection(dir)}
                          disabled={executing}
                          style={{
                            flex: 1,
                            paddingVertical: 14,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: isSel ? activeColor : colors.border,
                            backgroundColor: isSel ? activeBg : colors.card,
                            alignItems: "center",
                            gap: 4,
                            opacity: executing && direction !== dir ? 0.5 : 1,
                          }}
                        >
                          <View style={{ alignItems: "center" }}>
                            <Ionicons
                              name={dir === "up" ? "chevron-up" : "chevron-down"}
                              size={16}
                              color={isSel ? activeColor : colors.mutedForeground}
                            />
                            <Ionicons
                              name={dir === "up" ? "chevron-up" : "chevron-down"}
                              size={16}
                              color={isSel ? activeColor : colors.mutedForeground}
                              style={{ marginTop: -8 }}
                            />
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: "600", color: isSel ? activeColor : colors.mutedForeground }}>
                            {dir === "up" ? "Subir" : "Bajar"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Step 3 */}
                <View style={{ marginBottom: 14 }}>
                  <SectionLabel>3. Duración (segundos)</SectionLabel>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    {DURATION_OPTIONS.map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        onPress={() => !executing && setDuration(sec)}
                        disabled={executing}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 10,
                          backgroundColor: duration === sec ? colors.primary : colors.muted,
                          borderColor: duration === sec ? colors.primary : colors.border,
                          opacity: executing && duration !== sec ? 0.5 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: duration === sec ? "700" : "500",
                            color: duration === sec ? "white" : colors.foreground,
                          }}
                        >
                          {sec}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="timer-outline" size={13} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                      Tiempo de operación del tecle: {duration} segundo{duration !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Execute / Progress */}
                {executing ? (
                  <View
                    style={{
                      backgroundColor: colors.primary + "15",
                      borderWidth: 1,
                      borderColor: colors.primary + "30",
                      borderRadius: 12,
                      padding: spacing.md,
                      marginBottom: spacing.sm,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons
                          name={direction === "up" ? "chevron-up" : "chevron-down"}
                          size={16}
                          color={direction === "up" ? "#22c55e" : "#f97316"}
                        />
                        <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                          {activeTecle?.name} — {direction === "up" ? "Subiendo" : "Bajando"}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.primary }}>{countdown}s</Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                      <Animated.View
                        style={{
                          height: "100%",
                          backgroundColor: colors.primary,
                          width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={executeTecle}
                    disabled={!selectedId}
                    style={{
                      paddingVertical: 16,
                      borderRadius: 14,
                      backgroundColor: direction === "up" ? "#22c55e" : "#f97316",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: !selectedId ? 0.5 : 1,
                      marginBottom: spacing.sm,
                    }}
                  >
                    <Ionicons name={direction === "up" ? "chevron-up" : "chevron-down"} size={20} color="white" />
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "white" }}>
                      {direction === "up" ? "Subir" : "Bajar"} {activeTecle?.name} por {duration}s
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
