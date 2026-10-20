import * as Notifications from 'expo-notifications';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import { syncReminders } from '../lib/reminders';
import { StoreProvider, useStore } from '../state/store';
import { colors } from '../theme';

// Screens read saved data when they mount, so keep the splash up until it has loaded.
SplashScreen.preventAutoHideAsync().catch(() => {});

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Keeps scheduled reminders in step with the saved reminder settings.
function ReminderSync() {
  const { loaded, settings } = useStore();
  const key = JSON.stringify(settings.reminder);
  const lastKey = useRef<string | null>(null);
  useEffect(() => {
    if (!loaded || lastKey.current === key) return;
    lastKey.current = key;
    syncReminders(settings.reminder).catch(() => {});
  }, [loaded, key, settings.reminder]);
  return null;
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <StatusBar style="light" />
      <ReminderSync />
      <AppStack />
    </StoreProvider>
  );
}

function AppStack() {
  const { loaded } = useStore();
  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);
  if (!loaded) return null;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="workout/[id]" options={{ title: 'Workout' }} />
      <Stack.Screen name="exercise/[id]" options={{ title: 'Exercise', presentation: 'modal' }} />
      <Stack.Screen
        name="player/[id]"
        options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
      />
      <Stack.Screen name="complete" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="challenge" options={{ title: '30 Day Challenge' }} />
      <Stack.Screen name="custom/[id]" options={{ title: 'My Workout' }} />
      <Stack.Screen name="weight" options={{ title: 'Log Weight', presentation: 'modal' }} />
    </Stack>
  );
}
