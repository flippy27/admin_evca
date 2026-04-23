import { useState, useMemo } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, TextInput } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors, spacing } from "@/theme";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Card } from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { useToastStore } from "@/components/ui/Toast";

// Mock OCPP Configuration parameters
const mockConfigParams = [
  {
    id: "1",
    key: "HeartbeatInterval",
    type: "Integer",
    value: "300",
    description: "Intervalo de latido del corazón en segundos",
  },
  {
    id: "2",
    key: "ClockAlignedDataInterval",
    type: "Integer",
    value: "900",
    description: "Intervalo de datos alineados con reloj",
  },
  {
    id: "3",
    key: "ConnectionTimeOut",
    type: "Integer",
    value: "30",
    description: "Tiempo de espera de conexión en segundos",
  },
  {
    id: "4",
    key: "AuthorizeRemoteTxRequests",
    type: "Boolean",
    value: "true",
    description: "Autorizar solicitudes remotas de transacción",
  },
  {
    id: "5",
    key: "MaxChargingProfilesInstalled",
    type: "Integer",
    value: "16",
    description: "Máximo de perfiles de carga instalados",
  },
  {
    id: "6",
    key: "MeterValueSampleInterval",
    type: "Integer",
    value: "60",
    description: "Intervalo de muestra de valor de medidor",
  },
];

export default function Configuration() {
  const scheme = useResolvedColorScheme();
  const colors = getThemeColors(scheme);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const chargers = useChargersStore((state) => state.chargers || []);
  const [params, setParams] = useState(mockConfigParams);
  const [isSaving, setIsSaving] = useState(false);

  const charger = useMemo(() => {
    return chargers.find((c: any) => c.id === id);
  }, [chargers, id]);

  const updateParam = (paramId: string, newValue: string) => {
    setParams(
      params.map((p) => (p.id === paramId ? { ...p, value: newValue } : p))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSaving(false);
    const toastShow = useToastStore.getState().show;
    toastShow("Los parámetros han sido guardados exitosamente", "success", "Configuración guardada");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              Configuración OCPP
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {charger?.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            opacity: isSaving ? 0.6 : 1,
          }}
        >
          <Ionicons name="checkmark" size={16} color="white" />
          <Text style={{ fontSize: 12, fontWeight: "600", color: "white" }}>
            {isSaving ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginBottom: spacing.md }}>
            Edita los parámetros OCPP del cargador. Algunos cambios pueden requerir reinicio.
          </Text>

          {params.map((param) => (
            <Card key={param.id} style={{ padding: spacing.md }}>
              <View style={{ gap: spacing.sm }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                      {param.key}
                    </Text>
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.mutedForeground,
                        marginTop: spacing.xs,
                      }}
                    >
                      {param.description}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: colors.muted,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xs / 2,
                      borderRadius: 4,
                      marginLeft: spacing.sm,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 9,
                        fontWeight: "600",
                        color: colors.mutedForeground,
                      }}
                    >
                      {param.type}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 6,
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.sm,
                    marginTop: spacing.sm,
                  }}
                >
                  <TextInput
                    value={param.value}
                    onChangeText={(text) => updateParam(param.id, text)}
                    placeholder="Ingresa valor"
                    style={{
                      fontSize: 13,
                      color: colors.foreground,
                    }}
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
