/**
 * Chargers API endpoints
 * Full implementation: list, detail, live, history, configuration
 */

import { bffClient } from './client';
import {
  Charger,
  ChargersListResponse,
  ChargerDetailResponse,
  ChargerLiveResponse,
  ChargerSessionsResponse,
  OcppConfigResponse,
  UpdateOcppConfigRequest,
} from '../types/charger.types';

// Re-export types for backward compatibility
export { Charger, Connector, ChargerSession } from '../types/charger.types';

export const chargersApi = {
  /**
   * GET /bff/chargers - List with pagination + filters
   */
  list: (params?: {
    page?: number;
    pageSize?: number;
    siteId?: string;
    status?: string;
    search?: string;
  }) => bffClient.get<ChargersListResponse>('/bff/chargers', { params }),

  /**
   * GET /bff/chargers/:id - Detail
   */
  detail: (id: string) => bffClient.get<ChargerDetailResponse>(`/bff/chargers/${id}`),

  /**
   * GET /bff/chargers/:id/live - Real-time data
   */
  live: (id: string) => bffClient.get<ChargerLiveResponse>(`/bff/chargers/${id}/live`),

  /**
   * GET /bff/chargers/:id/history - Sessions + history
   */
  history: (id: string, params?: { startDate?: string; endDate?: string; page?: number }) =>
    bffClient.get<ChargerSessionsResponse>(`/bff/chargers/${id}/history`, { params }),

  /**
   * GET /bff/chargers/:id/configuration - OCPP config
   */
  getConfiguration: (id: string) =>
    bffClient.get<OcppConfigResponse>(`/bff/chargers/${id}/configuration`),

  /**
   * POST /bff/chargers/:id/configuration - Update OCPP config
   */
  updateConfiguration: (id: string, payload: UpdateOcppConfigRequest) =>
    bffClient.post<OcppConfigResponse>(`/bff/chargers/${id}/configuration`, payload),

  /**
   * POST /bff/chargers - Create
   */
  create: (payload: Partial<Charger>) => bffClient.post<ChargerDetailResponse>('/bff/chargers', payload),

  /**
   * PUT /bff/chargers/:id - Update
   */
  update: (id: string, payload: Partial<Charger>) =>
    bffClient.put<ChargerDetailResponse>(`/bff/chargers/${id}`, payload),

  /**
   * DELETE /bff/chargers/:id - Delete
   */
  delete: (id: string) => bffClient.delete(`/bff/chargers/${id}`),
};
