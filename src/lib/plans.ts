import { getChallengeDay, CHALLENGE_DAYS } from '../data/challenge';
import { classicOrder } from '../data/exercises';
import type { CustomWorkout, Settings } from '../state/types';

export type WorkoutPlan = {
  id: string;
  title: string;
  exerciseIds: string[];
  workSec: number;
  restSec: number;
  rounds: number;
  countdownSec: number;
};

export const CLASSIC_ID = 'classic';
const CHALLENGE_PREFIX = 'challenge-';

export function challengeWorkoutId(day: number): string {
  return `${CHALLENGE_PREFIX}${day}`;
}

export function parseChallengeDay(workoutId: string): number | null {
  if (!workoutId.startsWith(CHALLENGE_PREFIX)) return null;
  const day = Number(workoutId.slice(CHALLENGE_PREFIX.length));
  return Number.isInteger(day) && day >= 1 && day <= CHALLENGE_DAYS ? day : null;
}

export function resolvePlan(
  workoutId: string,
  settings: Settings,
  customWorkouts: CustomWorkout[],
): WorkoutPlan | null {
  const countdownSec = settings.countdownSec;

  if (workoutId === CLASSIC_ID) {
    return {
      id: CLASSIC_ID,
      title: 'Classic 7 Minute',
      exerciseIds: classicOrder,
      workSec: settings.workSec,
      restSec: settings.restSec,
      rounds: settings.rounds,
      countdownSec,
    };
  }

  const day = parseChallengeDay(workoutId);
  if (day !== null) {
    const plan = getChallengeDay(day);
    if (plan.rest) return null;
    return {
      id: workoutId,
      title: `30 Day Challenge · Day ${day}`,
      exerciseIds: plan.exerciseIds,
      workSec: plan.workSec,
      restSec: plan.restSec,
      rounds: plan.rounds,
      countdownSec,
    };
  }

  const custom = customWorkouts.find((w) => w.id === workoutId);
  if (custom && custom.exerciseIds.length > 0) {
    return {
      id: custom.id,
      title: custom.name,
      exerciseIds: custom.exerciseIds,
      workSec: custom.workSec,
      restSec: custom.restSec,
      rounds: custom.rounds,
      countdownSec,
    };
  }
  return null;
}

export function planDurationSec(plan: WorkoutPlan): number {
  const sets = plan.exerciseIds.length * plan.rounds;
  return sets * plan.workSec + Math.max(0, sets - 1) * plan.restSec;
}
