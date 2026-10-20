import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { CHALLENGE_DAYS } from '../data/challenge';
import { toDateKey } from '../lib/dates';
import {
  emptyData,
  type AppData,
  type CustomWorkout,
  type Session,
  type Settings,
} from './types';

const STORAGE_KEY = 'sevenmin/data/v1';

type Store = AppData & {
  loaded: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  addSession: (session: Session) => void;
  logWeight: (kg: number, date?: Date) => void;
  deleteWeight: (date: string) => void;
  saveCustomWorkout: (workout: CustomWorkout) => void;
  deleteCustomWorkout: (id: string) => void;
  toggleChallengeDay: (day: number, done: boolean) => void;
  resetChallenge: () => void;
  clearHistory: () => void;
};

const StoreContext = createContext<Store | null>(null);

// Merges stored data over the defaults so fields added in later versions get sane values.
function hydrate(raw: string | null): AppData {
  if (!raw) return emptyData;
  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return {
      ...emptyData,
      ...parsed,
      settings: {
        ...emptyData.settings,
        ...parsed.settings,
        reminder: { ...emptyData.settings.reminder, ...parsed.settings?.reminder },
      },
    };
  } catch {
    return emptyData;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [loaded, setLoaded] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setData(hydrate(raw)))
      .catch(() => setData(emptyData))
      .finally(() => {
        loadedRef.current = true;
        setLoaded(true);
      });
  }, []);

  useEffect(() => {
    // Never overwrite stored data with the defaults rendered before loading finished.
    if (!loadedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [data]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const addSession = useCallback((session: Session) => {
    setData((d) => ({ ...d, sessions: [...d.sessions, session] }));
  }, []);

  const logWeight = useCallback((kg: number, date: Date = new Date()) => {
    const key = toDateKey(date);
    setData((d) => ({
      ...d,
      weights: [...d.weights.filter((w) => w.date !== key), { date: key, kg }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    }));
  }, []);

  const deleteWeight = useCallback((date: string) => {
    setData((d) => ({ ...d, weights: d.weights.filter((w) => w.date !== date) }));
  }, []);

  const saveCustomWorkout = useCallback((workout: CustomWorkout) => {
    setData((d) => {
      const exists = d.customWorkouts.some((w) => w.id === workout.id);
      return {
        ...d,
        customWorkouts: exists
          ? d.customWorkouts.map((w) => (w.id === workout.id ? workout : w))
          : [...d.customWorkouts, workout],
      };
    });
  }, []);

  const deleteCustomWorkout = useCallback((id: string) => {
    setData((d) => ({ ...d, customWorkouts: d.customWorkouts.filter((w) => w.id !== id) }));
  }, []);

  const toggleChallengeDay = useCallback((day: number, done: boolean) => {
    if (day < 1 || day > CHALLENGE_DAYS) return;
    setData((d) => {
      const rest = d.challengeCompletedDays.filter((x) => x !== day);
      return { ...d, challengeCompletedDays: done ? [...rest, day].sort((a, b) => a - b) : rest };
    });
  }, []);

  const resetChallenge = useCallback(() => {
    setData((d) => ({ ...d, challengeCompletedDays: [] }));
  }, []);

  const clearHistory = useCallback(() => {
    setData((d) => ({ ...d, sessions: [], weights: [] }));
  }, []);

  const value = useMemo<Store>(
    () => ({
      ...data,
      loaded,
      updateSettings,
      addSession,
      logWeight,
      deleteWeight,
      saveCustomWorkout,
      deleteCustomWorkout,
      toggleChallengeDay,
      resetChallenge,
      clearHistory,
    }),
    [
      data,
      loaded,
      updateSettings,
      addSession,
      logWeight,
      deleteWeight,
      saveCustomWorkout,
      deleteCustomWorkout,
      toggleChallengeDay,
      resetChallenge,
      clearHistory,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const store = useContext(StoreContext);
  if (!store) throw new Error('useStore must be used inside StoreProvider');
  return store;
}

export function latestWeightKg(data: Pick<AppData, 'weights'>): number | null {
  return data.weights.length ? data.weights[data.weights.length - 1].kg : null;
}
