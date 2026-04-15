/**
 * useNetworkStatus hook
 * Detects network connectivity and provides offline state
 * For React Native - assumes online by default
 */

import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface NetworkState {
  isOnline: boolean;
}

/**
 * Hook to monitor network connectivity
 * Returns current network state
 * Note: Actual network detection would require @react-native-community/netinfo
 * For now, assumes online (graceful degradation in offline scenarios)
 */
export function useNetworkStatus(): NetworkState {
  const [isOnline, setIsOnline] = useState<boolean>(true); // Assume online by default

  useEffect(() => {
    // Monitor app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAppStateChange = (state: AppStateStatus) => {
    if (state === 'active') {
      // App came to foreground - still assume online
      setIsOnline(true);
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
