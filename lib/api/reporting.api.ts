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
   * GET /api/reports - List reports
   */
  list: (params?: { page?: number; pageSize?: number; type?: string; status?: string }) =>
    bffClient.get<ReportsListResponse>('/api/reports', { params }),

  /**
   * GET /api/reports/:id - Report detail
   */
  detail: (id: string) => bffClient.get<ReportDetailResponse>(`/api/reports/${id}`),

  /**
   * POST /api/reports/generate - Generate new report
   */
  generate: (payload: GenerateReportRequest) =>
    bffClient.post<ReportDetailResponse>('/api/reports/generate', payload),
};
