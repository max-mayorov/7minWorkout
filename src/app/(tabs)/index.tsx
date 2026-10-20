import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExerciseFigure } from '../../components/ExerciseFigure';
import { Button, Card, Icon, SectionTitle } from '../../components/ui';
import { CHALLENGE_DAYS, getChallengeDay, nextChallengeDay } from '../../data/challenge';
import { currentStreak, toDateKey } from '../../lib/dates';
import { CLASSIC_ID, challengeWorkoutId, planDurationSec, resolvePlan } from '../../lib/plans';
import { formatWeight } from '../../lib/units';
import { latestWeightKg, useStore } from '../../state/store';
import { colors, radius, spacing } from '../../theme';

export default function WorkoutsScreen() {
  const store = useStore();
  const { settings, sessions, customWorkouts, challengeCompletedDays } = store;

  const classic = resolvePlan(CLASSIC_ID, settings, customWorkouts);
  const classicMinutes = classic ? Math.round(planDurationSec(classic) / 60) : 7;

  const dayKeys = new Set(sessions.map((s) => toDateKey(s.startedAt)));
  const streak = currentStreak(dayKeys);
  // Refreshed whenever the tab gains focus so the 7-day window stays current.
  const [now, setNow] = useState(() => Date.now());
  useFocusEffect(useCallback(() => setNow(Date.now()), []));
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const thisWeek = sessions.filter((s) => s.startedAt >= weekAgo).length;
  const weekMinutes = Math.round(
    sessions.filter((s) => s.startedAt >= weekAgo).reduce((sum, s) => sum + s.durationSec, 0) / 60,
  );

  const nextDay = nextChallengeDay(challengeCompletedDays);
  const nextDayPlan = nextDay ? getChallengeDay(nextDay) : null;
  const weightKg = latestWeightKg(store);

  const startChallenge = () => {
    if (!nextDayPlan || nextDayPlan.rest) router.push('/challenge');
    else router.push(`/player/${challengeWorkoutId(nextDayPlan.day)}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <HeroStat value={String(streak)} label={streak === 1 ? 'day streak' : 'days streak'} icon="fire" />
        <View style={styles.heroDivider} />
        <HeroStat value={String(thisWeek)} label="workouts / 7d" icon="check-circle-outline" />
        <View style={styles.heroDivider} />
        <HeroStat value={String(weekMinutes)} label="minutes / 7d" icon="timer-outline" />
      </View>

      <Pressable onPress={() => router.push('/weight')}>
        <Card style={styles.weightCard}>
          <View style={styles.weightIcon}>
            <Icon name="scale-bathroom" color={colors.primary} />
          </View>
          <Text style={[styles.weightText, !weightKg && styles.weightPlaceholder]}>
            {weightKg ? formatWeight(weightKg, settings.units) : 'Log your weight'}
          </Text>
          <Icon name="plus-circle" color={colors.accent} size={26} />
        </Card>
      </Pressable>

      <Card style={styles.programCard}>
        <View style={[styles.banner, { backgroundColor: colors.primary }]}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerKicker}>CLASSIC</Text>
            <Text style={styles.bannerTitle}>7 Minute Workout</Text>
            <Text style={styles.bannerMeta}>
              13 exercises · {classicMinutes} min · {settings.rounds}{' '}
              {settings.rounds === 1 ? 'circuit' : 'circuits'}
            </Text>
          </View>
          <View style={styles.bannerFigure}>
            <ExerciseFigure exerciseId="jumping_jacks" size={120} />
          </View>
        </View>
        <Text style={styles.programBody}>
          High-intensity circuit training using just your body weight, a chair and a wall.
        </Text>
        <View style={styles.actions}>
          <Button
            title="Instructions"
            variant="secondary"
            icon="format-list-bulleted"
            onPress={() => router.push(`/workout/${CLASSIC_ID}`)}
            style={styles.flex}
          />
          <Button
            title="Start"
            icon="play"
            onPress={() => router.push(`/player/${CLASSIC_ID}`)}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card style={styles.programCard}>
        <View style={[styles.banner, { backgroundColor: colors.accent }]}>
          <View style={styles.bannerText}>
            <Text style={styles.bannerKicker}>FULL BODY</Text>
            <Text style={styles.bannerTitle}>30 Day Challenge</Text>
            <Text style={styles.bannerMeta}>
              {nextDay ? `Day ${nextDay}${nextDayPlan?.rest ? ' · Rest day' : ''}` : 'Completed!'}
            </Text>
          </View>
          <View style={styles.trophy}>
            <Icon name="trophy" size={64} color={colors.white} />
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${(challengeCompletedDays.length / CHALLENGE_DAYS) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.programBody}>
          {challengeCompletedDays.length}/{CHALLENGE_DAYS} days complete. Intensity increases each
          week.
        </Text>
        <View style={styles.actions}>
          <Button
            title="Plan"
            variant="secondary"
            icon="calendar-month"
            onPress={() => router.push('/challenge')}
            style={styles.flex}
          />
          <Button
            title={nextDayPlan?.rest ? 'Rest day' : 'Start'}
            icon={nextDayPlan?.rest ? 'coffee' : 'play'}
            disabled={!nextDay}
            onPress={startChallenge}
            style={styles.flex}
          />
        </View>
      </Card>

      <SectionTitle>My workouts</SectionTitle>
      {customWorkouts.map((workout) => {
        const plan = resolvePlan(workout.id, settings, customWorkouts);
        return (
          <Card key={workout.id} style={styles.customCard}>
            <Pressable style={styles.customInfo} onPress={() => router.push(`/workout/${workout.id}`)}>
              <Text style={styles.customTitle}>{workout.name}</Text>
              <Text style={styles.customMeta}>
                {workout.exerciseIds.length} exercises
                {plan ? ` · ${Math.max(1, Math.round(planDurationSec(plan) / 60))} min` : ''}
              </Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Start ${workout.name}`}
              disabled={!plan}
              onPress={() => router.push(`/player/${workout.id}`)}
              style={styles.playButton}
            >
              <Icon name="play" color={colors.white} />
            </Pressable>
          </Card>
        );
      })}
      <Button
        title="Create a workout"
        variant="ghost"
        icon="plus"
        onPress={() => router.push('/custom/new')}
      />
    </ScrollView>
  );
}

