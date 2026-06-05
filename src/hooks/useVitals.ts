import { useMemo } from 'react';
import { useFitnessStore } from '@/store/fitnessStore';
import {
  HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog,
} from '@/types';

function pastISO(daysAgo: number): string {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

function avg(arr: number[]): number {
  return arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;
}

export interface VitalsResult {
  // Heart Rate
  hrLogs:       HeartRateLog[];
  latestHR:     HeartRateLog | null;
  weeklyHR:     HeartRateLog[];
  avgHR:        number;
  minHR:        number;
  maxHR:        number;
  addHeartRate:    (log: Omit<HeartRateLog, 'id'>) => void;
  deleteHeartRate: (id: string) => void;

  // Blood Pressure
  bpLogs:       BloodPressureLog[];
  latestBP:     BloodPressureLog | null;
  weeklyBP:     BloodPressureLog[];
  avgSys:       number;
  avgDia:       number;
  addBloodPressure:    (log: Omit<BloodPressureLog, 'id'>) => void;
  deleteBloodPressure: (id: string) => void;

  // Glucose
  glucoseLogs:   BloodGlucoseLog[];
  latestGlucose: BloodGlucoseLog | null;
  weeklyGlucose: BloodGlucoseLog[];
  avgGlucose:    number;
  addBloodGlucose:    (log: Omit<BloodGlucoseLog, 'id'>) => void;
  deleteBloodGlucose: (id: string) => void;

  // Oxygen
  oxygenLogs:   OxygenLog[];
  latestOxygen: OxygenLog | null;
  weeklyOxygen: OxygenLog[];
  avgSpo2:      number;
  addOxygen:    (log: Omit<OxygenLog, 'id'>) => void;
  deleteOxygen: (id: string) => void;
}

export function useVitals(): VitalsResult {
  const hrLogs      = useFitnessStore(s => s.heartRateLogs    ?? []);
  const bpLogs      = useFitnessStore(s => s.bloodPressureLogs ?? []);
  const glucoseLogs = useFitnessStore(s => s.bloodGlucoseLogs  ?? []);
  const oxygenLogs  = useFitnessStore(s => s.oxygenLogs        ?? []);

  const addHeartRate      = useFitnessStore(s => s.addHeartRate);
  const deleteHeartRate   = useFitnessStore(s => s.deleteHeartRate);
  const addBloodPressure  = useFitnessStore(s => s.addBloodPressure);
  const deleteBloodPressure = useFitnessStore(s => s.deleteBloodPressure);
  const addBloodGlucose   = useFitnessStore(s => s.addBloodGlucose);
  const deleteBloodGlucose = useFitnessStore(s => s.deleteBloodGlucose);
  const addOxygen         = useFitnessStore(s => s.addOxygen);
  const deleteOxygen      = useFitnessStore(s => s.deleteOxygen);

  const cutoff = pastISO(7);

  const sortedHR  = useMemo(() => [...hrLogs].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [hrLogs]);
  const sortedBP  = useMemo(() => [...bpLogs].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [bpLogs]);
  const sortedGlc = useMemo(() => [...glucoseLogs].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [glucoseLogs]);
  const sortedO2  = useMemo(() => [...oxygenLogs].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)), [oxygenLogs]);

  const weeklyHR      = useMemo(() => sortedHR.filter(l  => l.date >= cutoff), [sortedHR]);
  const weeklyBP      = useMemo(() => sortedBP.filter(l  => l.date >= cutoff), [sortedBP]);
  const weeklyGlucose = useMemo(() => sortedGlc.filter(l => l.date >= cutoff), [sortedGlc]);
  const weeklyOxygen  = useMemo(() => sortedO2.filter(l  => l.date >= cutoff), [sortedO2]);

  const hrValues  = useMemo(() => weeklyHR.map(l => l.bpm),      [weeklyHR]);
  const sysValues = useMemo(() => weeklyBP.map(l => l.systolic), [weeklyBP]);
  const diaValues = useMemo(() => weeklyBP.map(l => l.diastolic),[weeklyBP]);
  const glcValues = useMemo(() => weeklyGlucose.map(l => l.value),[weeklyGlucose]);
  const o2Values  = useMemo(() => weeklyOxygen.map(l => l.spo2), [weeklyOxygen]);

  return {
    hrLogs: sortedHR,
    latestHR:    sortedHR[0] ?? null,
    weeklyHR:    weeklyHR.slice().reverse(),
    avgHR:       avg(hrValues),
    minHR:       hrValues.length ? Math.min(...hrValues) : 0,
    maxHR:       hrValues.length ? Math.max(...hrValues) : 0,
    addHeartRate, deleteHeartRate,

    bpLogs: sortedBP,
    latestBP:    sortedBP[0] ?? null,
    weeklyBP:    weeklyBP.slice().reverse(),
    avgSys:      avg(sysValues),
    avgDia:      avg(diaValues),
    addBloodPressure, deleteBloodPressure,

    glucoseLogs: sortedGlc,
    latestGlucose:  sortedGlc[0] ?? null,
    weeklyGlucose:  weeklyGlucose.slice().reverse(),
    avgGlucose:     avg(glcValues),
    addBloodGlucose, deleteBloodGlucose,

    oxygenLogs: sortedO2,
    latestOxygen:  sortedO2[0] ?? null,
    weeklyOxygen:  weeklyOxygen.slice().reverse(),
    avgSpo2:       avg(o2Values),
    addOxygen, deleteOxygen,
  };
}
