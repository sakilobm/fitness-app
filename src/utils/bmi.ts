// ─────────────────────────────────────────────────────────────────────────────
//  BMI Calculation Utilities & Suggestion Engine
//  WHO-standard BMI categories with personalized health recommendations
// ─────────────────────────────────────────────────────────────────────────────

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export interface BMIResult {
  value: number;
  category: BMICategory;
  label: string;
  color: string;
  emoji: string;
}

export interface HealthSuggestion {
  id: string;
  icon: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'diet' | 'exercise' | 'lifestyle' | 'hydration';
  accentColor: string;
}

// ─── BMI Core Calculations ───────────────────────────────────────────────────

/**
 * Calculate BMI from weight (kg) and height (cm).
 * Formula: weight / (height_in_meters)^2
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

/**
 * Classify BMI value into WHO standard categories.
 */
export function classifyBMI(bmi: number): BMIResult {
  if (bmi <= 0) {
    return { value: 0, category: 'normal', label: 'Unknown', color: '#9CA3AF', emoji: '❓' };
  }
  if (bmi < 18.5) {
    return { value: bmi, category: 'underweight', label: 'Underweight', color: '#3B82F6', emoji: '🔵' };
  }
  if (bmi < 25) {
    return { value: bmi, category: 'normal', label: 'Normal', color: '#2E7D5E', emoji: '🟢' };
  }
  if (bmi < 30) {
    return { value: bmi, category: 'overweight', label: 'Overweight', color: '#F59E0B', emoji: '🟡' };
  }
  return { value: bmi, category: 'obese', label: 'Obese', color: '#EF4444', emoji: '🔴' };
}

/**
 * Get the full BMI result from weight and height.
 */
export function getBMIResult(weightKg: number, heightCm: number): BMIResult {
  const bmi = calculateBMI(weightKg, heightCm);
  return classifyBMI(bmi);
}

/**
 * Calculate ideal weight range for a given height (BMI 18.5–24.9).
 */
export function getIdealWeightRange(heightCm: number): { min: number; max: number } {
  const heightM = heightCm / 100;
  return {
    min: parseFloat((18.5 * heightM * heightM).toFixed(1)),
    max: parseFloat((24.9 * heightM * heightM).toFixed(1)),
  };
}

/**
 * Calculate weight needed to lose/gain to reach normal BMI range.
 */
export function getWeightToNormal(weightKg: number, heightCm: number): { amount: number; direction: 'lose' | 'gain' | 'maintain' } {
  const range = getIdealWeightRange(heightCm);
  if (weightKg < range.min) {
    return { amount: parseFloat((range.min - weightKg).toFixed(1)), direction: 'gain' };
  }
  if (weightKg > range.max) {
    return { amount: parseFloat((weightKg - range.max).toFixed(1)), direction: 'lose' };
  }
  return { amount: 0, direction: 'maintain' };
}

// ─── WHO Category Definitions ────────────────────────────────────────────────

export const BMI_CATEGORIES = [
  { label: 'Underweight', range: '< 18.5', color: '#3B82F6', min: 0, max: 18.5 },
  { label: 'Normal', range: '18.5 – 24.9', color: '#2E7D5E', min: 18.5, max: 25 },
  { label: 'Overweight', range: '25.0 – 29.9', color: '#F59E0B', min: 25, max: 30 },
  { label: 'Obese', range: '≥ 30.0', color: '#EF4444', min: 30, max: 50 },
];

// ─── Gauge Positioning ───────────────────────────────────────────────────────

/** Map BMI value (15–40) to a 0–1 position on the gauge */
export function bmiToGaugePosition(bmi: number): number {
  const MIN_BMI = 15;
  const MAX_BMI = 40;
  const clamped = Math.max(MIN_BMI, Math.min(MAX_BMI, bmi));
  return (clamped - MIN_BMI) / (MAX_BMI - MIN_BMI);
}

// ─── Suggestion Engine ───────────────────────────────────────────────────────

/**
 * Generate personalized health suggestions based on:
 * - Current BMI category
 * - Step goal achievement percentage
 * - Weight trend direction (losing/gaining/stable)
 * - Daily water intake vs goal
 */
