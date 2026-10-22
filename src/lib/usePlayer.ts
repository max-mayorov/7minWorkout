import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { prepareAudio, runCues, silence, type CoachOptions } from './coach';
import {
  buildTimeline,
  cuesForPhaseStart,
  cuesForTick,
  countExercisesDone,
  nextExerciseStart,
  previousExerciseStart,
  totalExercises,
  type Phase,
} from './engine';
import type { WorkoutPlan } from './plans';

// Fine-grained so countdown numbers are spoken on the second; the screen is
// only re-rendered every UI_REFRESH_MS or when the whole second changes.
const TICK_MS = 50;
const UI_REFRESH_MS = 200;

export type PlayerSnapshot = {
  index: number;
  phase: Phase | undefined;
  remainingMs: number;
  paused: boolean;
  finished: boolean;
};

export type PlayerResult = {
  startedAt: number;
  activeSec: number;
  pauses: number;
  exercisesDone: number;
  exercisesTotal: number;
  // Seconds actually exercised per work phase index, for the calorie estimate.
  workSeconds: Map<number, number>;
  completed: boolean;
};

// Drives a workout timeline in real time. Timing is derived from wall-clock
// deadlines rather than counting ticks, so the timer stays accurate even if
// JS timers are throttled.
export function usePlayer(plan: WorkoutPlan | null, coach: CoachOptions) {
  const timeline = useMemo(() => (plan ? buildTimeline(plan) : []), [plan]);
  const total = totalExercises(timeline);

  const coachRef = useRef(coach);
  useEffect(() => {
    coachRef.current = coach;
  });

  const indexRef = useRef(0);
  const endAtRef = useRef(0);
  const pausedRemainingRef = useRef<number | null>(null);
  const lastSecRef = useRef(0);
  const lastTickRef = useRef(0);
  const lastPublishRef = useRef(0);
  const startedAtRef = useRef(0);
  const activeMsRef = useRef(0);
  const pausesRef = useRef(0);
  const workSecondsRef = useRef(new Map<number, number>());
  const finishedRef = useRef(false);

  const [snapshot, setSnapshot] = useState<PlayerSnapshot>({
    index: 0,
    phase: timeline[0],
    remainingMs: (timeline[0]?.durationSec ?? 0) * 1000,
    paused: false,
    finished: timeline.length === 0,
  });

  const publish = useCallback(() => {
    const paused = pausedRemainingRef.current !== null;
    const remainingMs = paused
      ? (pausedRemainingRef.current as number)
      : Math.max(0, endAtRef.current - Date.now());
    lastPublishRef.current = Date.now();
    setSnapshot({
      index: indexRef.current,
      phase: timeline[indexRef.current],
      remainingMs,
      paused,
      finished: finishedRef.current,
    });
  }, [timeline]);

  const enterPhase = useCallback(
    (index: number) => {
      if (index >= timeline.length) {
        finishedRef.current = true;
        silence();
        runCues([{ type: 'say', text: 'Congratulations! Workout complete.' }], coachRef.current);
        publish();
        return;
      }
      const phase = timeline[index];
      indexRef.current = index;
      lastSecRef.current = phase.durationSec;
      const nextWork = timeline.slice(index + 1).find((p) => p.kind === 'work');
      if (pausedRemainingRef.current !== null) {
        pausedRemainingRef.current = phase.durationSec * 1000;
      } else {
        endAtRef.current = Date.now() + phase.durationSec * 1000;
        runCues(cuesForPhaseStart(phase, nextWork), coachRef.current);
      }
      publish();
    },
    [timeline, publish],
  );

  // Start the workout once.
  useEffect(() => {
    if (timeline.length === 0) return;
    startedAtRef.current = Date.now();
    lastTickRef.current = Date.now();
    if (coachRef.current.sound) prepareAudio();
    enterPhase(0);
    return () => silence();
  }, [timeline, enterPhase]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTickRef.current;
      lastTickRef.current = now;
      if (finishedRef.current || pausedRemainingRef.current !== null) return;

      activeMsRef.current += elapsed;
      const index = indexRef.current;
      const phase = timeline[index];
      if (!phase) return;
      if (phase.kind === 'work') {
        const prev = workSecondsRef.current.get(index) ?? 0;
        workSecondsRef.current.set(index, Math.min(phase.durationSec, prev + elapsed / 1000));
      }

      const remaining = endAtRef.current - now;
      if (remaining <= 0) {
        enterPhase(index + 1);
        return;
      }
      const secLeft = Math.ceil(remaining / 1000);
      const secondChanged = secLeft !== lastSecRef.current;
      runCues(cuesForTick(phase, lastSecRef.current, secLeft), coachRef.current);
      lastSecRef.current = secLeft;
      if (secondChanged || now - lastPublishRef.current >= UI_REFRESH_MS) publish();
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [timeline, enterPhase, publish]);

  const pause = useCallback(() => {
    if (finishedRef.current || pausedRemainingRef.current !== null) return;
    pausedRemainingRef.current = Math.max(0, endAtRef.current - Date.now());
    pausesRef.current += 1;
    silence();
    publish();
  }, [publish]);

  const resume = useCallback(() => {
    if (pausedRemainingRef.current === null) return;
    endAtRef.current = Date.now() + pausedRemainingRef.current;
    pausedRemainingRef.current = null;
    lastTickRef.current = Date.now();
    publish();
  }, [publish]);

  const jumpTo = useCallback(
    (index: number) => {
      silence();
      // Jumping always resumes, so the new exercise starts with its cues.
      pausedRemainingRef.current = null;
      lastTickRef.current = Date.now();
      enterPhase(index);
    },
    [enterPhase],
  );

  const next = useCallback(() => jumpTo(nextExerciseStart(timeline, indexRef.current)), [jumpTo, timeline]);
  const previous = useCallback(
    () => jumpTo(previousExerciseStart(timeline, indexRef.current)),
    [jumpTo, timeline],
  );

  const result = useCallback((): PlayerResult => {
    const exercisesDone = countExercisesDone(timeline, workSecondsRef.current);
    return {
      startedAt: startedAtRef.current,
      activeSec: Math.round(activeMsRef.current / 1000),
      pauses: pausesRef.current,
      exercisesDone,
      exercisesTotal: total,
      workSeconds: workSecondsRef.current,
      completed: finishedRef.current,
    };
  }, [timeline, total]);

  return { timeline, total, snapshot, pause, resume, next, previous, result };
}
