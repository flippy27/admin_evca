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

type CreateSiteScreenProps = object

export default function CreateSiteScreen(props: CreateSiteScreenProps) {
  const router = useRouter()
  const { show: showToast } = useToast()

  usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.SITES_CREATE],
  })

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    alias: '',
    city: '',
    street: '',
    country: '',
    adm_division: '',
    latitude: '',
    longitude: '',
    company: '',
    timezone: 'UTC',
    accessibility: '',
  })

  const handleSubmit = async () => {
    try {
      setLoading(true)

      // Validate required fields
      if (!form.name) {
        showToast('Fill all required fields', 'error')
        return
      }

      const token = await SecureStore.getItemAsync('access_token')
      if (!token) throw new Error('Not authenticated')

      const payload = {
        payload: {
          location_name: form.name,
          location_alias: form.alias,
          location_address: {
            location_address_city: form.city,
            location_address_street: form.street,
            location_address_country: form.country,
            location_address_adm_division: form.adm_division,
            location_address_latitude: form.latitude ? parseFloat(form.latitude) : null,
            location_address_longitude: form.longitude ? parseFloat(form.longitude) : null,
          },
          location_company: form.company,
          location_timezone: form.timezone,
          location_accessibility: form.accessibility,
        },
      }

      const response = await fetch(
        'https://emobility-bff.dev.dhemax.link/bff/sites',
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
      apiCache.clearPattern('^sites-')

      showToast('Site created', 'success')
      router.back()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create'
      showToast(msg, 'error')
      console.error('Create site error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader>
          <Text style={styles.title}>New Site</Text>
        </CardHeader>
        <CardContent>
          <Text style={styles.section}>Required</Text>
          <Input
            placeholder="Name"
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            editable={!loading}
          />

          <Text style={styles.section}>Details</Text>
          <Input
            placeholder="Alias"
            value={form.alias}
            onChangeText={(v) => setForm({ ...form, alias: v })}
            editable={!loading}
          />
          <Input
            placeholder="City"
            value={form.city}
            onChangeText={(v) => setForm({ ...form, city: v })}
            editable={!loading}
          />
          <Input
            placeholder="Street"
            value={form.street}
            onChangeText={(v) => setForm({ ...form, street: v })}
            editable={!loading}
          />
          <Input
            placeholder="Country"
            value={form.country}
            onChangeText={(v) => setForm({ ...form, country: v })}
            editable={!loading}
          />
          <Input
            placeholder="State/Division"
            value={form.adm_division}
            onChangeText={(v) => setForm({ ...form, adm_division: v })}
            editable={!loading}
          />
          <Input
            placeholder="Latitude"
            value={form.latitude}
            onChangeText={(v) => setForm({ ...form, latitude: v })}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Input
            placeholder="Longitude"
            value={form.longitude}
            onChangeText={(v) => setForm({ ...form, longitude: v })}
            keyboardType="decimal-pad"
            editable={!loading}
          />
          <Input
            placeholder="Company"
            value={form.company}
            onChangeText={(v) => setForm({ ...form, company: v })}
            editable={!loading}
          />
          <Input
            placeholder="Timezone"
            value={form.timezone}
            onChangeText={(v) => setForm({ ...form, timezone: v })}
            editable={!loading}
          />
          <Input
            placeholder="Accessibility"
            value={form.accessibility}
            onChangeText={(v) => setForm({ ...form, accessibility: v })}
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
