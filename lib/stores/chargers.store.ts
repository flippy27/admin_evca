/**
 * Chargers store — manages chargers list, detail, live data, history, config
 */

import { create } from 'zustand';
import { chargersApi } from '../api/chargers.api';
import { useAuthStore } from './auth.store';
import {
  Charger,
  ChargerLiveData,
  ChargerSession,
  OcppConfig,
} from '../types/charger.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface ChargersState {
  // Location filter
  selectedLocationId: string | null;

  // List state
  chargers: Charger[];
  chargersLoading: boolean;
  chargersError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;

  // Detail state
  selectedCharger: Charger | null;
  detailLoading: boolean;
  detailError: string | null;

  // Live data state
  liveData: ChargerLiveData | null;
  liveLoading: boolean;
  liveError: string | null;
  liveRefreshInterval: number;

  // History state
  sessions: ChargerSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;

  // Config state
  config: OcppConfig | null;
  configLoading: boolean;
  configError: string | null;

  // Actions
  setSelectedLocationId: (locationId: string | null) => void;
  fetchChargers: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  fetchChargerDetail: (id: string) => Promise<void>;
  fetchLiveData: (id: string) => Promise<void>;
  fetchHistory: (id: string, params?: any) => Promise<void>;
  fetchConfiguration: (id: string) => Promise<void>;
  updateConfiguration: (id: string, config: any) => Promise<void>;
  setLiveRefreshInterval: (interval: number) => void;
  clearError: (key: 'chargers' | 'detail' | 'live' | 'sessions' | 'config') => void;
}

export const useChargersStore = create<ChargersState>((set, get) => ({
  // Initial state
  selectedLocationId: null,

  chargers: [],
  chargersLoading: false,
  chargersError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,

  selectedCharger: null,
  detailLoading: false,
  detailError: null,

  liveData: null,
  liveLoading: false,
  liveError: null,
  liveRefreshInterval: 5000, // 5s default

  sessions: [],
  sessionsLoading: false,
  sessionsError: null,

  config: null,
  configLoading: false,
  configError: null,

  // ========== LOCATION FILTER ==========
  setSelectedLocationId: (locationId: string | null) => {
    set({ selectedLocationId: locationId });
  },

  // ========== CHARGERS LIST ==========
  fetchChargers: async (page = 1, pageSize = 20, filters = {}) => {
    set({ chargersLoading: true, chargersError: null });
    try {
      // Get companyExternalId from auth store (for API calls)
      const { user } = useAuthStore.getState();
      const companyId = user?.companyExternalId;

      const res = await chargersApi.list({
        page,
        pageSize,
        companyId,
        ...filters,
      });

      // Append to existing chargers if not first page, otherwise replace
      const chargersList = page === 1 ? res.data.payload : [...get().chargers, ...res.data.payload];

      set({
        chargers: chargersList,
        page,
        pageSize,
        totalPages: res.data.pagination?.total_pages || 1,
        chargersLoading: false,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        chargersError: apiError.message,
        chargersLoading: false,
      });
    }
  },

  // ========== CHARGER DETAIL ==========
  fetchChargerDetail: async (id: string) => {
    set({ detailLoading: true, detailError: null });
    try {
      const res = await chargersApi.detail(id);
      set({
        selectedCharger: res.data.data,
        detailLoading: false,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        detailError: apiError.message,
        detailLoading: false,
      });
    }
  },

  // ========== LIVE DATA ==========
  fetchLiveData: async (id: string) => {
    set({ liveLoading: true, liveError: null });
    try {
      const res = await chargersApi.live(id);
      set({
        liveData: res.data.data,
        liveLoading: false,
      });
      logger.debug(`Live data fetched: ${id}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        liveError: apiError.message,
        liveLoading: false,
      });
    }
  },

  // ========== HISTORY / SESSIONS ==========
  fetchHistory: async (id: string, params = {}) => {
    set({ sessionsLoading: true, sessionsError: null });
    try {
      const res = await chargersApi.history(id, params);
      set({
        sessions: res.data.data,
        sessionsLoading: false,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        sessionsError: apiError.message,
        sessionsLoading: false,
      });
    }
  },

  // ========== CONFIGURATION ==========
  fetchConfiguration: async (id: string) => {
    set({ configLoading: true, configError: null });
    try {
      const res = await chargersApi.getConfiguration(id);
      set({
        config: res.data.data,
        configLoading: false,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        configError: apiError.message,
        configLoading: false,
      });
    }
  },

  updateConfiguration: async (id: string, newConfig: any) => {
    set({ configLoading: true, configError: null });
    try {
      const res = await chargersApi.updateConfiguration(id, {
        variables: newConfig,
      });
      set({
        config: res.data.data,
        configLoading: false,
      });
    } catch (error) {
      const apiError = handleError(error);
      set({
        configError: apiError.message,
        configLoading: false,
      });
      throw error;
    }
  },

  // ========== UTILITIES ==========
  setLiveRefreshInterval: (interval: number) => {
    set({ liveRefreshInterval: interval });
  },

  clearError: (key: 'chargers' | 'detail' | 'live' | 'sessions' | 'config') => {
    const errorKey = {
      chargers: 'chargersError',
      detail: 'detailError',
      live: 'liveError',
      sessions: 'sessionsError',
      config: 'configError',
    }[key] as keyof ChargersState;

    set({ [errorKey]: null } as any);
  },
}));
