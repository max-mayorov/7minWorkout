import { useKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { BackHandler, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExerciseFigure } from '../../components/ExerciseFigure';
import { Button, Icon, ProgressRing, type IconName } from '../../components/ui';
import { getExercise } from '../../data/exercises';
import { estimateKcal } from '../../lib/engine';
import { parseChallengeDay, resolvePlan } from '../../lib/plans';
import { usePlayer } from '../../lib/usePlayer';
import { latestWeightKg, useStore } from '../../state/store';
import type { Session } from '../../state/types';
import { colors, radius, spacing } from '../../theme';

const DEFAULT_WEIGHT_KG = 70;

export default function PlayerScreen() {
  useKeepAwake();
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const { settings, customWorkouts, updateSettings, addSession, toggleChallengeDay } = store;
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  // Freeze the plan for the whole session so settings tweaks don't reshape a running workout.
  const plan = useMemo(
    () => resolvePlan(id, settings, customWorkouts),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );
  const { timeline, total, snapshot, pause, resume, next, previous, result } = usePlayer(plan, {
    sound: settings.sound,
    voice: settings.voice,
  });
  const savedRef = useRef(false);

  const saveSession = (): Session | null => {
    if (savedRef.current || !plan) return null;
    const r = result();
    if (r.exercisesDone === 0) return null;
    savedRef.current = true;
    const session: Session = {
      id: `${r.startedAt.toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      workoutId: plan.id,
      title: plan.title,
      startedAt: r.startedAt,
      durationSec: r.activeSec,
      pauses: r.pauses,
      exercisesDone: r.exercisesDone,
      exercisesTotal: r.exercisesTotal,
      roundsTotal: plan.rounds,
      kcal: estimateKcal(timeline, r.workSeconds, latestWeightKg(store) ?? DEFAULT_WEIGHT_KG),
      completed: r.completed,
    };
    addSession(session);
    const challengeDay = parseChallengeDay(plan.id);
    if (challengeDay !== null && r.completed) toggleChallengeDay(challengeDay, true);
    return session;
  };

  useEffect(() => {
    if (!snapshot.finished || !plan) return;
    const session = saveSession();
    router.replace(session ? `/complete?sessionId=${session.id}` : '/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot.finished]);

  // Android back pauses the workout instead of silently leaving it.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      pause();
      return true;
    });
    return () => sub.remove();
  }, [pause]);

  const quit = () => {
    saveSession();
    router.back();
  };

  if (!plan) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.missing}>This workout isn’t available.</Text>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const phase = snapshot.phase ?? timeline[0];
  if (!phase) return null;
  const exercise = getExercise(phase.exerciseId);
  const isWork = phase.kind === 'work';
  const secLeft = Math.ceil(snapshot.remainingMs / 1000);
  const progress = 1 - snapshot.remainingMs / (phase.durationSec * 1000);
  const figureSize = Math.min(width - 80, height * 0.32, 320);
  const itemsPerRound = plan.exerciseIds.length;
  const overallNumber = (phase.round - 1) * itemsPerRound + phase.itemIndex + 1;

  const fg = isWork ? colors.text : colors.white;
  const muted = isWork ? colors.textMuted : colors.primarySoft;

  return (
    <View
      style={[
        styles.screen,
        { backgroundColor: isWork ? colors.bg : colors.primary, paddingTop: insets.top + spacing.sm, paddingBottom: insets.bottom + spacing.md },
      ]}
    >
      <View style={styles.topBar}>
        <IconButton icon="close" color={fg} label="Pause and show options" onPress={pause} />
        <View style={styles.topCenter}>
          {plan.rounds > 1 && (
            <Text style={[styles.round, { color: muted }]}>
              Round {phase.round}/{plan.rounds}
            </Text>
          )}
          <Text style={[styles.counter, { color: fg }]}>
            {phase.itemIndex + 1}/{itemsPerRound}
          </Text>
        </View>
        <IconButton
          icon={settings.sound ? 'volume-high' : 'volume-off'}
          color={fg}
          label={settings.sound ? 'Mute beeps' : 'Unmute beeps'}
          onPress={() => updateSettings({ sound: !settings.sound })}
        />
        <IconButton
          icon={settings.voice ? 'account-voice' : 'account-voice-off'}
          color={fg}
          label={settings.voice ? 'Turn voice off' : 'Turn voice on'}
          onPress={() => updateSettings({ voice: !settings.voice })}
        />
      </View>

      <View style={styles.segments}>
        {Array.from({ length: itemsPerRound }, (_, i) => {
          const done = i < phase.itemIndex || (i === phase.itemIndex && isWork && progress >= 1);
          const current = i === phase.itemIndex;
          return (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: isWork ? colors.border : 'rgba(255,255,255,0.25)' },
                done && { backgroundColor: colors.accent },
                current && !done && { backgroundColor: isWork ? colors.accent : colors.white, opacity: 0.6 },
              ]}
            />
          );
        })}
      </View>

      <View style={styles.titleBlock}>
        <Text style={[styles.kicker, { color: isWork ? colors.accent : colors.accentLight }]}>
          {phase.kind === 'ready' ? 'READY TO GO!' : phase.kind === 'rest' ? 'REST' : `EXERCISE ${overallNumber} OF ${total}`}
        </Text>
        <Pressable
          onPress={() => {
            pause();
            router.push(`/exercise/${exercise.id}`);
          }}
          style={styles.nameRow}
        >
          <Text style={[styles.name, { color: fg }]} numberOfLines={2}>
            {phase.kind === 'work' ? exercise.name : `Next: ${exercise.name}`}
          </Text>
          <Icon name="information-outline" color={isWork ? colors.primary : colors.white} />
        </Pressable>
      </View>

      <View style={[styles.figureCard, { width: figureSize + 24 }]}>
        <ExerciseFigure exerciseId={exercise.id} size={figureSize} playing={!snapshot.paused} />
      </View>

      <ProgressRing
        size={128}
        stroke={10}
        progress={progress}
        color={colors.accent}
        trackColor={isWork ? colors.border : 'rgba(255,255,255,0.25)'}
      >
        <Text style={[styles.seconds, { color: fg }]}>{secLeft}</Text>
        <Text style={[styles.secondsUnit, { color: muted }]}>sec</Text>
      </ProgressRing>

      <View style={styles.controls}>
        <IconButton icon="skip-previous" color={fg} size={34} label="Previous exercise" onPress={previous} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={snapshot.paused ? 'Resume' : 'Pause'}
          onPress={snapshot.paused ? resume : pause}
          style={({ pressed }) => [styles.playButton, pressed && { transform: [{ scale: 0.95 }] }]}
        >
          <Icon name={snapshot.paused ? 'play' : 'pause'} size={40} color={colors.white} />
        </Pressable>
        <IconButton icon="skip-next" color={fg} size={34} label="Next exercise" onPress={next} />
      </View>

      {snapshot.paused && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <View style={styles.pauseCard}>
            <Text style={styles.pausedTitle}>PAUSED</Text>
            <Text style={styles.pausedSub}>
              Exercise {overallNumber} of {total} · {exercise.name}
            </Text>
            <Button title="Resume" icon="play" onPress={resume} style={styles.fullWidth} />
            <Button
              title="Quit workout"
              icon="exit-to-app"
              variant="danger"
              onPress={quit}
              style={styles.fullWidth}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function IconButton({
  icon,
  color,
  label,
  onPress,
  size = 26,
}: {
  icon: IconName;
  color: string;
  label: string;
  onPress: () => void;
  size?: number;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} hitSlop={10} onPress={onPress} style={styles.iconButton}>
      <Icon name={icon} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  missing: { fontSize: 16, color: colors.textMuted },
  topBar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  topCenter: { flex: 1, alignItems: 'center' },
  round: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  counter: { fontSize: 17, fontWeight: '800' },
  iconButton: { padding: 6 },
  segments: { flexDirection: 'row', gap: 4, alignSelf: 'stretch' },
  segment: { flex: 1, height: 5, borderRadius: 3 },
  titleBlock: { alignItems: 'center', marginTop: spacing.sm, gap: 4 },
  kicker: { fontSize: 14, fontWeight: '800', letterSpacing: 1.5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md },
  name: { fontSize: 26, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  figureCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    alignItems: 'center',
    paddingVertical: 8,
  },
  seconds: { fontSize: 44, fontWeight: '800', lineHeight: 48 },
  secondsUnit: { fontSize: 13, fontWeight: '600' },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: 'auto',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accentDark,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  overlay: {
    backgroundColor: 'rgba(18,56,114,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  pauseCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: spacing.md,
  },
  pausedTitle: { fontSize: 32, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  pausedSub: { fontSize: 15, color: colors.textMuted, marginBottom: spacing.sm },
  fullWidth: { alignSelf: 'stretch' },
});
