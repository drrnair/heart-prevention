import { useCallback, useEffect, useState } from "react";
import {
  requestPermission as requestNotificationPermission,
  scheduleWeeklyCheckinReminder,
  scheduleMedicationReminder,
} from "@/lib/notifications";
import { useAuth } from "./useAuth";

interface UseNotificationsReturn {
  readonly hasPermission: boolean;
  readonly requestPermission: () => Promise<void>;
  readonly scheduleCheckin: () => void;
  readonly scheduleMedReminder: (time: string) => void;
}

export function useNotifications(): UseNotificationsReturn {
  const { isAuthenticated } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);

  const requestPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    setHasPermission(granted);
  }, []);

  // Request permission on auth
  useEffect(() => {
    if (isAuthenticated) {
      requestPermission();
    }
  }, [isAuthenticated, requestPermission]);

  // TODO: Handle notification taps
  // useEffect(() => {
  //   const subscription = Notifications.addNotificationResponseReceivedListener(response => {
  //     const data = response.notification.request.content.data;
  //     // Navigate based on data.screen
  //   });
  //   return () => subscription.remove();
  // }, []);

  const scheduleCheckin = useCallback(() => {
    if (hasPermission) {
      scheduleWeeklyCheckinReminder();
    }
  }, [hasPermission]);

  const scheduleMedReminder = useCallback(
    (time: string) => {
      if (hasPermission) {
        scheduleMedicationReminder(time);
      }
    },
    [hasPermission],
  );

  return {
    hasPermission,
    requestPermission,
    scheduleCheckin,
    scheduleMedReminder,
  };
}
