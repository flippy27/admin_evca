/**
 * Chargers store — global chargers state (Zustand)
 */

import { create } from 'zustand';
import { chargersApi, Charger, ChargingSession } from '../api/chargers.api';

interface ChargersState {
  chargers: Charger[];
  selectedChargerId: string | null;
  sessions: ChargingSession[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchChargers: () => Promise<void>;
  selectCharger: (id: string) => void;
  fetchSessions: (chargerId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useChargersStore = create<ChargersState>((set) => ({
  chargers: [],
  selectedChargerId: null,
  sessions: [],
  isLoading: false,
  error: null,

  fetchChargers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await chargersApi.list();
      set({ chargers: res.data.data, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch chargers';
      set({ error: errorMsg, isLoading: false });
    }
  },

  selectCharger: (id: string) => {
    set({ selectedChargerId: id });
  },

  fetchSessions: async (chargerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await chargersApi.getSessions(chargerId);
      set({ sessions: res.data.data, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch sessions';
      set({ error: errorMsg, isLoading: false });
    }
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
