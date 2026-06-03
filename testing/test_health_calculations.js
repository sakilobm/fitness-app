const path = require('path');

// Load the compiled JavaScript code from the build output directory
const {
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  estimateActiveCalories,
  calculateMacros
} = require('./dist/healthCalculations');

console.log('🧪 Starting Health Calculations Unit Tests...');

let failures = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    failures++;
  } else {
    console.log(`✅ Passed: ${message}`);
  }
}

// 1. BMI Test
const bmi = calculateBMI(78.4, 178);
assert(bmi === 24.7, `BMI for 78.4kg, 178cm should be 24.7, got ${bmi}`);

const invalidBmi = calculateBMI(0, 178);
assert(invalidBmi === 0, `BMI for 0kg should be 0, got ${invalidBmi}`);

// 2. BMR Test
const bmrMale = calculateBMR(78.4, 178, 24, 'male');
assert(bmrMale === 1782, `BMR for Male (78.4kg, 178cm, 24y) should be 1782, got ${bmrMale}`);

const bmrFemale = calculateBMR(78.4, 178, 24, 'female');
assert(bmrFemale === 1616, `BMR for Female (78.4kg, 178cm, 24y) should be 1616, got ${bmrFemale}`);

// 3. TDEE Test
const tdee = calculateTDEE(1782, 'moderately_active');
assert(tdee === 2762, `TDEE for BMR 1782, moderately active should be 2762, got ${tdee}`);

// 4. Active Calories Test
const activeCals = estimateActiveCalories(6240, 48, 78.4);
assert(activeCals === 683, `Active calories for 6240 steps, 48 active mins at 78.4kg should be 683, got ${activeCals}`);

// 5. Macros Test
const macrosLoss = calculateMacros(2300, 'Fat Loss');
assert(macrosLoss.carbs === 201 && macrosLoss.protein === 230 && macrosLoss.fat === 64, 
  `Macros for Fat Loss (2300 kcal) should be carbs: 201, protein: 230, fat: 64. Got: ${JSON.stringify(macrosLoss)}`);

const macrosGain = calculateMacros(2300, 'Strength Training');
assert(macrosGain.carbs === 230 && macrosGain.protein === 173 && macrosGain.fat === 77, 
  `Macros for Strength Training (2300 kcal) should be carbs: 230, protein: 173, fat: 77. Got: ${JSON.stringify(macrosGain)}`);

if (failures > 0) {
  console.error(`\n❌ Tests finished with ${failures} failure(s).`);
  process.exit(1);
} else {
  console.log('\n🎉 All Health Calculations Tests Passed Successfully!');
  process.exit(0);
}
