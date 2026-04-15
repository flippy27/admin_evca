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
   */
  list: (params?: { page?: number; pageSize?: number; type?: string; status?: string }) =>
    bffClient.get<ReportsListResponse>('/bff/reports', { params }),

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
