/**
 * User profile domain types
 */

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  company: string;
  language: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeLanguageRequest {
  language: string;
}

export interface ProfileResponse {
  data: UserProfile;
}
