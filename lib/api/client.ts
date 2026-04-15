/**
 * Axios HTTP client with auth interceptors
 * Handles token injection, 401 refresh, and error mapping
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { ENDPOINTS, AUTH_WHITELIST } from './endpoints';
import { logger } from '../services/logger';
import { extractErrorMessage } from '../services/errorHandler';

// In-flight refresh token to prevent concurrent refresh requests
let refreshTokenPromise: Promise<string | null> | null = null;

// Callback for handling 401 + refresh
let onRefreshFailedCallback: (() => void) | null = null;

/**
 * Register callback when token refresh fails (logout)
 */
export function onRefreshFailed(callback: () => void) {
  onRefreshFailedCallback = callback;
}

/**
 * Create an axios instance with base URL and interceptors
 */
function createAuthenticatedClient(baseURL: string, isBff: boolean = false): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000,
  });

  // Request interceptor: inject access token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url || '';
      const isAuthEndpoint = AUTH_WHITELIST.some((endpoint) => url.includes(endpoint));

      if (!isAuthEndpoint) {
        // Token will be injected by auth store via setter
        // For now, this is a placeholder — actual token injection happens in auth store
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: handle errors + 401 refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      const apiError = extractErrorMessage(error);

      // Log all errors
      logger.error(`API Error: ${error.config?.url}`, {
        status: error.response?.status,
        message: apiError.message,
      });

      // Handle 401: try to refresh token
      if (error.response?.status === 401 && !originalRequest._retried) {
        originalRequest._retried = true;

        // Use single-flight pattern for refresh
        if (!refreshTokenPromise) {
          refreshTokenPromise = attemptRefresh().finally(() => {
            refreshTokenPromise = null;
          });
        }

        try {
          await refreshTokenPromise;
          // Token refreshed, retry original request
          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed — logout
          logger.error('Token refresh failed');
          onRefreshFailedCallback?.();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
}

/**
 * Attempt to refresh access token
 * This is a placeholder — actual logic is in auth store
 */
async function attemptRefresh(): Promise<string | null> {
  // Actual implementation will call authStore.refreshAccessToken()
  return null;
}

// Create two clients: one for BFF, one for user management
export const bffClient = createAuthenticatedClient(ENV.BFF_URL, true);
export const userMgmtClient = createAuthenticatedClient(ENV.USER_MGMT_URL, false);

/**
 * Inject token into axios instance
 * Called by auth store when token changes
 */
export function injectAuthToken(token: string | null) {
  const tokenHeader = token ? `Bearer ${token}` : undefined;

  bffClient.defaults.headers.common['Authorization'] = tokenHeader;
  userMgmtClient.defaults.headers.common['Authorization'] = tokenHeader;
}

/**
 * Clear auth token from all clients
 */
export function clearAuthToken() {
  delete bffClient.defaults.headers.common['Authorization'];
  delete userMgmtClient.defaults.headers.common['Authorization'];
}
