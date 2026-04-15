import { SafeAreaView, ScrollView, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text } from '../../../components/ui/Text';
import { Card, CardContent, CardHeader } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Switch } from '../../../components/ui/Switch';
import { getThemeColors, spacing } from '../../../theme';

export default function ChargerConfigurationScreen() {
  const { id } = useLocalSearchParams();
  const colors = getThemeColors('light');
  const [name, setName] = useState('Charger ' + id);
  const [maxCurrent, setMaxCurrent] = useState('32');
  const [enableRemote, setEnableRemote] = useState(true);
  const [enableScheduling, setEnableScheduling] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xl }}>
        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              Basic Settings
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                Charger Name
              </Text>
              <Input
                placeholder="Enter charger name"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                Serial Number
              </Text>
              <Input
                placeholder="Serial number"
                value={'WNBS-2024-' + id}
                editable={false}
              />
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                Firmware Version
              </Text>
              <Input
                placeholder="Firmware version"
                value="v4.2.1"
                editable={false}
              />
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              Power Settings
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                Max Current (Amperes)
              </Text>
              <Input
                placeholder="Max current"
                value={maxCurrent}
                onChangeText={setMaxCurrent}
                keyboardType="numeric"
              />
            </View>

            <View>
              <Text variant="caption" style={{ color: colors.mutedForeground, marginBottom: spacing.sm }}>
                Rated Power
              </Text>
              <Input
                placeholder="Rated power"
                value="22 kW"
                editable={false}
              />
            </View>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Text variant="h4" weight="bold">
              Features
            </Text>
          </CardHeader>
          <CardContent style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="bold">
                  Remote Control
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Allow remote start/stop
                </Text>
              </View>
              <Switch
                value={enableRemote}
                onValueChange={setEnableRemote}
              />
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="bold">
                    Scheduling
                  </Text>
                  <Text variant="caption" style={{ color: colors.mutedForeground }}>
                    Enable charging schedules
                  </Text>
                </View>
                <Switch
                  value={enableScheduling}
                  onValueChange={setEnableScheduling}
                />
              </View>
            </View>
          </CardContent>
        </Card>

        <View style={{ gap: spacing.md }}>
          <Button
            label="Save Configuration"
            variant="primary"
            onPress={() => {
              // TODO: save configuration
            }}
          />
          <Button
            label="Restart Charger"
            variant="outline"
            onPress={() => {
              // TODO: restart charger
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
