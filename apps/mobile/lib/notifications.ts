// TODO: Import from expo-notifications when the package is installed
// import * as Notifications from 'expo-notifications';

export async function requestPermission(): Promise<boolean> {
  // TODO: Replace with real expo-notifications implementation
  // const { status } = await Notifications.requestPermissionsAsync();
  // return status === 'granted';
  console.log("[Notifications] requestPermission called — stub");
  return true;
}

export function scheduleWeeklyCheckinReminder(): void {
  // TODO: Replace with real expo-notifications implementation
  // Notifications.scheduleNotificationAsync({
  //   content: { title: 'Weekly Check-in', body: 'Time for your weekly health check-in!' },
  //   trigger: { weekday: 1, hour: 18, minute: 0, repeats: true },
  // });
  console.log(
    "[Notifications] scheduleWeeklyCheckinReminder — Sunday 6 PM weekly",
  );
}

export function scheduleMedicationReminder(time: string): void {
  // TODO: Replace with real expo-notifications implementation
  // const [hour, minute] = time.split(':').map(Number);
  // Notifications.scheduleNotificationAsync({
  //   content: { title: 'Medication Reminder', body: 'Time to take your medication.' },
  //   trigger: { hour, minute, repeats: true },
  // });
  console.log(
    `[Notifications] scheduleMedicationReminder — daily at ${time}`,
  );
}

export function scheduleLabFollowUp(date: Date, testName: string): void {
  // TODO: Replace with real expo-notifications implementation
  // Notifications.scheduleNotificationAsync({
  //   content: { title: 'Lab Follow-up', body: `Time to schedule your ${testName} test.` },
  //   trigger: date,
  // });
  console.log(
    `[Notifications] scheduleLabFollowUp — ${testName} on ${date.toISOString()}`,
  );
}

export function cancelAll(): void {
  // TODO: Replace with real expo-notifications implementation
  // Notifications.cancelAllScheduledNotificationsAsync();
  console.log("[Notifications] cancelAll — stub");
}
