import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { Platform } from 'react-native';

import type { Reminder } from '../state/types';

const CHANNEL_ID = 'workout-reminders';
const REMINDER_KIND = 'workout-reminder';

const messages = [
  'Seven minutes is all it takes. Ready for today’s workout?',
  'Your body will thank you — time for a quick circuit!',
  'Keep the streak alive: 7 minutes, 13 exercises, let’s go!',
];

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Workout reminders',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7A1A',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Replaces every previously scheduled reminder with one weekly trigger per selected day.
export async function syncReminders(reminder: Reminder): Promise<void> {
  if (Platform.OS === 'web') return;
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === REMINDER_KIND)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
  if (!reminder.enabled) return;

  await Promise.all(
    reminder.weekdays.map((weekday, i) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: '7 Minute Workout',
          body: messages[i % messages.length],
          data: { kind: REMINDER_KIND },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          channelId: CHANNEL_ID,
          weekday,
          hour: reminder.hour,
          minute: reminder.minute,
        },
      }),
    ),
  );
}
