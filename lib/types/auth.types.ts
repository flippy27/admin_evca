/**
 * Auth types — shared between ui-emobility-web and admin_evca
 * Source of truth for authentication data structures
 */

// ============ PERMISSIONS ENUM ============
export enum AuthPermissionsEnum {
  // Profile & Dashboard
  PROFILE_VIEW = 'profile--view',
  PROFILE_EDIT = 'profile--edit',
  DASHBOARD_VIEW = 'dashboard--view',

  // Chargers
  CHARGERS_VIEW = 'chargers--view',
  CHARGERS_LIST = 'chargers--list',
  CHARGERS_DETAIL = 'chargers--detail',
  CHARGERS_SESSIONS_VIEW = 'chargers--sessions-view',
  CHARGERS_CREATE = 'chargers--create',
  CHARGERS_EDIT = 'chargers--edit',
  CHARGERS_DELETE = 'chargers--delete',

  // Charger Commands & Configuration
  CHARGERS_COMMANDS_OCPP = 'chargers--commands-ocpp',
  CHARGERS_COMMANDS_POLLEY = 'chargers--commands-polley',
  CHARGERS_PRIORITIZE_CHARGE = 'chargers--prioritize-charge',
  CHARGERS_DETAIL_LIVE_VIEW = 'chargers--detail-live-view',
  CHARGERS_DETAIL_HISTORY_VIEW = 'chargers--detail-history-view',
  CHARGERS_DETAIL_CONFIG_VIEW = 'chargers--detail-config-view',
  CHARGERS_DETAIL_CONFIG_MANAGE = 'chargers--detail-config-manage',
  CHARGERS_DETAIL_CONNECTORS_VIEW = 'chargers--detail-connectors-view',
  CHARGERS_DETAIL_CONNECTORS_MANAGE = 'chargers--detail-connectors-manage',

  // Sites
  SITES_VIEW = 'sites--view',
  SITES_LIST = 'sites--list',
  SITES_DETAIL = 'sites--detail',
  SITES_CREATE = 'sites--create',
  SITES_EDIT = 'sites--edit',
  SITES_DELETE = 'sites--delete',

  // Reports
  REPORTS_VIEW = 'reports--view',
  REPORTS_USER_LOGS = 'reports--user-logs',
  REPORTS_ALARMS_CHARGERS = 'reports--alarms-chargers',
  REPORTS_ALARMS_CONNECTORS = 'reports--alarms-connectors',
  REPORTS_CONSUMPTION_SITES = 'reports--consumption-sites',
  REPORTS_CONSUMPTION_USERS = 'reports--consumption-users',
  REPORTS_CHARGE_SESSIONS = 'reports--charge-sessions',
  REPORTS_OCPP_MESSAGES = 'reports--ocpp-messages',
  REPORTS_ENERGY_VARIABLES = 'reports--energy-variables',
  REPORTS_SYSTEM_UPTIMES = 'reports--system-uptimes',

  // Credentials & Energy Resources (mobile-specific)
  CREDENTIALS_VIEW = 'credentials--view',
  ENERGY_RESOURCES_VIEW = 'energy-resources--view',
}

// ============ SESSION STATE ============
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

export interface PermissionsPayload {
  success: boolean;
  message: string;
  statusCode: number;
  path: string;
  timestamp: string;
  data: PermissionsData;  // Already decrypted by server
}

export interface PermissionsRawResponse {
  meta: BffMeta;
  columns: unknown[];
  payload: PermissionsPayload;
  pagination: unknown | null;
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
  companyExternalId?: string;
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
