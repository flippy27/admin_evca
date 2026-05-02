/**
 * Charger Panel API — real-time per-connector live data
 * Endpoint: GET /bff/operations/sites/:siteId/chargers/:chargerId/panel?company_id=:companyId
 */

import { bffClient } from './client';
import { ChargerPanelResponse } from '../types/charger-panel.types';

export const chargerPanelApi = {
  /**
   * Fetch real-time panel for a single charger.
   * Returns connector state, live SOC, power_kw, session info, and capabilities.
   * company_id comes from the JWT (companyExternalId in auth store).
   */
  getPanel: (siteId: string, chargerId: string, companyId: string) =>
    bffClient.get<ChargerPanelResponse>(
      `/bff/operations/sites/${siteId}/chargers/${chargerId}/panel?company_id=${companyId}`,
    ),
};
