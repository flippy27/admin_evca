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
   * GET /api/chargers - List with pagination + filters
   */
  list: (params?: {
    page?: number;
    pageSize?: number;
    siteId?: string;
    status?: string;
    search?: string;
  }) => bffClient.get<ChargersListResponse>('/api/chargers', { params }),

  /**
   * GET /api/chargers/:id - Detail
   */
  detail: (id: string) => bffClient.get<ChargerDetailResponse>(`/api/chargers/${id}`),

  /**
   * GET /api/chargers/:id/live - Real-time data
   */
  live: (id: string) => bffClient.get<ChargerLiveResponse>(`/api/chargers/${id}/live`),

  /**
   * GET /api/chargers/:id/history - Sessions + history
   */
  history: (id: string, params?: { startDate?: string; endDate?: string; page?: number }) =>
    bffClient.get<ChargerSessionsResponse>(`/api/chargers/${id}/history`, { params }),

  /**
   * GET /api/chargers/:id/configuration - OCPP config
   */
  getConfiguration: (id: string) =>
    bffClient.get<OcppConfigResponse>(`/api/chargers/${id}/configuration`),

  /**
   * POST /api/chargers/:id/configuration - Update OCPP config
   */
  updateConfiguration: (id: string, payload: UpdateOcppConfigRequest) =>
    bffClient.post<OcppConfigResponse>(`/api/chargers/${id}/configuration`, payload),

  /**
   * POST /api/chargers - Create
   */
  create: (payload: Partial<Charger>) => bffClient.post<ChargerDetailResponse>('/api/chargers', payload),

  /**
   * PUT /api/chargers/:id - Update
   */
  update: (id: string, payload: Partial<Charger>) =>
    bffClient.put<ChargerDetailResponse>(`/api/chargers/${id}`, payload),

  /**
   * DELETE /api/chargers/:id - Delete
   */
  delete: (id: string) => bffClient.delete(`/api/chargers/${id}`),
};
