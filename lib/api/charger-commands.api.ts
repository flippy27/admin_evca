/**
 * Charger Commands API — OCPP remote operations
 * Base: /bff/operations/sites/:siteId/chargers/:chargerId/...
 */

import { bffClient } from './client';

export interface CommandResponse {
  meta: {
    request_id: string;
    ts: string;
  };
  result: {
    status: 'accepted' | 'rejected';
    message: string;
  };
}

type ConnectorCommand = 'start' | 'stop' | 'unlock' | 'enable' | 'disable' | 'availability';

function cmdMeta() {
  return {
    meta: {
      request_id: `cmd-${Date.now()}`,
      ts: new Date().toISOString(),
    },
  };
}

export const chargerCommandsApi = {
  /**
   * POST /bff/operations/sites/:siteId/chargers/:chargerId/connectors/:connectorId/:command
   */
  connectorCommand: (
    siteId: string,
    chargerId: string,
    connectorId: string,
    command: ConnectorCommand,
  ) =>
    bffClient.post<CommandResponse>(
      `/bff/operations/sites/${siteId}/chargers/${chargerId}/connectors/${connectorId}/${command}`,
      cmdMeta(),
    ),

  /**
   * POST /bff/operations/sites/:siteId/chargers/:chargerId/reboot
   */
  reboot: (siteId: string, chargerId: string) =>
    bffClient.post<CommandResponse>(
      `/bff/operations/sites/${siteId}/chargers/${chargerId}/reboot`,
      cmdMeta(),
    ),
};
