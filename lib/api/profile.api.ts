/**
 * Profile API endpoints
 */

import { bffClient } from './client';
import {
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangeLanguageRequest,
  ProfileResponse,
} from '../types/profile.types';

export const profileApi = {
  /**
   * GET /api/user/profile - Get current user profile
   */
  getProfile: () => bffClient.get<ProfileResponse>('/api/user/profile'),

  /**
   * PUT /api/user/profile - Update user profile
   */
  updateProfile: (payload: UpdateProfileRequest) =>
    bffClient.put<ProfileResponse>('/api/user/profile', payload),

  /**
   * POST /api/user/change-password - Change password
   */
  changePassword: (payload: ChangePasswordRequest) =>
    bffClient.post<{ data: { success: boolean } }>('/api/user/change-password', payload),

  /**
   * POST /api/user/change-language - Change language preference
   */
  changeLanguage: (payload: ChangeLanguageRequest) =>
    bffClient.post<ProfileResponse>('/api/user/change-language', payload),
};
