import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WeightChart } from '../../components/WeightChart';
import { Button, Card, Icon, SectionTitle, StatTile } from '../../components/ui';
import { currentStreak, formatClock, MONTHS, monthGrid, toDateKey, WEEKDAY_SHORT } from '../../lib/dates';
import { bmi, bmiCategory, formatHeight, formatWeight } from '../../lib/units';
import { latestWeightKg, useStore } from '../../state/store';
import type { Session } from '../../state/types';
import { colors, spacing } from '../../theme';

export default function ReportScreen() {
  const store = useStore();
  const { sessions, weights, settings } = store;
  const today = new Date();
  const [month, setMonth] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(toDateKey(today));

  const byDay = useMemo(() => {
    const map = new Map<string, Session[]>();
    for (const s of sessions) {
      const key = toDateKey(s.startedAt);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return map;
  }, [sessions]);

  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + s.durationSec, 0) / 60);
  const totalKcal = sessions.reduce((sum, s) => sum + s.kcal, 0);
  const streak = currentStreak(new Set(byDay.keys()));
  const grid = monthGrid(month.year, month.month);
  const selectedSessions = (byDay.get(selected) ?? []).slice().sort((a, b) => a.startedAt - b.startedAt);

  const shiftMonth = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const d = new Date(year, m + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const weightKg = latestWeightKg(store);
  const bmiValue = weightKg && settings.heightCm ? bmi(weightKg, settings.heightCm) : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card style={styles.summary}>
        <StatTile icon="dumbbell" value={String(sessions.length)} label="Workouts" />
        <StatTile icon="timer-outline" value={String(totalMinutes)} label="Minutes" />
        <StatTile icon="fire" value={String(totalKcal)} label="kcal" />
        <StatTile icon="lightning-bolt" value={String(streak)} label="Streak" />
      </Card>

      <SectionTitle>History</SectionTitle>
      <Card>
        <View style={styles.monthHeader}>
          <Pressable accessibilityLabel="Previous month" hitSlop={10} onPress={() => shiftMonth(-1)}>
            <Icon name="chevron-left" color={colors.primary} size={28} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[month.month]} {month.year}
          </Text>
          <Pressable accessibilityLabel="Next month" hitSlop={10} onPress={() => shiftMonth(1)}>
            <Icon name="chevron-right" color={colors.primary} size={28} />
          </Pressable>
        </View>
        <View style={styles.week}>
          {WEEKDAY_SHORT.map((d) => (
            <Text key={d} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {grid.map((date) => {
            const key = toDateKey(date);
            const count = byDay.get(key)?.length ?? 0;
            const inMonth = date.getMonth() === month.month;
            const isSelected = key === selected;
            const isToday = key === toDateKey(today);
            return (
              <Pressable key={key} style={styles.cell} onPress={() => setSelected(key)}>
                <View
                  style={[
                    styles.dayCircle,
                    isToday && styles.today,
                    isSelected && styles.selected,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      !inMonth && styles.otherMonth,
                      isSelected && styles.selectedText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </View>
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(count, 3) }, (_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.dayDetail}>
          {selectedSessions.length === 0 ? (
            <Text style={styles.muted}>No workouts on this day.</Text>
          ) : (
            selectedSessions.map((s) => <SessionRow key={s.id} session={s} />)
          )}
        </View>
      </Card>

      <SectionTitle>Weight</SectionTitle>
      <Card style={styles.weightCard}>
        <View style={styles.weightHeader}>
          <View>
            <Text style={styles.muted}>Current</Text>
            <Text style={styles.weightValue}>
              {weightKg ? formatWeight(weightKg, settings.units) : '—'}
            </Text>
          </View>
          <View style={styles.bmiBox}>
            <Text style={styles.muted}>BMI</Text>
            <Text style={styles.weightValue}>{bmiValue ?? '—'}</Text>
            {bmiValue ? <Text style={styles.bmiCategory}>{bmiCategory(bmiValue)}</Text> : null}
          </View>
        </View>
        {weights.length >= 2 ? (
          <WeightChart entries={weights.slice(-30)} units={settings.units} />
        ) : (
          <Text style={styles.muted}>Log your weight on two or more days to see a trend.</Text>
        )}
        {!settings.heightCm && (
          <Text style={styles.muted}>Set your height in Settings to see your BMI.</Text>
        )}
        {settings.heightCm ? (
          <Text style={styles.muted}>Height {formatHeight(settings.heightCm, settings.units)}</Text>
        ) : null}
        <Button title="Log weight" icon="scale-bathroom" variant="secondary" onPress={() => router.push('/weight')} />
      </Card>
    </ScrollView>
  );
}

function SessionRow({ session }: { session: Session }) {
  const time = new Date(session.startedAt);
  const pct = Math.round((session.exercisesDone / Math.max(1, session.exercisesTotal)) * 100);
  return (
    <View style={styles.session}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTitle}>{session.title}</Text>
        <Text style={styles.muted}>
          {String(time.getHours()).padStart(2, '0')}:{String(time.getMinutes()).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.sessionStats}>
        <Text style={styles.sessionStat}>
          <Text style={styles.sessionStatValue}>{formatClock(session.durationSec)}</Text> time
        </Text>
        <Text style={styles.sessionStat}>
          <Text style={styles.sessionStatValue}>{session.kcal}</Text> kcal
        </Text>
        <Text style={styles.sessionStat}>
          <Text style={styles.sessionStatValue}>{session.pauses}</Text> pauses
        </Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.muted}>
        {session.exercisesDone}/{session.exercisesTotal} exercises · {pct}%
        {session.roundsTotal > 1 ? ` · ${session.roundsTotal} rounds` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  summary: { flexDirection: 'row' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.primary },
  week: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 4 },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 1.5, borderColor: colors.primary },
  selected: { backgroundColor: colors.primary },
  dayText: { fontSize: 15, color: colors.text },
  otherMonth: { color: colors.border },
  selectedText: { color: colors.white, fontWeight: '700' },
  dots: { flexDirection: 'row', gap: 2, height: 6, marginTop: 2 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent },
  dayDetail: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.md, gap: spacing.md },
  muted: { fontSize: 14, color: colors.textMuted },
  session: { gap: 6 },
  sessionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sessionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, flex: 1 },
  sessionStats: { flexDirection: 'row', gap: spacing.md },
  sessionStat: { fontSize: 13, color: colors.textMuted },
  sessionStatValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.primaryLight, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: colors.accent },
  weightCard: { gap: spacing.md },
  weightHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  weightValue: { fontSize: 24, fontWeight: '800', color: colors.primary },
  bmiBox: { alignItems: 'flex-end' },
  bmiCategory: { fontSize: 13, fontWeight: '600', color: colors.accentDark },
});
