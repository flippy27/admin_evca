/**
 * Axios HTTP client with auth interceptors
 * Handles token injection, 401 refresh, error mapping, and HTTP logging
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '../config/env';
import { ENDPOINTS, AUTH_WHITELIST } from './endpoints';
import { logger } from '../services/logger';
import { extractErrorMessage } from '../services/errorHandler';

// HTTP Logging levels
enum HttpLogLevel {
  OFF = 0,
  BASIC = 1,      // URL + status
  DETAILED = 2,   // URL + method + status + headers
  VERBOSE = 3,    // Everything including request/response bodies
}

const LOG_LEVEL: HttpLogLevel = parseInt(ENV.HTTP_LOG_LEVEL || '1', 10) as HttpLogLevel;

// In-flight refresh token to prevent concurrent refresh requests
let refreshTokenPromise: Promise<string | null> | null = null;

// Callback for handling 401 + refresh
let onRefreshFailedCallback: (() => void) | null = null;

/**
 * Log HTTP request/response based on log level
 */
function logHttpRequest(method: string, url: string, config?: InternalAxiosRequestConfig) {
  if (LOG_LEVEL === HttpLogLevel.OFF) return;

  const prefix = `[HTTP ${method}]`;

  if (LOG_LEVEL >= HttpLogLevel.BASIC) {
    logger.info(`${prefix} ${url}`);
  }

  if (LOG_LEVEL >= HttpLogLevel.DETAILED) {
    if (config?.headers) {
      const safeHeaders = { ...config.headers };
      // Redact sensitive headers
      if (safeHeaders['Authorization']) {
        safeHeaders['Authorization'] = safeHeaders['Authorization'].toString().substring(0, 20) + '...';
      }
      logger.debug(`${prefix} Headers:`, safeHeaders);
    }
  }

  if (LOG_LEVEL >= HttpLogLevel.VERBOSE) {
    if (config?.data) {
      logger.debug(`${prefix} Request body:`, config.data);
    }
  }
}

function logHttpResponse(method: string, url: string, response: AxiosResponse) {
  if (LOG_LEVEL === HttpLogLevel.OFF) return;

  const prefix = `[HTTP ${method}] ${response.status}`;

  if (LOG_LEVEL >= HttpLogLevel.BASIC) {
    logger.info(`${prefix} ${url}`);
  }

  if (LOG_LEVEL >= HttpLogLevel.DETAILED) {
    logger.debug(`${prefix} Response headers:`, response.headers);
  }

  if (LOG_LEVEL >= HttpLogLevel.VERBOSE) {
    logger.debug(`${prefix} Response body:`, response.data);
  }
}

function logHttpError(method: string, url: string, error: AxiosError) {
  if (LOG_LEVEL === HttpLogLevel.OFF) return;

  const status = error.response?.status || 'unknown';
  const prefix = `[HTTP ${method}] ERROR ${status}`;

  if (LOG_LEVEL >= HttpLogLevel.BASIC) {
    logger.error(`${prefix} ${url}`);
  }

  if (LOG_LEVEL >= HttpLogLevel.DETAILED) {
    logger.error(`${prefix} Error:`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });
  }

  if (LOG_LEVEL >= HttpLogLevel.VERBOSE) {
    logger.error(`${prefix} Full error response:`, error.response?.data);
  }
}

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

  // Request interceptor: inject access token + log
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url || '';
      const method = config.method?.toUpperCase() || 'GET';

      logHttpRequest(method, url, config);

      const isAuthEndpoint = AUTH_WHITELIST.some((endpoint) => url.includes(endpoint));

      if (!isAuthEndpoint) {
        // Token will be injected by auth store via setter
        // For now, this is a placeholder — actual token injection happens in auth store
      }

      return config;
    },
    (error) => {
      logger.error('[HTTP] Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor: handle errors + 401 refresh + log
  client.interceptors.response.use(
    (response) => {
      const url = response.config.url || '';
      const method = response.config.method?.toUpperCase() || 'GET';
      logHttpResponse(method, url, response);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as any;
      const url = error.config?.url || '';
      const method = error.config?.method?.toUpperCase() || 'GET';
      const apiError = extractErrorMessage(error);

      // Log HTTP error
      logHttpError(method, url, error);

      // Also log to logger for general error handling
      logger.error(`API Error: ${url}`, {
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
