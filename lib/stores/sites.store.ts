/**
 * Sites store — manages sites list + detail
 */

import { create } from 'zustand';
import { sitesApi } from '../api/sites.api';
import { useAuthStore } from './auth.store';
import { Site, SiteDetail } from '../types/site.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface SitesState {
  // List state
  sites: Site[];
  sitesLoading: boolean;
  sitesError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;

  // Detail state
  selectedSite: SiteDetail | null;
  detailLoading: boolean;
  detailError: string | null;

  // Actions
  fetchSites: (page?: number, pageSize?: number, filters?: any) => Promise<void>;
  fetchSiteDetail: (id: string) => Promise<void>;
  clearError: (key: 'sites' | 'detail') => void;
}

export const useSitesStore = create<SitesState>((set, get) => ({
  // Initial state
  sites: [],
  sitesLoading: false,
  sitesError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,

  selectedSite: null,
  detailLoading: false,
  detailError: null,

  // Fetch sites list
  fetchSites: async (page = 1, pageSize = 20, filters = {}) => {
    set({ sitesLoading: true, sitesError: null });
    try {
      // Get companyId from auth store
      const { user } = useAuthStore.getState();
      const companyId = user?.companyId;

      const res = await sitesApi.list({
        page,
        pageSize,
        companyId,
        ...filters,
      });

      // Append to existing sites if not first page, otherwise replace
      const sitesList = page === 1 ? res.data.payload : [...get().sites, ...res.data.payload];

      set({
        sites: sitesList,
        page,
        pageSize,
        totalPages: res.data.pagination?.total_pages || 1,
        sitesLoading: false,
      });

      logger.info('Sites fetched', { count: res.data.payload?.length || 0 });
    } catch (error) {
      const apiError = handleError(error);
      set({
        sitesError: apiError.message,
        sitesLoading: false,
      });
    }
  },

  // Fetch site detail
  fetchSiteDetail: async (id: string) => {
    set({ detailLoading: true, detailError: null });
    try {
      const res = await sitesApi.detail(id);
      set({
        selectedSite: res.data.data,
        detailLoading: false,
      });
      logger.info(`Site detail fetched: ${id}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        detailError: apiError.message,
        detailLoading: false,
      });
    }
  },

  // Clear errors
  clearError: (key: 'sites' | 'detail') => {
    const errorKey = {
      sites: 'sitesError',
      detail: 'detailError',
    }[key] as keyof SitesState;

    set({ [errorKey]: null } as any);
  },
}));
