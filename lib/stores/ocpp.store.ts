/**
 * OCPP Commands Store - Manage charger control operations
 * Handles start/stop/disable/enable/unlock/reboot commands
 */

import { create } from 'zustand'
import { ocppApi } from '../api/ocpp.api'
import { logger } from '../services/logger'

interface OCPPCommand {
  type: 'start' | 'stop' | 'disable' | 'enable' | 'unlock' | 'reboot'
  chargerId: string
  timestamp: number
  status: 'pending' | 'success' | 'error'
  message?: string
}

interface OCPPState {
  // State
  executing: boolean
  lastCommand: OCPPCommand | null
  error: string | null

  // Actions
  startCharge: (chargerId: string, connectorId: string, idTag?: string) => Promise<boolean>
  stopCharge: (chargerId: string, transactionId: number) => Promise<boolean>
  disableCharger: (chargerId: string) => Promise<boolean>
  enableCharger: (chargerId: string) => Promise<boolean>
  unlockConnector: (chargerId: string, connectorId: string) => Promise<boolean>
  rebootCharger: (chargerId: string) => Promise<boolean>
  clearError: () => void
}

export const useOCPPStore = create<OCPPState>((set, get) => ({
  // Initial state
  executing: false,
  lastCommand: null,
  error: null,

  // Start charge command
  startCharge: async (chargerId: string, connectorId: string, idTag?: string) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.startCharge(chargerId, connectorId, idTag)

      const command: OCPPCommand = {
        type: 'start',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Started charge on connector ${connectorId}`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Start charge on ${chargerId}/${connectorId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start charge'
      const command: OCPPCommand = {
        type: 'start',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Start charge failed - ${message}`)
      return false
    }
  },

  // Stop charge command
  stopCharge: async (chargerId: string, transactionId: number) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.stopCharge(chargerId, transactionId)

      const command: OCPPCommand = {
        type: 'stop',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Stopped charge (transaction ${transactionId})`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Stop charge on ${chargerId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop charge'
      const command: OCPPCommand = {
        type: 'stop',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Stop charge failed - ${message}`)
      return false
    }
  },

  // Disable charger command
  disableCharger: async (chargerId: string) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.disableCharger(chargerId)

      const command: OCPPCommand = {
        type: 'disable',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Disabled charger`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Disabled ${chargerId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable charger'
      const command: OCPPCommand = {
        type: 'disable',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Disable failed - ${message}`)
      return false
    }
  },

  // Enable charger command
  enableCharger: async (chargerId: string) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.enableCharger(chargerId)

      const command: OCPPCommand = {
        type: 'enable',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Enabled charger`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Enabled ${chargerId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable charger'
      const command: OCPPCommand = {
        type: 'enable',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Enable failed - ${message}`)
      return false
    }
  },

  // Unlock connector command
  unlockConnector: async (chargerId: string, connectorId: string) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.unlockConnector(chargerId, connectorId)

      const command: OCPPCommand = {
        type: 'unlock',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Unlocked connector ${connectorId}`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Unlocked ${chargerId}/${connectorId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unlock connector'
      const command: OCPPCommand = {
        type: 'unlock',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Unlock failed - ${message}`)
      return false
    }
  },

  // Reboot charger command
  rebootCharger: async (chargerId: string) => {
    try {
      set({ executing: true, error: null })

      const res = await ocppApi.rebootCharger(chargerId)

      const command: OCPPCommand = {
        type: 'reboot',
        chargerId,
        timestamp: Date.now(),
        status: 'success',
        message: `Reboot initiated`,
      }

      set({ lastCommand: command, executing: false })
      logger.info(`OCPP: Reboot ${chargerId}`)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reboot charger'
      const command: OCPPCommand = {
        type: 'reboot',
        chargerId,
        timestamp: Date.now(),
        status: 'error',
        message,
      }

      set({ lastCommand: command, error: message, executing: false })
      logger.error(`OCPP: Reboot failed - ${message}`)
      return false
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },
}))
