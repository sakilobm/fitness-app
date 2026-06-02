// ─────────────────────────────────────────────────────────────────────────────
//  Step Tracking Utilities
//  Research-based conversion formulas for steps → calories & distance
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert steps to approximate calories burned.
 * Uses average stride-based formula:
 * - ~0.04 kcal per step for an average person (70kg)
 * - Adjusted by weight factor
 */
export function stepsToCalories(steps: number, weightKg: number = 70): number {
  const baseFactor = 0.04;
  const weightMultiplier = weightKg / 70;
  return Math.round(steps * baseFactor * weightMultiplier);
}

/**
 * Convert steps to approximate distance in kilometers.
 * Average stride length: ~0.762m (varies by height)
 * Adjusted by height factor.
 */
export function stepsToDistanceKm(steps: number, heightCm: number = 170): number {
  // Stride length approximation: height * 0.415 for walking
  const strideLengthM = (heightCm / 100) * 0.415;
  const distanceM = steps * strideLengthM;
  return parseFloat((distanceM / 1000).toFixed(1));
}

/**
 * Convert steps to approximate active minutes.
 * Average walking pace: ~100 steps per minute.
 */
export function stepsToActiveMinutes(steps: number): number {
  return Math.round(steps / 100);
}

/**
 * Get the date string in YYYY-MM-DD format for a date offset from today.
 */
export function getDateStr(daysAgo: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

/**
 * Get a readable day label for a date string.
 */
export function getDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  
  const diffMs = today.getTime() - d.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[d.getDay()];
}

/**
 * Format step count for display (e.g., 6240 → "6.2k", 12400 → "12.4k").
 */
export function formatStepCount(steps: number): string {
  if (steps >= 1000) {
    return `${(steps / 1000).toFixed(1)}k`;
  }
  return steps.toString();
}
