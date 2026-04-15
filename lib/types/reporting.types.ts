/**
 * Reporting domain types
 */

export interface Report {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt?: string;
  generatedAt?: string;
}

export interface ReportsListResponse {
  data: Report[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ReportDetailResponse {
  data: Report;
}

export interface GenerateReportRequest {
  type: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  filters?: Record<string, any>;
}
