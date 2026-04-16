import React from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import { Modal } from './Modal'
import { Button } from './Button'
import { Text } from './Text'
import { Card } from './Card'
import { spacing, getThemeColors } from '../../theme'

interface OCPPModalProps {
  visible: boolean
  chargerId: string
  chargerName: string
  chargerStatus: string
  isActive: boolean
  executing: boolean
  onStartCharge: () => void
  onStopCharge: () => void
  onDisable: () => void
  onEnable: () => void
  onUnlock: () => void
  onReboot: () => void
  onEdit: () => void
  onClose: () => void
}

export function OCPPModal({
  visible,
  chargerId,
  chargerName,
  chargerStatus,
  isActive,
  executing,
  onStartCharge,
  onStopCharge,
  onDisable,
  onEnable,
  onUnlock,
  onReboot,
  onEdit,
  onClose,
}: OCPPModalProps) {
  const colors = getThemeColors('light')

  return (
    <Modal visible={visible} onClose={onClose} title={`${chargerName} (${chargerId})`}>
      <View style={styles.container}>
        {/* Status Badge */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text
              style={[
                styles.statusValue,
                {
                  color:
                    chargerStatus === 'Online' ? '#22c55e' : '#ef4444',
                },
              ]}
            >
              {chargerStatus}
            </Text>
          </View>
        </Card>

        {/* Commands */}
        <Text style={styles.sectionTitle}>Commands</Text>

        {/* Start Charge */}
        <Button
          label={executing ? 'Executing...' : 'Start Charge'}
          onPress={onStartCharge}
          disabled={executing || isActive}
          style={styles.button}
        />

        {/* Stop Charge - only if active */}
        {isActive && (
          <Button
            label={executing ? 'Stopping...' : 'Stop Charge'}
            onPress={onStopCharge}
            disabled={executing}
            variant="secondary"
            style={styles.button}
          />
        )}

        {/* Disable/Enable */}
        {chargerStatus === 'Online' ? (
          <Button
            label={executing ? 'Disabling...' : 'Disable'}
            onPress={onDisable}
            disabled={executing}
            variant="secondary"
            style={styles.button}
          />
        ) : (
          <Button
            label={executing ? 'Enabling...' : 'Enable'}
            onPress={onEnable}
            disabled={executing}
            variant="secondary"
            style={styles.button}
          />
        )}

        {/* Unlock Connector */}
        <Button
          label={executing ? 'Unlocking...' : 'Unlock Connector'}
          onPress={onUnlock}
          disabled={executing}
          variant="secondary"
          style={styles.button}
        />

        {/* Reboot */}
        <Button
          label={executing ? 'Rebooting...' : 'Reboot'}
          onPress={onReboot}
          disabled={executing}
          variant="secondary"
          style={styles.button}
        />

        {/* Edit & Close */}
        <View style={styles.actionRow}>
          <Button
            label="Edit"
            onPress={onEdit}
            disabled={executing}
            style={styles.halfButton}
          />
          <Button
            label="Close"
            onPress={onClose}
            disabled={executing}
            variant="secondary"
            style={styles.halfButton}
          />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  button: {
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  halfButton: {
    flex: 1,
  },
})
