import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Icon, SectionTitle } from '../components/ui';
import { toDateKey } from '../lib/dates';
import { displayToKg, formatWeight, kgToDisplay } from '../lib/units';
import { latestWeightKg, useStore } from '../state/store';
import { colors, spacing } from '../theme';

export default function WeightScreen() {
  const store = useStore();
  const { settings, weights, logWeight, deleteWeight } = store;
  const last = latestWeightKg(store);
  const [text, setText] = useState(last ? String(kgToDisplay(last, settings.units)) : '');
  const [dayOffset, setDayOffset] = useState(0);

  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const value = Number(text.replace(',', '.'));
  const valid = Number.isFinite(value) && value > 20 && value < 700;

  const save = () => {
    if (!valid) return;
    logWeight(displayToKg(value, settings.units), date);
    router.back();
  };

  const dateLabel =
    dayOffset === 0 ? 'Today' : dayOffset === -1 ? 'Yesterday' : date.toLocaleDateString();

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Card style={styles.card}>
        <View style={styles.dateRow}>
          <Pressable accessibilityLabel="Previous day" hitSlop={10} onPress={() => setDayOffset((d) => d - 1)}>
            <Icon name="chevron-left" color={colors.primary} size={28} />
          </Pressable>
          <Text style={styles.date}>{dateLabel}</Text>
          <Pressable
            accessibilityLabel="Next day"
            hitSlop={10}
            disabled={dayOffset >= 0}
            onPress={() => setDayOffset((d) => Math.min(0, d + 1))}
          >
            <Icon name="chevron-right" color={dayOffset >= 0 ? colors.border : colors.primary} size={28} />
          </Pressable>
        </View>
        <View style={styles.inputRow}>
          <TextInput
            autoFocus
            value={text}
            onChangeText={setText}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.border}
            style={styles.input}
            onSubmitEditing={save}
          />
          <Text style={styles.unit}>{settings.units === 'kg' ? 'kg' : 'lbs'}</Text>
        </View>
        <Button title="Save" icon="check" disabled={!valid} onPress={save} />
      </Card>

      {weights.length > 0 && (
        <>
          <SectionTitle>Recent entries</SectionTitle>
          <Card style={styles.list}>
            {weights
              .slice(-10)
              .reverse()
              .map((w, i) => (
                <View key={w.date} style={[styles.entry, i > 0 && styles.entryBorder]}>
                  <Text style={styles.entryDate}>{w.date === toDateKey(new Date()) ? 'Today' : w.date}</Text>
                  <Text style={styles.entryValue}>{formatWeight(w.kg, settings.units)}</Text>
                  <Pressable accessibilityLabel={`Delete entry for ${w.date}`} hitSlop={10} onPress={() => deleteWeight(w.date)}>
                    <Icon name="trash-can-outline" color={colors.textMuted} size={20} />
                  </Pressable>
                </View>
              ))}
          </Card>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md },
  card: { gap: spacing.lg },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  date: { fontSize: 17, fontWeight: '700', color: colors.text },
  inputRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', gap: spacing.sm },
  input: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    minWidth: 140,
    textAlign: 'center',
    borderBottomWidth: 3,
    borderBottomColor: colors.accent,
  },
  unit: { fontSize: 20, color: colors.textMuted, fontWeight: '600' },
  list: { paddingVertical: 0 },
  entry: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: spacing.md },
  entryBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  entryDate: { flex: 1, fontSize: 15, color: colors.textMuted },
  entryValue: { fontSize: 16, fontWeight: '700', color: colors.text },
});
