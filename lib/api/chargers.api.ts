/**
 * Chargers API endpoints
 * Full implementation: list, detail, live, history, configuration
 */

import { bffClient } from './client';
import {
  Charger,
  Connector,
  ChargersListResponse,
  ChargerDetailResponse,
  ChargerLiveResponse,
  ChargerSessionsResponse,
  OcppConfigResponse,
  UpdateOcppConfigRequest,
} from '../types/charger.types';

// Re-export types for backward compatibility
export { Charger, Connector, ChargerSession } from '../types/charger.types';

/**
 * Map raw API charger data to Charger type
 */
function mapChargerFromApi(rawCharger: any): Charger {
  const status = (rawCharger.charger_status || 'offline').toLowerCase() as any;
  const statusMap: Record<string, 'available' | 'charging' | 'faulted' | 'offline'> = {
    'offline': 'offline',
    'online': 'available',
    'available': 'available',
    'occupied': 'charging',
    'charging': 'charging',
    'faulted': 'faulted',
    'error': 'faulted',
  };

  return {
    id: String(rawCharger.charger_ID),
    name: rawCharger.charger_name || 'N/A',
    status: statusMap[status] || 'offline',
    siteId: String(rawCharger.location_id || ''),
    siteName: rawCharger.charger_site_name,
    power: parseFloat(rawCharger.charger_total_max_power_kw || '0'),
    connectors: (rawCharger.charger_connectors_summary || []).map((conn: any) => ({
      id: String(conn.connector_id),
      connectorId: conn.connector_id,
      status: (conn.status || 'unavailable').toLowerCase() as any,
      type: conn.type,
    })),
    model: rawCharger.charger_model,
    serialNumber: rawCharger.ocpp_id,
  };
}

export const chargersApi = {
  /**
   * GET /bff/chargers - List with pagination + filters
   * Maps pageSize -> size, siteId -> location_ids (as repeated params)
   */
  list: async (params?: {
    page?: number;
    pageSize?: number;
    siteId?: string | string[];
    companyId?: string;
    status?: string;
    search?: string;
  }) => {
    // Build query string with comma-separated location_ids
    const queryParts: string[] = [];

    queryParts.push(`page=${params?.page || 1}`);
    queryParts.push(`size=${params?.pageSize || 20}`);

    // Add company_id if provided
    if (params?.companyId) {
      queryParts.push(`company_id=${params.companyId}`);
    }

    // Add location_ids as comma-separated values
    if (params?.siteId && (Array.isArray(params.siteId) ? params.siteId.length > 0 : params.siteId)) {
      const locationIds = Array.isArray(params.siteId) ? params.siteId : [params.siteId];
      queryParts.push(`location_ids=${locationIds.join(',')}`);
    }

    if (params?.status) {
      queryParts.push(`status=${params.status}`);
    }

    if (params?.search) {
      queryParts.push(`search=${encodeURIComponent(params.search)}`);
    }

    const queryString = queryParts.join('&');
    const url = `/bff/chargers?${queryString}`;

    const response = await bffClient.get<ChargersListResponse>(url);
    return {
      ...response,
      data: {
        ...response.data,
        payload: response.data.payload?.map(mapChargerFromApi) || [],
      },
    };
  },

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
