export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
export type FitnessGoal = 'lose_fat' | 'maintain' | 'build_muscle';
export type BiologicalSex = 'male' | 'female';

export interface AlgorithmInputs {
  age: number;
  weightKg: number;
  heightCm: number;
  sex: BiologicalSex;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
}

export interface AlgorithmOutputs {
  bmr: number;
  tdee: number;
  calorieGoal: number;
  waterGoalMl: number;
  stepsGoal: number;
  workoutGoal: number;
}

const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
};

const STEPS_BASE = {
  sedentary: 5000,
  lightly_active: 7500,
  moderately_active: 10000,
  very_active: 12500,
};

const WORKOUT_BASE = {
  sedentary: 2,
  lightly_active: 3,
  moderately_active: 4,
  very_active: 5,
};

export function calculateFitnessEngine(inputs: AlgorithmInputs): AlgorithmOutputs {
  const { age, weightKg, heightCm, sex, activityLevel, goal } = inputs;

  // 1. Calculate BMR (Mifflin-St Jeor)
  // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
  // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age);
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  bmr = Math.round(bmr);

  // 2. Calculate TDEE
  const tdee = Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);

  // 3. Adjust for Goal
  let calorieGoal = tdee;
  let stepsGoal = STEPS_BASE[activityLevel];
  let workoutGoal = WORKOUT_BASE[activityLevel];

  if (goal === 'lose_fat') {
    calorieGoal -= 500;
    stepsGoal += 2000;
  } else if (goal === 'build_muscle') {
    calorieGoal += 300;
    workoutGoal += 1;
  }

  // Ensure minimum safe calorie intake
  const MIN_CALORIES = sex === 'male' ? 1500 : 1200;
  calorieGoal = Math.max(calorieGoal, MIN_CALORIES);

  // 4. Hydration (approx 35ml per kg of body weight, max 4000ml)
  let waterGoalMl = Math.round(weightKg * 35);
  // Add a bit of extra water if they are highly active
  if (activityLevel === 'moderately_active' || activityLevel === 'very_active') {
    waterGoalMl += 500;
  }
  
  // Round to nearest 100ml
  waterGoalMl = Math.round(waterGoalMl / 100) * 100;
  waterGoalMl = Math.min(Math.max(waterGoalMl, 2000), 5000); // Between 2L and 5L

  return {
    bmr,
    tdee,
    calorieGoal,
    waterGoalMl,
    stepsGoal,
    workoutGoal,
  };
}
