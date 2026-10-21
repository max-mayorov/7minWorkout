import { classicOrder } from './exercises';

export const CHALLENGE_DAYS = 30;

export type ChallengeDay = {
  day: number;
  rest: boolean;
  exerciseIds: string[];
  workSec: number;
  restSec: number;
  rounds: number;
};

// One rest day at the end of every week.
const REST_DAYS = new Set([7, 14, 21, 28]);

// Full-body 30-day plan built from the classic circuit. Every week adds
// work time and trims rest; weeks 3–4 double the circuit and the final
// days run it three times.
export function getChallengeDay(day: number): ChallengeDay {
  const week = Math.ceil(day / 7);
  const dayInWeek = (day - 1) % 7;
  return {
    day,
    rest: REST_DAYS.has(day),
    exerciseIds: classicOrder,
    workSec: 20 + (week - 1) * 5 + dayInWeek,
    restSec: Math.max(10, 15 - (week - 1) * 2),
    rounds: week <= 2 ? 1 : week <= 4 ? 2 : 3,
  };
}

export const challengeDays: ChallengeDay[] = Array.from({ length: CHALLENGE_DAYS }, (_, i) =>
  getChallengeDay(i + 1),
);

export function nextChallengeDay(completedDays: number[]): number | null {
  const done = new Set(completedDays);
  const next = challengeDays.find((d) => !done.has(d.day));
  return next ? next.day : null;
}
