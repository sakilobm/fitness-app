import { useMemo } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import { SleepLog } from '@/types';
import { todayISO } from '@/constants/calendar';
import { SLEEP_GOAL_HOURS } from '@/constants/sleep';

export interface SleepLoggerResult {
  sleepLogs:        SleepLog[];
  addSleepLog:      (log: Omit<SleepLog, 'id'>) => void;
  deleteSleepLog:   (id: string) => void;
  updateSleepLog:   (id: string, updates: Partial<Omit<SleepLog, 'id'>>) => void;
  lastNight:        SleepLog | null;
  weeklyLogs:       (SleepLog | null)[];  // index 0 = today, 6 = 6 days ago
  avgDurationMin:   number;
  avgScore:         number;
  sleepDebtMin:     number;
}

function pastDateISO(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

export function useSleepLogger(): SleepLoggerResult {
  const sleepLogs    = useFitnessStore(s => s.sleepLogs ?? []);
  const addSleepLog  = useFitnessStore(s => s.addSleepLog);
  const deleteSleepLog = useFitnessStore(s => s.deleteSleepLog);
  const updateSleepLog = useFitnessStore(s => s.updateSleepLog);

  const sorted = useMemo(
    () => [...sleepLogs].sort((a, b) => b.date.localeCompare(a.date)),
    [sleepLogs],
  );

  const lastNight = useMemo(
    () => sorted.find(l => l.date <= todayISO()) ?? null,
    [sorted],
  );

  const weeklyLogs = useMemo<(SleepLog | null)[]>(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const target = pastDateISO(i);
      return sorted.find(l => l.date === target) ?? null;
    });
  }, [sorted]);

  const { avgDurationMin, avgScore, sleepDebtMin } = useMemo(() => {
    const logs = weeklyLogs.filter((l): l is SleepLog => l !== null);
    if (logs.length === 0) return { avgDurationMin: 0, avgScore: 0, sleepDebtMin: 0 };
    const avgDur   = Math.round(logs.reduce((s, l) => s + l.totalMin, 0) / logs.length);
    const avgSc    = Math.round(logs.reduce((s, l) => s + l.score,    0) / logs.length);
    const goalMin  = SLEEP_GOAL_HOURS * 60;
    const debt     = logs.reduce((s, l) => s + Math.max(0, goalMin - l.totalMin), 0);
    return { avgDurationMin: avgDur, avgScore: avgSc, sleepDebtMin: debt };
  }, [weeklyLogs]);

  return {
    sleepLogs: sorted,
    addSleepLog,
    deleteSleepLog,
    updateSleepLog,
    lastNight,
    weeklyLogs,
    avgDurationMin,
    avgScore,
    sleepDebtMin,
  };
}
