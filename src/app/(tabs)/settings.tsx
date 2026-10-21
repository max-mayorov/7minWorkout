import Constants from 'expo-constants';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Card,
  PressableRow,
  SectionTitle,
  Segmented,
  StepperRow,
  SwitchRow,
} from '../../components/ui';
import { say } from '../../lib/coach';
import { formatTimeOfDay, WEEKDAY_SHORT } from '../../lib/dates';
import { ensureNotificationPermission } from '../../lib/reminders';
import { cmToFeetInches, feetInchesToCm, formatHeight } from '../../lib/units';
import { useStore } from '../../state/store';
import type { Reminder, Units } from '../../state/types';
import { colors, spacing } from '../../theme';

const seconds = (v: number) => `${v} s`;

export default function SettingsScreen() {
  const { settings, updateSettings, resetChallenge, clearHistory } = useStore();
  const reminder = settings.reminder;

  const setReminder = (patch: Partial<Reminder>) =>
    updateSettings({ reminder: { ...reminder, ...patch } });

  const toggleReminder = async (enabled: boolean) => {
    if (!enabled) {
      setReminder({ enabled: false });
      return;
    }
    const granted = await ensureNotificationPermission().catch(() => false);
    if (granted) setReminder({ enabled: true });
    else Alert.alert('Notifications are off', 'Allow notifications for this app in system settings to get reminders.');
  };

  const toggleWeekday = (weekday: number) => {
    const has = reminder.weekdays.includes(weekday);
    const weekdays = has
      ? reminder.weekdays.filter((d) => d !== weekday)
      : [...reminder.weekdays, weekday].sort((a, b) => a - b);
    setReminder({ weekdays });
  };

  const confirm = (title: string, message: string, onConfirm: () => void) =>
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: onConfirm },
    ]);

  const heightInches = settings.heightCm ? Math.round(settings.heightCm / 2.54) : 67;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle>Workout</SectionTitle>
      <Card style={styles.card}>
        <StepperRow
          label="Repeat circuits"
          icon="repeat"
          value={settings.rounds}
          min={1}
          max={6}
          format={(v) => `${v}×`}
          onChange={(rounds) => updateSettings({ rounds })}
        />
        <StepperRow
          label="Exercise time"
          icon="timer-outline"
          value={settings.workSec}
          min={10}
          max={120}
          step={5}
          format={seconds}
          onChange={(workSec) => updateSettings({ workSec })}
        />
        <StepperRow
          label="Rest time"
          icon="coffee-outline"
          value={settings.restSec}
          min={0}
          max={60}
          step={5}
          format={seconds}
          onChange={(restSec) => updateSettings({ restSec })}
        />
        <StepperRow
          label="Get-ready countdown"
          icon="timer-sand"
          value={settings.countdownSec}
          min={0}
          max={30}
          step={5}
          format={seconds}
          onChange={(countdownSec) => updateSettings({ countdownSec })}
        />
      </Card>

      <SectionTitle>Coach</SectionTitle>
      <Card style={styles.card}>
        <SwitchRow
          label="Sound & vibration"
          icon="volume-high"
          value={settings.sound}
          onChange={(sound) => updateSettings({ sound })}
        />
        <SwitchRow
          label="Voice guidance"
          icon="account-voice"
          value={settings.voice}
          onChange={(voice) => updateSettings({ voice })}
        />
        <PressableRow
          label="Test voice"
          icon="play-circle-outline"
          onPress={() => say('Ready to go! Start with jumping jacks.')}
        />
      </Card>

      <SectionTitle>Reminders</SectionTitle>
      <Card style={styles.card}>
        <SwitchRow
          label="Remind me to work out"
          icon="bell-ring-outline"
          value={reminder.enabled}
          onChange={toggleReminder}
        />
        {reminder.enabled && (
          <>
            <StepperRow
              label="Hour"
              icon="clock-outline"
              value={reminder.hour}
              min={0}
              max={23}
              format={(h) => formatTimeOfDay(h, reminder.minute)}
              onChange={(hour) => setReminder({ hour })}
            />
            <StepperRow
              label="Minute"
              icon="clock-time-eight-outline"
              value={reminder.minute}
              min={0}
              max={55}
              step={5}
              format={(m) => `:${String(m).padStart(2, '0')}`}
              onChange={(minute) => setReminder({ minute })}
            />
            <View style={styles.days}>
              {WEEKDAY_SHORT.map((label, i) => {
                const weekday = i + 1;
                const active = reminder.weekdays.includes(weekday);
                return (
                  <Pressable
                    key={label}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={label}
                    onPress={() => toggleWeekday(weekday)}
                    style={[styles.day, active && styles.dayActive]}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{label.charAt(0)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </Card>

      <SectionTitle>Profile</SectionTitle>
      <Card style={styles.card}>
        <View style={styles.unitsRow}>
          <Text style={styles.label}>Units</Text>
          <View style={styles.segmented}>
            <Segmented<Units>
              options={[
                { value: 'kg', label: 'kg, cm' },
                { value: 'lb', label: 'lbs, ft' },
              ]}
              value={settings.units}
              onChange={(units) => updateSettings({ units })}
            />
          </View>
        </View>
        {settings.heightCm === null ? (
          <PressableRow
            label="Set your height"
            icon="human-male-height"
            detail="for BMI"
            onPress={() => updateSettings({ heightCm: 170 })}
          />
        ) : settings.units === 'kg' ? (
          <StepperRow
            label="Height"
            icon="human-male-height"
            value={settings.heightCm}
            min={100}
            max={230}
            format={(cm) => formatHeight(cm, 'kg')}
            onChange={(heightCm) => updateSettings({ heightCm })}
          />
        ) : (
          <StepperRow
            label="Height"
            icon="human-male-height"
            value={heightInches}
            min={40}
            max={90}
            format={(inches) => {
              const { feet, inches: rest } = cmToFeetInches(inches * 2.54);
              return `${feet}′ ${rest}″`;
            }}
            onChange={(inches) =>
              updateSettings({ heightCm: feetInchesToCm(Math.floor(inches / 12), inches % 12) })
            }
          />
        )}
      </Card>

      <SectionTitle>Data</SectionTitle>
      <Card style={styles.card}>
        <PressableRow
          label="Restart 30 day challenge"
          icon="restart"
          onPress={() =>
            confirm('Restart challenge?', 'Your challenge progress will be cleared.', resetChallenge)
          }
        />
        <PressableRow
          label="Clear workout & weight history"
          icon="delete-outline"
          color={colors.danger}
          onPress={() =>
            confirm('Clear history?', 'All workout sessions and weight entries will be deleted.', clearHistory)
          }
        />
      </Card>

      <Text style={styles.version}>
        7 Minute Workout · v{Constants.expoConfig?.version ?? '1.0.0'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { paddingVertical: spacing.xs },
  days: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  day: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayText: { fontWeight: '700', color: colors.primary },
  dayTextActive: { color: colors.white },
  unitsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: spacing.md },
  label: { fontSize: 16, color: colors.text, flex: 1 },
  segmented: { width: 180 },
  version: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.lg, fontSize: 13 },
});
