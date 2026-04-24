import { Text } from "@/components/ui/Text";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { mockTecles, Tecle } from "@/lib/data/mockData";
import { getThemeColors, spacing } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";

interface TecleControlProps {
  visible: boolean;
  onClose: () => void;
}

const DURATION_OPTIONS = [3, 5, 10, 15, 20, 30];

export function TecleControl({ visible, onClose }: TecleControlProps) {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);

  const [tecles, setTecles] = useState<Tecle[]>(mockTecles);
  const [selectedTecle, setSelectedTecle] = useState<string | null>(null);
  const [duration, setDuration] = useState(5);
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [executing, setExecuting] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const activeTecle = tecles.find((t) => t.id === selectedTecle);

  const teclesByLocation = useMemo(() => {
    return tecles.reduce(
      (acc, t) => {
        if (!acc[t.location]) acc[t.location] = [];
        acc[t.location].push(t);
        return acc;
      },
      {} as Record<string, Tecle[]>,
    );
  }, [tecles]);

  const executeTecle = useCallback(async () => {
    if (!selectedTecle) return;

    setExecuting(true);
    setCountdown(duration);

    setTecles((prev) =>
      prev.map((t) =>
        t.id === selectedTecle
          ? {
              ...t,
              status: direction === "up" ? "moving_up" : "moving_down",
            }
          : t,
      ),
    );

    for (let i = duration; i > 0; i--) {
      await new Promise((r) => setTimeout(r, 1000));
      setCountdown(i - 1);
    }

    setTecles((prev) =>
      prev.map((t) =>
        t.id === selectedTecle
          ? {
              ...t,
              status: "idle",
            }
          : t,
      ),
    );

    setExecuting(false);
    setCountdown(null);
  }, [selectedTecle, direction, duration]);

  if (!visible) return null;

  const locationNames = Object.keys(teclesByLocation);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1 }}>
        {/* Overlay */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          }}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Bottom Sheet */}
        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: "82%",
            backgroundColor: colors.background,
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
              paddingVertical: spacing.md,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.foreground,
                  marginBottom: 2,
                }}
              >
                Control de Tecle
              </Text>

              <Text
                style={{
                  fontSize: 13,
                  color: colors.mutedForeground,
                }}
              >
                Selecciona tecle, dirección y duración
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: spacing.sm,
                marginLeft: spacing.md,
              }}
            >
              <Ionicons name="close" size={30} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator
          >
            {/* Step 1 */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.mutedForeground,
                  textTransform: "uppercase",
                  marginBottom: 8,
                  letterSpacing: 0.5,
                }}
              >
                1. Seleccionar Tecle
              </Text>

              <View style={{ gap: 14 }}>
                {locationNames.map((location) => (
                  <View key={location}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#9ca3af",
                        marginBottom: 8,
                      }}
                    >
                      {location}
                    </Text>

                    <View
                      style={{
                        flexDirection: "row",
                        flexWrap: "wrap",
                        gap: 12,
                      }}
                    >
                      {teclesByLocation[location].map((tecle) => (
                        <TouchableOpacity
                          key={tecle.id}
                          onPress={() => !executing && setSelectedTecle(tecle.id)}
                          disabled={executing}
                          style={{
                            width: "48%",
                            padding: 16,
                            borderRadius: 14,
                            borderWidth: 1,
                            borderColor: selectedTecle === tecle.id ? colors.primary : "#e5e7eb",
                            backgroundColor: selectedTecle === tecle.id ? colors.primary + "12" : "#ffffff",
                            opacity: executing && selectedTecle !== tecle.id ? 0.5 : 1,
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: 6,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 18,
                                fontWeight: "700",
                                color: "#111827",
                              }}
                            >
                              {tecle.name}
                            </Text>

                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: tecle.status === "idle" ? "#d1d5db" : tecle.status === "moving_up" ? "#22c55e" : "#f97316",
                              }}
                            />
                          </View>

                          <Text
                            style={{
                              fontSize: 16,
                              color: "#6b7280",
                            }}
                          >
                            {tecle.status === "idle" ? "Disponible" : tecle.status === "moving_up" ? "Subiendo..." : "Bajando..."}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {selectedTecle && (
              <>
                {/* Step 2 */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      marginBottom: 8,
                      letterSpacing: 0.5,
                    }}
                  >
                    2. Dirección
                  </Text>

                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <TouchableOpacity
                      onPress={() => !executing && setDirection("up")}
                      disabled={executing}
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: direction === "up" ? "#22c55e" : "#e5e7eb",
                        backgroundColor: direction === "up" ? "#dcfce7" : "#ffffff",
                        alignItems: "center",
                        gap: 8,
                        opacity: executing && direction !== "up" ? 0.5 : 1,
                      }}
                    >
                      <Ionicons name="chevron-up" size={28} color={direction === "up" ? "#22c55e" : "#6b7280"} />

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: direction === "up" ? "#16a34a" : "#6b7280",
                        }}
                      >
                        Subir
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => !executing && setDirection("down")}
                      disabled={executing}
                      style={{
                        flex: 1,
                        paddingVertical: 16,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        borderWidth: 2,
                        borderColor: direction === "down" ? "#f97316" : "#e5e7eb",
                        backgroundColor: direction === "down" ? "#fed7aa" : "#ffffff",
                        alignItems: "center",
                        gap: 8,
                        opacity: executing && direction !== "down" ? 0.5 : 1,
                      }}
                    >
                      <Ionicons name="chevron-down" size={28} color={direction === "down" ? "#f97316" : "#6b7280"} />

                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: direction === "down" ? "#f97316" : "#6b7280",
                        }}
                      >
                        Bajar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Step 3 */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.mutedForeground,
                      textTransform: "uppercase",
                      marginBottom: 8,
                      letterSpacing: 0.5,
                    }}
                  >
                    3. Duración (segundos)
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 12,
                      marginBottom: spacing.sm,
                    }}
                  >
                    {DURATION_OPTIONS.map((sec) => (
                      <TouchableOpacity
                        key={sec}
                        onPress={() => !executing && setDuration(sec)}
                        disabled={executing}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 12,
                          borderRadius: 12,
                          backgroundColor: duration === sec ? colors.primary : "#f3f4f6",
                          opacity: executing && duration !== sec ? 0.5 : 1,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: duration === sec ? "700" : "600",
                            color: duration === sec ? "white" : "#4b5563",
                          }}
                        >
                          {sec}s
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="timer" size={16} color="#9ca3af" />

                    <Text
                      style={{
                        fontSize: 14,
                        color: "#9ca3af",
                      }}
                    >
                      Tiempo de operación del tecle: {duration} segundo{duration !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>

                {/* Execute */}
                {executing ? (
                  <View
                    style={{
                      backgroundColor: colors.primary + "15",
                      borderWidth: 1,
                      borderColor: colors.primary + "30",
                      borderRadius: 12,
                      padding: spacing.md,
                      marginBottom: spacing.md,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: spacing.md,
                      }}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons
                          name={direction === "up" ? "chevron-up" : "chevron-down"}
                          size={18}
                          color={direction === "up" ? "#22c55e" : "#f97316"}
                        />

                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.foreground,
                          }}
                        >
                          {activeTecle?.name} — {direction === "up" ? "Subiendo" : "Bajando"}
                        </Text>
                      </View>

                      <Text
                        style={{
                          fontSize: 28,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {countdown}s
                      </Text>
                    </View>

                    <View
                      style={{
                        height: 8,
                        backgroundColor: colors.border,
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          backgroundColor: colors.primary,
                          width: `${((duration - (countdown ?? 0)) / duration) * 100}%`,
                        }}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={executeTecle}
                    disabled={!selectedTecle}
                    style={{
                      paddingVertical: 18,
                      borderRadius: 14,
                      backgroundColor: direction === "up" ? "#22c55e" : "#f97316",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: !selectedTecle ? 0.5 : 1,
                      marginBottom: spacing.md,
                    }}
                  >
                    <Ionicons name={direction === "up" ? "chevron-up" : "chevron-down"} size={24} color="white" />

                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: "white",
                      }}
                    >
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
