/**
 * Auth types — ported from ui-emobility-web/src/app/features/authentication/models/
 */

// ============ GENERAL ============
export type SessionState = 'idle' | 'restoring' | 'authenticated' | 'unauthenticated' | 'failed';

// ============ LOGIN ============
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface BffLoginData {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  scope: string;
  userId?: string;
  userExternalId?: string;
  companyId?: string;
  companyExternalId?: string;
}

export interface BffLoginPayload {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: BffLoginData;
}

export interface BffMeta {
  success: boolean;
  operation: string;
  execution_time_ms: number;
  correlation_id: string;
  microservices_called: string[];
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export interface BffLoginResponse {
  meta: BffMeta;
  columns: unknown[];
  payload: BffLoginPayload;
  pagination: unknown | null;
}

export interface LoginResponseData {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_expires_in?: number;
  token_type?: string;
  session_state?: string;
  scope?: string;
  company?: {
    id: string;
    slug: string;
  };
  roles?: string[];
  permissions?: string[];
}

export interface LoginResponse {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: LoginResponseData;
  details?: ErrorDetails;
}

// ============ PERMISSIONS ============
export interface PermissionsUser {
  id: string;
  reportingUserId?: string;
  email: string;
  name: string;
  externalId: string;
}

export interface PermissionsCompany {
  name: string;
  externalId: string;
  plan: string;
}

export interface Permission {
  code: string;
  name: string;
  description: string;
}

export interface PermissionsApplicationCompany {
  name: string;
  externalId: string;
  role: string;
  permissions: Permission[];
}

export interface PermissionsApplication {
  name: string;
  companies: PermissionsApplicationCompany[];
}

export interface PermissionsData {
  user: PermissionsUser;
  company: PermissionsCompany;
  applications: PermissionsApplication[];
  expiresAt: string;
}

export interface PermissionsResponseData {
  data: PermissionsData;
  signature: string;
}

export interface PermissionsResponse {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: PermissionsResponseData;
  details?: ErrorDetails;
}

// Raw encrypted payload from API
export interface EncryptedPayload {
  encryptedData: string;
  iv: string;
  authTag: string;
  signature: string;
}

export interface PermissionsRawResponse {
  success: boolean;
  data: EncryptedPayload;
}

// ============ PASSWORD RECOVERY ============
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export interface ChangePasswordRequest {
  email: string;
  temporaryPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

// ============ PROCESSED USER DATA ============
export interface ProcessedUserData {
  userId: string;
  email: string;
  fullName: string;
  company: string;
  companyId?: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
}

// ============ TOKEN STORAGE ============
export interface AuthDataSnapshot {
  accessToken: string;
  refreshToken: string;
  userData?: ProcessedUserData;
  expiresIn?: number;
  refreshExpiresIn?: number;
  timestamp?: number;
  tokenType?: string;
  sessionState?: string;
  scope?: string;
}

// ============ COMMON ============
export interface ErrorDetails {
  message: string | string[];
  error: string;
  statusCode: number;
}
