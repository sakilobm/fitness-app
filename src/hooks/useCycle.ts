import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useFitnessStore } from '@/store/fitnessStore';
import { CycleLog, CyclePhase } from '@/types';
import {
  getDayOfCycle, getCurrentPhase, getNextPeriodDate, getOvulationDate,
  getFertileWindow, daysUntil, getTodayStr, PHASE_META,
} from '@/constants/cycle';

export interface CycleResult {
  cycleLogs:     CycleLog[];
  cycleSettings: { cycleLength: number; periodLength: number; lastPeriodStart: string | null };

  // Computed predictions
  todayStr:         string;
  dayOfCycle:       number | null;  // null when no period start set
  currentPhase:     CyclePhase | null;
  phaseMeta:        typeof PHASE_META[CyclePhase] | null;
  cycleProgress:    number;         // 0–1 for ring progress

  nextPeriodDate:   string | null;
  daysUntilPeriod:  number | null;
  ovulationDate:    string | null;
  fertileStart:     string | null;
  fertileEnd:       string | null;
  inFertileWindow:  boolean;

  todayLog:         CycleLog | null;

  // Actions
  addCycleLog:         (log: Omit<CycleLog, 'id'>) => void;
  updateCycleLog:      (id: string, patch: Partial<CycleLog>) => void;
  deleteCycleLog:      (id: string) => void;
  updateCycleSettings: (patch: Partial<{ cycleLength: number; periodLength: number; lastPeriodStart: string | null }>) => void;
  markPeriodStart:     (date?: string) => void;
}

export function useCycle(): CycleResult {
  const {
    cycleLogs, cycleSettings,
    addCycleLog, updateCycleLog, deleteCycleLog, updateCycleSettings,
  } = useFitnessStore(useShallow((s) => ({
    cycleLogs:            s.cycleLogs,
    cycleSettings:        s.cycleSettings,
    addCycleLog:          s.addCycleLog,
    updateCycleLog:       s.updateCycleLog,
    deleteCycleLog:       s.deleteCycleLog,
    updateCycleSettings:  s.updateCycleSettings,
  })));

  const todayStr = getTodayStr();

  const dayOfCycle = useMemo(
    () => getDayOfCycle(cycleSettings.lastPeriodStart, todayStr),
    [cycleSettings.lastPeriodStart, todayStr],
  );

  // Normalise day-of-cycle to within a single cycle (handles multi-cycle gaps)
  const normalisedDay = useMemo(() => {
    if (!dayOfCycle) return null;
    return ((dayOfCycle - 1) % cycleSettings.cycleLength) + 1;
  }, [dayOfCycle, cycleSettings.cycleLength]);

  const currentPhase = useMemo<CyclePhase | null>(() => {
    if (!normalisedDay) return null;
    return getCurrentPhase(normalisedDay, cycleSettings.periodLength, cycleSettings.cycleLength);
  }, [normalisedDay, cycleSettings]);

  const phaseMeta = currentPhase ? PHASE_META[currentPhase] : null;

  const cycleProgress = useMemo(() => {
    if (!normalisedDay) return 0;
    return (normalisedDay - 1) / cycleSettings.cycleLength;
  }, [normalisedDay, cycleSettings.cycleLength]);

  const nextPeriodDate = useMemo(() => {
    if (!cycleSettings.lastPeriodStart) return null;
    return getNextPeriodDate(cycleSettings.lastPeriodStart, cycleSettings.cycleLength);
  }, [cycleSettings.lastPeriodStart, cycleSettings.cycleLength]);

  const daysUntilPeriod = useMemo(
    () => (nextPeriodDate ? daysUntil(nextPeriodDate, todayStr) : null),
    [nextPeriodDate, todayStr],
  );

  const ovulationDate = useMemo(() => {
    if (!cycleSettings.lastPeriodStart) return null;
    return getOvulationDate(cycleSettings.lastPeriodStart, cycleSettings.cycleLength);
  }, [cycleSettings.lastPeriodStart, cycleSettings.cycleLength]);

  const fertileWindow = useMemo(() => {
    if (!ovulationDate) return null;
    return getFertileWindow(ovulationDate);
  }, [ovulationDate]);

  const inFertileWindow = useMemo(() => {
    if (!fertileWindow) return false;
    return todayStr >= fertileWindow.start && todayStr <= fertileWindow.end;
  }, [fertileWindow, todayStr]);

  const todayLog = useMemo(
    () => cycleLogs.find((l) => l.date === todayStr) ?? null,
    [cycleLogs, todayStr],
  );

  const markPeriodStart = (date = todayStr) => {
    updateCycleSettings({ lastPeriodStart: date });
    // Auto-add a period log if none for this date
    const existing = cycleLogs.find((l) => l.date === date);
    if (!existing) {
      addCycleLog({ date, flow: 'medium', symptoms: [], mood: null, note: '', bbt: null });
    }
  };

  return {
    cycleLogs, cycleSettings,
    todayStr, dayOfCycle: normalisedDay, currentPhase, phaseMeta, cycleProgress,
    nextPeriodDate, daysUntilPeriod,
    ovulationDate,
    fertileStart:    fertileWindow?.start ?? null,
    fertileEnd:      fertileWindow?.end   ?? null,
    inFertileWindow,
    todayLog,
    addCycleLog, updateCycleLog, deleteCycleLog, updateCycleSettings, markPeriodStart,
  };
}
