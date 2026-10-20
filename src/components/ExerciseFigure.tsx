import { useEffect, useState } from 'react';
import Svg, { Circle, G, Line, Polyline, Rect } from 'react-native-svg';

import { animations, type Point, type Pose, type Prop } from '../data/poses';
import { colors } from '../theme';

const VIEWBOX = '0 -20 120 116';
const FLOOR_Y = 92;

const ease = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

function lerpPoint(a: Point, b: Point, t: number): Point {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function poseAt(keyframes: Pose[], progress: number): Pose {
  const scaled = progress * keyframes.length;
  const index = Math.floor(scaled) % keyframes.length;
  const t = ease(scaled - Math.floor(scaled));
  const from = keyframes[index];
  const to = keyframes[(index + 1) % keyframes.length];
  const result = {} as Record<keyof Pose, Point>;
  (Object.keys(from) as (keyof Pose)[]).forEach((joint) => {
    result[joint] = lerpPoint(from[joint], to[joint], t);
  });
  return result;
}

function useCycleProgress(cycleMs: number, playing: boolean): number {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const start = Date.now() - progress * cycleMs;
    const loop = () => {
      setProgress(((Date.now() - start) % cycleMs) / cycleMs);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
    // Resuming continues from the current progress, so it is intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleMs, playing]);
  return progress;
}

function Limb({ points, color, width }: { points: Point[]; color: string; width: number }) {
  return (
    <Polyline
      points={points.map((p) => p.join(',')).join(' ')}
      fill="none"
      stroke={color}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Scenery({ props }: { props: Prop[] }) {
  return (
    <G>
      {props.includes('wall-left') && (
        <Rect x={22} y={-20} width={8} height={FLOOR_Y + 20} fill={colors.primaryLight} />
      )}
      {props.includes('chair-right') && <Chair x={60} flip={false} />}
      {props.includes('chair-left') && <Chair x={14} flip />}
    </G>
  );
}

function Chair({ x, flip }: { x: number; flip: boolean }) {
  const seatY = 68;
  const width = 32;
  const backX = flip ? x : x + width;
  return (
    <G stroke={colors.textMuted} strokeWidth={3} strokeLinecap="round">
      <Line x1={x} y1={seatY} x2={x + width} y2={seatY} />
      <Line x1={x + 2} y1={seatY} x2={x + 2} y2={FLOOR_Y} />
      <Line x1={x + width - 2} y1={seatY} x2={x + width - 2} y2={FLOOR_Y} />
      <Line x1={backX} y1={seatY} x2={backX} y2={seatY - 26} />
    </G>
  );
}

type FigureProps = {
  exerciseId: string;
  size?: number;
  playing?: boolean;
};

export function ExerciseFigure({ exerciseId, size = 200, playing = true }: FigureProps) {
  const animation = animations[exerciseId];
  const progress = useCycleProgress(animation?.cycleMs ?? 1000, playing && !!animation);
  if (!animation) return null;
  const pose = poseAt(animation.keyframes, progress);

  return (
    <Svg width={size} height={size * (116 / 120)} viewBox={VIEWBOX}>
      <Line
        x1={4}
        y1={FLOOR_Y + 1.5}
        x2={116}
        y2={FLOOR_Y + 1.5}
        stroke={colors.border}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Scenery props={animation.props ?? []} />
      {/* Far limbs sit behind the torso and are drawn lighter for depth. */}
      <Limb points={[pose.hip, pose.farKnee, pose.farFoot]} color={colors.primarySoft} width={6} />
      <Limb points={[pose.neck, pose.farElbow, pose.farHand]} color={colors.primarySoft} width={5} />
      <Limb points={[pose.neck, pose.hip]} color={colors.accent} width={10} />
      <Limb points={[pose.hip, pose.nearKnee, pose.nearFoot]} color={colors.primary} width={6} />
      <Limb points={[pose.neck, pose.nearElbow, pose.nearHand]} color={colors.primaryDark} width={5} />
      <Circle cx={pose.head[0]} cy={pose.head[1]} r={6.5} fill={colors.primaryDark} />
    </Svg>
  );
}
