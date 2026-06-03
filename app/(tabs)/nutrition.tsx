import React, { useState, useEffect } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import MacroBar from '@/components/ui/MacroBar';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ProgressRing from '@/components/ui/ProgressRing';
import { Colors, Typography, Radius } from '@/constants/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { FoodItem, Meal } from '@/types';

const FOOD_LIBRARY: FoodItem[] = [
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

function NutritionScore({ score }: { score: 'A' | 'B' | 'C' }) {
  const colors: Record<string, string> = { A: Colors.lime, B: Colors.amber, C: Colors.danger };
  const pcts: Record<string, number> = { A: 0.92, B: 0.72, C: 0.52 };
  const labels: Record<string, string> = { A: 'Excellent', B: 'Good', C: 'Needs Work' };
  return (
    <View style={scoreS.container}>
      <ProgressRing size={64} strokeWidth={6} progress={pcts[score]} color={colors[score]}>
        <Text style={[scoreS.letter, { color: colors[score] }]}>{score}</Text>
      </ProgressRing>
      <View style={[scoreS.labelBadge, { backgroundColor: colors[score] + '15', borderColor: colors[score] + '35' }]}>
        <Text style={[scoreS.labelText, { color: colors[score] }]}>{labels[score]}</Text>
      </View>
    </View>
  );
}

const scoreS = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  letter: { ...Typography.h2 },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  labelText: { ...Typography.micro },
});

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  
  const {
    user,
    meals,
    setMeals,
    addFoodToMeal,
    deleteFoodFromMeal,
    waterLogs,
    addWaterLog,
  } = useFitnessStore();

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
    setMeals((ms) => ms.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));
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
    setMeals((prev) =>
      prev.map((m) => (m.id === activeMealId ? { ...m, expanded: true } : m))
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

    addFoodToMeal(activeMealId, foodToLog);
    
    // Autoexpand log group locally
    setMeals((prev) =>
      prev.map((m) => (m.id === activeMealId ? { ...m, expanded: true } : m))
    );
    setShowModal(false);
  };

  // Live filtering of library list
  const filteredLibrary = FOOD_LIBRARY.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Nutrition"
          subtitle="FOOD & MACROS"
          icon={{ lib: 'MCI', name: 'food-apple' }}
          accentColor={Colors.chart.calories}
        />

        {/* Dynamic Water Chip (Quick add +250ml) */}
        <TouchableOpacity 
          style={styles.waterChip} 
          activeOpacity={0.8}
          onPress={() => addWaterLog(250)}
        >
          <View style={styles.waterChipIconWrap}>
            <Ionicons name="water" size={16} color={Colors.chart.water} />
          </View>
          <View style={styles.waterChipContent}>
            <Text style={styles.waterChipText}>Water: {waterLogged.toFixed(2)} / {waterGoal} L today</Text>
            <View style={styles.waterBar}>
              <View style={[styles.waterFill, { width: `${(waterLogged / waterGoal) * 100}%` }]} />
            </View>
          </View>
          <View style={styles.waterChipAddBtn}>
            <Ionicons name="add-circle" size={20} color={Colors.chart.water} />
            <Text style={styles.waterChipAddTxt}>+250ml</Text>
          </View>
        </TouchableOpacity>

        {/* Macro summary (Dynamic calculations) */}
        <GlassCard accentColor={Colors.lime}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryLeft}>
              <Text style={styles.kcalNum}>{totalKcal}</Text>
              <Text style={styles.kcalLabel}>/ {goalKcal} kcal</Text>
              <View style={[styles.remainBadge, { backgroundColor: totalKcal <= goalKcal ? Colors.lime + '15' : Colors.danger + '15', borderColor: totalKcal <= goalKcal ? Colors.lime + '30' : Colors.danger + '30' }]}>
                <Ionicons name="flame" size={11} color={totalKcal <= goalKcal ? Colors.lime : Colors.danger} />
                <Text style={[styles.kcalRemain, { color: totalKcal <= goalKcal ? Colors.lime : Colors.danger }]}>
                  {totalKcal <= goalKcal ? `${goalKcal - totalKcal} remaining` : `${totalKcal - goalKcal} exceeded`}
                </Text>
              </View>
            </View>
            <NutritionScore score={activeScore} />
          </View>
          <MacroBar label="Calories" current={totalKcal} goal={goalKcal} color={Colors.chart.calories} unit=" kcal" />
          <MacroBar label="Protein" current={totalProtein} goal={150} color={Colors.chart.protein} />
          <MacroBar label="Carbs" current={totalCarbs} goal={250} color={Colors.chart.carbs} />
          <MacroBar label="Fibre" current={totalFibre} goal={30} color={Colors.chart.fibre} />
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
                  color={meal.expanded ? Colors.lime : Colors.muted}
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
                      <View style={[styles.chip, { backgroundColor: Colors.chart.calories + '18' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.calories }]}>{item.kcal} kcal</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: Colors.chart.protein + '18' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.protein }]}>{item.protein}P</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: Colors.chart.carbs + '18' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.carbs }]}>{item.carbs}C</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFood(meal.id, i)} activeOpacity={0.75}>
                      <Ionicons name="close-circle" size={18} color={Colors.danger + 'bb'} />
                    </TouchableOpacity>
                  </View>
                ))}

                {/* Photo log card */}
                <TouchableOpacity style={styles.photoRow} activeOpacity={0.75}>
                  <Ionicons name="camera-outline" size={16} color={Colors.muted} />
                  <Text style={styles.photoText}>Log plate photo</Text>
                </TouchableOpacity>

                {/* Card-level Add Food trigger */}
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => openLogModal(meal.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={14} color={Colors.lime} />
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
        <Ionicons name="add" size={18} color={Colors.bg} />
        <Text style={styles.fabText}>Log Food</Text>
      </TouchableOpacity>

      {/* Quick-add Segmented Modal (Option A - Recommended) */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              
              {/* Modal Header */}
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Log Food</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
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
                  <Ionicons name="search-outline" size={13} color={activeFormTab === 'library' ? Colors.lime : Colors.muted} />
                  <Text style={[styles.modalTabText, activeFormTab === 'library' && styles.modalTabTextActive]}>Search Library</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalTab, activeFormTab === 'custom' && styles.modalTabActive]}
                  onPress={() => setActiveFormTab('custom')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={13} color={activeFormTab === 'custom' ? Colors.lime : Colors.muted} />
                  <Text style={[styles.modalTabText, activeFormTab === 'custom' && styles.modalTabTextActive]}>Custom Food</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {activeFormTab === 'library' ? (
                  <View style={styles.modalScrollContent}>
                    {/* Portion Configurator if food selected */}
                    {selectedFood ? (
                      <View style={styles.selectedConfigCard}>
                        <View style={styles.configHeader}>
                          <TouchableOpacity onPress={() => setSelectedFood(null)} style={styles.backToSearch}>
                            <Ionicons name="arrow-back" size={16} color={Colors.lime} />
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
                              <Text style={[styles.liveMacroVal, { color: Colors.chart.protein }]}>{getScaledVal(selectedFood.protein, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Protein</Text>
                            </View>
                            <View style={styles.liveMacroCell}>
                              <Text style={[styles.liveMacroVal, { color: Colors.chart.carbs }]}>{getScaledVal(selectedFood.carbs, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Carbs</Text>
                            </View>
                            <View style={styles.liveMacroCell}>
                              <Text style={[styles.liveMacroVal, { color: Colors.danger }]}>{getScaledVal(selectedFood.fat, parseFloat(portionGrams) || 0, selectedFood.grams)}g</Text>
                              <Text style={styles.liveMacroLbl}>Fat</Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity style={styles.modalAddLogBtn} onPress={handleSaveLibraryFood} activeOpacity={0.8}>
                          <Ionicons name="checkmark" size={16} color={Colors.white} />
                          <Text style={styles.modalAddLogBtnTxt}>Add to {activeMealId}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.searchFlow}>
                        {/* Search Input bar */}
                        <View style={styles.modalSearchWrap}>
                          <Ionicons name="search" size={18} color={Colors.muted} />
                          <TextInput
                            style={styles.modalInput}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search breakfast/lunch items..."
                            placeholderTextColor={Colors.muted}
                          />
                          {!!searchQuery && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                              <Ionicons name="close-circle" size={18} color={Colors.muted} />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Search Results list */}
                        <View style={styles.searchResultsContainer}>
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
                                  <Ionicons name="chevron-forward" size={14} color={Colors.lime} />
                                </View>
                              </TouchableOpacity>
                            ))
                          ) : (
                            <View style={styles.noSearchData}>
                              <Ionicons name="alert-circle-outline" size={28} color={Colors.muted} />
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
                          placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
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
                            placeholderTextColor={Colors.muted}
                          />
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity style={styles.modalAddLogBtn} onPress={handleSaveCustomFood} activeOpacity={0.8}>
                      <Ionicons name="checkmark" size={16} color={Colors.white} />
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
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.chart.water + '10',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '30',
    padding: 12,
  },
  waterChipIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.chart.water + '18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterChipContent: { flex: 1, gap: 4 },
  waterChipText: { ...Typography.captionBold, color: Colors.text.primary },
  waterBar: { height: 4, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 2 },
  waterFill: { height: '100%', backgroundColor: Colors.chart.water, borderRadius: 2 },
  waterChipAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.chart.water + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.chart.water + '25',
  },
  waterChipAddTxt: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.chart.water,
  },

  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryLeft: { gap: 2 },
  kcalNum: { ...Typography.h1, color: Colors.text.primary },
  kcalLabel: { ...Typography.caption, color: Colors.muted },
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
  mealLabel: { ...Typography.h4, color: Colors.text.primary },
  mealKcal: { ...Typography.caption, color: Colors.muted },
  mealChevronWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealChevronWrapActive: {
    backgroundColor: Colors.lime + '15',
  },

  mealBody: { paddingHorizontal: 16, paddingBottom: 12, gap: 2 },
  foodItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  foodLeft: { flex: 1 },
  foodName: { ...Typography.bodyBold, color: Colors.text.primary },
  foodGrams: { ...Typography.caption, color: Colors.muted },
  foodChips: { flexDirection: 'row', gap: 4 },
  chip: { borderRadius: Radius.pill, paddingHorizontal: 7, paddingVertical: 3 },
  chipText: { ...Typography.micro },
  deleteBtn: { padding: 6 },

  photoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  photoText: { ...Typography.caption, color: Colors.muted },

  addFoodBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lime + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.lime + '40',
  },
  addFoodBtnText: { ...Typography.captionBold, color: Colors.lime },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 14,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { ...Typography.bodyBold, color: Colors.bg },

  // Modal styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28, 28, 30, 0.60)' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  modalSheet: {
    backgroundColor: Colors.ivory, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 520, maxHeight: '92%',
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0,
    borderColor: Colors.lime + '20',
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: Colors.muted + '44', borderRadius: 2, marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder,
  },
  mealTargetSelector: {
    flexDirection: 'row', gap: 6, marginBottom: 16,
  },
  mealTargetBtn: {
    flex: 1, height: 36, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.cardBorder,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  mealTargetBtnActive: {
    borderColor: Colors.lime, backgroundColor: Colors.lime + '12',
  },
  mealTargetTxt: { ...Typography.micro, color: Colors.muted },
  mealTargetTxtActive: { color: Colors.lime },

  modalQuickAdd: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: Radius.pill,
    padding: 3, marginBottom: 16, borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 8, borderRadius: Radius.pill,
  },
  modalTabActive: {
    backgroundColor: Colors.card,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  modalTabText: { ...Typography.captionBold, color: Colors.muted },
  modalTabTextActive: { color: Colors.lime },

  modalScroll: { maxHeight: 330 },
  modalScrollContent: { paddingBottom: 16 },

  // Search Flow
  searchFlow: {
    gap: 12,
  },
  modalSearchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 12, height: 46, marginBottom: 12,
  },
  modalInput: { flex: 1, color: Colors.text.primary, ...Typography.body, padding: 0 },
  searchResultsContainer: { gap: 10 },
  searchResultRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 12,
  },
  searchResultLeft: { gap: 2 },
  searchResultName: { ...Typography.bodyBold, color: Colors.text.primary },
  searchResultBase: { ...Typography.micro, color: Colors.muted },
  searchResultRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchResultKcal: { ...Typography.captionBold, color: Colors.chart.calories },
  noSearchData: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  noSearchText: { ...Typography.caption, color: Colors.muted },
  jumpToCustomBtn: {
    marginTop: 4, paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Colors.lime, backgroundColor: Colors.lime + '10',
  },
  jumpToCustomText: { ...Typography.captionBold, color: Colors.lime },

  // Portions Configurator Card
  selectedConfigCard: {
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 16, gap: 16,
  },
  configHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, paddingBottom: 8 },
  backToSearch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backToSearchText: { ...Typography.captionBold, color: Colors.lime },
  configFoodTitleRow: { gap: 2 },
  configFoodName: { ...Typography.h4, color: Colors.text.primary },
  configBaseScale: { ...Typography.caption, color: Colors.muted },
  liveScaledMacros: {
    padding: 12, backgroundColor: Colors.bg + '66', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, gap: 8,
  },
  macroDisplayLabel: { fontSize: 8, fontWeight: '700', letterSpacing: 0.8, color: Colors.muted },
  liveMacroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  liveMacroCell: { alignItems: 'center', gap: 2, flex: 1 },
  liveMacroVal: { ...Typography.bodyBold, color: Colors.text.primary },
  liveMacroLbl: { ...Typography.micro, color: Colors.muted },
  modalAddLogBtn: {
    height: 46, borderRadius: Radius.md, backgroundColor: Colors.lime,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  modalAddLogBtnTxt: { ...Typography.bodyBold, color: Colors.white },

  // Custom Form
  formSection: { gap: 14, paddingBottom: 16 },
  inputGroup: { gap: 6 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputLabel: { ...Typography.captionBold, color: Colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: Colors.danger, backgroundColor: Colors.danger + '05' },
  textInput: { flex: 1, ...Typography.body, color: Colors.text.primary, padding: 0 },
  inputFieldUnit: { ...Typography.caption, color: Colors.muted, marginLeft: 4 },
  customFormError: { ...Typography.captionBold, color: Colors.danger, textAlign: 'center', marginBottom: 4 },

  modalFooterClose: { paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.cardBorder },
  cancelSheetBtn: { height: 44, borderRadius: Radius.md, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' },
  cancelSheetBtnText: { ...Typography.bodyBold, color: Colors.text.secondary },
});
