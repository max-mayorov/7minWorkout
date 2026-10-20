import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Icon } from '../components/ui';
import { CHALLENGE_DAYS, challengeDays, getChallengeDay, nextChallengeDay } from '../data/challenge';
import { challengeWorkoutId, planDurationSec, resolvePlan } from '../lib/plans';
import { useStore } from '../state/store';
import { colors, radius, spacing } from '../theme';

export default function ChallengeScreen() {
  const { settings, customWorkouts, challengeCompletedDays, toggleChallengeDay } = useStore();
  const completed = new Set(challengeCompletedDays);
  const next = nextChallengeDay(challengeCompletedDays);
  const [selected, setSelected] = useState(next ?? CHALLENGE_DAYS);

  const day = getChallengeDay(selected);
  const isDone = completed.has(selected);
  const plan = day.rest ? null : resolvePlan(challengeWorkoutId(selected), settings, customWorkouts);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerValue}>
          {challengeCompletedDays.length}
          <Text style={styles.headerTotal}>/{CHALLENGE_DAYS}</Text>
        </Text>
        <Text style={styles.headerLabel}>days complete</Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${(challengeCompletedDays.length / CHALLENGE_DAYS) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.grid}>
        {challengeDays.map((d) => {
          const done = completed.has(d.day);
          const isNext = d.day === next;
          const isSelected = d.day === selected;
          return (
            <Pressable
              key={d.day}
              accessibilityLabel={`Day ${d.day}${d.rest ? ', rest day' : ''}${done ? ', completed' : ''}`}
              onPress={() => setSelected(d.day)}
              style={[
                styles.tile,
                done && styles.tileDone,
                isNext && styles.tileNext,
                isSelected && styles.tileSelected,
              ]}
            >
              {done ? (
                <Icon name="check-bold" color={colors.white} size={20} />
              ) : d.rest ? (
                <Icon name="coffee" color={colors.primarySoft} size={20} />
              ) : (
                <Text style={[styles.tileText, isNext && styles.tileTextNext]}>{d.day}</Text>
              )}
            </Pressable>
          );
        })}
      </View>

      <Card style={styles.detail}>
        <Text style={styles.detailTitle}>
          Day {selected}
          {day.rest ? ' · Rest day' : ''}
        </Text>
        {day.rest ? (
          <Text style={styles.muted}>
            Recovery is part of training. Take a walk, stretch, and come back tomorrow.
          </Text>
        ) : (
          plan && (
            <View style={styles.facts}>
              <Fact label="Exercises" value={String(plan.exerciseIds.length)} />
              <Fact label="Work" value={`${plan.workSec}s`} />
              <Fact label="Rest" value={`${plan.restSec}s`} />
              <Fact label="Circuits" value={`${plan.rounds}×`} />
              <Fact label="Total" value={`${Math.round(planDurationSec(plan) / 60)} min`} />
            </View>
          )
        )}
        {!day.rest && (
          <Button
            title={isDone ? 'Do it again' : 'Start'}
            icon="play"
            onPress={() => router.push(`/player/${challengeWorkoutId(selected)}`)}
          />
        )}
        <Button
          title={isDone ? 'Mark as not done' : 'Mark as done'}
          variant="ghost"
          icon={isDone ? 'close' : 'check'}
          onPress={() => toggleChallengeDay(selected, !isDone)}
        />
      </Card>
    </ScrollView>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  header: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  headerValue: { fontSize: 40, fontWeight: '900', color: colors.white },
  headerTotal: { fontSize: 22, fontWeight: '700', color: colors.accentLight },
  headerLabel: { color: colors.white, fontWeight: '600' },
  track: {
    height: 8,
    alignSelf: 'stretch',
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  fill: { height: 8, backgroundColor: colors.primary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  tile: {
    width: '14%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileDone: { backgroundColor: colors.accent, borderColor: colors.accent },
  tileNext: { borderColor: colors.primary, borderWidth: 2.5 },
  tileSelected: { transform: [{ scale: 1.08 }], borderColor: colors.primaryDark },
  tileText: { fontSize: 16, fontWeight: '700', color: colors.text },
  tileTextNext: { color: colors.primary },
  detail: { gap: spacing.md },
  detailTitle: { fontSize: 20, fontWeight: '800', color: colors.primary },
  muted: { fontSize: 13, color: colors.textMuted },
  facts: { flexDirection: 'row', justifyContent: 'space-between' },
  fact: { alignItems: 'center' },
  factValue: { fontSize: 18, fontWeight: '800', color: colors.text },
});
