import { SafeAreaView, ScrollView, View, FlatList, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '../../components/ui/Text';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { getThemeColors, spacing } from '../../../theme';
import { Ionicons } from '@expo/vector-icons';

interface RFIDCredential {
  id: string;
  uid: string;
  vehicle: string;
  status: 'active' | 'inactive';
  addedDate: string;
}

interface EVCCIDCredential {
  id: string;
  evccid: string;
  vehicle: string;
  status: 'active' | 'inactive';
  addedDate: string;
}

const MOCK_RFID: RFIDCredential[] = [
  { id: '1', uid: '04F3C2A1B5', vehicle: 'Tesla Model 3 - ABC123', status: 'active', addedDate: '2024-03-10' },
  { id: '2', uid: '08AB4D7F3C', vehicle: 'BMW i3 - XYZ789', status: 'active', addedDate: '2024-02-15' },
  { id: '3', uid: '12CD5E9G4H', vehicle: 'Nissan Leaf - DEF456', status: 'inactive', addedDate: '2024-01-20' },
];

const MOCK_EVCCID: EVCCIDCredential[] = [
  { id: '1', evccid: 'DE*ABC*12345678*1', vehicle: 'Tesla Model 3 - ABC123', status: 'active', addedDate: '2024-03-10' },
  { id: '2', evccid: 'DE*XYZ*87654321*2', vehicle: 'Audi e-tron - JKL012', status: 'active', addedDate: '2024-03-05' },
];

export default function CredentialsScreen() {
  const { t } = useTranslation();
  const colors = getThemeColors('light');
  const [activeTab, setActiveTab] = useState<'rfid' | 'evccid'>('rfid');

  const TabButton = ({ tab, label }: { tab: 'rfid' | 'evccid'; label: string }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(tab)}
      style={{
        flex: 1,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: activeTab === tab ? colors.primary : colors.border,
        alignItems: 'center',
      }}
    >
      <Text
        variant="body"
        weight={activeTab === tab ? 'bold' : 'normal'}
        style={{ color: activeTab === tab ? colors.primary : colors.mutedForeground }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const RFIDList = () => (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      {MOCK_RFID.map(credential => (
        <Card key={credential.id}>
          <CardContent style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Text variant="h4" weight="bold">
                  {credential.vehicle}
                </Text>
                <Text variant="body" style={{ color: colors.mutedForeground, fontFamily: 'monospace' }}>
                  UID: {credential.uid}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Added: {credential.addedDate}
                </Text>
              </View>
              <Badge label={credential.status === 'active' ? 'Active' : 'Inactive'} variant={credential.status === 'active' ? 'secondary' : 'outline'} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Edit" variant="outline" size="sm" />
              <Button label="Delete" variant="destructive" size="sm" />
            </View>
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );

  const EVCCIDList = () => (
    <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
      {MOCK_EVCCID.map(credential => (
        <Card key={credential.id}>
          <CardContent style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: spacing.sm }}>
                <Text variant="h4" weight="bold">
                  {credential.vehicle}
                </Text>
                <Text variant="body" style={{ color: colors.mutedForeground, fontFamily: 'monospace', fontSize: 11 }}>
                  {credential.evccid}
                </Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  Added: {credential.addedDate}
                </Text>
              </View>
              <Badge label={credential.status === 'active' ? 'Active' : 'Inactive'} variant={credential.status === 'active' ? 'secondary' : 'outline'} />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <Button label="Edit" variant="outline" size="sm" />
              <Button label="Delete" variant="destructive" size="sm" />
            </View>
          </CardContent>
        </Card>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
          <Text variant="h2" weight="bold">
            {t('common.ui.pageTitles.credentials') || 'Credentials'}
          </Text>
          <Text variant="body" style={{ color: colors.mutedForeground, marginTop: spacing.sm }}>
            Manage RFID and EVCCID credentials
          </Text>
        </View>

        <View style={{ flexDirection: 'row', marginTop: spacing.lg }}>
          <TabButton tab="rfid" label="RFID" />
          <TabButton tab="evccid" label="EVCCID" />
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 'rfid' ? <RFIDList /> : <EVCCIDList />}
        </View>

        <View style={{ padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Button
            label={`Add ${activeTab.toUpperCase()}`}
            variant="primary"
            onPress={() => {
              // TODO: navigate to add credential screen
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
