import { getExercise } from '../data/exercises';
import type { WorkoutPlan } from './plans';

export type PhaseKind = 'ready' | 'work' | 'rest';

export type Phase = {
  kind: PhaseKind;
  durationSec: number;
  // Exercise performed in this phase, or coming up next for ready/rest.
  exerciseId: string;
  // Position of that exercise within the circuit (0-based) and its round (1-based).
  itemIndex: number;
  round: number;
};

export function buildTimeline(plan: WorkoutPlan): Phase[] {
  const phases: Phase[] = [];
  const items = plan.exerciseIds;
  if (items.length === 0 || plan.rounds < 1) return phases;

  if (plan.countdownSec > 0) {
    phases.push({
      kind: 'ready',
      durationSec: plan.countdownSec,
      exerciseId: items[0],
      itemIndex: 0,
      round: 1,
    });
  }

  for (let round = 1; round <= plan.rounds; round++) {
    items.forEach((exerciseId, itemIndex) => {
      const isFirst = round === 1 && itemIndex === 0;
      if (!isFirst && plan.restSec > 0) {
        phases.push({ kind: 'rest', durationSec: plan.restSec, exerciseId, itemIndex, round });
      }
      phases.push({ kind: 'work', durationSec: plan.workSec, exerciseId, itemIndex, round });
    });
  }
  return phases;
}

// An exercise counts as done once at least half of its time was spent on it,
// so skipping straight past an exercise does not count it.
export function countExercisesDone(timeline: Phase[], workSeconds: Map<number, number>): number {
  let done = 0;
  workSeconds.forEach((seconds, phaseIndex) => {
    const phase = timeline[phaseIndex];
    if (phase?.kind === 'work' && seconds >= phase.durationSec / 2) done++;
  });
  return done;
}

export function totalExercises(timeline: Phase[]): number {
  return timeline.filter((p) => p.kind === 'work').length;
}

// Skip targets for the previous/next buttons. Both land on a work phase:
// during a rest or the ready countdown the "current" exercise is the one
// coming up, so "next" jumps straight into it.
export function previousExerciseStart(timeline: Phase[], phaseIndex: number): number {
  let current = phaseIndex;
  while (current < timeline.length && timeline[current].kind !== 'work') current++;
  for (let i = current - 1; i >= 0; i--) {
    if (timeline[i].kind === 'work') return i;
  }
  return Math.min(current, timeline.length - 1);
}

// Returns timeline.length when there is no further exercise (workout finished).
export function nextExerciseStart(timeline: Phase[], phaseIndex: number): number {
  for (let i = phaseIndex + 1; i < timeline.length; i++) {
    if (timeline[i].kind === 'work') return i;
  }
  return timeline.length;
}

export type Cue = { type: 'beep' } | { type: 'say'; text: string };

// Spoken cues fired when the visible whole-second countdown changes from
// `prevSecLeft` to `secLeft` within `phase`. The 3-2-1 countdown is voice only:
// a beep alongside each number grabbed audio focus and delayed the speech.
export function cuesForTick(phase: Phase, prevSecLeft: number, secLeft: number): Cue[] {
  if (secLeft === prevSecLeft) return [];
  const cues: Cue[] = [];
  if (secLeft <= 3 && secLeft >= 1 && (phase.kind !== 'work' || phase.durationSec >= 10)) {
    cues.push({ type: 'say', text: String(secLeft) });
  }
  if (phase.kind === 'work' && phase.durationSec >= 20) {
    const half = Math.floor(phase.durationSec / 2);
    if (secLeft === half) cues.push({ type: 'say', text: 'Half time' });
  }
  return cues;
}

export function cuesForPhaseStart(phase: Phase, next: Phase | undefined): Cue[] {
  const name = getExercise(phase.exerciseId).name;
  switch (phase.kind) {
    case 'ready':
      return [{ type: 'say', text: `Ready to go! Start with ${name}` }];
    case 'rest':
      return [{ type: 'say', text: `Take a rest. Next, ${name}` }];
    case 'work':
      return [
        { type: 'beep' },
        { type: 'say', text: next ? name : `Last one. ${name}` },
      ];
  }
}

export function estimateKcal(
  timeline: Phase[],
  completedWorkSec: Map<number, number>,
  weightKg: number,
): number {
  let kcal = 0;
  completedWorkSec.forEach((seconds, phaseIndex) => {
    const phase = timeline[phaseIndex];
    if (!phase || phase.kind !== 'work') return;
    kcal += getExercise(phase.exerciseId).met * weightKg * (seconds / 3600);
  });
  return Math.round(kcal);
}