function HeroStat({ value, label, icon }: { value: string; label: string; icon: 'fire' | 'check-circle-outline' | 'timer-outline' }) {
  return (
    <View style={styles.heroStat}>
      <Icon name={icon} color={colors.accent} size={20} />
      <Text style={styles.heroValue}>{value}</Text>
      <Text style={styles.heroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.md },
  hero: {
    flexDirection: 'row',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: 2 },
  heroValue: { color: colors.white, fontSize: 22, fontWeight: '800' },
  heroLabel: { color: colors.primarySoft, fontSize: 12 },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  weightCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  weightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightText: { flex: 1, fontSize: 20, fontWeight: '600', color: colors.primary },
  weightPlaceholder: { color: colors.textMuted, fontWeight: '400', fontSize: 17 },
  programCard: { padding: 0, overflow: 'hidden' },
  banner: { flexDirection: 'row', alignItems: 'center', minHeight: 130, paddingLeft: spacing.md },
  bannerText: { flex: 1, gap: 2 },
  bannerKicker: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  bannerTitle: { color: colors.white, fontSize: 24, fontWeight: '800' },
  bannerMeta: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  bannerFigure: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    paddingVertical: 6,
    paddingLeft: 6,
  },
  trophy: { paddingHorizontal: spacing.lg },
  programBody: {
    fontSize: 15,
    color: colors.textMuted,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    lineHeight: 21,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.accentLight,
  },
  progressFill: { height: 6, backgroundColor: colors.primary },
  actions: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md },
  flex: { flex: 1 },
  customCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  customInfo: { flex: 1 },
  customTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  customMeta: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
