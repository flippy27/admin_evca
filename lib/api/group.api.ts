/**
 * Group API — areas-grid per site
 * Endpoint: GET /bff/operations/sites/:siteId/areas-grid?company_id=:companyId
 */

import { bffClient } from './client';
import { GroupGridResponse } from '../types/group.types';

export const groupApi = {
  /**
   * GET /bff/operations/sites/:siteId/areas-grid
   * Returns site info, areas, and chargers with connector live state.
   * company_id comes from JWT (companyExternalId in user).
   */
  getGrid: (siteId: string, companyId: string) =>
    bffClient.get<GroupGridResponse>(
      `/bff/operations/sites/${siteId}/areas-grid?company_id=${companyId}`,
    ),
};
