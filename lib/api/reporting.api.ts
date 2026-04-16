/**
 * Reporting API endpoints
 */

import { bffClient } from './client';
import {
  Report,
  ReportsListResponse,
  ReportDetailResponse,
  GenerateReportRequest,
} from '../types/reporting.types';

export const reportingApi = {
  /**
   * GET /bff/reports - List reports
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
    const url = `/bff/reports?${queryString}`;

    return bffClient.get<ReportsListResponse>(url);
  },

  /**
   * GET /bff/reports/:id - Report detail
   */
  detail: (id: string) => bffClient.get<ReportDetailResponse>(`/bff/reports/${id}`),

  /**
   * POST /bff/reports/generate - Generate new report
   */
  generate: (payload: GenerateReportRequest) =>
    bffClient.post<ReportDetailResponse>('/bff/reports/generate', payload),
};
