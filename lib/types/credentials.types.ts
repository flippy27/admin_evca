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
  payload: any[];
  pagination?: {
    current_page?: number;
    page?: number;
    per_page?: string | number;
    pageSize?: number;
    total_items?: number;
    totalItems?: number;
    total_pages?: number;
    totalPages?: number;
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
