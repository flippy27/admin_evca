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

export interface RampBody {
  direction: 'up' | 'down';
  step_kw?: number;
  preset_seconds?: number;
}

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

  /**
   * POST /bff/operations/sites/:siteId/chargers/:chargerId/connectors/:connectorId/ramp
   * direction: "up" increases power, "down" decreases power
   * step_kw: power step in kW (optional, backend default)
   * preset_seconds: tecle duration in seconds 1–120 (optional)
   */
  ramp: (
    siteId: string,
    chargerId: string,
    connectorId: string,
    body: RampBody,
  ) =>
    bffClient.post<CommandResponse>(
      `/bff/operations/sites/${siteId}/chargers/${chargerId}/connectors/${connectorId}/ramp`,
      { ...cmdMeta(), ...body },
    ),
};
