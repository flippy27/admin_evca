/**
 * useApiErrorToast hook
 * Automatically shows toast when API errors occur
 */

import { useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Hook to display toast notification when API error occurs
 * Usage: useApiErrorToast(chargersError, 'Failed to load chargers')
 */
export function useApiErrorToast(
  error: string | null | undefined,
  fallbackMessage: string = 'An error occurred'
) {
  const { show } = useToast();

  useEffect(() => {
    if (error) {
      show(error || fallbackMessage, 'error', 'Error');
    }
  }, [error, show, fallbackMessage]);
}

/**
 * Hook to display toast for multiple API errors
 * Usage: useApiErrorToasts({ chargers: chargersError, sites: sitesError })
 */
export function useApiErrorToasts(
  errors: Record<string, string | null | undefined>,
  fallbackMessage: string = 'An error occurred'
) {
  const { show } = useToast();

  useEffect(() => {
    Object.values(errors).forEach((error) => {
      if (error) {
        show(error || fallbackMessage, 'error', 'Error');
      }
    });
  }, [errors, show, fallbackMessage]);
}
