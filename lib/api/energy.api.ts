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
   */
  list: (params?: { page?: number; pageSize?: number; type?: string; status?: string }) =>
    bffClient.get<EnergyResourcesListResponse>('/bff/energy-resources', { params }),

  /**
   * GET /bff/energy-resources/:id - Energy resource detail
   */
  detail: (id: string) =>
    bffClient.get<EnergyResourceDetailResponse>(`/bff/energy-resources/${id}`),
};
