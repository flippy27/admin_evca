/**
 * Energy Resources store — manages energy resources list and detail
 */

import { create } from 'zustand';
import { energyApi } from '../api/energy.api';
import { EnergyResource } from '../types/energy.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface EnergyState {
  // List state
  resources: EnergyResource[];
  resourcesLoading: boolean;
  resourcesError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;

  // Detail state
  selectedResource: EnergyResource | null;
  detailLoading: boolean;
  detailError: string | null;

  // Actions
  fetchResources: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  fetchResourceDetail: (id: string) => Promise<void>;
  clearError: (key: 'resources' | 'detail') => void;
}

export const useEnergyStore = create<EnergyState>((set, get) => ({
  // Initial state
  resources: [],
  resourcesLoading: false,
  resourcesError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,

  selectedResource: null,
  detailLoading: false,
  detailError: null,

  // Fetch resources
  fetchResources: async (page = 1, pageSize = 20, filters = {}) => {
    set({ resourcesLoading: true, resourcesError: null });
    try {
      const res = await energyApi.list({
        page,
        pageSize,
        ...filters,
      });

      // Append to existing resources if not first page, otherwise replace
      const resourcesList = page === 1 ? res.data.payload : [...get().resources, ...res.data.payload];

      set({
        resources: resourcesList,
        page,
        pageSize,
        totalPages: res.data.pagination?.total_pages || 1,
        resourcesLoading: false,
      });

      logger.info('Energy resources fetched', { count: res.data.payload?.length || 0 });
    } catch (error) {
      const apiError = handleError(error);
      set({
        resourcesError: apiError.message,
        resourcesLoading: false,
      });
    }
  },

  // Fetch resource detail
  fetchResourceDetail: async (id: string) => {
    set({ detailLoading: true, detailError: null });
    try {
      const res = await energyApi.detail(id);
      set({
        selectedResource: res.data.data,
        detailLoading: false,
      });
      logger.info(`Energy resource detail fetched: ${id}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        detailError: apiError.message,
        detailLoading: false,
      });
    }
  },

  // Clear errors
  clearError: (key: 'resources' | 'detail') => {
    const errorMap = {
      resources: 'resourcesError',
      detail: 'detailError',
    };
    const errorKey = errorMap[key] as keyof EnergyState;
    set({ [errorKey]: null } as any);
  },
}));
