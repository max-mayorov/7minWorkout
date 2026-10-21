import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ExerciseFigure } from '../../components/ExerciseFigure';
import { Card, Icon } from '../../components/ui';
import { exercises } from '../../data/exercises';
import { colors, spacing } from '../../theme';

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const exercise = exercises.find((e) => e.id === id);
  if (!exercise) return null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: exercise.name }} />
      <View style={styles.figure}>
        <ExerciseFigure exerciseId={exercise.id} size={260} />
      </View>
      <View style={styles.badge}>
        <Icon name="target" size={16} color={colors.accentDark} />
        <Text style={styles.badgeText}>{exercise.focus}</Text>
      </View>
      <Card style={styles.steps}>
        {exercise.steps.map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>
      <View style={styles.tip}>
        <Icon name="lightbulb-on-outline" color={colors.primary} size={20} />
        <Text style={styles.tipText}>{exercise.tip}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, gap: spacing.md },
  figure: { alignItems: 'center', backgroundColor: colors.white, borderRadius: 20, paddingVertical: spacing.md },
  badge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { color: colors.accentDark, fontWeight: '700' },
  steps: { gap: spacing.md },
  step: { flexDirection: 'row', gap: spacing.md },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: colors.white, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 16, lineHeight: 23, color: colors.text },
  tip: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: 14,
  },
  tipText: { flex: 1, fontSize: 15, color: colors.primaryDark, lineHeight: 21 },
});
