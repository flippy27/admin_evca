/**
 * Credentials domain types
 */

export interface Credential {
  id: string;
  name: string;
  type: 'api_key' | 'token' | 'other';
  createdAt: string;
  lastUsedAt?: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface CredentialsListResponse {
  data: Credential[];
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateCredentialRequest {
  name: string;
  type: 'api_key' | 'token' | 'other';
  expiresIn?: number; // days
}

export interface CreateCredentialResponse {
  data: Credential & { secret?: string }; // secret only returned on creation
}
