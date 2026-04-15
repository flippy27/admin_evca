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
      console.log('loginres',JSON.stringify(loginRes));
      
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

      // Step 2: Get encrypted permissions
      const permRes = await authApi.getPermissions();
      const decrypted = await decryptAndValidate<PermissionsData>(permRes.data.data);

      // Process permissions into ProcessedUserData
      const roles: string[] = [];
      const permissions: string[] = [];

      decrypted.applications.forEach((app) => {
        app.companies.forEach((company) => {
          if (company.role) roles.push(company.role);
          if (company.permissions?.length) {
            permissions.push(...company.permissions.map((p) => p.code));
          }
        });
      });

      const processedUser: ProcessedUserData = {
        userId: decrypted.user.externalId,
        email: decrypted.user.email,
        fullName: decrypted.user.name,
        company: decrypted.company.name,
        companyId: decrypted.company.externalId,
        roles: [...new Set(roles)],
        permissions: [...new Set(permissions)],
        isActive: true,
      };

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
          set({
            user: snapshot.userData || null,
            sessionState: 'authenticated',
          });
        } catch (error) {
          console.error('Silent refresh failed:', error);
          await get().logout();
        }
      } else {
        // Tokens are still valid
        injectAuthToken(snapshot.accessToken);
        set({
          accessToken: snapshot.accessToken,
          refreshToken: snapshot.refreshToken,
          expiresIn: snapshot.expiresIn,
          refreshExpiresIn: snapshot.refreshExpiresIn,
          tokenTimestamp: snapshot.timestamp || 0,
          user: snapshot.userData || null,
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
      const newTokens = res.data.data;

      const updated = {
        accessToken: newTokens.access_token,
        refreshToken: newTokens.refresh_token,
        expiresIn: newTokens.expires_in,
        refreshExpiresIn: newTokens.refresh_expires_in,
        tokenTimestamp: Date.now(),
      };

      set(updated);
      injectAuthToken(newTokens.access_token);

      // Update SecureStore
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        const snapshot = JSON.parse(stored) as AuthDataSnapshot;
        await SecureStore.setItemAsync(
          STORAGE_KEY,
          JSON.stringify({ ...snapshot, ...updated })
        );
      }
    } catch (error) {
      console.error('Refresh token failed:', error);
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
