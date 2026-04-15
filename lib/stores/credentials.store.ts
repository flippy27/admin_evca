/**
 * Credentials store — manages API credentials
 */

import { create } from 'zustand';
import { credentialsApi } from '../api/credentials.api';
import { Credential, CreateCredentialRequest } from '../types/credentials.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface CredentialsState {
  // List state
  credentials: Credential[];
  credentialsLoading: boolean;
  credentialsError: string | null;
  page: number;
  pageSize: number;
  totalPages: number;

  // Create state
  createLoading: boolean;
  createError: string | null;
  createdCredential: (Credential & { secret?: string }) | null;

  // Revoke state
  revokeLoading: boolean;
  revokeError: string | null;

  // Actions
  fetchCredentials: (page?: number, pageSize?: number) => Promise<void>;
  createCredential: (payload: CreateCredentialRequest) => Promise<void>;
  revokeCredential: (id: string) => Promise<void>;
  clearError: (key: 'credentials' | 'create' | 'revoke') => void;
}

export const useCredentialsStore = create<CredentialsState>((set, get) => ({
  // Initial state
  credentials: [],
  credentialsLoading: false,
  credentialsError: null,
  page: 1,
  pageSize: 20,
  totalPages: 1,

  createLoading: false,
  createError: null,
  createdCredential: null,

  revokeLoading: false,
  revokeError: null,

  // Fetch credentials
  fetchCredentials: async (page = 1, pageSize = 20) => {
    set({ credentialsLoading: true, credentialsError: null });
    try {
      const res = await credentialsApi.list({ page, pageSize });

      set({
        credentials: res.data.data,
        page,
        pageSize,
        totalPages: res.data.pagination?.totalPages || 1,
        credentialsLoading: false,
      });

      logger.info('Credentials fetched', { count: res.data.data.length });
    } catch (error) {
      const apiError = handleError(error);
      set({
        credentialsError: apiError.message,
        credentialsLoading: false,
      });
    }
  },

  // Create credential
  createCredential: async (payload: CreateCredentialRequest) => {
    set({ createLoading: true, createError: null });
    try {
      const res = await credentialsApi.create(payload);

      set((state) => ({
        credentials: [...state.credentials, res.data.data],
        createLoading: false,
        createdCredential: res.data.data,
      }));

      logger.info('Credential created', { name: payload.name });
    } catch (error) {
      const apiError = handleError(error);
      set({
        createError: apiError.message,
        createLoading: false,
      });
      throw apiError;
    }
  },

  // Revoke credential
  revokeCredential: async (id: string) => {
    set({ revokeLoading: true, revokeError: null });
    try {
      await credentialsApi.revoke(id);

      set((state) => ({
        credentials: state.credentials.filter((c) => c.id !== id),
        revokeLoading: false,
      }));

      logger.info(`Credential revoked: ${id}`);
    } catch (error) {
      const apiError = handleError(error);
      set({
        revokeError: apiError.message,
        revokeLoading: false,
      });
      throw apiError;
    }
  },

  // Clear errors
  clearError: (key: 'credentials' | 'create' | 'revoke') => {
    const errorMap = {
      credentials: 'credentialsError',
      create: 'createError',
      revoke: 'revokeError',
    };
    const errorKey = errorMap[key] as keyof CredentialsState;
    set({ [errorKey]: null } as any);
  },
}));
