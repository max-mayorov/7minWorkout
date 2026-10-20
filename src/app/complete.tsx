import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Icon, StatTile } from '../components/ui';
import { formatClock } from '../lib/dates';
import { displayToKg, kgToDisplay } from '../lib/units';
import { latestWeightKg, useStore } from '../state/store';
import { colors, spacing } from '../theme';

export default function CompleteScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const store = useStore();
  const { sessions, settings, logWeight } = store;
  const insets = useSafeAreaInsets();
  const session = sessions.find((s) => s.id === sessionId);
  const lastKg = latestWeightKg(store);
  const [weightText, setWeightText] = useState(
    lastKg ? String(kgToDisplay(lastKg, settings.units)) : '',
  );
  const [weightSaved, setWeightSaved] = useState(false);

  const done = () => router.dismissTo('/');

  const saveWeight = () => {
    const value = Number(weightText.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) return;
    logWeight(displayToKg(value, settings.units));
    setWeightSaved(true);
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.primary }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl, paddingBottom: insets.bottom + spacing.lg }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.trophy}>
        <Icon name="trophy" size={56} color={colors.white} />
      </View>
      <Text style={styles.title}>{session?.completed === false ? 'Good effort!' : 'Workout complete!'}</Text>
      <Text style={styles.subtitle}>{session?.title}</Text>

      {session && (
        <Card style={styles.stats}>
          <StatTile icon="timer-outline" value={formatClock(session.durationSec)} label="Duration" />
          <StatTile
            icon="format-list-checks"
            value={`${session.exercisesDone}/${session.exercisesTotal}`}
            label="Exercises"
          />
          <StatTile icon="fire" value={`${session.kcal}`} label="kcal (est.)" />
        </Card>
      )}

      <Card style={styles.weightCard}>
        <Text style={styles.weightTitle}>Log today’s weight</Text>
        <View style={styles.weightRow}>
          <TextInput
            value={weightText}
            onChangeText={(t) => {
              setWeightText(t);
              setWeightSaved(false);
            }}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Text style={styles.unit}>{settings.units === 'kg' ? 'kg' : 'lbs'}</Text>
          <Button
            title={weightSaved ? 'Saved' : 'Save'}
            icon={weightSaved ? 'check' : undefined}
            variant="secondary"
            onPress={saveWeight}
          />
        </View>
      </Card>

      <Button title="Done" icon="check" onPress={done} style={styles.doneButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, alignItems: 'center', gap: spacing.md, flexGrow: 1 },
  trophy: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: colors.white, fontSize: 30, fontWeight: '900', marginTop: spacing.sm },
  subtitle: { color: colors.primarySoft, fontSize: 16 },
  stats: { flexDirection: 'row', alignSelf: 'stretch', marginTop: spacing.md },
  weightCard: { alignSelf: 'stretch', gap: spacing.sm },
  weightTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: 6,
  },
  unit: { fontSize: 16, color: colors.textMuted, marginRight: spacing.sm },
  doneButton: { alignSelf: 'stretch', marginTop: 'auto' },
});
