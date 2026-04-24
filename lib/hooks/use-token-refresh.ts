/**
 * Proactive token refresh hook
 * Monitors token expiry and refreshes 1 minute before expiration
 */

import { useEffect } from 'react';
import { useAuthStore } from '../stores/auth.store';
import { logger } from '../services/logger';

const REFRESH_BUFFER_MS = 60 * 1000; // Refresh 1 minute before expiry

export function useTokenRefresh() {
  useEffect(() => {
    const interval = setInterval(async () => {
      const { accessToken, tokenTimestamp, expiresIn, isTokenExpired, isRefreshTokenExpired, refreshAccessToken } = useAuthStore.getState();

      // Skip if not authenticated
      if (!accessToken || !tokenTimestamp || !expiresIn) {
        return;
      }

      // Check if refresh token is expired
      if (isRefreshTokenExpired()) {
        logger.error('Refresh token expired — user must re-login');
        await useAuthStore.getState().logout();
        return;
      }

      // Check if access token is about to expire
      const timeUntilExpiry = (tokenTimestamp + expiresIn * 1000) - Date.now();
      if (timeUntilExpiry < REFRESH_BUFFER_MS && timeUntilExpiry > 0) {
        logger.info(`Token expiring in ${Math.round(timeUntilExpiry / 1000)}s — refreshing proactively`);
        try {
          await refreshAccessToken();
          logger.info('Proactive token refresh succeeded');
        } catch (error) {
          logger.error('Proactive token refresh failed:', error);
        }
      }

      // Emergency: token is already expired
      if (isTokenExpired()) {
        logger.warn('Token already expired — attempting emergency refresh');
        try {
          await refreshAccessToken();
          logger.info('Emergency token refresh succeeded');
        } catch (error) {
          // refreshAccessToken() already logs out on failure, just log here
          logger.error('Emergency refresh failed, auth.store handled logout');
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);
}
