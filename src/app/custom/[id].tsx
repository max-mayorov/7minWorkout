import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExerciseFigure } from '../../components/ExerciseFigure';
import { Button, Card, Icon, SectionTitle, StepperRow } from '../../components/ui';
import { exercises, getExercise } from '../../data/exercises';
import { formatClock } from '../../lib/dates';
import { useStore } from '../../state/store';
import type { CustomWorkout } from '../../state/types';
import { colors, spacing } from '../../theme';

const newId = () => `custom-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function CustomWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { customWorkouts, settings, saveCustomWorkout, deleteCustomWorkout } = useStore();
  const existing = customWorkouts.find((w) => w.id === id);

  const [draft, setDraft] = useState<CustomWorkout>(
    () =>
      existing ?? {
        id: newId(),
        name: '',
        exerciseIds: [],
        workSec: settings.workSec,
        restSec: settings.restSec,
        rounds: settings.rounds,
      },
  );
  const update = (patch: Partial<CustomWorkout>) => setDraft((d) => ({ ...d, ...patch }));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= draft.exerciseIds.length) return;
    const ids = [...draft.exerciseIds];
    [ids[index], ids[target]] = [ids[target], ids[index]];
    update({ exerciseIds: ids });
  };
  const remove = (index: number) =>
    update({ exerciseIds: draft.exerciseIds.filter((_, i) => i !== index) });
  const add = (exerciseId: string) => update({ exerciseIds: [...draft.exerciseIds, exerciseId] });

  const sets = draft.exerciseIds.length * draft.rounds;
  const totalSec = sets * draft.workSec + Math.max(0, sets - 1) * draft.restSec;
  const canSave = draft.name.trim().length > 0 && draft.exerciseIds.length > 0;

  const save = () => {
    if (!canSave) return;
    saveCustomWorkout({ ...draft, name: draft.name.trim() });
    router.back();
  };

  const confirmDelete = () =>
    Alert.alert('Delete workout?', `“${draft.name}” will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCustomWorkout(draft.id);
          router.dismissTo('/');
        },
      },
    ]);

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: existing ? 'Edit Workout' : 'New Workout' }} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <TextInput
            value={draft.name}
            onChangeText={(name) => update({ name })}
            placeholder="Workout name"
            placeholderTextColor={colors.textMuted}
            style={styles.nameInput}
            maxLength={40}
          />
          <StepperRow
            label="Exercise time"
            icon="timer-outline"
            value={draft.workSec}
            min={10}
            max={120}
            step={5}
            format={(v) => `${v} s`}
            onChange={(workSec) => update({ workSec })}
          />
          <StepperRow
            label="Rest time"
            icon="coffee-outline"
            value={draft.restSec}
            min={0}
            max={60}
            step={5}
            format={(v) => `${v} s`}
            onChange={(restSec) => update({ restSec })}
          />
          <StepperRow
            label="Circuits"
            icon="repeat"
            value={draft.rounds}
            min={1}
            max={6}
            format={(v) => `${v}×`}
            onChange={(rounds) => update({ rounds })}
          />
        </Card>

        <SectionTitle>
          In this workout · {draft.exerciseIds.length} · {formatClock(totalSec)}
        </SectionTitle>
        <Card style={styles.list}>
          {draft.exerciseIds.length === 0 && (
            <Text style={styles.muted}>Add exercises from the list below.</Text>
          )}
          {draft.exerciseIds.map((exerciseId, index) => (
            <View key={`${exerciseId}-${index}`} style={[styles.row, index > 0 && styles.rowBorder]}>
              <Text style={styles.index}>{index + 1}</Text>
              <Text style={styles.rowName} numberOfLines={1}>
                {getExercise(exerciseId).name}
              </Text>
              <SmallButton icon="arrow-up" label="Move up" disabled={index === 0} onPress={() => move(index, -1)} />
              <SmallButton
                icon="arrow-down"
                label="Move down"
                disabled={index === draft.exerciseIds.length - 1}
                onPress={() => move(index, 1)}
              />
              <SmallButton icon="close" label="Remove" danger onPress={() => remove(index)} />
            </View>
          ))}
        </Card>

        <SectionTitle>Add exercises</SectionTitle>
        <Card style={styles.list}>
          {exercises.map((exercise, index) => (
            <Pressable
              key={exercise.id}
              onPress={() => add(exercise.id)}
              style={({ pressed }) => [styles.row, index > 0 && styles.rowBorder, pressed && { opacity: 0.6 }]}
            >
              <View style={styles.thumb}>
                <ExerciseFigure exerciseId={exercise.id} size={44} playing={false} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.rowName}>{exercise.name}</Text>
                <Text style={styles.muted}>{exercise.focus}</Text>
              </View>
              <Icon name="plus-circle" color={colors.accent} size={28} />
            </Pressable>
          ))}
        </Card>

        {existing && (
          <Button title="Delete workout" variant="danger" icon="trash-can-outline" onPress={confirmDelete} style={styles.delete} />
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Save" icon="content-save" disabled={!canSave} onPress={save} />
      </View>
    </View>
  );
}

function SmallButton({
  icon,
  label,
  onPress,
  disabled,
  danger,
}: {
  icon: 'arrow-up' | 'arrow-down' | 'close';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      hitSlop={6}
      disabled={disabled}
      onPress={onPress}
      style={[styles.small, disabled && { opacity: 0.3 }]}
    >
      <Icon name={icon} size={18} color={danger ? colors.danger : colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 110 },
  nameInput: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: 8,
    marginBottom: spacing.sm,
  },
  list: { paddingVertical: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10 },
  rowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  index: { width: 24, fontWeight: '800', color: colors.accent },
  rowName: { flex: 1, fontSize: 16, color: colors.text, fontWeight: '600' },
  muted: { fontSize: 13, color: colors.textMuted, paddingVertical: 6 },
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: { backgroundColor: colors.primaryLight, borderRadius: 8 },
  flex: { flex: 1 },
  delete: { marginTop: spacing.lg },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: 'rgba(244,246,251,0.95)',
  },
});
