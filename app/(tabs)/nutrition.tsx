import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import KeyboardSlideView from '@/components/ui/KeyboardSlideView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import MacroBar from '@/components/ui/MacroBar';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ProgressRing from '@/components/ui/ProgressRing';
import NutritionScore from '@/components/ui/NutritionScore';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { FoodItem, Meal } from '@/types';

const FOOD_LIBRARY: FoodItem[] = [
  // ── International ──────────────────────────────────────────────
  { name: 'Oats with banana', grams: 100, kcal: 113, protein: 4, carbs: 19, fat: 2 },
  { name: 'Greek yoghurt', grams: 100, kcal: 93, protein: 9, carbs: 5, fat: 3 },
  { name: 'Chicken breast', grams: 100, kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: 'Brown rice', grams: 100, kcal: 111, protein: 2.6, carbs: 23, fat: 0.9 },
  { name: 'Salmon fillet', grams: 100, kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { name: 'Boiled Egg', grams: 50, kcal: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { name: 'Banana', grams: 120, kcal: 105, protein: 1.3, carbs: 27, fat: 0.3 },
  { name: 'Avocado', grams: 100, kcal: 160, protein: 2, carbs: 9, fat: 15 },
  { name: 'Almonds', grams: 30, kcal: 173, protein: 6, carbs: 6, fat: 15 },
  { name: 'Protein shake', grams: 300, kcal: 220, protein: 30, carbs: 10, fat: 2 },
  { name: 'Apple', grams: 150, kcal: 78, protein: 0.5, carbs: 20, fat: 0.3 },
  { name: 'Whole wheat bread', grams: 50, kcal: 120, protein: 5, carbs: 22, fat: 1.5 },

  // ── Indian — Breads & Breakfast ────────────────────────────────
  { name: 'Chapati / Roti', grams: 30, kcal: 90, protein: 2.5, carbs: 17, fat: 1.5 },
  { name: 'Plain Paratha', grams: 80, kcal: 240, protein: 5, carbs: 32, fat: 10 },
  { name: 'Aloo Paratha', grams: 120, kcal: 310, protein: 6, carbs: 42, fat: 12 },
  { name: 'Naan', grams: 90, kcal: 270, protein: 8, carbs: 46, fat: 5 },
  { name: 'Puri', grams: 30, kcal: 120, protein: 2, carbs: 14, fat: 6 },
  { name: 'Bhatura', grams: 90, kcal: 300, protein: 7, carbs: 42, fat: 12 },
  { name: 'Idli (1 piece)', grams: 40, kcal: 58, protein: 2, carbs: 12, fat: 0.3 },
  { name: 'Plain Dosa', grams: 100, kcal: 168, protein: 4, carbs: 32, fat: 3 },
  { name: 'Masala Dosa', grams: 150, kcal: 220, protein: 5, carbs: 36, fat: 7 },
  { name: 'Upma', grams: 100, kcal: 120, protein: 3.5, carbs: 18, fat: 4 },
  { name: 'Poha', grams: 100, kcal: 130, protein: 3, carbs: 26, fat: 2 },
  { name: 'Vada (1 piece)', grams: 50, kcal: 130, protein: 3.5, carbs: 14, fat: 7 },
  { name: 'Dhokla', grams: 50, kcal: 70, protein: 3, carbs: 10, fat: 1.5 },

  // ── Indian — Rice & Dal ────────────────────────────────────────
  { name: 'Basmati Rice (cooked)', grams: 100, kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: 'Chicken Biryani', grams: 100, kcal: 180, protein: 10, carbs: 22, fat: 6 },
  { name: 'Veg Biryani', grams: 100, kcal: 145, protein: 4, carbs: 25, fat: 4 },
  { name: 'Khichdi', grams: 100, kcal: 102, protein: 4, carbs: 18, fat: 2 },
  { name: 'Dal Tadka', grams: 100, kcal: 85, protein: 5, carbs: 11, fat: 3 },
  { name: 'Dal Makhani', grams: 100, kcal: 125, protein: 6, carbs: 14, fat: 5 },
  { name: 'Sambar', grams: 100, kcal: 55, protein: 3, carbs: 8, fat: 1.5 },
  { name: 'Rasam', grams: 150, kcal: 35, protein: 1, carbs: 6, fat: 0.5 },
  { name: 'Rajma', grams: 100, kcal: 127, protein: 8, carbs: 20, fat: 1 },
  { name: 'Chana Masala', grams: 100, kcal: 140, protein: 7, carbs: 20, fat: 4 },
  { name: 'Chole Bhature', grams: 200, kcal: 490, protein: 14, carbs: 60, fat: 21 },

  // ── Indian — Paneer & Dairy ────────────────────────────────────
  { name: 'Paneer (plain)', grams: 100, kcal: 265, protein: 18, carbs: 2, fat: 20 },
  { name: 'Paneer Butter Masala', grams: 100, kcal: 155, protein: 9, carbs: 8, fat: 11 },
  { name: 'Palak Paneer', grams: 100, kcal: 125, protein: 8, carbs: 6, fat: 8 },
  { name: 'Shahi Paneer', grams: 100, kcal: 190, protein: 10, carbs: 10, fat: 13 },
  { name: 'Dahi / Curd', grams: 100, kcal: 65, protein: 4, carbs: 5, fat: 3 },
  { name: 'Sweet Lassi', grams: 200, kcal: 160, protein: 5, carbs: 28, fat: 3 },
  { name: 'Masala Chai', grams: 150, kcal: 55, protein: 2, carbs: 8, fat: 2 },

  // ── Indian — Meat ─────────────────────────────────────────────
  { name: 'Butter Chicken', grams: 100, kcal: 165, protein: 14, carbs: 6, fat: 10 },
  { name: 'Chicken Curry', grams: 100, kcal: 150, protein: 15, carbs: 5, fat: 8 },
  { name: 'Mutton Curry', grams: 100, kcal: 225, protein: 18, carbs: 4, fat: 15 },
  { name: 'Egg Curry', grams: 100, kcal: 140, protein: 9, carbs: 5, fat: 10 },
  { name: 'Fish Curry', grams: 100, kcal: 130, protein: 14, carbs: 4, fat: 7 },

  // ── Indian — Snacks ────────────────────────────────────────────
  { name: 'Samosa (1 piece)', grams: 70, kcal: 150, protein: 3, carbs: 18, fat: 7 },
  { name: 'Pakora (veg)', grams: 50, kcal: 130, protein: 3, carbs: 13, fat: 7 },
  { name: 'Bhel Puri', grams: 100, kcal: 160, protein: 4, carbs: 28, fat: 4 },
  { name: 'Pani Puri (6 pcs)', grams: 90, kcal: 150, protein: 3, carbs: 26, fat: 4 },
  { name: 'Aloo Tikki', grams: 80, kcal: 170, protein: 3, carbs: 24, fat: 7 },
  { name: 'Kachori', grams: 60, kcal: 200, protein: 4, carbs: 22, fat: 11 },

  // ── Indian — Sweets ────────────────────────────────────────────
  { name: 'Gulab Jamun (1 pc)', grams: 50, kcal: 175, protein: 2, carbs: 30, fat: 6 },
  { name: 'Kheer', grams: 100, kcal: 180, protein: 5, carbs: 28, fat: 6 },
  { name: 'Sooji Halwa', grams: 100, kcal: 250, protein: 4, carbs: 40, fat: 9 },
  { name: 'Rasgulla (1 pc)', grams: 50, kcal: 105, protein: 2, carbs: 23, fat: 0.5 },

  // ── Indian — Raita & Sides ─────────────────────────────────────
  { name: 'Boondi Raita', grams: 100, kcal: 80, protein: 4, carbs: 9, fat: 3 },
  { name: 'Cucumber Raita', grams: 100, kcal: 55, protein: 3, carbs: 6, fat: 2 },
  { name: 'Green Chutney', grams: 20, kcal: 18, protein: 0.5, carbs: 2, fat: 1 },

  // ── Indian — Fruits (local) ────────────────────────────────────
  { name: 'Mango', grams: 100, kcal: 60, protein: 0.8, carbs: 15, fat: 0.4 },
  { name: 'Guava', grams: 100, kcal: 68, protein: 2.5, carbs: 14, fat: 1 },
  { name: 'Pomegranate', grams: 100, kcal: 83, protein: 1.7, carbs: 19, fat: 1.2 },
  { name: 'Papaya', grams: 100, kcal: 43, protein: 0.5, carbs: 11, fat: 0.3 },
  { name: 'Jackfruit', grams: 100, kcal: 95, protein: 1.7, carbs: 23, fat: 0.6 },
];

const initialMeals: Meal[] = [
  {
    id: 'breakfast', label: 'Breakfast', icon: '🌅', expanded: true,
    items: [
      { name: 'Oats with banana', grams: 300, kcal: 340, protein: 12, carbs: 58, fat: 6 },
      { name: 'Greek yoghurt', grams: 150, kcal: 140, protein: 14, carbs: 8, fat: 4 },
    ],
  },
  {
    id: 'lunch', label: 'Lunch', icon: '☀️', expanded: false,
    items: [
      { name: 'Chicken rice bowl', grams: 450, kcal: 520, protein: 38, carbs: 62, fat: 10 },
      { name: 'Side salad', grams: 120, kcal: 45, protein: 2, carbs: 8, fat: 1 },
    ],
  },
  {
    id: 'dinner', label: 'Dinner', icon: '🌙', expanded: false,
    items: [
      { name: 'Salmon & veggies', grams: 380, kcal: 420, protein: 36, carbs: 20, fat: 18 },
    ],
  },
  {
    id: 'snacks', label: 'Snacks', icon: '🍎', expanded: false,
    items: [
      { name: 'Protein bar', grams: 60, kcal: 200, protein: 20, carbs: 24, fat: 6 },
    ],
  },
];


export default function NutritionScreen() {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();

  const {
    user,
    meals,
    setMeals,
    addFoodToMeal,
    deleteFoodFromMeal,
    waterLogs,
    addWaterLog,
    customFoods,
    addCustomFood,
  } = useFitnessStore(useShallow((s) => ({
    user: s.user,
    meals: s.meals,
    setMeals: s.setMeals,
    addFoodToMeal: s.addFoodToMeal,
    deleteFoodFromMeal: s.deleteFoodFromMeal,
    waterLogs: s.waterLogs,
    addWaterLog: s.addWaterLog,
    customFoods: s.customFoods,
    addCustomFood: s.addCustomFood,
  })));

  const [showModal, setShowModal] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string>('breakfast');

  // Sync hydration metrics dynamically from the store
  const totalWaterMl = waterLogs.reduce((sum, item) => sum + item.ml, 0);
  const waterLogged = parseFloat((totalWaterMl / 1000).toFixed(2)); // in L
  const waterGoal = parseFloat((user.waterGoal / 1000).toFixed(2)); // in L

  // Search and portions state inside Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFormTab, setActiveFormTab] = useState<'library' | 'custom'>('library');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionGrams, setPortionGrams] = useState('100');

  // Custom Food state
  const [customName, setCustomName] = useState('');
  const [customGrams, setCustomGrams] = useState('100');
  const [customKcal, setCustomKcal] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customError, setCustomError] = useState('');

  // Auto-detect meal category based on current hour of day
  const getContextualMealId = (): string => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 21) return 'dinner';
    return 'snacks';
  };

  const toggleMeal = (id: string) => {
    setMeals((ms: Meal[]) => ms.map((m: Meal) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));
  };

  const mealKcal = (m: Meal) => m.items.reduce((s, i) => s + i.kcal, 0);

  // Dynamic calculations (Option A - Recommended)
  const totalKcal = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.kcal, 0), 0);
  const goalKcal = user.calorieGoal;
  const totalProtein = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0), 0);
  const totalFibre = Math.round(totalCarbs * 0.1); // Fiber dynamic estimate

  // Dynamic Nutrition scoring (Option A - Recommended)
  const calculateScore = (): 'A' | 'B' | 'C' => {
    if (totalKcal > goalKcal + 100) return 'C'; // Exceeded calories by too much
    if (totalProtein >= 105 && totalKcal <= goalKcal) return 'A'; // High protein, under calories
    if (totalProtein >= 70 && totalKcal <= goalKcal) return 'B'; // Normal protein
    return 'C';
  };
  const activeScore = calculateScore();

  // Delete food item (Option A - Recommended)
  const handleDeleteFood = (mealId: string, itemIndex: number) => {
    deleteFoodFromMeal(mealId, itemIndex);
  };

  // Pre-select meal time on Modal open
  const openLogModal = (mealId?: string) => {
    setActiveMealId(mealId || getContextualMealId());
    setSelectedFood(null);
    setSearchQuery('');
    setPortionGrams('100');
    setCustomName('');
    setCustomGrams('100');
    setCustomKcal('');
    setCustomProtein('');
    setCustomCarbs('');
    setCustomFat('');
    setCustomError('');
    setActiveFormTab('library');
    setShowModal(true);
  };

  // Dynamic Portion Calculations
  const getScaledVal = (base: number, currentGrams: number, baseGrams: number) => {
    return parseFloat(((base * currentGrams) / baseGrams).toFixed(1));
  };

  const handleSaveLibraryFood = () => {
    if (!selectedFood) return;
    const grams = parseFloat(portionGrams);
    if (isNaN(grams) || grams <= 0) return;

    const baseG = selectedFood.grams;
    const foodToLog: FoodItem = {
      name: selectedFood.name,
      grams: grams,
      kcal: Math.round(getScaledVal(selectedFood.kcal, grams, baseG)),
      protein: getScaledVal(selectedFood.protein, grams, baseG),
      carbs: getScaledVal(selectedFood.carbs, grams, baseG),
      fat: getScaledVal(selectedFood.fat, grams, baseG),
    };

    addFoodToMeal(activeMealId, foodToLog);

    // Autoexpand log group locally
    setMeals((prev: Meal[]) =>
      prev.map((m: Meal) => (m.id === activeMealId ? { ...m, expanded: true } : m))
    );
    setShowModal(false);
  };

  const handleSaveCustomFood = () => {
    if (!customName.trim()) {
      setCustomError('Food name is required');
      return;
    }
    const cal = parseInt(customKcal, 10);
    const gr = parseFloat(customGrams);
    const prot = parseFloat(customProtein);
    const cb = parseFloat(customCarbs);
    const ft = parseFloat(customFat);

    if (isNaN(cal) || cal < 0 || isNaN(gr) || gr <= 0) {
      setCustomError('Enter valid calories and weight');
      return;
    }

    const foodToLog: FoodItem = {
      name: customName.trim(),
      grams: gr,
      kcal: cal,
      protein: isNaN(prot) ? 0 : prot,
      carbs: isNaN(cb) ? 0 : cb,
      fat: isNaN(ft) ? 0 : ft,
    };

    // Save to My Foods so the user can reuse it from the library
    addCustomFood(foodToLog);

    addFoodToMeal(activeMealId, foodToLog);
    setMeals((prev) =>
      prev.map((m) => (m.id === activeMealId ? { ...m, expanded: true } : m))
    );
    setShowModal(false);
  };

  // Library search: match against built-in list; My Foods shown separately above
  const q = searchQuery.toLowerCase();
  const filteredLibrary = FOOD_LIBRARY.filter((item) => item.name.toLowerCase().includes(q));
  const filteredMyFoods = customFoods.filter((item) => item.name.toLowerCase().includes(q || 'a'));

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Nutrition"
          subtitle="FOOD & MACROS"
          icon={{ lib: 'MCI', name: 'food-apple' }}
          accentColor="#FB7185"
        />

        {/* Dynamic Water Chip (Quick add +250ml) */}
        <TouchableOpacity
          style={styles.waterChip}
          activeOpacity={0.8}
          onPress={() => addWaterLog(250)}
        >
          <View style={styles.waterChipIconWrap}>
            <Ionicons name="water" size={16} color={colors.chart.water} />
          </View>
          <View style={styles.waterChipContent}>
            <Text style={styles.waterChipText}>Water: {waterLogged.toFixed(2)} / {waterGoal} L today</Text>
            <View style={styles.waterBar}>
              <View style={[styles.waterFill, { width: `${(waterLogged / waterGoal) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.waterChipAddBtn}>
            <Ionicons name="add-circle" size={20} color={colors.chart.water} />
            <Text style={styles.waterChipAddTxt}>+250ml</Text>
          </View>
        </TouchableOpacity>

        {/* Macro summary (Dynamic calculations) */}
        <GlassCard accentColor={colors.lime}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryLeft}>
              <Text style={styles.kcalNum}>{totalKcal}</Text>
              <Text style={styles.kcalLabel}>/ {goalKcal} kcal</Text>
              <View style={[styles.remainBadge, { backgroundColor: totalKcal <= goalKcal ? colors.lime + '15' : colors.danger + '15', borderColor: totalKcal <= goalKcal ? colors.lime + '30' : colors.danger + '30' }]}>
                <Ionicons name="flame" size={11} color={totalKcal <= goalKcal ? colors.lime : colors.danger} />
                <Text style={[styles.kcalRemain, { color: totalKcal <= goalKcal ? colors.lime : colors.danger }]}>
                  {totalKcal <= goalKcal ? `${goalKcal - totalKcal} remaining` : `${totalKcal - goalKcal} exceeded`}
                </Text>
              </View>
            </View>
            <NutritionScore score={activeScore} />
          </View>
          <MacroBar label="Calories" current={totalKcal} goal={goalKcal} color={colors.chart.calories} unit=" kcal" />
          <MacroBar label="Protein" current={totalProtein} goal={150} color={colors.chart.protein} />
          <MacroBar label="Carbs" current={totalCarbs} goal={250} color={colors.chart.carbs} />
          <MacroBar label="Fibre" current={totalFibre} goal={30} color={colors.chart.fibre} />
        </GlassCard>

        {/* Meals Dynamic Mapping */}
        {meals.map((meal) => (
          <GlassCard key={meal.id} noPadding>
            <TouchableOpacity
              style={styles.mealHeader}
              onPress={() => toggleMeal(meal.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View style={styles.mealHeaderText}>
                <Text style={styles.mealLabel}>{meal.label}</Text>
                <Text style={styles.mealKcal}>{mealKcal(meal)} kcal</Text>
              </View>
              <View style={[styles.mealChevronWrap, meal.expanded && styles.mealChevronWrapActive]}>
                <Ionicons
                  name={meal.expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={meal.expanded ? colors.lime : colors.muted}
                />
              </View>
            </TouchableOpacity>

            {meal.expanded && (
              <View style={styles.mealBody}>
                {meal.items.map((item, i) => (
                  <View key={i} style={styles.foodItem}>
                    <View style={styles.foodLeft}>
                      <Text style={styles.foodName}>{item.name}</Text>
                      <Text style={styles.foodGrams}>{item.grams}g</Text>
                    </View>
                    <View style={styles.foodChips}>
                      <View style={[styles.chip, { backgroundColor: colors.chart.calories + '18' }]}>
                        <Text style={[styles.chipText, { color: colors.chart.calories }]}>{item.kcal} kcal</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: colors.chart.protein + '18' }]}>
                        <Text style={[styles.chipText, { color: colors.chart.protein }]}>{item.protein}P</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: colors.chart.carbs + '18' }]}>
                        <Text style={[styles.chipText, { color: colors.chart.carbs }]}>{item.carbs}C</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFood(meal.id, i)} activeOpacity={0.75}>
                      <Ionicons name="close-circle" size={18} color={colors.danger + 'bb'} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Photo log card */}
                <TouchableOpacity style={styles.photoRow} activeOpacity={0.75}>
                  <Ionicons name="camera-outline" size={16} color={colors.muted} />
                  <Text style={styles.photoText}>Log plate photo</Text>
                </TouchableOpacity>

                {/* Card-level Add Food trigger */}
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => openLogModal(meal.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={14} color={colors.lime} />
                  <Text style={styles.addFoodBtnText}>Add Food</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => openLogModal()}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={colors.bg} />
        <Text style={styles.fabText}>Log Food</Text>
      </TouchableOpacity>

      {/* Quick-add Segmented Modal (Option A - Recommended) */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBackdrop}>
            <KeyboardSlideView style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Log Food</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Meal target selector pills */}
              <View style={styles.mealTargetSelector}>
                {['breakfast', 'lunch', 'dinner', 'snacks'].map((id) => (
                  <TouchableOpacity
                    key={id}
                    style={[styles.mealTargetBtn, activeMealId === id && styles.mealTargetBtnActive]}
                    onPress={() => setActiveMealId(id)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.mealTargetTxt, activeMealId === id && styles.mealTargetTxtActive]}>
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Segment Tab selector */}
              <View style={styles.modalQuickAdd}>
                <TouchableOpacity
                  style={[styles.modalTab, activeFormTab === 'library' && styles.modalTabActive]}
                  onPress={() => {
                    setActiveFormTab('library');
                    setSelectedFood(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="search-outline" size={13} color={activeFormTab === 'library' ? colors.lime : colors.muted} />
                  <Text style={[styles.modalTabText, activeFormTab === 'library' && styles.modalTabTextActive]}>Search Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalTab, activeFormTab === 'custom' && styles.modalTabActive]}
                  onPress={() => setActiveFormTab('custom')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={13} color={activeFormTab === 'custom' ? colors.lime : colors.muted} />
                  <Text style={[styles.modalTabText, activeFormTab === 'custom' && styles.modalTabTextActive]}>Custom Food</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {activeFormTab === 'library' ? (
                  <View style={styles.modalScrollContent}>
                    {/* Portion Configurator if food selected */}
                    {selectedFood ? (
                      <View style={styles.selectedConfigCard}>
                        <View style={styles.configHeader}>
                          <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backToSearch}>
                            <Ionicons name="arrow-back" size={16} color={colors.lime} />
                            <Text style={styles.backToSearchText}>Search Again</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.configFoodTitleRow}>
                          <Text style={styles.configFoodName}>{selectedFood.name}</Text>
                          <Text style={styles.configBaseScale}>Base: {selectedFood.grams}g</Text>
                        </View>

                        {/* Grams Input */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>Portion Size (grams)</Text>
                          <View style={styles.inputFieldWrap}>
                            <TextInput
                              style={styles.textInput}
                              value={portionGrams}
                              onChangeText={setPortionGrams}
                              keyboardType="numeric"
                              placeholder="100"
                              maxLength={4}
                            />
                            <Text style={styles.inputFieldUnit}>grams</Text>
                          </View>
                        </View>

                        {/* Dynamic Scaled Macros Panel */}
                        <View style={styles.liveScaledMacros}>
                          <Text style={styles.macroDisplayLabel}>CALCULATED MACROS</Text>
                          <View style={styles.liveMacroRow}>
                            <View style={styles.liveMacroCell}>
                              <Text style={styles.liveMacroVal}>{Math.round(getScaledVal(selectedFood.kcal, parseFloat(portionGrams) || 0, selectedFood.grams))}</Text>
                              <Text style={styles.liveMacroLbl}>kcal</Text>
                            </View>
                            <View style={styles.liveMacroCell}>
                              <Text style={[styles.liveMacroVal, { color: colors.chart.protein }]}>{getScaledVal(selectedFood.protein, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Protein</Text>
                            </View>
                            <View style={styles.liveMacroCell}>
                              <Text style={[styles.liveMacroVal, { color: colors.chart.carbs }]}>{getScaledVal(selectedFood.carbs, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Carbs</Text>
                            </View>
                            <View style={styles.liveMacroCell}>
                              <Text style={[styles.liveMacroVal, { color: colors.danger }]}>{getScaledVal(selectedFood.fat, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Fat</Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity style={styles.modalAddLogBtn} onPress={handleSaveLibraryFood} activeOpacity={0.8}>
                          <Ionicons name="checkmark" size={16} color={colors.white} />
                          <Text style={styles.modalAddLogBtnTxt}>Add to {activeMealId}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.searchFlow}>
                        {/* Search Input bar */}
                        <View style={styles.modalSearchWrap}>
                          <Ionicons name="search" size={18} color={colors.muted} />
                          <TextInput
                            style={styles.modalInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search breakfast/lunch items..."
                            placeholderTextColor={colors.muted}
                          />
                          {!!searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                              <Ionicons name="close-circle" size={18} color={colors.muted} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* My Foods section (user-created) */}
                        {filteredMyFoods.length > 0 && (
                          <View style={styles.searchResultsContainer}>
                            <View style={styles.librarySectionHeader}>
                              <Ionicons name="person-circle-outline" size={13} color={colors.lime} />
                              <Text style={[styles.librarySectionLabel, { color: colors.lime }]}>My Foods</Text>
                            </View>
                            {filteredMyFoods.map((food, idx) => (
                              <TouchableOpacity
                                key={`my_${idx}`}
                                style={styles.searchResultRow}
                                onPress={() => { setSelectedFood(food); setPortionGrams(food.grams.toString()); }}
                                activeOpacity={0.7}
                              >
                                <View style={styles.searchResultLeft}>
                                  <Text style={styles.searchResultName}>{food.name}</Text>
                                  <Text style={styles.searchResultBase}>{food.grams}g · custom</Text>
                                </View>
                                <View style={styles.searchResultRight}>
                                  <Text style={styles.searchResultKcal}>{food.kcal} kcal</Text>
                                  <Ionicons name="chevron-forward" size={14} color={colors.lime} />
                                </View>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}

                        {/* Built-in library results */}
                        <View style={styles.searchResultsContainer}>
                          {filteredLibrary.length > 0 && (
                            <View style={styles.librarySectionHeader}>
                              <Ionicons name="library-outline" size={13} color={colors.muted} />
                              <Text style={styles.librarySectionLabel}>Food Library</Text>
                            </View>
                          )}
                          {filteredLibrary.length > 0 ? (
                            filteredLibrary.map((food) => (
                              <TouchableOpacity
                                key={food.name}
                                style={styles.searchResultRow}
                                onPress={() => {
                                  setSelectedFood(food);
                                  setPortionGrams(food.grams.toString());
                                }}
                                activeOpacity={0.7}
                              >
                                <View style={styles.searchResultLeft}>
                                  <Text style={styles.searchResultName}>{food.name}</Text>
                                  <Text style={styles.searchResultBase}>{food.grams}g Serving</Text>
                                </View>
                                <View style={styles.searchResultRight}>
                                  <Text style={styles.searchResultKcal}>{food.kcal} kcal</Text>
                                  <Ionicons name="chevron-forward" size={14} color={colors.lime} />
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.noSearchData}>
                              <Ionicons name="alert-circle-outline" size={28} color={colors.muted} />
                              <Text style={styles.noSearchText}>No matching foods found</Text>
                              <TouchableOpacity style={styles.jumpToCustomBtn} onPress={() => setActiveFormTab('custom')}>
                                <Text style={styles.jumpToCustomText}>Create Custom Entry</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.formSection}>
                    {/* Custom Food Form */}
                    {!!customError && <Text style={styles.customFormError}>{customError}</Text>}

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Food Name</Text>
                      <View style={styles.inputFieldWrap}>
                        <TextInput
                          style={styles.textInput}
                          value={customName}
                          onChangeText={(t) => {
                            setCustomName(t);
                            if (customError) setCustomError('');
                          }}
                          placeholder="e.g. Avocado Toast"
                          placeholderTextColor={colors.muted}
                        />
                      </View>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Calories (kcal)</Text>
                        <View style={styles.inputFieldWrap}>
                          <TextInput
                            style={styles.textInput}
                            value={customKcal}
                            onChangeText={setCustomKcal}
                            keyboardType="numeric"
                            placeholder="280"
                            placeholderTextColor={colors.muted}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Serving Weight</Text>
                        <View style={styles.inputFieldWrap}>
                          <TextInput
                            style={styles.textInput}
                            value={customGrams}
                            onChangeText={setCustomGrams}
                            keyboardType="numeric"
                            placeholder="150"
                            placeholderTextColor={colors.muted}
                          />
                          <Text style={styles.inputFieldUnit}>g</Text>
                        </View>
                      </View>
                    </View>

                    <View style={styles.inputRow}>
                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Protein (g)</Text>
                        <View style={styles.inputFieldWrap}>
                          <TextInput
                            style={styles.textInput}
                            value={customProtein}
                            onChangeText={setCustomProtein}
                            keyboardType="numeric"
                            placeholder="12"
                            placeholderTextColor={colors.muted}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Carbs (g)</Text>
                        <View style={styles.inputFieldWrap}>
                          <TextInput
                            style={styles.textInput}
                            value={customCarbs}
                            onChangeText={setCustomCarbs}
                            keyboardType="numeric"
                            placeholder="32"
                            placeholderTextColor={colors.muted}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, { flex: 1 }]}>
                        <Text style={styles.inputLabel}>Fats (g)</Text>
                        <View style={styles.inputFieldWrap}>
                          <TextInput
                            style={styles.textInput}
                            value={customFat}
                            onChangeText={setCustomFat}
                            keyboardType="numeric"
                            placeholder="8"
                            placeholderTextColor={colors.muted}
                          />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.modalAddLogBtn} onPress={handleSaveCustomFood} activeOpacity={0.8}>
                      <Ionicons name="checkmark" size={16} color={colors.white} />
                      <Text style={styles.modalAddLogBtnTxt}>Add Custom to {activeMealId}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>

              {/* Modal cancel block */}
              {(!selectedFood || activeFormTab !== 'library') && (
                <View style={styles.modalFooterClose}>
                  <TouchableOpacity style={styles.cancelSheetBtn} onPress={() => setShowModal(false)}>
                    <Text style={styles.cancelSheetBtnText}>Close Tracker</Text>
                  </TouchableOpacity>
                </View>
              )}
            </KeyboardSlideView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.chart.water + '10',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: colors.chart.water + '30',
    padding: 12,
  },
  waterChipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.chart.water + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterChipContent: { flex: 1, gap: 4 },
  waterChipText: { ...Typography.captionBold, color: colors.text.primary },
  waterBar: { height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)', borderRadius: 2 },
  waterFill: { height: '100%', backgroundColor: colors.chart.water, borderRadius: 2 },
  waterChipAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.chart.water + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.chart.water + '25',
  },
  waterChipAddTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.chart.water,
  },

  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryLeft: { gap: 2 },
  kcalNum: { ...Typography.h1, color: colors.text.primary },
  kcalLabel: { ...Typography.caption, color: colors.muted },
  remainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginTop: 4,
  },
  kcalRemain: { ...Typography.captionBold },

  mealHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: Radius.lg,
  },
  mealIcon: { fontSize: 24 },
  mealHeaderText: { flex: 1 },
  mealLabel: { ...Typography.h4, color: colors.text.primary },
  mealKcal: { ...Typography.caption, color: colors.muted },
  mealChevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealChevronWrapActive: {
    backgroundColor: colors.lime + '15',
  },

  mealBody: { paddingHorizontal: 16, paddingBottom: 12, gap: 2 },
  foodItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  foodLeft: { flex: 1 },
  foodName: { ...Typography.bodyBold, color: colors.text.primary },
  foodGrams: { ...Typography.caption, color: colors.muted },
  foodChips: { flexDirection: 'row', gap: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  chipText: { ...Typography.micro },
  deleteBtn: { padding: 6 },

  photoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  photoText: { ...Typography.caption, color: colors.muted },

  addFoodBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lime + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.lime + '40',
  },
  addFoodBtnText: { ...Typography.captionBold, color: colors.lime },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 14,
    shadowColor: colors.lime, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { ...Typography.bodyBold, color: colors.bg },

  // Modal styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.70)' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  modalSheet: {
    backgroundColor: colors.ivory, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 520, maxHeight: '92%',
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0,
    borderColor: colors.lime + '20',
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: colors.muted + '44', borderRadius: 2, marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { ...Typography.h3, color: colors.text.primary },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder,
  },
  mealTargetSelector: {
    flexDirection: 'row', gap: 6, marginBottom: 16,
  },
  mealTargetBtn: {
    flex: 1, height: 36, borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  mealTargetBtnActive: {
    borderColor: colors.lime, backgroundColor: colors.lime + '12',
  },
  mealTargetTxt: { ...Typography.micro, color: colors.muted },
  mealTargetTxtActive: { color: colors.lime },

  modalQuickAdd: {
    flexDirection: 'row', backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: Radius.pill,
    padding: 3, marginBottom: 16, borderWidth: 1, borderColor: colors.cardBorder,
  },
  modalTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderRadius: Radius.pill,
  },
  modalTabActive: {
    backgroundColor: colors.card,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  modalTabText: { ...Typography.captionBold, color: colors.muted },
  modalTabTextActive: { color: colors.lime },

  modalScroll: { flex: 1 },
  modalScrollContent: { paddingBottom: 16 },

  // Search Flow
  searchFlow: {
    gap: 12,
  },
  modalSearchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: 12, height: 46, marginBottom: 12,
  },
  modalInput: { flex: 1, color: colors.text.primary, ...Typography.body, padding: 0 },
  searchResultsContainer: { gap: 10 },
  librarySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 6, marginTop: 4 },
  librarySectionLabel: { ...Typography.micro, fontWeight: '700' as const, color: colors.muted, letterSpacing: 0.5, textTransform: 'uppercase' as const },
  searchResultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    padding: 12,
  },
  searchResultLeft: { gap: 2 },
  searchResultName: { ...Typography.bodyBold, color: colors.text.primary },
  searchResultBase: { ...Typography.micro, color: colors.muted },
  searchResultRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchResultKcal: { ...Typography.captionBold, color: colors.chart.calories },
  noSearchData: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  noSearchText: { ...Typography.caption, color: colors.muted },
  jumpToCustomBtn: {
    marginTop: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: colors.lime, backgroundColor: colors.lime + '10',
  },
  jumpToCustomText: { ...Typography.captionBold, color: colors.lime },

  // Portions Configurator Card
  selectedConfigCard: {
    backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    padding: 16, gap: 16,
  },
  configHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.cardBorder, paddingBottom: 8 },
  backToSearch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backToSearchText: { ...Typography.captionBold, color: colors.lime },
  configFoodTitleRow: { gap: 2 },
  configFoodName: { ...Typography.h4, color: colors.text.primary },
  configBaseScale: { ...Typography.caption, color: colors.muted },
  liveScaledMacros: {
    padding: 12, backgroundColor: colors.bg + '66', borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder, gap: 8,
  },
  macroDisplayLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8, color: colors.muted },
  liveMacroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  liveMacroCell: { alignItems: 'center', gap: 2, flex: 1 },
  liveMacroVal: { ...Typography.bodyBold, color: colors.text.primary },
  liveMacroLbl: { ...Typography.micro, color: colors.muted },
  modalAddLogBtn: {
    height: 46, borderRadius: Radius.md, backgroundColor: colors.lime,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  modalAddLogBtnTxt: { ...Typography.bodyBold, color: colors.white },

  // Custom Form
  formSection: { gap: 14, paddingBottom: 16 },
  inputGroup: { gap: 6 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputLabel: { ...Typography.captionBold, color: colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: colors.danger, backgroundColor: colors.danger + '05' },
  textInput: { flex: 1, ...Typography.body, color: colors.text.primary, padding: 0 },
  inputFieldUnit: { ...Typography.caption, color: colors.muted, marginLeft: 4 },
  customFormError: { ...Typography.captionBold, color: colors.danger, textAlign: 'center', marginBottom: 4 },

  modalFooterClose: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.cardBorder },
  cancelSheetBtn: { height: 44, borderRadius: Radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  cancelSheetBtnText: { ...Typography.bodyBold, color: colors.text.secondary },
});
