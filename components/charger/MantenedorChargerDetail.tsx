import { useState } from "react";
import { ScrollView, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from "react-native";
import { useNavigation, useRouter, useLocalSearchParams } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "@/components/ui/Toast";
import { AppHeader } from "@/components/layout/AppHeader";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { chargerCommandsApi } from "@/lib/api/charger-commands.api";
import { EnergyVariablesModal, EnergyVariable } from "@/components/charger/EnergyVariablesModal";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { useTranslation } from "react-i18next";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  preparing:   { label: "Preparando",    bg: "#f3f4f6",  color: "#0ACDA9" },
  charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  occupied:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  offline:     { label: "Offline",       bg: "#f3f4f6",  color: "#9ca3af" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status?.toLowerCase()] || { label: status, bg: "#f3f4f6", color: "#9ca3af" };
}

function buildConnectorVariables(connector: any, t: (key: string) => string): EnergyVariable[] {
  const vars: EnergyVariable[] = [];
  if (connector.voltage != null) {
    vars.push({ key: "voltage", label: t("mobile.chargerDetail.voltage"), unit: "V",  icon: "speedometer", color: "#0ACDA9", bg: "#f0fdfa", value: connector.voltage });
  }
  if (connector.current != null) {
    vars.push({ key: "current", label: t("mobile.chargerDetail.current"), unit: "A",  icon: "flash",       color: "#2563eb", bg: "#eff6ff", value: connector.current });
  }
  if (connector.livePower != null) {
    vars.push({ key: "power",   label: t("mobile.chargerDetail.power"),   unit: "kW", icon: "pulse",       color: "#9333ea", bg: "#faf5ff", value: connector.livePower });
  }
  vars.push({
    key: "temperature",
    label: t("mobile.chargerDetail.temperature"),
    unit: "°C",
    icon: "thermometer",
    color: connector.temperature != null && connector.temperature > 45 ? "#dc2626" : "#ea580c",
    bg: connector.temperature != null && connector.temperature > 45 ? "#fef2f2" : "#fff7ed",
    value: connector.temperature ?? 0,
  });
  return vars;
}

