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
   * GET /bff/credentials - List credentials
   */
  list: (params?: { page?: number; pageSize?: number }) =>
    bffClient.get<CredentialsListResponse>('/bff/credentials', { params }),

  /**
   * POST /bff/credentials - Create credential
   */
  create: (payload: CreateCredentialRequest) =>
    bffClient.post<CreateCredentialResponse>('/bff/credentials', payload),

  /**
   * DELETE /bff/credentials/:id - Revoke credential
   */
  revoke: (id: string) =>
    bffClient.delete(`/bff/credentials/${id}`),
};
