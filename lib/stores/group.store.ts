/**
 * Group store — areas-grid state per site
 */

import { create } from 'zustand';
import { groupApi } from '../api/group.api';
import { useAuthStore } from './auth.store';
import { GroupData, GroupMeta } from '../types/group.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface GroupState {
  // Data
  groupData: GroupData | null;
  groupMeta: GroupMeta | null;
  groupLoading: boolean;
  groupError: string | null;

  // Current site context
  currentSiteId: string | null;

  // Actions
  fetchGroup: (siteId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useGroupStore = create<GroupState>((set) => ({
  groupData: null,
  groupMeta: null,
  groupLoading: false,
  groupError: null,
  currentSiteId: null,

  fetchGroup: async (siteId: string) => {
    set({ groupLoading: true, groupError: null, currentSiteId: siteId });
    try {
      const { user } = useAuthStore.getState();
      const companyId = user?.companyExternalId;

      if (!companyId) {
        throw new Error('No company ID available');
      }

      const res = await groupApi.getGrid(siteId, companyId);

      set({
        groupData: res.data.data,
        groupMeta: res.data.meta,
        groupLoading: false,
      });

      logger.info(`Group grid fetched: site ${siteId}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        groupError: apiError.message,
        groupLoading: false,
      });
    }
  },

  clearError: () => set({ groupError: null }),

  reset: () =>
    set({
      groupData: null,
      groupMeta: null,
      groupLoading: false,
      groupError: null,
      currentSiteId: null,
    }),
}));
