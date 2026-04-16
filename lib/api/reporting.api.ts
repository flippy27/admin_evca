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

    return bffClient.get<ReportsListResponse>('/bff/reports', { params: apiParams });
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
