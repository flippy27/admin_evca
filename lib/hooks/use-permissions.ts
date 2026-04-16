/**
 * usePermissions hook
 * Reads permissions from auth store and provides checking utilities
 */

import { useAuthStore } from '../stores/auth.store';
import { AuthPermissionsEnum } from '../config/permissions';

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useAuthStore((state) => state.hydrated);

  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];

  return {
    hasPermission: (slug: AuthPermissionsEnum): boolean => permissions.includes(slug),
    hasAnyPermission: (slugs: AuthPermissionsEnum[]): boolean =>
      slugs.some((s) => permissions.includes(s)),
    hasAllPermissions: (slugs: AuthPermissionsEnum[]): boolean =>
      slugs.every((s) => permissions.includes(s)),
    hasRole: (role: string): boolean => roles.includes(role),
    permissions,
    roles,
    hydrated,
  };
}
