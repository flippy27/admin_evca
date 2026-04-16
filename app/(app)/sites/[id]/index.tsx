import React, { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Toast } from '@/components/ui/Toast'
import { apiCache } from '@/lib/utils/cache'

export default function SiteDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [site, setSite] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchSite()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchSite = async () => {
    try {
      setLoading(true)
      setError(null)

      const cacheKey = `site-${id}`

      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        console.log('Using cached site data')
        setSite(cached)
        setLoading(false)
        return
      }

      // Get token from secure store
      const token = await SecureStore.getItemAsync('access_token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Call API
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

      // Cache for 5 minutes
      apiCache.set(cacheKey, siteData, 5 * 60 * 1000)

      setSite(siteData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load site'
      setError(message)
      Toast.error(message)
      console.error('Site detail error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  if (error || !site) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load site</Text>
        <Button title="Retry" onPress={fetchSite} />
        <Button title="Back" onPress={() => router.back()} variant="secondary" />
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerContent}>
            <Text style={styles.siteName}>{site.location_name}</Text>
            <Text style={styles.siteAlias}>{site.location_alias}</Text>
          </View>
          <Badge
            variant="default"
            label={site.location_status || 'Active'}
          />
        </View>
      </Card>

      {/* Location Details */}
      <Card title="Location" style={styles.detailCard}>
        {site.location_address && (
          <>
            <DetailRow label="City" value={site.location_address.location_address_city} />
            <DetailRow label="State/Division" value={site.location_address.location_address_adm_division} />
            <DetailRow label="Country" value={site.location_address.location_address_country} />
            <DetailRow label="Street" value={site.location_address.location_address_street} />
            <DetailRow label="Latitude" value={site.location_address.location_address_latitude} />
            <DetailRow label="Longitude" value={site.location_address.location_address_longitude} />
          </>
        )}
      </Card>

      {/* Details */}
      <Card title="Information" style={styles.detailCard}>
        {site.location_company && <DetailRow label="Company" value={site.location_company} />}
        {site.location_timezone && <DetailRow label="Timezone" value={site.location_timezone} />}
        {site.location_accessibility && <DetailRow label="Accessibility" value={site.location_accessibility} />}
      </Card>

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <Button
          title="View Chargers"
          onPress={() => router.push(`/chargers?location=${id}`)}
        />
        <Button
          title="Edit Site"
          onPress={() => router.push(`/sites/${id}/profile`)}
          variant="secondary"
          style={styles.actionButton}
        />
      </Card>
    </ScrollView>
  )
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
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
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  headerCard: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  siteName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  siteAlias: {
    fontSize: 14,
    color: '#666',
  },
  detailCard: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  actionsCard: {
    marginBottom: 32,
  },
  actionButton: {
    marginTop: 12,
  },
})
