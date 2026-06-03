/**
 * Zero-dependency pure-functional utility layer for health calculations.
 * All formulas are research-based and standardized (WHO, Mifflin-St Jeor, MET).
 */

/**
 * Calculates Body Mass Index (BMI).
 * Formula: weight (kg) / (height (m) ^ 2)
 *
 * @param weightKg Weight of the user in kilograms (must be > 0).
 * @param heightCm Height of the user in centimeters (must be > 0).
 * @returns Calculated BMI value rounded to 1 decimal place, or 0 if inputs are invalid.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 * Men: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) + 5
 * Women: BMR = 10 * weight (kg) + 6.25 * height (cm) - 5 * age (years) - 161
 *
 * @param weightKg Weight in kilograms (must be > 0).
 * @param heightCm Height in centimeters (must be > 0).
 * @param age Years of age (must be > 0).
 * @param gender 'male' | 'female'
 * @returns BMR in calories (kcal) rounded to nearest integer, or 0 if inputs are invalid.
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female'
): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const genderAdjustment = gender === 'male' ? 5 : -161;
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + genderAdjustment);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE).
 * Formula: BMR * Activity Multiplier
 *
 * Activity Multipliers (Harris-Benedict standards):
 * - Sedentary (little to no exercise): 1.2
 * - Lightly active (light exercise/sports 1-3 days/week): 1.375
 * - Moderately active (moderate exercise/sports 3-5 days/week): 1.55
 * - Very active (hard exercise/sports 6-7 days/week): 1.725
 * - Extremely active (very hard exercise/physical job): 1.9
 *
 * @param bmr Basal Metabolic Rate in kcal (must be > 0).
 * @param activityLevel Activity description string.
 * @returns Calculated TDEE in kcal rounded to nearest integer.
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active'
): number {
  if (bmr <= 0) return 0;
  const multipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9,
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Estimates active calories burned based on steps and active minutes using MET (Metabolic Equivalent of Task).
 * MET conversions:
 * - Walking (normal pace, ~100 steps/min): ~3.5 METs
 * - Active/Strenuous exercise: ~7.5 METs
 *
 * Formulas:
 * - Active Calorie burn from steps: steps * 0.04 (approx 0.04 kcal/step for a 70kg individual, adjusted by weight)
 * - Active Calorie burn from active minutes: activeMinutes * 7.5 kcal/min
 *
 * @param steps Daily step count logged.
 * @param activeMinutes Daily active minutes logged.
 * @param weightKg Weight in kg for MET calculations (defaults to 70).
 * @returns Total estimated active calories burned (kcal).
 */
export function estimateActiveCalories(
  steps: number,
  activeMinutes: number,
  weightKg: number = 70
): number {
  const stepsKcal = steps * 0.04 * (weightKg / 70);
  const minutesKcal = activeMinutes * 7.5 * (weightKg / 70);
  return Math.round(stepsKcal + minutesKcal);
}

/**
 * Calculates macronutrient target breakdown (grams) based on calorie goal and profile goal type.
 * Macronutrient distributions (Carbs / Protein / Fat %):
 * - "Strength Training" / Muscle Building (40/30/30): High protein
 * - "Fat Loss" / Weight Loss (35/40/25): Very high protein, moderate carbs, lower fat
 * - "Maintenance" / Healthy Balance (50/20/30): Standard balanced distribution
 * - Default: (45/25/30)
 *
 * Calorie values:
 * - Carbs: 4 kcal/gram
 * - Protein: 4 kcal/gram
 * - Fat: 9 kcal/gram
 *
 * @param calorieGoal Daily calorie intake goal in kcal (must be > 0).
 * @param goalType User's profile goal (e.g. "Strength Training", "Fat Loss", "Maintenance").
 * @returns Macros target object with carbs, protein, and fat in grams.
 */
export function calculateMacros(
  calorieGoal: number,
  goalType: string
): { carbs: number; protein: number; fat: number } {
  if (calorieGoal <= 0) return { carbs: 0, protein: 0, fat: 0 };
  
  let carbsPct = 0.45;
  let proteinPct = 0.25;
  let fatPct = 0.30;
  
  const normalizedGoal = goalType.toLowerCase();
  if (normalizedGoal.includes('strength') || normalizedGoal.includes('muscle') || normalizedGoal.includes('gain')) {
    carbsPct = 0.40;
    proteinPct = 0.30;
    fatPct = 0.30;
  } else if (normalizedGoal.includes('fat') || normalizedGoal.includes('loss') || normalizedGoal.includes('weight')) {
    carbsPct = 0.35;
    proteinPct = 0.40;
    fatPct = 0.25;
  } else if (normalizedGoal.includes('maintain') || normalizedGoal.includes('balance')) {
    carbsPct = 0.50;
    proteinPct = 0.20;
    fatPct = 0.30;
  }
  
  const carbsGrams = Math.round((calorieGoal * carbsPct) / 4);
  const proteinGrams = Math.round((calorieGoal * proteinPct) / 4);
  const fatGrams = Math.round((calorieGoal * fatPct) / 9);
  
  return {
    carbs: carbsGrams,
    protein: proteinGrams,
    fat: fatGrams,
  };
}
