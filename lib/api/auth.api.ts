/**
 * Auth API endpoints
 */

import { bffClient, userMgmtClient } from './client';
import { ENDPOINTS } from './endpoints';
import {
  LoginRequest,
  BffLoginResponse,
  LoginResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  PermissionsRawResponse,
} from '../types/auth.types';

export const authApi = {
  /**
   * Step 1 of login: get tokens from BFF
   */
  login: (req: LoginRequest) =>
    bffClient.post<BffLoginResponse>(ENDPOINTS.LOGIN, {
      email: req.email,
      password: req.password,
    }),

  /**
   * Step 2 of login: get encrypted permissions from user management service
   */
  getPermissions: () =>
    bffClient.get<PermissionsRawResponse>(ENDPOINTS.PERMISSIONS, {
      params: { applicationCode: 'cms' },
    }),

  /**
   * Refresh access token using refresh token
   * Calls user-management service (not BFF)
   * Response: { access_token, refresh_token, expires_in, refresh_expires_in }
   */
  refreshToken: (refreshToken: string) =>
    userMgmtClient.post<any>(ENDPOINTS.REFRESH_TOKEN, {
      refreshToken: refreshToken,
    }),

  /**
   * Request password reset link (forgot password flow)
   */
  forgotPassword: (req: ForgotPasswordRequest) =>
    bffClient.post(ENDPOINTS.FORGOT_PASSWORD, req),

  /**
   * Reset password with token
   */
  resetPassword: (req: ResetPasswordRequest) =>
    bffClient.post(ENDPOINTS.RESET_PASSWORD, req),

  /**
   * Change password (temporary password on first login)
   */
  changePassword: (req: ChangePasswordRequest) =>
    bffClient.post(ENDPOINTS.CHANGE_PASSWORD, req),
};
