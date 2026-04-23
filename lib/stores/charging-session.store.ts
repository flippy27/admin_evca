/**
 * Charging Sessions store — manages sessions list with filters
 */

import { create } from 'zustand';
import { chargingSessionApi } from '../api/charging-session.api';
import { ChargingSession, SessionsRequest } from '../types/charging-session.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';
import { useAuthStore } from './auth.store';

interface ChargingSessionsState {
  // List state
  sessions: ChargingSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;

  // Actions
  fetchSessions: (request: SessionsRequest) => Promise<void>;
  clearError: () => void;
}

export const useChargingSessionsStore = create<ChargingSessionsState>((set, get) => ({
  // Initial state
  sessions: [],
  sessionsLoading: false,
  sessionsError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,
  total: 0,

  // Fetch sessions
  fetchSessions: async (request: SessionsRequest) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      // Build request with defaults
      const fullRequest: SessionsRequest = {
        pagination: {
          page: 1,
          per_page: 20,
          ...request.pagination,
        },
        payload: {
          ...request.payload,
        },
      };

      const res = await chargingSessionApi.list(fullRequest);

      // Append to existing sessions if not first page, otherwise replace
      const currentPage = request.pagination?.page || 1;
      const sessionsList = currentPage === 1 ? res.data.payload : [...get().sessions, ...res.data.payload];

      set({
        sessions: sessionsList,
        page: currentPage,
        pageSize: request.pagination?.per_page || 20,
        totalPages: res.data.pagination?.total_pages || 1,
        total: res.data.pagination?.total_items || res.data.pagination?.total || 0,
        sessionsLoading: false,
      });

      logger.info('Sessions loaded', {
        count: res.data.payload?.length,
        total: res.data.pagination?.total,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        sessionsError: apiError.message,
        sessionsLoading: false,
      });
      logger.error('Fetch sessions error:', {
        error: apiError.message,
      });
    }
  },

  // Clear error
  clearError: () => {
    set({ sessionsError: null });
  },
}));
