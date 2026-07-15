import { WorkoutLog } from '@/types';

export function calculateWorkoutCalories(
  type: string,
  duration: number,
  intensity: 'low' | 'medium' | 'high',
  userWeight: number
): number {
  let baseBurnRate = 6; // kcal per min
  if (type === 'Cardio') baseBurnRate = 8.5;
  else if (type === 'Leg Day') baseBurnRate = 7.5;
  else if (type === 'Full Body') baseBurnRate = 7.0;
  else if (type === 'Push Day' || type === 'Pull Day') baseBurnRate = 6.5;
  else if (type === 'Core / Abs') baseBurnRate = 5.0;
  else if (type === 'Yoga & Stretch') baseBurnRate = 3.5;

  const multiplier = intensity === 'low' ? 0.8 : intensity === 'medium' ? 1.0 : 1.3;
  const bodyWeightMultiplier = userWeight / 70; // Normalized around 70kg weight

  return Math.round(baseBurnRate * duration * multiplier * bodyWeightMultiplier);
}

export function calculateWorkoutStats(workoutLogs: WorkoutLog[]) {
  const totalWorkouts = workoutLogs.length;

  // Count workouts in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const dateLimit = sevenDaysAgo.toISOString().split('T')[0];
  const currentWeekWorkouts = workoutLogs.filter((w) => w.date >= dateLimit).length;

  const totalCaloriesBurned = workoutLogs.reduce((sum, w) => sum + w.caloriesBurned, 0);

  const avgWorkoutDuration = totalWorkouts === 0
    ? 0
    : Math.round(workoutLogs.reduce((sum, w) => sum + w.durationMin, 0) / totalWorkouts);

  return {
    totalWorkouts,
    currentWeekWorkouts,
    totalCaloriesBurned,
    avgWorkoutDuration,
  };
}
