import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExerciseFigure } from '../../components/ExerciseFigure';
import { Button, Card, Icon, SectionTitle } from '../../components/ui';
import { getExercise } from '../../data/exercises';
import { CLASSIC_ID, planDurationSec, resolvePlan } from '../../lib/plans';
import { useStore } from '../../state/store';
import { colors, spacing } from '../../theme';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { settings, customWorkouts } = useStore();
  const plan = resolvePlan(id, settings, customWorkouts);
  const isCustom = customWorkouts.some((w) => w.id === id);

  if (!plan) {
    return (
      <View style={styles.empty}>
        <Text style={styles.muted}>This workout no longer exists.</Text>
      </View>
    );
  }

  const minutes = Math.max(1, Math.round(planDurationSec(plan) / 60));

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: plan.title,
          headerRight: isCustom
            ? () => (
                <Pressable accessibilityLabel="Edit workout" hitSlop={10} onPress={() => router.push(`/custom/${id}`)}>
                  <Icon name="pencil" color={colors.white} />
                </Pressable>
              )
            : undefined,
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.metaRow}>
          <Meta icon="timer-outline" value={`${minutes} min`} />
          <Meta icon="format-list-numbered" value={`${plan.exerciseIds.length} exercises`} />
          <Meta icon="repeat" value={`${plan.rounds} × circuit`} />
        </View>
        <Text style={styles.muted}>
          {plan.workSec}s per exercise · {plan.restSec}s rest between exercises
        </Text>

        {id === CLASSIC_ID && <ClassicIntro />}

        <SectionTitle>Exercises</SectionTitle>
        <Card style={styles.list}>
          {plan.exerciseIds.map((exerciseId, index) => {
            const exercise = getExercise(exerciseId);
            return (
              <Pressable
                key={`${exerciseId}-${index}`}
                onPress={() => router.push(`/exercise/${exerciseId}`)}
                style={({ pressed }) => [styles.item, index > 0 && styles.itemBorder, pressed && { opacity: 0.6 }]}
              >
                <View style={styles.thumb}>
                  <ExerciseFigure exerciseId={exerciseId} size={64} playing={false} />
                </View>
                <View style={styles.itemText}>
                  <Text style={styles.itemName}>
                    {index + 1}. {exercise.name}
                  </Text>
                  <Text style={styles.muted}>
                    {exercise.focus} · {plan.workSec}s
                  </Text>
                </View>
                <Icon name="information-outline" color={colors.primary} />
              </Pressable>
            );
          })}
        </Card>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Start" icon="play" onPress={() => router.push(`/player/${id}`)} />
      </View>
    </View>
  );
}

function Meta({ icon, value }: { icon: 'timer-outline' | 'format-list-numbered' | 'repeat'; value: string }) {
  return (
    <View style={styles.meta}>
      <Icon name={icon} color={colors.accent} size={20} />
      <Text style={styles.metaText}>{value}</Text>
    </View>
  );
}

function ClassicIntro() {
  return (
    <>
      <SectionTitle>What is the 7 minute workout?</SectionTitle>
      <Card style={styles.intro}>
        <Text style={styles.body}>
          A circuit of 13 bodyweight exercises based on high-intensity circuit training (HICT). Each
          exercise lasts 30 seconds with a 10-second rest, so one circuit takes about 7 minutes.
        </Text>
        <Text style={styles.body}>
          The order alternates between upper body, lower body and core so one muscle group rests
          while another works. All you need is a chair and a wall.
        </Text>
        <Text style={styles.body}>
          Short on time? One circuit still gets your heart going. For a fuller workout, repeat the
          circuit 2–3 times — change “Repeat circuits” in Settings.
        </Text>
        <View style={styles.tip}>
          <Icon name="alert-circle-outline" color={colors.accentDark} size={18} />
          <Text style={styles.tipText}>
            Check with a doctor before starting a new exercise programme, and stop if you feel pain.
          </Text>
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.md, paddingBottom: 110 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 15, fontWeight: '700', color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted },
  intro: { gap: spacing.sm },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  tip: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentLight,
    padding: spacing.sm,
    borderRadius: 8,
  },
  tipText: { flex: 1, fontSize: 13, color: colors.accentDark, lineHeight: 18 },
  list: { paddingVertical: 0 },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  thumb: { backgroundColor: colors.primaryLight, borderRadius: 10, padding: 2 },
  itemText: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 2 },
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
