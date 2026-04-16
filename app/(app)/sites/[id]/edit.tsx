import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard'
import { AuthPermissionsEnum } from '@/lib/config/permissions'
import { apiCache } from '@/lib/utils/cache'

export default function EditSiteScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { show: showToast } = useToast()

  usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.SITES_EDIT],
  })

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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
    timezone: '',
    accessibility: '',
  })

  // Fetch existing site data
  useEffect(() => {
    if (id) {
      fetchSiteData()
    }
  }, [id])

  const fetchSiteData = async () => {
    try {
      setFetching(true)

      const token = await SecureStore.getItemAsync('access_token')
      if (!token) throw new Error('Not authenticated')

      const response = await fetch(
        `https://emobility-bff.dev.dhemax.link/bff/sites/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      const siteData = data.payload

      // Pre-fill form with existing data
      setForm({
        name: siteData.location_name || '',
        alias: siteData.location_alias || '',
        city: siteData.location_address?.location_address_city || '',
        street: siteData.location_address?.location_address_street || '',
        country: siteData.location_address?.location_address_country || '',
        adm_division: siteData.location_address?.location_address_adm_division || '',
        latitude: String(siteData.location_address?.location_address_latitude || ''),
        longitude: String(siteData.location_address?.location_address_longitude || ''),
        company: siteData.location_company || '',
        timezone: siteData.location_timezone || '',
        accessibility: siteData.location_accessibility || '',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load site'
      showToast(msg, 'error')
      console.error('Fetch site error:', err)
    } finally {
      setFetching(false)
    }
  }

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
        `https://emobility-bff.dev.dhemax.link/bff/sites/${id}`,
        {
          method: 'PUT',
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
      apiCache.delete(`site-${id}`)
      apiCache.clearPattern('^sites-')

      showToast('Site updated', 'success')
      router.back()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update'
      showToast(msg, 'error')
      console.error('Edit site error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader>
          <Text style={styles.title}>Edit Site</Text>
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
              label={loading ? 'Updating...' : 'Update'}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
