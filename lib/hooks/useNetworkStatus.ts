/**
 * useNetworkStatus hook
 * Detects network connectivity and provides offline state
 */

import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkState {
  isOnline: boolean;
}

/**
 * Hook to monitor network connectivity
 * Returns current network state and updates when connectivity changes
 */
export function useNetworkStatus(): NetworkState {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    // Check on app state change
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      subscription?.remove();
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      // Recheck network status when app comes to foreground
      const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(online);
    }
  };

  return { isOnline };
}

/**
 * Hook to handle retrying failed requests when coming online
 */
export function useOnlineRetry(callback: () => void) {
  const { isOnline } = useNetworkStatus();
  const [retryPending, setRetryPending] = useState(false);

  useEffect(() => {
    if (isOnline && retryPending) {
      callback();
      setRetryPending(false);
    }
  }, [isOnline, retryPending, callback]);

  const markForRetry = () => {
    setRetryPending(true);
  };

  return { markForRetry, retryPending };
}