export function generateSuggestions(params: {
  bmiResult: BMIResult;
  stepsPct: number;       // 0–1 (steps / stepsGoal)
  weightTrend: 'losing' | 'gaining' | 'stable';
  waterPct: number;       // 0–1 (water intake / waterGoal)
}): HealthSuggestion[] {
  const { bmiResult, stepsPct, weightTrend, waterPct } = params;
  const suggestions: HealthSuggestion[] = [];

  // ── BMI-based suggestions ──────────────────────────────────────────────

  if (bmiResult.category === 'underweight') {
    suggestions.push({
      id: 'bmi_under_1',
      icon: '🥑',
      title: 'Increase Calorie Intake',
      description: 'Focus on nutrient-dense foods like nuts, avocados, whole grains, and lean proteins. Aim for 300–500 extra calories daily.',
      priority: 'high',
      category: 'diet',
      accentColor: '#3B82F6',
    });
    suggestions.push({
      id: 'bmi_under_2',
      icon: '💪',
      title: 'Strength Training',
      description: 'Build muscle mass with progressive resistance training 3–4 times per week. Focus on compound movements like squats and deadlifts.',
      priority: 'medium',
      category: 'exercise',
      accentColor: '#3B82F6',
    });
  }

  if (bmiResult.category === 'normal') {
    suggestions.push({
      id: 'bmi_normal_1',
      icon: '✅',
      title: 'Maintain Your Balance',
      description: 'Great job! Keep your balanced diet and regular exercise routine. Monitor your weight weekly to catch small changes early.',
      priority: 'low',
      category: 'lifestyle',
      accentColor: '#2E7D5E',
    });
    suggestions.push({
      id: 'bmi_normal_2',
      icon: '🎯',
      title: 'Progressive Goals',
      description: 'Consider setting performance goals — improve your 5K time, increase weights, or try a new sport to stay motivated.',
      priority: 'low',
      category: 'exercise',
      accentColor: '#2E7D5E',
    });
  }

  if (bmiResult.category === 'overweight') {
    suggestions.push({
      id: 'bmi_over_1',
      icon: '🥗',
      title: 'Mindful Eating',
      description: 'Create a modest 300–500 calorie deficit. Prioritize vegetables, lean proteins, and whole grains. Avoid sugary drinks and processed snacks.',
      priority: 'high',
      category: 'diet',
      accentColor: '#F59E0B',
    });
    suggestions.push({
      id: 'bmi_over_2',
      icon: '🚶',
      title: 'Increase Daily Movement',
      description: 'Aim for 8,000–10,000 steps daily. Add 30 minutes of moderate cardio (brisk walking, cycling) 5 times per week.',
      priority: 'high',
      category: 'exercise',
      accentColor: '#F59E0B',
    });
  }

  if (bmiResult.category === 'obese') {
    suggestions.push({
      id: 'bmi_obese_1',
      icon: '🩺',
      title: 'Consult a Professional',
      description: 'Consider speaking with a healthcare provider or nutritionist for a personalized plan. Small, sustainable changes work best.',
      priority: 'high',
      category: 'lifestyle',
      accentColor: '#EF4444',
    });
    suggestions.push({
      id: 'bmi_obese_2',
      icon: '🏊',
      title: 'Low-Impact Exercise',
      description: 'Start with gentle activities like swimming, walking, or cycling. Aim for 150 minutes of moderate activity per week.',
      priority: 'high',
      category: 'exercise',
      accentColor: '#EF4444',
    });
  }

  // ── Steps-based suggestions ────────────────────────────────────────────

  if (stepsPct < 0.3) {
    suggestions.push({
      id: 'steps_low',
      icon: '👟',
      title: 'Get Moving!',
      description: 'You\'re below 30% of your step goal. Try a 10-minute walk after each meal to boost your daily count significantly.',
      priority: 'high',
      category: 'exercise',
      accentColor: '#6366F1',
    });
  } else if (stepsPct < 0.7) {
    suggestions.push({
      id: 'steps_mid',
      icon: '🚶‍♂️',
      title: 'Almost There!',
      description: `You're at ${Math.round(stepsPct * 100)}% of your step goal. Take the stairs, park farther away, or add a short evening stroll.`,
      priority: 'medium',
      category: 'exercise',
      accentColor: '#6366F1',
    });
  } else if (stepsPct >= 1) {
    suggestions.push({
      id: 'steps_hit',
      icon: '🏆',
      title: 'Step Goal Crushed!',
      description: 'You\'ve hit your step target! Consider increasing it by 1,000 to keep pushing your limits.',
      priority: 'low',
      category: 'exercise',
      accentColor: '#6366F1',
    });
  }

  // ── Weight trend suggestions ───────────────────────────────────────────

  if (weightTrend === 'losing' && bmiResult.category === 'underweight') {
    suggestions.push({
      id: 'trend_lose_under',
      icon: '⚠️',
      title: 'Weight Loss Concern',
      description: 'You\'re losing weight while already underweight. Increase your calorie intake and consider consulting a professional.',
      priority: 'high',
      category: 'diet',
      accentColor: '#EF4444',
    });
  } else if (weightTrend === 'gaining' && (bmiResult.category === 'overweight' || bmiResult.category === 'obese')) {
    suggestions.push({
      id: 'trend_gain_over',
      icon: '📉',
      title: 'Reverse the Trend',
      description: 'Your weight is trending up. Review your portions, reduce evening snacking, and aim for consistent daily movement.',
      priority: 'high',
      category: 'diet',
      accentColor: '#F59E0B',
    });
  } else if (weightTrend === 'stable') {
    suggestions.push({
      id: 'trend_stable',
      icon: '📊',
      title: 'Consistent Progress',
      description: 'Your weight has been stable. If you\'re targeting a change, try adjusting your calorie intake by ±200 kcal.',
      priority: 'low',
      category: 'lifestyle',
      accentColor: '#2E7D5E',
    });
  }

  // ── Hydration suggestions ─────────────────────────────────────────────

  if (waterPct < 0.5) {
    suggestions.push({
      id: 'water_low',
      icon: '💧',
      title: 'Stay Hydrated',
      description: 'You\'re below 50% of your water goal. Dehydration can slow metabolism and increase hunger. Keep a water bottle handy!',
      priority: 'high',
      category: 'hydration',
      accentColor: '#3B82F6',
    });
  }

  return suggestions;
}
