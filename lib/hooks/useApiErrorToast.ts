/**
 * useApiErrorToast hook
 * Automatically shows toast when API errors occur
 */

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';

/**
 * Hook to display toast notification when API error occurs
 * Only shows once per unique error to avoid repeated toasts
 * Usage: useApiErrorToast(chargersError, 'Failed to load chargers')
 */
export function useApiErrorToast(
  error: string | null | undefined,
  fallbackMessage: string = 'An error occurred'
) {
  const { show } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  useEffect(() => {
    // Only show toast if error changed
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      show(error || fallbackMessage, 'error', 'Error');
    }
    // Clear ref when error clears
    if (!error) {
      lastErrorRef.current = null;
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
