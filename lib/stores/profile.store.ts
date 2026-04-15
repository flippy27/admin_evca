/**
 * Profile store — manages user profile data
 */

import { create } from 'zustand';
import { profileApi } from '../api/profile.api';
import {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeLanguageRequest,
} from '../types/profile.types';
import { logger } from '../services/logger';
import { handleError } from '../services/errorHandler';

interface ProfileState {
  // Profile data
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;

  // Update state
  updateLoading: boolean;
  updateError: string | null;

  // Password change state
  passwordLoading: boolean;
  passwordError: string | null;

  // Language change state
  languageLoading: boolean;
  languageError: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  changeLanguage: (payload: ChangeLanguageRequest) => Promise<void>;
  clearError: (key: 'profile' | 'update' | 'password' | 'language') => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  profileLoading: false,
  profileError: null,

  updateLoading: false,
  updateError: null,

  passwordLoading: false,
  passwordError: null,

  languageLoading: false,
  languageError: null,

  // Fetch profile
  fetchProfile: async () => {
    set({ profileLoading: true, profileError: null });
    try {
      const res = await profileApi.getProfile();
      set({
        profile: res.data.data,
        profileLoading: false,
      });
      logger.info('Profile fetched');
    } catch (error) {
      const apiError = handleError(error);
      set({
        profileError: apiError.message,
        profileLoading: false,
      });
    }
  },

  // Update profile
  updateProfile: async (payload: UpdateProfileRequest) => {
    set({ updateLoading: true, updateError: null });
    try {
      const res = await profileApi.updateProfile(payload);
      set({
        profile: res.data.data,
        updateLoading: false,
      });
      logger.info('Profile updated');
    } catch (error) {
      const apiError = handleError(error);
      set({
        updateError: apiError.message,
        updateLoading: false,
      });
      throw apiError;
    }
  },

  // Change password
  changePassword: async (payload: ChangePasswordRequest) => {
    set({ passwordLoading: true, passwordError: null });
    try {
      await profileApi.changePassword(payload);
      set({
        passwordLoading: false,
      });
      logger.info('Password changed');
    } catch (error) {
      const apiError = handleError(error);
      set({
        passwordError: apiError.message,
        passwordLoading: false,
      });
      throw apiError;
    }
  },

  // Change language
  changeLanguage: async (payload: ChangeLanguageRequest) => {
    set({ languageLoading: true, languageError: null });
    try {
      const res = await profileApi.changeLanguage(payload);
      set({
        profile: res.data.data,
        languageLoading: false,
      });
      logger.info('Language changed');
    } catch (error) {
      const apiError = handleError(error);
      set({
        languageError: apiError.message,
        languageLoading: false,
      });
      throw apiError;
    }
  },

  // Clear errors
  clearError: (key: 'profile' | 'update' | 'password' | 'language') => {
    const errorMap = {
      profile: 'profileError',
      update: 'updateError',
      password: 'passwordError',
      language: 'languageError',
    };
    const errorKey = errorMap[key] as keyof ProfileState;
    set({ [errorKey]: null } as any);
  },
}));
