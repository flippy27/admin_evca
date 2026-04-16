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
    // Transform params to match backend API format
    const apiParams: Record<string, any> = {
      page: params?.page || 1,
      size: params?.pageSize || 20,
    };

    if (params?.siteId) {
      // Convert siteId to location_ids (can be array or single value)
      apiParams.location_ids = Array.isArray(params.siteId) ? params.siteId : [params.siteId];
    }

    if (params?.type) {
      apiParams.type = params.type;
    }

    if (params?.status) {
      apiParams.status = params.status;
    }

    return bffClient.get<EnergyResourcesListResponse>('/bff/energy-resources', { params: apiParams });
  },

  /**
   * GET /bff/energy-resources/:id - Energy resource detail
   */
  detail: (id: string) =>
    bffClient.get<EnergyResourceDetailResponse>(`/bff/energy-resources/${id}`),
};
