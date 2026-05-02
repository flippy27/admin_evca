/**
 * Charger Panel store — real-time per-connector live data
 * Keyed by charger_id for O(1) lookup in views.
 * All fetches are "silent" (fire-and-forget enrichment, never block the UI).
 */

import { create } from 'zustand';
import { chargerPanelApi } from '../api/charger-panel.api';
import { ChargerPanel } from '../types/charger-panel.types';
import { GroupData } from '../types/group.types';
import { useAuthStore } from './auth.store';
import { logger } from '../services/logger';

interface ChargerPanelState {
  /** Real-time panel data, keyed by charger_id string */
  panels: Record<string, ChargerPanel>;

  /** Fetch live panel for a single charger — silent on error */
  fetchPanel: (siteId: string, chargerId: string) => Promise<void>;

  /** Fire fetchPanel for every charger in the current group (no-await, concurrent) */
  fetchPanelsForGroup: (siteId: string, chargerIds: string[]) => void;

  /** Clear all panel data (call on location change) */
  clearPanels: () => void;
}

export const useChargerPanelStore = create<ChargerPanelState>((set) => ({
  panels: {},

  fetchPanel: async (siteId: string, chargerId: string) => {
    const companyId = useAuthStore.getState().user?.companyExternalId;
    if (!companyId) return;

    try {
      const res = await chargerPanelApi.getPanel(siteId, chargerId, companyId);
      set((state) => ({
        panels: { ...state.panels, [chargerId]: res.data.payload },
      }));
    } catch (error) {
      // Panel data is enrichment-only — log but never surface errors to UI
      logger.warn(`[ChargerPanel] fetch failed charger=${chargerId}`, error);
    }
  },

  fetchPanelsForGroup: (siteId: string, chargerIds: string[]) => {
    const { fetchPanel } = useChargerPanelStore.getState();
    chargerIds.forEach((id) => fetchPanel(siteId, id));
  },

  clearPanels: () => set({ panels: {} }),
}));

// ─── Shared utilities ──────────────────────────────────────────────────────────

/**
 * Extract all charger IDs from a GroupData object.
 * Handles both area-based and flat charger lists.
 */
export function getAllChargerIdsFromGroup(data: GroupData): string[] {
  if (data.areas.length > 0) {
    return data.areas.flatMap((area) =>
      (area.lines ?? []).flatMap((line) =>
        line.chargers.map((c) => String(c.charger_ID))
      )
    );
  }
  return data.chargers.map((c) => String(c.charger_ID));
}

/**
 * Parse power_kw from the panel response.
 * Handles European decimal notation ("3,67") and regular floats.
 * Returns undefined for null / unparseable values.
 */
export function parsePanelPowerKw(value: string | null | undefined): number | undefined {
  if (value == null) return undefined;
  const n = parseFloat(String(value).replace(',', '.'));
  return isNaN(n) ? undefined : n;
}
