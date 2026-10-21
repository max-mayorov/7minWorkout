export type Units = 'kg' | 'lb';

export type Reminder = {
  enabled: boolean;
  hour: number;
  minute: number;
  // 1 = Sunday … 7 = Saturday, matching expo-notifications weekly triggers.
  weekdays: number[];
};

export type Settings = {
  rounds: number;
  workSec: number;
  restSec: number;
  countdownSec: number;
  sound: boolean;
  voice: boolean;
  units: Units;
  heightCm: number | null;
  reminder: Reminder;
};

export type Session = {
  id: string;
  workoutId: string;
  title: string;
  startedAt: number;
  // Time actually spent in the workout, excluding pauses.
  durationSec: number;
  pauses: number;
  exercisesDone: number;
  exercisesTotal: number;
  roundsTotal: number;
  kcal: number;
  completed: boolean;
};

export type WeightEntry = {
  // Local calendar day, YYYY-MM-DD.
  date: string;
  kg: number;
};

export type CustomWorkout = {
  id: string;
  name: string;
  exerciseIds: string[];
  workSec: number;
  restSec: number;
  rounds: number;
};

export type AppData = {
  settings: Settings;
  sessions: Session[];
  weights: WeightEntry[];
  customWorkouts: CustomWorkout[];
  challengeCompletedDays: number[];
};

export const defaultSettings: Settings = {
  rounds: 1,
  workSec: 30,
  restSec: 10,
  countdownSec: 15,
  sound: true,
  voice: true,
  units: 'kg',
  heightCm: null,
  reminder: { enabled: false, hour: 19, minute: 0, weekdays: [1, 2, 3, 4, 5, 6, 7] },
};

export const emptyData: AppData = {
  settings: defaultSettings,
  sessions: [],
  weights: [],
  customWorkouts: [],
  challengeCompletedDays: [],
};
