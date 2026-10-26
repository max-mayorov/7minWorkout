import { describe, expect, it } from '@jest/globals';

import { challengeDays, getChallengeDay, nextChallengeDay } from '../../data/challenge';
import { exercises } from '../../data/exercises';
import { animations } from '../../data/poses';
import { currentStreak, formatClock, monthGrid, toDateKey } from '../dates';
import { CLASSIC_ID, challengeWorkoutId, parseChallengeDay, planDurationSec, resolvePlan } from '../plans';
import { defaultSettings } from '../../state/types';
import { bmi, bmiCategory, cmToFeetInches, displayToKg, feetInchesToCm, kgToDisplay } from '../units';

describe('exercise data', () => {
  it('has an animation for every exercise', () => {
    for (const exercise of exercises) expect(animations[exercise.id]).toBeDefined();
  });

  it('contains the 13 classic exercises', () => {
    expect(exercises).toHaveLength(13);
  });
});

describe('30 day challenge', () => {
  it('has weekly rest days and gets harder over time', () => {
    expect(challengeDays.filter((d) => d.rest).map((d) => d.day)).toEqual([7, 14, 21, 28]);
    expect(getChallengeDay(1)).toMatchObject({ workSec: 20, restSec: 15, rounds: 1 });
    expect(getChallengeDay(30)).toMatchObject({ workSec: 41, restSec: 10, rounds: 3 });
  });

  it('picks the first unfinished day', () => {
    expect(nextChallengeDay([])).toBe(1);
    expect(nextChallengeDay([1, 2, 4])).toBe(3);
    expect(nextChallengeDay(challengeDays.map((d) => d.day))).toBeNull();
  });
});

describe('plans', () => {
  it('builds the classic plan with fixed 30s work and 10s rest', () => {
    const plan = resolvePlan(CLASSIC_ID, defaultSettings, []);
    expect(plan?.exerciseIds).toHaveLength(13);
    expect(plan).toMatchObject({ workSec: 30, restSec: 10 });
    expect(planDurationSec(plan!)).toBe(13 * 30 + 12 * 10);
    expect(resolvePlan(CLASSIC_ID, { ...defaultSettings, rounds: 2 }, [])?.rounds).toBe(2);
  });

  it('round-trips challenge ids and refuses rest days', () => {
    expect(parseChallengeDay(challengeWorkoutId(12))).toBe(12);
    expect(parseChallengeDay('challenge-31')).toBeNull();
    expect(resolvePlan(challengeWorkoutId(7), defaultSettings, [])).toBeNull();
    expect(resolvePlan(challengeWorkoutId(8), defaultSettings, [])?.rounds).toBe(1);
  });

  it('resolves custom workouts and ignores empty ones', () => {
    const custom = { id: 'custom-a', name: 'Abs', exerciseIds: ['plank'], workSec: 45, restSec: 5, rounds: 2 };
    expect(resolvePlan('custom-a', defaultSettings, [custom])).toMatchObject({ title: 'Abs', workSec: 45 });
    expect(resolvePlan('custom-a', defaultSettings, [{ ...custom, exerciseIds: [] }])).toBeNull();
  });
});

describe('dates', () => {
  it('formats keys and clocks', () => {
    expect(toDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(formatClock(75)).toBe('01:15');
    expect(formatClock(3725)).toBe('1:02:05');
  });

  it('builds a Sunday-first month grid', () => {
    const grid = monthGrid(2026, 9); // October 2026 starts on a Thursday.
    expect(grid).toHaveLength(42);
    expect(grid[0].getDay()).toBe(0);
    expect(toDateKey(grid[4])).toBe('2026-10-01');
  });

  it('counts streaks ending today or yesterday', () => {
    const today = new Date(2026, 9, 20);
    const keys = new Set(['2026-10-17', '2026-10-18', '2026-10-19']);
    expect(currentStreak(keys, today)).toBe(3);
    keys.add('2026-10-20');
    expect(currentStreak(keys, today)).toBe(4);
    expect(currentStreak(new Set(['2026-10-15']), today)).toBe(0);
  });
});

describe('units', () => {
  it('converts weight both ways', () => {
    expect(kgToDisplay(70, 'lb')).toBe(154.3);
    expect(displayToKg(154.3, 'lb')).toBeCloseTo(70, 1);
    expect(kgToDisplay(70, 'kg')).toBe(70);
  });

  it('converts height and computes BMI', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(feetInchesToCm(5, 11)).toBe(180);
    expect(bmi(70, 175)).toBe(22.9);
    expect(bmiCategory(22.9)).toBe('Healthy weight');
    expect(bmiCategory(31)).toBe('Obese');
  });
});
