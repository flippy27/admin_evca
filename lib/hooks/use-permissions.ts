/**
 * usePermissions hook
 * Reads permissions from auth store and provides checking utilities
 */

import { AuthPermissionsEnum } from '../config/permissions'
import { useAuthStore } from '../stores/auth.store'

export function usePermissions() {
  const user = useAuthStore((state) => state.user)
  const hydrated = useAuthStore((state) => state.hydrated)

  const permissions = user?.permissions ?? []

  // Add roles as permissions for easy checking
  //console.log(permissions)

  const roles = user?.roles ?? []

  //TODO: REMOVE DIS SHAIT, ROLES SHOULD COME FROM BACKEND, I ADDED DIS SHIT FOR TESTING ONLY
  roles.push('operator')
  roles.push('supervisor')
  roles.push('maintainer')

  return {
    hasPermission: (slug: AuthPermissionsEnum): boolean =>
      permissions.includes(slug),
    hasAnyPermission: (slugs: AuthPermissionsEnum[]): boolean =>
      slugs.some((s) => permissions.includes(s)),
    hasAllPermissions: (slugs: AuthPermissionsEnum[]): boolean =>
      slugs.every((s) => permissions.includes(s)),
    hasRole: (role: string): boolean => roles.includes(role),
    permissions,
    roles,
    hydrated,
  }
}
