import React, { useState } from 'react'
import { View, ScrollView, StyleSheet, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { Card } from '@/components/ui/Card'
import { Text } from '@/components/ui/Text'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { useToast } from '@/components/ui/Toast'
import { usePermissionGuard } from '@/lib/hooks/usePermissionGuard'
import { AuthPermissionsEnum } from '@/lib/config/permissions'
import { apiCache } from '@/lib/utils/cache'

export default function ChargerDetailWithTabsScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const { show: showToast } = useToast()

  usePermissionGuard({
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  })

  const [charger, setCharger] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch charger data on mount
  React.useEffect(() => {
    if (id) {
      fetchCharger()
    }
  }, [id])

  const fetchCharger = async () => {
    try {
      setLoading(true)
      setError(null)

      const cacheKey = `charger-${id}`

      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        setCharger(cached)
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
        `https://emobility-bff.dev.dhemax.link/bff/chargers/${id}`,
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
      const chargerData = data.payload

      // Cache for 5 minutes
      apiCache.set(cacheKey, chargerData, 5 * 60 * 1000)

      setCharger(chargerData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load charger'
      setError(message)
      showToast(message, 'error')
      console.error('Charger detail error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    // Delete logic from index.tsx
    // For now, just navigate back
    showToast('Delete not implemented in tabs view', 'info')
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  if (error || !charger) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load charger</Text>
        <Button label="Retry" onPress={fetchCharger} />
        <Button label="Back" onPress={() => router.back()} variant="secondary" />
      </View>
    )
  }

  // Tab definitions
  const tabs = [
    {
      label: 'Overview',
      key: 'overview',
      content: (
        <ScrollView style={styles.tabContent}>
          <Card style={styles.card}>
            <View style={styles.section}>
              <Text style={styles.label}>Charger ID</Text>
              <Text style={styles.value}>{charger.charger_ID}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{charger.charger_name}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>OCPP ID</Text>
              <Text style={styles.value}>{charger.charger_ocpp_id}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Vendor</Text>
              <Text style={styles.value}>{charger.charger_vendor || '--'}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Model</Text>
              <Text style={styles.value}>{charger.charger_model || '--'}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Power (kW)</Text>
              <Text style={styles.value}>{String(charger.charger_rated_power_kw)}</Text>
            </View>
          </Card>
        </ScrollView>
      ),
    },
    {
      label: 'Live',
      key: 'live',
      content: (
        <ScrollView style={styles.tabContent}>
          <Card style={styles.card}>
            <Text style={styles.placeholder}>Live data view (route: /chargers/[id]/live)</Text>
          </Card>
        </ScrollView>
      ),
    },
    {
      label: 'History',
      key: 'history',
      content: (
        <ScrollView style={styles.tabContent}>
          <Card style={styles.card}>
            <Text style={styles.placeholder}>History view (route: /chargers/[id]/history)</Text>
          </Card>
        </ScrollView>
      ),
    },
    {
      label: 'Config',
      key: 'config',
      content: (
        <ScrollView style={styles.tabContent}>
          <Card style={styles.card}>
            <Text style={styles.placeholder}>Configuration view (route: /chargers/[id]/configuration)</Text>
          </Card>
        </ScrollView>
      ),
    },
  ]

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{charger.charger_ID}</Text>
          <Text style={styles.subtitle}>{charger.charger_name}</Text>
        </View>
        <Badge
          label={charger.charger_status === 'Online' ? 'Online' : charger.charger_status}
          variant={charger.charger_status === 'Online' ? 'secondary' : 'outline'}
        />
      </View>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultKey="overview" onChange={setActiveTab} />

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button label="Edit" onPress={() => router.push(`/chargers/${id}/edit`)} />
        <Button
          label="Delete"
          onPress={handleDelete}
          variant="destructive"
          style={styles.deleteButton}
        />
        <Button label="Back" onPress={() => router.back()} variant="secondary" />
      </View>
    </View>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 16,
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  section: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
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
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  deleteButton: {
    flex: 0.5,
  },
  placeholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 40,
  },
})
