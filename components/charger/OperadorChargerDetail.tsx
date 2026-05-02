import { ScrollView, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from "react-native";
import { useResolvedColorScheme } from "@/hooks/use-color-scheme";
import { getThemeColors } from "@/theme";
import { useNavigation } from "expo-router";
import { Text } from "@/components/ui/Text";
import { Ionicons } from "@expo/vector-icons";
import { useToastStore } from "@/components/ui/Toast";
import { AppHeader } from "@/components/layout/AppHeader";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { chargerCommandsApi } from "@/lib/api/charger-commands.api";
import { chargingSessionApi } from "@/lib/api/charging-session.api";
import { useChargerCommandsStore } from "@/lib/stores/charger-commands.store";
import { useTranslation } from "react-i18next";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  Available:   { label: "Disponible",    bg: "#f3f4f6",  color: "#0ACDA9" },
  charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  Charging:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  occupied:    { label: "Cargando",      bg: "#dbeafe",  color: "#1477FF" },
  finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  Finishing:   { label: "Finalizando",   bg: "#f3e8ff",  color: "#a855f7" },
  faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  Faulted:     { label: "Falla",         bg: "#fee2e2",  color: "#ef4444" },
  suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  Suspended:   { label: "Suspendido",    bg: "#fef3c7",  color: "#f59e0b" },
  unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  Unavailable: { label: "No disponible", bg: "#f3f4f6",  color: "#9ca3af" },
  offline:     { label: "Offline",       bg: "#f3f4f6",  color: "#9ca3af" },
};

function getStatus(status: string) {
  return STATUS_CONFIG[status] || { label: status, bg: "#f3f4f6", color: "#9ca3af" };
}

function isCharging(status: string) {
  return ["charging", "Charging", "occupied"].includes(status);
}

function isOfflineError(err: unknown): boolean {
  const status = (err as any)?.response?.status;
  const code = (err as any)?.code;
  return status === 502 || status === 503 || status === 504 || code === "ECONNABORTED" || code === "ERR_NETWORK";
}

