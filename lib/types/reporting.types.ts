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
  payload: any[];
  pagination?: {
    current_page?: number;
    page?: number;
    per_page?: string | number;
    pageSize?: number;
    total_items?: number;
    totalItems?: number;
    total_pages?: number;
    totalPages?: number;
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
