import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard'
import { AuthPermissionsEnum } from '@/lib/config/permissions'
import { apiCache } from '@/lib/utils/cache'

export default function CreateChargerScreen() {
  const router = useRouter()
  const { show: showToast } = useToast()

  usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_CREATE],
  })

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    charger_id: '',
    name: '',
    vendor: '',
    model: '',
    ocpp_id: '',
    ip_address: '',
    serial_number: '',
    firmware_version: '',
    rated_power_kw: '22',
    access_type: 'PUBLIC',
    ocpp_version: '1.6',
    location_id: '11',
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validate required fields
      if (!form.charger_id || !form.name || !form.vendor || !form.model) {
        showToast('Fill all required fields', 'error')
        return
      }

      const token = await SecureStore.getItemAsync('access_token')
      if (!token) throw new Error('Not authenticated')

      const payload = {
        payload: {
          charger_id: form.charger_id,
          name: form.name,
          vendor: form.vendor,
          model: form.model,
          ocpp_id: form.ocpp_id,
          ip_address: form.ip_address,
          serial_number: form.serial_number,
          firmware_version: form.firmware_version,
          rated_power_kw: parseFloat(form.rated_power_kw),
          access_type: form.access_type,
          ocpp_version: form.ocpp_version,
          connectors: [
            {
              connector_id: 'CONN-1',
              name: 'Connector 1',
              type: 'AC',
              standard: 'IEC_62196_T2',
              power_type: 'AC_1_PHASE',
              max_voltage: 230,
              max_amperage: 16,
            },
          ],
          site: {
            existing: {
              location_id: form.location_id,
            },
          },
        },
      }

      const response = await fetch(
        'https://emobility-bff.dev.dhemax.link/bff/chargers',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(
          error.meta?.errors?.[0]?.message || `HTTP ${response.status}`
        )
      }

      // Clear cache
      apiCache.clearPattern('^chargers-')

      showToast('Charger created', 'success')
      router.back()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create'
      showToast(msg, 'error')
      console.error('Create charger error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader>
          <Text style={styles.title}>New Charger</Text>
        </CardHeader>
        <CardContent>
          <Text style={styles.section}>Required</Text>
          <Input
            placeholder="Charger ID"
            value={form.charger_id}
            onChangeText={(v) => setForm({ ...form, charger_id: v })}
            editable={!loading}
          />
          <Input
            placeholder="Name"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            editable={!loading}
          />
          <Input
            placeholder="Vendor"
            value={form.vendor}
            onChangeText={(v) => setForm({ ...form, vendor: v })}
            editable={!loading}
          />
          <Input
            placeholder="Model"
            value={form.model}
            onChangeText={(v) => setForm({ ...form, model: v })}
            editable={!loading}
          />

          <Text style={styles.section}>Details</Text>
          <Input
            placeholder="OCPP ID"
            value={form.ocpp_id}
            onChangeText={(v) => setForm({ ...form, ocpp_id: v })}
            editable={!loading}
          />
          <Input
            placeholder="IP Address"
            value={form.ip_address}
            onChangeText={(v) => setForm({ ...form, ip_address: v })}
            editable={!loading}
          />
          <Input
            placeholder="Serial Number"
            value={form.serial_number}
            onChangeText={(v) => setForm({ ...form, serial_number: v })}
            editable={!loading}
          />
          <Input
            placeholder="Firmware Version"
            value={form.firmware_version}
            onChangeText={(v) => setForm({ ...form, firmware_version: v })}
            editable={!loading}
          />
          <Input
            placeholder="Power (kW)"
            value={form.rated_power_kw}
            onChangeText={(v) => setForm({ ...form, rated_power_kw: v })}
            keyboardType="decimal-pad"
            editable={!loading}
          />

          <View style={styles.actions}>
            <Button
              label={loading ? 'Creating...' : 'Create'}
              onPress={handleSubmit}
              disabled={loading}
            />
            <Button
              label="Cancel"
              onPress={() => router.back()}
              variant="secondary"
              style={styles.button}
              disabled={loading}
            />
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    marginBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 20,
  },
  button: {
    marginTop: 12,
  },
})
