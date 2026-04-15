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
   * GET /api/energy-resources - List energy resources
   */
  list: (params?: { page?: number; pageSize?: number; type?: string; status?: string }) =>
    bffClient.get<EnergyResourcesListResponse>('/api/energy-resources', { params }),

  /**
   * GET /api/energy-resources/:id - Energy resource detail
   */
  detail: (id: string) =>
    bffClient.get<EnergyResourceDetailResponse>(`/api/energy-resources/${id}`),
};
