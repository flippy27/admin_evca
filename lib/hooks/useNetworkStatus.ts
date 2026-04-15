/**
 * useNetworkStatus hook
 * Detects network connectivity and provides offline state
 */

import { useEffect, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { NetInfo } from '@react-native-community/netinfo';

interface NetworkState {
  isOnline: boolean;
  isWifi: boolean;
  isMobile: boolean;
  type: string | null;
}

/**
 * Hook to monitor network connectivity
 * Returns current network state and updates when connectivity changes
 */
export function useNetworkStatus(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isOnline: true, // assume online initially
    isWifi: false,
    isMobile: false,
    type: null,
  });

  useEffect(() => {
    let subscription: any = null;

    // Check initial state
    if (Platform.OS !== 'web') {
      // NetInfo is not available on web, so skip
      try {
        checkNetworkStatus();
      } catch {
        // NetInfo might not be installed
      }
    }

    async function checkNetworkStatus() {
      // Note: NetInfo would need to be imported from @react-native-community/netinfo
      // For now, we'll use a simple online check
      const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setNetworkState((prev) => ({ ...prev, isOnline }));
    }

    // Check on app state change
    const subscription_ = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription_?.remove();
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      // Recheck network status when app comes to foreground
      setNetworkState((prev) => ({
        ...prev,
        isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      }));
    }
  };

  return networkState;
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
