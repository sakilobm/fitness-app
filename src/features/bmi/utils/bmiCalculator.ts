import { BMILog } from '@/types';

export interface BMIInfo {
  bmi: number;
  label: string;
  color: string;
  emoji: string;
  suggestions: string[];
}

export function getIdealWeightRange(heightCm: number) {
  const hM = heightCm / 100;
  return {
    min: parseFloat((18.5 * hM * hM).toFixed(1)),
    max: parseFloat((24.9 * hM * hM).toFixed(1)),
  };
}

export function getWeightToNormal(weightKg: number, heightCm: number) {
  const range = getIdealWeightRange(heightCm);
  if (weightKg < range.min) {
    return { direction: 'gain' as const, amount: parseFloat((range.min - weightKg).toFixed(1)) };
  } else if (weightKg > range.max) {
    return { direction: 'lose' as const, amount: parseFloat((weightKg - range.max).toFixed(1)) };
  }
  return { direction: 'maintain' as const, amount: 0 };
}

export function computeBMITrendStats(bmiLogs: BMILog[]) {
  if (bmiLogs.length < 2) return { change: 0, direction: 'stable' as const };
  const first = bmiLogs[0].bmi;
  const last = bmiLogs[bmiLogs.length - 1].bmi;
  const change = parseFloat((last - first).toFixed(1));
  return {
    change: Math.abs(change),
    direction: change < -0.2 ? 'down' as const : change > 0.2 ? 'up' as const : 'stable' as const,
  };
}
