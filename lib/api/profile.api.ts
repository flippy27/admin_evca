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
   * GET /bff/user/profile - Get current user profile
   */
  getProfile: () => bffClient.get<ProfileResponse>('/bff/user/profile'),

  /**
   * PUT /bff/user/profile - Update user profile
   */
  updateProfile: (payload: UpdateProfileRequest) =>
    bffClient.put<ProfileResponse>('/bff/user/profile', payload),

  /**
   * POST /bff/user/change-password - Change password
   */
  changePassword: (payload: ChangePasswordRequest) =>
    bffClient.post<{ data: { success: boolean } }>('/bff/user/change-password', payload),

  /**
   * POST /bff/user/change-language - Change language preference
   */
  changeLanguage: (payload: ChangeLanguageRequest) =>
    bffClient.post<ProfileResponse>('/bff/user/change-language', payload),
};
