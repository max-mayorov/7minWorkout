import { useState } from 'react';
import { type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { kgToDisplay } from '../lib/units';
import type { Units, WeightEntry } from '../state/types';
import { colors } from '../theme';

const HEIGHT = 160;
const PAD = { top: 16, right: 12, bottom: 24, left: 36 };

export function WeightChart({ entries, units }: { entries: WeightEntry[]; units: Units }) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const values = entries.map((e) => kgToDisplay(e.kg, units));
  const min = Math.floor(Math.min(...values) - 1);
  const max = Math.ceil(Math.max(...values) + 1);
  const plotW = Math.max(0, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (entries.length === 1 ? plotW / 2 : (i / (entries.length - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * plotH;
  const path = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(v)}`).join(' ');
  const first = entries[0].date.slice(5).replace('-', '/');
  const last = entries[entries.length - 1].date.slice(5).replace('-', '/');

  return (
    <View onLayout={onLayout} accessibilityLabel={`Weight trend from ${values[0]} to ${values[values.length - 1]} ${units}`}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {[min, (min + max) / 2, max].map((v) => (
            <Line key={v} x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} stroke={colors.border} strokeWidth={1} />
          ))}
          {[min, max].map((v) => (
            <SvgText key={v} x={PAD.left - 6} y={y(v) + 4} fontSize={11} fill={colors.textMuted} textAnchor="end">
              {v}
            </SvgText>
          ))}
          <Path d={path} stroke={colors.primary} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
          {values.map((v, i) => (
            <Circle key={i} cx={x(i)} cy={y(v)} r={i === values.length - 1 ? 5 : 3} fill={colors.accent} />
          ))}
        </Svg>
      )}
      <View style={styles.axis}>
        <Text style={styles.axisText}>{first}</Text>
        <Text style={styles.axisText}>{last}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  axis: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: PAD.left, marginTop: -18 },
  axisText: { fontSize: 11, color: colors.textMuted },
});
