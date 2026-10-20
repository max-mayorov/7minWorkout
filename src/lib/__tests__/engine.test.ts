import { describe, expect, it } from '@jest/globals';

import {
  buildTimeline,
  countExercisesDone,
  cuesForTick,
  estimateKcal,
  nextExerciseStart,
  previousExerciseStart,
  totalExercises,
} from '../engine';
import type { WorkoutPlan } from '../plans';

const plan = (overrides: Partial<WorkoutPlan> = {}): WorkoutPlan => ({
  id: 'test',
  title: 'Test',
  exerciseIds: ['jumping_jacks', 'wall_sit', 'push_ups'],
  workSec: 30,
  restSec: 10,
  rounds: 1,
  countdownSec: 15,
  ...overrides,
});

describe('buildTimeline', () => {
  it('starts with a countdown and puts rests only between exercises', () => {
    const kinds = buildTimeline(plan()).map((p) => p.kind);
    expect(kinds).toEqual(['ready', 'work', 'rest', 'work', 'rest', 'work']);
  });

  it('repeats the circuit for every round with a rest between rounds', () => {
    const timeline = buildTimeline(plan({ rounds: 2 }));
    expect(totalExercises(timeline)).toBe(6);
    const secondRoundStart = timeline.findIndex((p) => p.round === 2);
    expect(timeline[secondRoundStart]).toMatchObject({ kind: 'rest', exerciseId: 'jumping_jacks' });
    expect(timeline[timeline.length - 1]).toMatchObject({ kind: 'work', round: 2, itemIndex: 2 });
  });

  it('omits the countdown and rests when they are set to zero', () => {
    const kinds = buildTimeline(plan({ countdownSec: 0, restSec: 0 })).map((p) => p.kind);
    expect(kinds).toEqual(['work', 'work', 'work']);
  });

  it('matches the classic 7 minute length', () => {
    const timeline = buildTimeline(
      plan({
        countdownSec: 0,
        exerciseIds: Array.from({ length: 13 }, () => 'plank'),
      }),
    );
    const seconds = timeline.reduce((sum, p) => sum + p.durationSec, 0);
    expect(seconds).toBe(13 * 30 + 12 * 10);
  });
});

describe('skipping', () => {
  const timeline = buildTimeline(plan());
  // ready(0) work(1) rest(2) work(3) rest(4) work(5)

  it('next from the countdown or a rest jumps into the upcoming exercise', () => {
    expect(nextExerciseStart(timeline, 0)).toBe(1);
    expect(nextExerciseStart(timeline, 2)).toBe(3);
  });

  it('next during an exercise moves to the following exercise or finishes', () => {
    expect(nextExerciseStart(timeline, 1)).toBe(3);
    expect(nextExerciseStart(timeline, 5)).toBe(timeline.length);
  });

  it('previous goes back one exercise and stays put at the first one', () => {
    expect(previousExerciseStart(timeline, 5)).toBe(3);
    // During a rest the upcoming exercise is the current one.
    expect(previousExerciseStart(timeline, 4)).toBe(3);
    expect(previousExerciseStart(timeline, 2)).toBe(1);
    expect(previousExerciseStart(timeline, 1)).toBe(1);
    expect(previousExerciseStart(timeline, 0)).toBe(1);
  });
});

describe('cuesForTick', () => {
  const [, work] = buildTimeline(plan());

  it('counts down the last three seconds', () => {
    expect(cuesForTick(work, 4, 3)).toEqual([
      { type: 'beep', final: false },
      { type: 'say', text: '3' },
    ]);
    expect(cuesForTick(work, 3, 3)).toEqual([]);
  });

  it('announces half time', () => {
    expect(cuesForTick(work, 16, 15)).toEqual([{ type: 'say', text: 'Half time' }]);
  });
});

describe('progress and calories', () => {
  const timeline = buildTimeline(plan());

  it('only counts exercises where at least half the time was spent', () => {
    const seconds = new Map([
      [1, 30],
      [3, 14],
      [5, 15],
    ]);
    expect(countExercisesDone(timeline, seconds)).toBe(2);
  });

  it('estimates calories from MET, weight and time', () => {
    // Jumping jacks MET 8 × 70 kg × 30 s ≈ 4.7 kcal.
    expect(estimateKcal(timeline, new Map([[1, 30]]), 70)).toBe(5);
  });
});
