/**
 * Global store for in-flight charger commands.
 * Survives component unmount/remount so users can't re-fire a command
 * just by navigating away and back.
 *
 * Keys: `${chargerId}-${connectorKey}` e.g. "42-start-1", "42-reboot"
 * Auto-expires after EXPIRY_MS (covers the 30 s axios timeout + buffer).
 */

import { create } from 'zustand';

const EXPIRY_MS = 35_000;

interface PendingEntry {
  command: string;
  sentAt: number;
}

interface ChargerCommandsStoreState {
  pending: Record<string, PendingEntry>;
  setPending: (key: string, command: string) => void;
  clearPending: (key: string) => void;
  isPending: (key: string) => boolean;
  clearExpired: () => void;
}

export const useChargerCommandsStore = create<ChargerCommandsStoreState>(
  (set, get) => ({
    pending: {},

    setPending: (key, command) => {
      get().clearExpired();
      set((s) => ({
        pending: { ...s.pending, [key]: { command, sentAt: Date.now() } },
      }));
    },

    clearPending: (key) =>
      set((s) => {
        const next = { ...s.pending };
        delete next[key];
        return { pending: next };
      }),

    isPending: (key) => {
      const entry = get().pending[key];
      if (!entry) return false;
      if (Date.now() - entry.sentAt > EXPIRY_MS) {
        get().clearPending(key);
        return false;
      }
      return true;
    },

    clearExpired: () =>
      set((s) => {
        const now = Date.now();
        const next: Record<string, PendingEntry> = {};
        for (const [k, v] of Object.entries(s.pending)) {
          if (now - v.sentAt <= EXPIRY_MS) next[k] = v;
        }
        return { pending: next };
      }),
  }),
);
