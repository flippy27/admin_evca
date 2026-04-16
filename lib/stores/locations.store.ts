/**
 * Locations Store
 * Manages available locations and selected filters
 */

import { create } from 'zustand';
import { locationsApi, LocationData } from '../api/locations.api';
import { logger } from '../services/logger';

interface LocationsState {
  // Available locations
  locations: LocationData[];
  locationsLoading: boolean;
  locationsError: string | null;

  // Selected location IDs for filtering
  selectedLocationIds: string[];

  // Methods
  fetchLocations: (userId: string, companyId: string) => Promise<void>;
  setSelectedLocationIds: (ids: string[]) => void;
  toggleLocation: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  clearError: (field?: string) => void;
}

export const useLocationsStore = create<LocationsState>((set, get) => ({
  locations: [],
  locationsLoading: false,
  locationsError: null,
  selectedLocationIds: [],

  fetchLocations: async (userId: string, companyId: string) => {
    logger.info('Fetching locations - START', {
      userId,
      companyId,
      endpoint: `/bff/users/${userId}/locations?companyId=${companyId}&enabled=true`,
    });

    set({ locationsLoading: true, locationsError: null });
    try {
      const response = await locationsApi.getUserLocations(userId, companyId);
      const locations = response.data.payload || [];

      logger.info('Locations response received', {
        count: locations.length,
        locations: locations.map((loc) => ({ id: loc.id, name: loc.name })),
      });

      set({
        locations,
        locationsLoading: false,
      });

      // Auto-select all locations on first fetch
      if (locations.length > 0 && get().selectedLocationIds.length === 0) {
        const allIds = locations.map((loc) => loc.id);
        logger.info('Auto-selecting all locations', {
          selectedIds: allIds,
        });

        set({
          selectedLocationIds: allIds,
        });
      }

      logger.info('Locations fetched - COMPLETE', { count: locations.length });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch locations';
      set({
        locationsError: message,
        locationsLoading: false,
      });
      logger.error('Fetch locations error:', {
        userId,
        companyId,
        error: message,
      });
    }
  },

  setSelectedLocationIds: (ids: string[]) => {
    set({ selectedLocationIds: ids });
  },

  toggleLocation: (id: string) => {
    const current = get().selectedLocationIds;
    const updated = current.includes(id)
      ? current.filter((locId) => locId !== id)
      : [...current, id];
    set({ selectedLocationIds: updated });
  },

  selectAll: () => {
    const allIds = get().locations.map((loc) => loc.id);
    set({ selectedLocationIds: allIds });
  },

  clearSelection: () => {
    set({ selectedLocationIds: [] });
  },

  clearError: (field?: string) => {
    if (!field || field === 'locations') {
      set({ locationsError: null });
    }
  },
}));
