/**
 * Reporting store — manages reports list and detail
 */

import { create } from 'zustand';
import { reportingApi } from '../api/reporting.api';
import { Report } from '../types/reporting.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface ReportingState {
  // List state
  reports: Report[];
  reportsLoading: boolean;
  reportsError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;

  // Detail state
  selectedReport: Report | null;
  detailLoading: boolean;
  detailError: string | null;

  // Generate state
  generateLoading: boolean;
  generateError: string | null;

  // Actions
  fetchReports: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  fetchReportDetail: (id: string) => Promise<void>;
  generateReport: (type: string, dateRange?: { startDate: string; endDate: string }) => Promise<void>;
  clearError: (key: 'reports' | 'detail' | 'generate') => void;
}

export const useReportingStore = create<ReportingState>((set, get) => ({
  // Initial state
  reports: [],
  reportsLoading: false,
  reportsError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,

  selectedReport: null,
  detailLoading: false,
  detailError: null,

  generateLoading: false,
  generateError: null,

  // Fetch reports list
  fetchReports: async (page = 1, pageSize = 20, filters = {}) => {
    set({ reportsLoading: true, reportsError: null });
    try {
      const res = await reportingApi.list({
        page,
        pageSize,
        ...filters,
      });

      set({
        reports: res.data.data,
        page,
        pageSize,
        totalPages: res.data.pagination?.totalPages || 1,
        reportsLoading: false,
      });

      logger.info('Reports fetched', { count: res.data.data.length });
    } catch (error) {
      const apiError = handleError(error);
      set({
        reportsError: apiError.message,
        reportsLoading: false,
      });
    }
  },

  // Fetch report detail
  fetchReportDetail: async (id: string) => {
    set({ detailLoading: true, detailError: null });
    try {
      const res = await reportingApi.detail(id);
      set({
        selectedReport: res.data.data,
        detailLoading: false,
      });
      logger.info(`Report detail fetched: ${id}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        detailError: apiError.message,
        detailLoading: false,
      });
    }
  },

  // Generate report
  generateReport: async (type: string, dateRange?: { startDate: string; endDate: string }) => {
    set({ generateLoading: true, generateError: null });
    try {
      const res = await reportingApi.generate({
        type,
        dateRange,
      });

      set({
        selectedReport: res.data.data,
        generateLoading: false,
      });
      logger.info(`Report generated: ${type}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        generateError: apiError.message,
        generateLoading: false,
      });
      throw apiError;
    }
  },

  // Clear errors
  clearError: (key: 'reports' | 'detail' | 'generate') => {
    const errorMap = {
      reports: 'reportsError',
      detail: 'detailError',
      generate: 'generateError',
    };
    const errorKey = errorMap[key] as keyof ReportingState;
    set({ [errorKey]: null } as any);
  },
}));