export function MantenedorChargerDetail({ charger }: { charger: any }) {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId) ?? "";
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const colors = getThemeColors(useResolvedColorScheme());

  // Modal state: which connector + which variable key
  const [modalConnectorId, setModalConnectorId] = useState<string | null>(null);
  const [modalInitialKey, setModalInitialKey] = useState<string>("voltage");

  const openModal = (connectorId: string, key: string) => {
    setModalConnectorId(connectorId);
    setModalInitialKey(key);
  };
  const closeModal = () => setModalConnectorId(null);

  const modalConnector = charger.connectors?.find((c: any) => String(c.id) === modalConnectorId) ?? null;
  const modalVars = modalConnector ? buildConnectorVariables(modalConnector, t) : [];

  const runReboot = async () => {
    setActionLoading("reboot");
    try {
      await chargerCommandsApi.reboot(selectedLocationId, charger.id);
      useToastStore.getState().show(t("mobile.chargerDetail.chargerReset"), "success", t("mobile.chargerDetail.resetCharger"));
    } catch {
      useToastStore.getState().show(t("mobile.chargerDetail.errorReset"), "error", t("mobile.chargerDetail.resetCharger"));
    } finally {
      setActionLoading(null);
    }
  };

  const location = charger.location || charger.site?.name || charger.siteName || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader hideRoleSelector={true} />

      {/* Page header */}
      <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity onPress={() => (navigation as any).goBack()} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "700", color: colors.foreground, lineHeight: 28 }}>
              {charger.name}
            </Text>
            {!!location && (
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 1 }}>{location}</Text>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ccfbf1", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Ionicons name="construct" size={11} color="#0d9488" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#0d9488" }}>{t("mobile.chargerDetail.maintainerView")}</Text>
            </View>
            <View style={{ backgroundColor: charger.online ? "#dcfce7" : "#fee2e2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Text style={{ fontSize: 10, fontWeight: "600", color: charger.online ? "#15803d" : "#dc2626" }}>
                {charger.online ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16 }}>
        {charger.connectors?.map((connector: any) => {
          const sc = getStatus(connector.status);
          const soc = connector.soc !== undefined ? Number(connector.soc) : undefined;
          const connEnergy = connector.energyDelivered ?? connector.energy;
          const connVars = buildConnectorVariables(connector, t);
          const hasEnergyData = connVars.length > 0;
          const tempHigh = connector.temperature != null && connector.temperature > 45;

          return (
            <View
              key={connector.id}
              style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}
            >
              {/* Connector header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
                  {t("mobile.chargerDetail.connector")} {connector.connectorId}
                </Text>
                <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: sc.color }}>{t(`mobile.status.${connector.status?.toLowerCase()}`, { defaultValue: sc.label })}</Text>
                </View>
              </View>

              {/* Vehicle & charging info */}
              {(connector.vehicleId || soc != null || connector.power != null || connEnergy != null) && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  {connector.vehicleId && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.vehicle")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {String(connector.vehicleId).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {soc != null && (
                    <View>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.stateOfCharge")}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <Ionicons name="battery-half" size={16} color="#2563eb" />
                          <Text style={{ fontSize: 18, fontWeight: "700", color: "#2563eb" }}>{soc}%</Text>
                        </View>
                      </View>
                      <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" }}>
                        <View style={{ height: 8, width: `${soc}%`, backgroundColor: "#3b82f6", borderRadius: 4 }} />
                      </View>
                      <Text style={{ fontSize: 12, color: colors.mutedForeground, fontStyle: "italic", marginTop: 4 }}>
                        {t("mobile.chargerDetail.socPartialNote")}
                      </Text>
                    </View>
                  )}

                  {connector.power != null && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.power")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{connector.power} kW</Text>
                    </View>
                  )}

                  {connEnergy != null && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.energyDelivered")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {Number(connEnergy).toFixed(1)} kWh
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* VARIABLES ENERGÉTICAS */}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                {hasEnergyData ? (
                  <View>
                    {/* Section header */}
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Ionicons name="pulse" size={13} color="#0d9488" />
                        <Text style={{ fontSize: 11, fontWeight: "700", color: "#0d9488", textTransform: "uppercase", letterSpacing: 0.5 }}>
                          {t("mobile.chargerDetail.energyVariables")}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => openModal(String(connector.id), connVars[0]?.key ?? "voltage")}
                        style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ccfbf1", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}
                      >
                        <Ionicons name="bar-chart" size={11} color="#0d9488" />
                        <Text style={{ fontSize: 11, fontWeight: "500", color: "#0d9488" }}>{t("mobile.chargerDetail.viewCurves")}</Text>
                      </TouchableOpacity>
                    </View>

                    {/* 2×2 energy grid — each card opens modal on that variable */}
                    <View style={{ gap: 8 }}>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {connVars.slice(0, 2).map((v) => (
                          <TouchableOpacity
                            key={v.key}
                            onPress={() => openModal(String(connector.id), v.key)}
                            style={{ flex: 1, backgroundColor: v.bg, borderRadius: 8, padding: 10 }}
                          >
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                              <Ionicons name={v.icon as any} size={12} color={v.color} />
                              <Text style={{ fontSize: 11, color: v.color }}>{v.label}</Text>
                            </View>
                            <Text style={{ fontSize: 17, fontWeight: "700", color: v.color }}>
                              {v.value.toFixed(1)} {v.unit}
                            </Text>
                            {v.key === "temperature" && tempHigh && (
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
                                <Ionicons name="alert-circle" size={10} color="#dc2626" />
                                <Text style={{ fontSize: 9, color: "#dc2626", fontWeight: "600" }}>{t("mobile.chargerDetail.temperatureHigh")}</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                      {connVars.length > 2 && (
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          {connVars.slice(2, 4).map((v) => (
                            <TouchableOpacity
                              key={v.key}
                              onPress={() => openModal(String(connector.id), v.key)}
                              style={{ flex: 1, backgroundColor: v.bg, borderRadius: 8, padding: 10 }}
                            >
                              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                                <Ionicons name={v.icon as any} size={12} color={v.color} />
                                <Text style={{ fontSize: 11, color: v.color }}>{v.label}</Text>
                              </View>
                              <Text style={{ fontSize: 17, fontWeight: "700", color: v.color }}>
                                {v.value.toFixed(1)} {v.unit}
                              </Text>
                              {v.key === "temperature" && tempHigh && (
                                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 }}>
                                  <Ionicons name="alert-circle" size={10} color="#dc2626" />
                                  <Text style={{ fontSize: 9, color: "#dc2626", fontWeight: "600" }}>{t("mobile.chargerDetail.temperatureHigh")}</Text>
                                </View>
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Hint */}
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}>
                      <Ionicons name="bar-chart" size={10} color="#0d9488" />
                      <Text style={{ fontSize: 11, color: "#0d9488" }}>{t("mobile.chargerDetail.tapVariablesHint")}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={{ backgroundColor: colors.muted, borderRadius: 8, padding: 16, alignItems: "center" }}>
                    <Ionicons name="pulse" size={20} color={colors.mutedForeground} />
                    <Text style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 4 }}>{t("mobile.chargerDetail.noEnergyDataConnector")}</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Herramientas Técnicas */}
        <View style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            {t("mobile.chargerDetail.technicalTools")}
          </Text>
          <View style={{ gap: 8 }}>
            <TouchableOpacity
              onPress={runReboot}
              disabled={actionLoading === "reboot"}
              style={{ backgroundColor: "#f97316", paddingVertical: 14, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: actionLoading === "reboot" ? 0.5 : 1 }}
            >
              {actionLoading === "reboot" ? <ActivityIndicator size="small" color="white" /> : <Ionicons name="reload" size={17} color="white" />}
              <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>{t("mobile.chargerDetail.resetCharger")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(app)/charger/${id}/ocpp` as any)}
              style={{ backgroundColor: colors.muted, paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="chatbubble-ellipses" size={17} color={colors.foreground} />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>{t("mobile.chargerDetail.ocppMessages")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push(`/(app)/charger/${id}/config` as any)}
              style={{ backgroundColor: "#f0fdfa", borderWidth: 1, borderColor: "#99f6e4", paddingVertical: 12, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Ionicons name="settings" size={17} color="#0d9488" />
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#0d9488" }}>{t("mobile.chargerDetail.ocppConfig")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Energy variables modal (per connector) */}
      <EnergyVariablesModal
        visible={!!modalConnectorId}
        onClose={closeModal}
        title={t("mobile.chargerDetail.energyVariables")}
        subtitle={`${charger.name} · C${modalConnector?.connectorId ?? ""} — ${t("mobile.chargerDetail.last30min")}`}
        variables={modalVars}
        initialKey={modalInitialKey}
        connectorId={modalConnectorId ?? undefined}
      />
    </SafeAreaView>
  );
}
