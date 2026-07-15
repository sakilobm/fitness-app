import { StepLog } from '@/types';

export function calculateStepsStreak(stepHistory: StepLog[], goal: number): number {
  let count = 0;
  // Start from second-to-last (skip today since it's in progress)
  for (let i = stepHistory.length - 2; i >= 0; i--) {
    if (stepHistory[i].steps >= goal) count++;
    else break;
  }
  return count;
}

export function calculateBestDay(stepHistory: StepLog[]): number {
  return stepHistory.reduce((max, d) => Math.max(max, d.steps), 0);
}

export function calculateAverageSteps(stepHistory: StepLog[]): number {
  if (stepHistory.length === 0) return 0;
  return Math.round(stepHistory.reduce((s, d) => s + d.steps, 0) / stepHistory.length);
}
