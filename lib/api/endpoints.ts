/**
 * API endpoint constants
 */

export const ENDPOINTS = {
  // Auth
  LOGIN: '/bff/auth/login',
  PERMISSIONS: '/auth/permissions',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/bff/users/reset-password',
  RESET_PASSWORD: '/auth/reset-password',
  CHANGE_PASSWORD: '/bff/users/change-password',
} as const;

// Endpoints that should skip auth header injection
export const AUTH_WHITELIST = [
  ENDPOINTS.LOGIN,
  ENDPOINTS.FORGOT_PASSWORD,
  ENDPOINTS.RESET_PASSWORD,
  ENDPOINTS.CHANGE_PASSWORD,
  ENDPOINTS.REFRESH_TOKEN,
];
