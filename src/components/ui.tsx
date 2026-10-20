import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Switch, Text, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, radius, shadow, spacing } from '../theme';

type IconProps = ComponentProps<typeof MaterialCommunityIcons>;
export type IconName = IconProps['name'];

export function Icon({ name, size = 22, color = colors.text }: { name: IconName; size?: number; color?: IconProps['color'] }) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, style }: ButtonProps) {
  const palette = {
    primary: { bg: colors.accent, fg: colors.white, border: colors.accent },
    secondary: { bg: colors.white, fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
    danger: { bg: colors.white, fg: colors.danger, border: colors.danger },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: palette.bg, borderColor: palette.border, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={palette.fg} />}
      <Text style={[styles.buttonText, { color: palette.fg }]}>{title}</Text>
    </Pressable>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

type StepperProps = {
  label: string;
  icon?: IconName;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
};

export function StepperRow({ label, icon, value, onChange, min, max, step = 1, format }: StepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <View style={styles.row}>
      {icon && <Icon name={icon} color={colors.primary} />}
      <Text style={styles.rowLabel}>{label}</Text>
      <Pressable
        accessibilityLabel={`Decrease ${label}`}
        hitSlop={8}
        onPress={() => onChange(clamp(value - step))}
        style={styles.stepButton}
      >
        <Icon name="minus" size={18} color={colors.primary} />
      </Pressable>
      <Text style={styles.stepValue}>{format ? format(value) : value}</Text>
      <Pressable
        accessibilityLabel={`Increase ${label}`}
        hitSlop={8}
        onPress={() => onChange(clamp(value + step))}
        style={styles.stepButton}
      >
        <Icon name="plus" size={18} color={colors.primary} />
      </Pressable>
    </View>
  );
}

export function SwitchRow({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon?: IconName;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      {icon && <Icon name={icon} color={colors.primary} />}
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.accent, false: colors.border }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function PressableRow({
  label,
  icon,
  detail,
  onPress,
  color = colors.text,
}: {
  label: string;
  icon?: IconName;
  detail?: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
      {icon && <Icon name={icon} color={color === colors.text ? colors.primary : color} />}
      <Text style={[styles.rowLabel, { color }]}>{label}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      <Icon name="chevron-right" color={colors.textMuted} />
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function ProgressRing({
  size,
  stroke,
  progress,
  color,
  trackColor = colors.border,
  children,
}: {
  size: number;
  stroke: number;
  progress: number;
  color: string;
  trackColor?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - clamped)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}

export function StatTile({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <View style={styles.stat}>
      <Icon name={icon} size={20} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    ...shadow,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 13,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  buttonText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 12,
    minHeight: 52,
  },
  rowLabel: { flex: 1, fontSize: 16, color: colors.text },
  rowDetail: { fontSize: 15, color: colors.textMuted },
  stepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepValue: { minWidth: 64, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.pill,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: radius.pill, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  segmentTextActive: { color: colors.white },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted },
});