export function OperadorChargerDetail({ charger }: { charger: any }) {
  const { t } = useTranslation();
  const colors = getThemeColors(useResolvedColorScheme());
  const navigation = useNavigation();
  const selectedLocationId = useChargersStore((s) => s.selectedLocationId) ?? "";
  const { isPending, setPending, clearPending } = useChargerCommandsStore();

  const cmdKey = (command: string, connectorNumber?: number) =>
    connectorNumber !== undefined
      ? `${charger.id}-${command}-${connectorNumber}`
      : `${charger.id}-${command}`;

  const runConnectorCmd = async (
    command: "start" | "stop" | "unlock",
    connectorUUID: string,
    connectorNumber: number,
  ) => {
    const key = cmdKey(command, connectorNumber);
    if (isPending(key)) return;
    setPending(key, command);
    try {
      if (command === "start") {
        const idTag = await chargingSessionApi.createRegistry(connectorUUID);
        await chargerCommandsApi.connectorCommand(selectedLocationId, charger.id, connectorUUID, command, idTag);
      } else {
        await chargerCommandsApi.connectorCommand(selectedLocationId, charger.id, connectorUUID, command);
      }
      useToastStore.getState().show(
        `${t("mobile.chargerDetail.connector")} ${connectorNumber}`,
        "success",
        t(`mobile.chargerDetail.${command === "start" ? "chargeStarted" : command === "stop" ? "chargeStopped" : "connectorUnlocked"}`),
      );
    } catch (err) {
      const msg = isOfflineError(err)
        ? t("mobile.chargerDetail.offlineWarning")
        : t(`mobile.chargerDetail.${command === "start" ? "errorStart" : command === "stop" ? "errorStop" : "errorUnlock"}`);
      useToastStore.getState().show(`${t("mobile.chargerDetail.connector")} ${connectorNumber}`, "error", msg);
    } finally {
      clearPending(key);
    }
  };

  const runReboot = async () => {
    const key = cmdKey("reboot");
    if (isPending(key)) return;
    setPending(key, "reboot");
    try {
      await chargerCommandsApi.reboot(selectedLocationId, charger.id);
      useToastStore.getState().show(t("mobile.chargerDetail.chargerReset"), "success", t("mobile.chargerDetail.resetCharger"));
    } catch (err) {
      const msg = isOfflineError(err)
        ? t("mobile.chargerDetail.offlineWarning")
        : t("mobile.chargerDetail.errorReset");
      useToastStore.getState().show(msg, "error", t("mobile.chargerDetail.resetCharger"));
    } finally {
      clearPending(key);
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#ede9fe", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 }}>
              <Ionicons name="flash" size={11} color="#7c3aed" />
              <Text style={{ fontSize: 10, fontWeight: "600", color: "#7c3aed" }}>{t("mobile.chargerDetail.operatorView")}</Text>
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
          const charging = isCharging(connector.status);
          const soc = connector.soc !== undefined ? Number(connector.soc) : undefined;
          const energy = connector.energyDelivered ?? connector.energy;

          return (
            <View
              key={connector.id}
              style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}
            >
              {/* Header */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground }}>
                  {t("mobile.chargerDetail.connector")} {connector.connectorId}
                </Text>
                <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: sc.color }}>{t(`mobile.status.${connector.status?.toLowerCase()}`, { defaultValue: sc.label })}</Text>
                </View>
              </View>

              {/* Vehicle + charging info — show whenever any data is available */}
              {(connector.vehicleId || soc !== undefined || connector.power !== undefined || energy !== undefined) && (
                <View style={{ gap: 10, marginBottom: 12 }}>
                  {connector.vehicleId && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.vehicle")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                        {String(connector.vehicleId).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  {soc !== undefined && (
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

                  {connector.power !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.power")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{connector.power} kW</Text>
                    </View>
                  )}

                  {energy !== undefined && (
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>{t("mobile.chargerDetail.energyDelivered")}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{Number(energy).toFixed(1)} kWh</Text>
                    </View>
                  )}
                </View>
              )}

              {/* CONTROLES REMOTOS */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: "700", color: "#9333ea", textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {t("mobile.chargerDetail.remoteControls")}
                </Text>

                {/* Offline warning */}
                {!charger.online && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fef2f2", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                    <Ionicons name="warning-outline" size={14} color="#dc2626" />
                    <Text style={{ fontSize: 12, color: "#dc2626" }}>{t("mobile.chargerDetail.offlineWarning")}</Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {/* Start / Stop */}
                  {!charging ? (
                    <TouchableOpacity
                      onPress={() => runConnectorCmd("start", connector.id, connector.connectorId)}
                      disabled={!charger.online || isPending(cmdKey("start", connector.connectorId))}
                      style={{ flex: 1, backgroundColor: "#22c55e", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: (!charger.online || isPending(cmdKey("start", connector.connectorId))) ? 0.4 : 1 }}
                    >
                      {isPending(cmdKey("start", connector.connectorId)) ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="play" size={15} color="white" />
                      )}
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>{t("mobile.chargerDetail.startCharge")}</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={() => runConnectorCmd("stop", connector.id, connector.connectorId)}
                      disabled={!charger.online || isPending(cmdKey("stop", connector.connectorId))}
                      style={{ flex: 1, backgroundColor: "#3b82f6", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: (!charger.online || isPending(cmdKey("stop", connector.connectorId))) ? 0.4 : 1 }}
                    >
                      {isPending(cmdKey("stop", connector.connectorId)) ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Ionicons name="stop" size={15} color="white" />
                      )}
                      <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>{t("mobile.chargerDetail.stopCharge")}</Text>
                    </TouchableOpacity>
                  )}

                  {/* Unlock */}
                  <TouchableOpacity
                    onPress={() => runConnectorCmd("unlock", connector.id, connector.connectorId)}
                    disabled={!charger.online || isPending(cmdKey("unlock", connector.connectorId))}
                    style={{ flex: 1, backgroundColor: "#4b5563", paddingVertical: 10, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, opacity: (!charger.online || isPending(cmdKey("unlock", connector.connectorId))) ? 0.4 : 1 }}
                  >
                    {isPending(cmdKey("unlock", connector.connectorId)) ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Ionicons name="lock-open" size={15} color="white" />
                    )}
                    <Text style={{ fontSize: 13, fontWeight: "600", color: "white" }}>{t("mobile.chargerDetail.unlock")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}

        {/* Acciones del Cargador */}
        <View style={{ backgroundColor: colors.card, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.foreground, marginBottom: 12 }}>
            {t("mobile.chargerDetail.chargerActions")}
          </Text>
          <TouchableOpacity
            onPress={runReboot}
            disabled={isPending(cmdKey("reboot"))}
            style={{ backgroundColor: "#f97316", paddingVertical: 14, borderRadius: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, opacity: isPending(cmdKey("reboot")) ? 0.5 : 1 }}
          >
            {isPending(cmdKey("reboot")) ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="reload" size={17} color="white" />
            )}
            <Text style={{ fontSize: 14, fontWeight: "600", color: "white" }}>{t("mobile.chargerDetail.resetCharger")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
