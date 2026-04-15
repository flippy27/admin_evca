/**
 * Route Permissions Map
 * Defines which permissions are required to access each route
 * Maps to AuthPermissionsEnum from shared-types
 */

import { AuthPermissionsEnum } from '@/lib/types/auth.types';

export interface RoutePermissionConfig {
  path: string;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  matchType?: 'oneOf' | 'all'; // oneOf = user needs at least one permission, all = user needs all permissions
}

export const ROUTE_PERMISSIONS_MAP: Record<string, RoutePermissionConfig> = {
  // Public routes - no permissions required
  '/(auth)/login': {
    path: '/(auth)/login',
  },

  // App routes with permission requirements
  '/(app)/dashboard': {
    path: '/(app)/dashboard',
    requiredPermissions: [AuthPermissionsEnum.DASHBOARD_VIEW],
  },

  '/(app)/chargers/index': {
    path: '/(app)/chargers',
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  },

  '/(app)/chargers/[id]': {
    path: '/(app)/chargers/[id]',
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  },

  '/(app)/chargers/[id]/live': {
    path: '/(app)/chargers/[id]/live',
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  },

  '/(app)/chargers/[id]/history': {
    path: '/(app)/chargers/[id]/history',
    requiredPermissions: [AuthPermissionsEnum.CHARGERS_VIEW],
  },

  '/(app)/sites/index': {
    path: '/(app)/sites',
    requiredPermissions: [AuthPermissionsEnum.SITES_VIEW],
  },

  '/(app)/sites/[id]': {
    path: '/(app)/sites/[id]',
    requiredPermissions: [AuthPermissionsEnum.SITES_VIEW],
  },

  '/(app)/profile': {
    path: '/(app)/profile',
    requiredPermissions: [AuthPermissionsEnum.PROFILE_EDIT],
  },

  '/(app)/reporting/index': {
    path: '/(app)/reporting',
    requiredPermissions: [AuthPermissionsEnum.REPORTS_VIEW],
  },

  '/(app)/credentials/index': {
    path: '/(app)/credentials',
    requiredPermissions: [AuthPermissionsEnum.CREDENTIALS_VIEW],
  },

  '/(app)/energy-resources/index': {
    path: '/(app)/energy-resources',
    requiredPermissions: [AuthPermissionsEnum.ENERGY_RESOURCES_VIEW],
  },
};

/**
 * Get permission config for a route
 */
export function getRoutePermissionConfig(
  path: string
): RoutePermissionConfig | undefined {
  return ROUTE_PERMISSIONS_MAP[path];
}

/**
 * Check if route requires authentication
 */
export function routeRequiresAuth(path: string): boolean {
  // All routes under /(app)/ require auth
  if (path.startsWith('/(app)/')) return true;
  // Login doesn't require auth (or user must be logged out)
  if (path === '/(auth)/login') return false;
  return false;
}

/**
 * Check if route requires specific permissions
 */
export function routeRequiresPermissions(path: string): boolean {
  const config = getRoutePermissionConfig(path);
  return !!(config?.requiredPermissions?.length || config?.requiredRoles?.length);
}
