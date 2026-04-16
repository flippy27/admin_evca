/**
 * Auth store — global authentication state (Zustand)
 * Manages: tokens, user data, permissions, session state
 * Persists to SecureStore (tokens) and in-memory (everything else)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { authApi } from '../api/auth.api';
import { clearAuthToken, injectAuthToken, onRefreshFailed } from '../api/client';
import { decryptAndValidate } from '../crypto/encryption';
import { logger } from '../services/logger';
import {
  AuthDataSnapshot,
  PermissionsData,
  ProcessedUserData,
  SessionState
} from '../types/auth.types';
import { getJWTClaims } from '../utils/jwt';

const STORAGE_KEY = 'cms_auth_data';
const REMEMBER_EMAIL_KEY = 'auth_remember_email';
const REMEMBER_FLAG_KEY = 'auth_remember_enabled';

interface AuthState {
  // State
  sessionState: SessionState;
  user: ProcessedUserData | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: number | null;
  refreshExpiresIn: number | null;
  tokenTimestamp: number | null;

  // Actions
  login: (email: string, password: string, rememberMe: boolean) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;

  // Helpers
  isTokenExpired: () => boolean;
  isRefreshTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  sessionState: 'idle',
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresIn: null,
  refreshExpiresIn: null,
  tokenTimestamp: null,

  // Login flow (2 steps)
  login: async (email: string, password: string, rememberMe: boolean) => {
    try {
      set({ sessionState: 'restoring' });

      // Step 1: Get tokens from BFF
      const loginRes = await authApi.login({ email, password });
      const loginData = loginRes.data.payload.data;

      // Store tokens immediately
      set({
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
        expiresIn: loginData.expires_in,
        refreshExpiresIn: loginData.refresh_expires_in,
        tokenTimestamp: Date.now(),
      });

      // Inject token into axios
      injectAuthToken(loginData.access_token);

      // Extract userId and companyId from JWT
      const jwtClaims = getJWTClaims(loginData.access_token);

      // Step 2: Get permissions (optional - use JWT as fallback)
      let roles: string[] = [];
      let permissionCodes: string[] = [];
      let company = 'Unknown';
      let companyExternalId = '';

      try {
        const permRes = await authApi.getPermissions();
        const permissions = permRes.data.payload.data;

        permissions.applications.forEach((app) => {
          app.companies.forEach((company) => {
            if (company.role) roles.push(company.role);
            if (company.permissions?.length) {
              permissionCodes.push(...company.permissions.map((p) => p.code));
            }
          });
        });

        company = permissions.company.name;
        companyExternalId = permissions.company.externalId;
      } catch (permError) {
        console.warn('[Auth] Failed to fetch permissions, using JWT claims:', permError);
        // Continue with JWT data only
      }

      const processedUser: ProcessedUserData = {
        userId: jwtClaims.userId,
        email: jwtClaims.email,
        fullName: jwtClaims.name,
        company,
        companyId: jwtClaims.companyId,
        companyExternalId,
        roles: [...new Set(roles)],
        permissions: [...new Set(permissionCodes)],
        isActive: true,
      };

      console.log('[Auth] ProcessedUser created:', {
        userId: processedUser.userId,
        companyId: processedUser.companyId,
        email: processedUser.email,
        fullName: processedUser.fullName,
      });

      // Persist to SecureStore
      const snapshot: AuthDataSnapshot = {
        accessToken: loginData.access_token,
        refreshToken: loginData.refresh_token,
        userData: processedUser,
        expiresIn: loginData.expires_in,
        refreshExpiresIn: loginData.refresh_expires_in,
        timestamp: Date.now(),
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(snapshot));

      // Handle remember-me
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email);
        await AsyncStorage.setItem(REMEMBER_FLAG_KEY, '1');
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
        await AsyncStorage.removeItem(REMEMBER_FLAG_KEY);
      }

      // Update state
      set({
        user: processedUser,
        sessionState: 'authenticated',
      });

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      set({
        sessionState: 'unauthenticated',
        accessToken: null,
        refreshToken: null,
        user: null,
      });
      clearAuthToken();
      return false;
    }
  },

  // Logout
  logout: async () => {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
      clearAuthToken();
    } catch (error) {
      console.error('Logout error:', error);
    }

    set({
      sessionState: 'unauthenticated',
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      refreshExpiresIn: null,
      tokenTimestamp: null,
    });
  },

  // Restore session from SecureStore (called on app boot)
  restoreSession: async () => {
    try {
      set({ sessionState: 'restoring' });

      const storedData = await SecureStore.getItemAsync(STORAGE_KEY);
      if (!storedData) {
        set({ sessionState: 'unauthenticated' });
        return;
      }

      const snapshot = JSON.parse(storedData) as AuthDataSnapshot;

      // Check if refresh token is expired
      const now = Date.now();
      const refreshTokenExpiry = (snapshot.timestamp || 0) + ((snapshot.refreshExpiresIn || 0) * 1000);
      if (now >= refreshTokenExpiry) {
        // Refresh token expired — session is gone
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        set({ sessionState: 'unauthenticated' });
        return;
      }

      // Check if access token is expired
      const accessTokenExpiry = (snapshot.timestamp || 0) + ((snapshot.expiresIn || 0) * 1000);
      if (now >= accessTokenExpiry) {
        // Access token expired — try to refresh silently
        set({
          accessToken: snapshot.accessToken,
          refreshToken: snapshot.refreshToken,
          expiresIn: snapshot.expiresIn,
          refreshExpiresIn: snapshot.refreshExpiresIn,
          tokenTimestamp: snapshot.timestamp || 0,
        });

        injectAuthToken(snapshot.accessToken);

        try {
          await get().refreshAccessToken();

          // Extract userId and companyId from current access token (after refresh)
          const currentToken = get().accessToken;
          if (currentToken) {
            const jwtClaims = getJWTClaims(currentToken);
            const updatedUser = snapshot.userData ? {
              ...snapshot.userData,
              userId: jwtClaims.userId || snapshot.userData.userId,
              companyId: jwtClaims.companyId || snapshot.userData.companyId,
            } : null;

            set({
              user: updatedUser || null,
              sessionState: 'authenticated',
            });
          } else {
            set({
              user: snapshot.userData || null,
              sessionState: 'authenticated',
            });
          }
        } catch (error) {
          console.error('Silent refresh failed:', error);
          await get().logout();
        }
      } else {
        // Tokens are still valid
        injectAuthToken(snapshot.accessToken);

        // Extract fresh userId and companyId from JWT
        const jwtClaims = getJWTClaims(snapshot.accessToken);
        const updatedUser = snapshot.userData ? {
          ...snapshot.userData,
          userId: jwtClaims.userId || snapshot.userData.userId,
          companyId: jwtClaims.companyId || snapshot.userData.companyId,
        } : null;

        console.log('[RestoreSession] Updated user:', {
          userId: updatedUser?.userId,
          companyId: updatedUser?.companyId,
        });

        set({
          accessToken: snapshot.accessToken,
          refreshToken: snapshot.refreshToken,
          expiresIn: snapshot.expiresIn,
          refreshExpiresIn: snapshot.refreshExpiresIn,
          tokenTimestamp: snapshot.timestamp || 0,
          user: updatedUser || null,
          sessionState: 'authenticated',
        });
      }
    } catch (error) {
      console.error('Restore session error:', error);
      set({ sessionState: 'failed' });
    }
  },

  // Refresh access token (using refresh token)
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const res = await authApi.refreshToken(refreshToken);
      // User management refresh returns tokens in response.data.data
      const newTokens = res.data.data as any;

      const updated = {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresIn: newTokens.expires_in,
        refreshExpiresIn: newTokens.refresh_expires_in,
        tokenTimestamp: Date.now(),
      };

      set(updated);
      injectAuthToken(newTokens.access_token);

      logger.info('Access token refreshed successfully');

      // Re-fetch permissions with new token (permissions may have changed)
      try {
        const permRes = await authApi.getPermissions();
        const permissions = permRes.data.payload.data;

        // Process permissions
        const roles: string[] = [];
        const permissionCodes: string[] = [];

        permissions.applications.forEach((app) => {
          app.companies.forEach((company) => {
            if (company.role) roles.push(company.role);
            if (company.permissions?.length) {
              permissionCodes.push(...company.permissions.map((p) => p.code));
            }
          });
        });

        // Extract userId and companyId from new JWT
        const jwtClaims = getJWTClaims(newTokens.access_token);
        const currentUser = get().user;

        const updatedUser: ProcessedUserData = {
          userId: jwtClaims.userId || currentUser?.userId || permissions.user.externalId,
          email: jwtClaims.email || currentUser?.email || permissions.user.email,
          fullName: currentUser?.fullName || permissions.user.name,
          company: permissions.company.name,
          companyId: jwtClaims.companyId || currentUser?.companyId || permissions.company.externalId,
          roles: [...new Set(roles)],
          permissions: [...new Set(permissionCodes)],
          isActive: true,
        };

        set({ user: updatedUser });

        // Update SecureStore with new tokens + updated user data
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored) {
          const snapshot = JSON.parse(stored) as AuthDataSnapshot;
          await SecureStore.setItemAsync(
            STORAGE_KEY,
            JSON.stringify({
              ...snapshot,
              ...updated,
              userData: updatedUser
            })
          );
        }

        logger.info('Permissions refreshed after token refresh');
      } catch (permError) {
        logger.warn('Failed to refresh permissions, but token refresh succeeded', permError);
        // Don't fail token refresh if permissions fetch fails - user is still authenticated
        // Update SecureStore with just new tokens
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (stored) {
          const snapshot = JSON.parse(stored) as AuthDataSnapshot;
          await SecureStore.setItemAsync(
            STORAGE_KEY,
            JSON.stringify({ ...snapshot, ...updated })
          );
        }
      }
    } catch (error) {
      logger.error('Refresh token failed:', error);
      await get().logout();
      throw error;
    }
  },

  // Check if access token is expired
  isTokenExpired: () => {
    const { tokenTimestamp, expiresIn } = get();
    if (!tokenTimestamp || !expiresIn) return true;
    return Date.now() >= tokenTimestamp + expiresIn * 1000;
  },

  // Check if refresh token is expired
  isRefreshTokenExpired: () => {
    const { tokenTimestamp, refreshExpiresIn } = get();
    if (!tokenTimestamp || !refreshExpiresIn) return true;
    return Date.now() >= tokenTimestamp + refreshExpiresIn * 1000;
  },
}));

// Register callback for when token refresh fails (API client will call this)
onRefreshFailed(() => {
  logger.error('Token refresh failed in API interceptor — forcing logout');
  useAuthStore.getState().logout();
});
