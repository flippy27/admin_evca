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

export default function ChargerDetailScreen() {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  const [charger, setCharger] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchCharger()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchCharger = async () => {
    try {
      setLoading(true)
      setError(null)

      const cacheKey = `charger-${id}`

      // Check cache first
      const cached = apiCache.get(cacheKey)
      if (cached) {
        console.log('Using cached charger data')
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
      Toast.error(message)
      console.error('Charger detail error:', err)
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

  if (error || !charger) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Failed to load charger</Text>
        <Button title="Retry" onPress={fetchCharger} />
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
            <Text style={styles.chargerId}>{charger.charger_ID}</Text>
            <Text style={styles.chargerName}>{charger.charger_name}</Text>
          </View>
          <Badge
            variant={charger.charger_status === 'Online' ? 'success' : 'default'}
            label={charger.charger_status}
          />
        </View>
      </Card>

      {/* Details */}
      <Card title="Information" style={styles.detailCard}>
        <DetailRow label="OCPP ID" value={charger.charger_ocpp_id} />
        <DetailRow label="Model" value={charger.charger_model || '--'} />
        <DetailRow label="Vendor" value={charger.charger_vendor || '--'} />
        <DetailRow label="Power (kW)" value={String(charger.charger_rated_power_kw)} />
        <DetailRow label="Connectors" value={String(charger.connectors_count)} />
      </Card>

      {/* Connectors */}
      {charger.connectors && charger.connectors.length > 0 && (
        <Card title="Connectors" style={styles.detailCard}>
          {charger.connectors.map((connector: any, idx: number) => (
            <View key={idx} style={styles.connectorRow}>
              <Text style={styles.connectorName}>{connector.name}</Text>
              <Badge label={connector.status} variant="default" />
            </View>
          ))}
        </Card>
      )}

      {/* Actions */}
      <Card style={styles.actionsCard}>
        <Button
          title="View Live Data"
          onPress={() => router.push(`/chargers/${id}/live`)}
        />
        <Button
          title="View History"
          onPress={() => router.push(`/chargers/${id}/history`)}
          variant="secondary"
          style={styles.actionButton}
        />
        <Button
          title="Configuration"
          onPress={() => router.push(`/chargers/${id}/configuration`)}
          variant="secondary"
          style={styles.actionButton}
        />
      </Card>
    </ScrollView>
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
  chargerId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  chargerName: {
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
  },
  connectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  connectorName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionsCard: {
    marginBottom: 32,
  },
  actionButton: {
    marginTop: 12,
  },
})
