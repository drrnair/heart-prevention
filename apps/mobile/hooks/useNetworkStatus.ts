import { useCallback, useEffect, useRef, useState } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { flush } from "@/lib/offline-queue";

interface UseNetworkStatusReturn {
  readonly isConnected: boolean;
  readonly isInternetReachable: boolean | null;
  readonly showReconnectedToast: boolean;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState<
    boolean | null
  >(true);
  const [showReconnectedToast, setShowReconnectedToast] = useState(false);
  const wasDisconnected = useRef(false);

  const handleStateChange = useCallback((state: NetInfoState) => {
    const connected = state.isConnected ?? false;
    setIsConnected(connected);
    setIsInternetReachable(state.isInternetReachable ?? null);

    // Detect reconnection: was disconnected, now connected
    if (wasDisconnected.current && connected) {
      flush().catch(() => {
        // Silently handle flush errors on reconnection
      });

      setShowReconnectedToast(true);
      setTimeout(() => {
        setShowReconnectedToast(false);
      }, 3000);
    }

    wasDisconnected.current = !connected;
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(handleStateChange);
    return () => {
      unsubscribe();
    };
  }, [handleStateChange]);

  return {
    isConnected,
    isInternetReachable,
    showReconnectedToast,
  };
}
