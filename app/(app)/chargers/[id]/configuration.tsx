import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { RefreshControl, SafeAreaView, ScrollView, View } from "react-native";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import {
  LoadingOverlayComponent,
  useLoadingOverlay,
} from "@/components/ui/LoadingOverlay";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/ui/Toast";
import { useChargersStore } from "@/lib/stores/chargers.store";
import { getThemeColors, spacing } from "@/theme";

export default function ChargerConfigurationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = getThemeColors("light");
  const { show: showToast } = useToast();
  const { show: showLoading, hide: hideLoading } = useLoadingOverlay();

  const {
    selectedCharger,
    config,
    configLoading,
    configError,
    fetchChargerDetail,
    fetchConfiguration,
    updateConfiguration,
    clearError,
  } = useChargersStore();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchChargerDetail(id);
      fetchConfiguration(id);
    }
  }, [id]);

  useEffect(() => {
    if (config) {
      setFormData({
        heartbeatInterval: String(config.heartbeatInterval),
        meterInterval: String(config.meterInterval),
        maxEnergy: String(config.maxEnergy || ""),
        minEnergy: String(config.minEnergy || ""),
      });
    }
  }, [config]);

  const handleSave = async () => {
    if (!id) return;

    setIsSaving(true);
    showLoading();

    try {
      await updateConfiguration(id, formData);
      showToast("Configuration saved");
    } catch (error) {
      showToast("Failed to save configuration", "error");
    } finally {
      setIsSaving(false);
      hideLoading();
    }
  };

  if (!selectedCharger) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
        refreshControl={
          <RefreshControl
            refreshing={configLoading}
            onRefresh={() => {
              clearError("config");
              fetchConfiguration(id!);
            }}
          />
        }
      >
        {/* Header */}
        <View>
          <Text variant="h2" weight="bold">
            {selectedCharger.name}
          </Text>
          <Text
            variant="body"
            style={{ color: colors.mutedForeground, marginTop: spacing.sm }}
          >
            OCPP Configuration
          </Text>
        </View>

        {configError && (
          <Alert variant="destructive" title="Error" message={configError} />
        )}

        {/* Config Form */}
        <Card>
          <CardContent style={{ gap: spacing.lg }}>
            <Text variant="h3" weight="bold">
              Settings
            </Text>

            <Input
              label="Heartbeat Interval (s)"
              placeholder="60"
              value={formData.heartbeatInterval}
              onChangeText={(val) =>
                setFormData({ ...formData, heartbeatInterval: val })
              }
              keyboardType="numeric"
            />

            <Input
              label="Meter Interval (s)"
              placeholder="30"
              value={formData.meterInterval}
              onChangeText={(val) =>
                setFormData({ ...formData, meterInterval: val })
              }
              keyboardType="numeric"
            />

            <Input
              label="Max Energy (kWh)"
              placeholder="100"
              value={formData.maxEnergy}
              onChangeText={(val) =>
                setFormData({ ...formData, maxEnergy: val })
              }
              keyboardType="numeric"
            />

            <Input
              label="Min Energy (kWh)"
              placeholder="10"
              value={formData.minEnergy}
              onChangeText={(val) =>
                setFormData({ ...formData, minEnergy: val })
              }
              keyboardType="numeric"
            />

            {/* Save Button */}
            <Button
              label={isSaving ? "Saving..." : "Save Configuration"}
              variant="primary"
              onPress={handleSave}
              disabled={isSaving || configLoading}
            />
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              OCPP (Open Charge Point Protocol) configuration. Changes apply on
              next charger restart.
            </Text>
          </CardContent>
        </Card>
      </ScrollView>

      <LoadingOverlayComponent />
    </SafeAreaView>
  );
}
