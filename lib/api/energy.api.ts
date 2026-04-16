/**
 * Energy Resources API endpoints
 */

import { bffClient } from './client';
import {
  EnergyResource,
  EnergyResourcesListResponse,
  EnergyResourceDetailResponse,
} from '../types/energy.types';

export const energyApi = {
  /**
   * GET /bff/energy-resources - List energy resources
   * Maps pageSize -> size, siteId -> location_ids
   */
  list: async (params?: {
    page?: number;
    pageSize?: number;
    siteId?: string | string[];
    type?: string;
    status?: string;
  }) => {
    // Build query string with comma-separated location_ids
    const queryParts: string[] = [];

    queryParts.push(`page=${params?.page || 1}`);
    queryParts.push(`size=${params?.pageSize || 20}`);

    // Add location_ids as comma-separated values
    if (params?.siteId && (Array.isArray(params.siteId) ? params.siteId.length > 0 : params.siteId)) {
      const locationIds = Array.isArray(params.siteId) ? params.siteId : [params.siteId];
      queryParts.push(`location_ids=${locationIds.join(',')}`);
    }

    if (params?.type) {
      queryParts.push(`type=${params.type}`);
    }

    if (params?.status) {
      queryParts.push(`status=${params.status}`);
    }

    const queryString = queryParts.join('&');
    const url = `/bff/energy-resources?${queryString}`;

    return bffClient.get<EnergyResourcesListResponse>(url);
  },

  /**
   * GET /bff/energy-resources/:id - Energy resource detail
   */
  detail: (id: string) =>
    bffClient.get<EnergyResourceDetailResponse>(`/bff/energy-resources/${id}`),
};
