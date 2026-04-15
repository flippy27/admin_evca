import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';

interface UsePermissionGuardOptions {
  requiredPermissions?: string[];
  requiredRoles?: string[];
  type?: 'oneOf' | 'all';
  fallbackRoute?: string;
}

/**
 * Hook to protect routes by permission
 * Checks auth state + user permissions
 * Redirects if unauthorized
 */
export function usePermissionGuard({
  requiredPermissions = [],
  requiredRoles = [],
  type = 'oneOf',
  fallbackRoute = '/forbidden',
}: UsePermissionGuardOptions): boolean {
  const router = useRouter();
  const sessionState = useAuthStore((state) => state.sessionState);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Not authenticated
    if (sessionState !== 'authenticated') {
      router.replace('/(auth)/login');
      return;
    }

    // Check permissions
    if (requiredPermissions.length > 0 && user) {
      const userPerms = user.permissions ?? [];
      const hasPerms =
        type === 'oneOf'
          ? requiredPermissions.some((p) => userPerms.includes(p))
          : requiredPermissions.every((p) => userPerms.includes(p));

      if (!hasPerms) {
        router.replace(fallbackRoute);
        return;
      }
    }

    // Check roles
    if (requiredRoles.length > 0 && user) {
      const userRoles = user.roles ?? [];
      const hasRoles = requiredRoles.some((r) => userRoles.includes(r));

      if (!hasRoles) {
        router.replace(fallbackRoute);
        return;
      }
    }
  }, [sessionState, user, requiredPermissions, requiredRoles, type, router, fallbackRoute]);

  return sessionState === 'authenticated' && user !== null;
}
