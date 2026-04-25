/**
 * OCPP Commands API - Charger control via Keycloak/BFF
 * Start, Stop, Disable, Enable, Unlock, Reboot
 */

import { bffClient } from './client'

export const ocppApi = {
  /**
   * Start charging on a connector
   */
  startCharge: (chargerId: string, connectorId: string, idTag?: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/start-charge`, {
      payload: {
        connector_id: connectorId,
        //idTag: idTag || undefined,
        idTag: idTag || "Zfv2w7T7s5LGzL5",
      },
    }),

  /**
   * Stop active charging session
   */
  stopCharge: (chargerId: string, transactionId: number) =>
    bffClient.post(`/bff/chargers/${chargerId}/stop-charge`, {
      payload: {
        transaction_id: transactionId,
      },
    }),

  /**
   * Disable charger (prevent new sessions)
   */
  disableCharger: (chargerId: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/disable`, {
      payload: {},
    }),

  /**
   * Enable charger (allow new sessions)
   */
  enableCharger: (chargerId: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/enable`, {
      payload: {},
    }),

  /**
   * Unlock connector (manual unlock)
   */
  unlockConnector: (chargerId: string, connectorId: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/unlock-connector`, {
      payload: {
        connector_id: connectorId,
      },
    }),

  /**
   * Reboot charger
   */
  rebootCharger: (chargerId: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/reboot`, {
      payload: {},
    }),

  /**
   * Get charger live status (power, connectors, sessions)
   */
  getLiveStatus: (chargerId: string) =>
    bffClient.post(`/bff/chargers/${chargerId}/live`, {
      payload: {},
    }),
}
