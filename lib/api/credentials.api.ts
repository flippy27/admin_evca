/**
 * Credentials API endpoints
 */

import { bffClient } from './client';
import {
  Credential,
  CredentialsListResponse,
  CreateCredentialRequest,
  CreateCredentialResponse,
} from '../types/credentials.types';

export const credentialsApi = {
  /**
   * GET /api/credentials - List credentials
   */
  list: (params?: { page?: number; pageSize?: number }) =>
    bffClient.get<CredentialsListResponse>('/api/credentials', { params }),

  /**
   * POST /api/credentials - Create credential
   */
  create: (payload: CreateCredentialRequest) =>
    bffClient.post<CreateCredentialResponse>('/api/credentials', payload),

  /**
   * DELETE /api/credentials/:id - Revoke credential
   */
  revoke: (id: string) =>
    bffClient.delete(`/api/credentials/${id}`),
};
