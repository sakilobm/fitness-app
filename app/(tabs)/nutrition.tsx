import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import MacroBar from '@/components/ui/MacroBar';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ProgressRing from '@/components/ui/ProgressRing';
import { Colors, Typography, Radius } from '@/constants/theme';

interface FoodItem {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  label: string;
  icon: string;
  items: FoodItem[];
  expanded: boolean;
}

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

const totalKcal = 1665;
const goalKcal = 2000;
const totalProtein = 122;
const totalCarbs = 180;
const totalFibre = 18;

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
  const [meals, setMeals] = useState<Meal[]>(initialMeals);
  const [showModal, setShowModal] = useState(false);
  const [activeMeal, setActiveMeal] = useState<string | null>(null);

  const toggleMeal = (id: string) => {
    setMeals((ms) => ms.map((m) => (m.id === id ? { ...m, expanded: !m.expanded } : m)));
  };

  const mealKcal = (m: Meal) => m.items.reduce((s, i) => s + i.kcal, 0);

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

        {/* Water reminder chip */}
        <TouchableOpacity style={styles.waterChip} activeOpacity={0.8}>
          <View style={styles.waterChipIconWrap}>
            <Ionicons name="water" size={16} color={Colors.chart.water} />
          </View>
          <View style={styles.waterChipContent}>
            <Text style={styles.waterChipText}>Water: 1.2 / 2.5 L today</Text>
            <View style={styles.waterBar}>
              <View style={[styles.waterFill, { width: `${(1.2 / 2.5) * 100}%` }]} />
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.chart.water} />
        </TouchableOpacity>

        {/* Macro summary */}
        <GlassCard accentColor={Colors.lime}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryLeft}>
              <Text style={styles.kcalNum}>{totalKcal}</Text>
              <Text style={styles.kcalLabel}>/ {goalKcal} kcal</Text>
              <View style={styles.remainBadge}>
                <Ionicons name="flame" size={11} color={Colors.lime} />
                <Text style={styles.kcalRemain}>{goalKcal - totalKcal} remaining</Text>
              </View>
            </View>
            <NutritionScore score="B" />
          </View>
          <MacroBar label="Calories" current={totalKcal} goal={goalKcal} color={Colors.chart.calories} unit=" kcal" />
          <MacroBar label="Protein" current={totalProtein} goal={150} color={Colors.chart.protein} />
          <MacroBar label="Carbs" current={totalCarbs} goal={250} color={Colors.chart.carbs} />
          <MacroBar label="Fibre" current={totalFibre} goal={30} color={Colors.chart.fibre} />
        </GlassCard>

        {/* Meals */}
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
                    <TouchableOpacity style={styles.deleteBtn}>
                      <Ionicons name="close-circle" size={18} color={Colors.danger + '88'} />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Photo card */}
                <TouchableOpacity style={styles.photoRow}>
                  <Ionicons name="camera-outline" size={16} color={Colors.muted} />
                  <Text style={styles.photoText}>Log plate photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => { setActiveMeal(meal.id); setShowModal(true); }}
                >
                  <Ionicons name="add" size={14} color={Colors.lime} />
                  <Text style={styles.addFoodBtnText}>Add Food</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlassCard>
        ))}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={Colors.bg} />
        <Text style={styles.fabText}>Log Food</Text>
      </TouchableOpacity>

      {/* Quick-add modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Food</Text>
            <View style={styles.modalSearchWrap}>
              <Ionicons name="search" size={18} color={Colors.muted} />
              <TextInput
                style={styles.modalInput}
                placeholder="Search food or scan barcode..."
                placeholderTextColor={Colors.muted}
              />
              <TouchableOpacity style={styles.scanBtn}>
                <Ionicons name="barcode-outline" size={20} color={Colors.lime} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalQuickAdd}>
              {['Recent', 'Frequent', 'Custom'].map((t) => (
                <TouchableOpacity key={t} style={styles.modalTab}>
                  <Text style={styles.modalTabText}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.modalClose} onPress={() => setShowModal(false)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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

  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryLeft: { gap: 2 },
  kcalNum: { ...Typography.h1, color: Colors.text.primary },
  kcalLabel: { ...Typography.caption, color: Colors.muted },
  remainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lime + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.lime + '30',
    marginTop: 4,
  },
  kcalRemain: { ...Typography.captionBold, color: Colors.lime },

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

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: Colors.card, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: 24, gap: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: Colors.muted + '55', borderRadius: 2, marginBottom: 4,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalSearchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.bg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 14,
  },
  modalInput: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.text.primary,
    ...Typography.body,
  },
  scanBtn: {
    padding: 4,
  },
  modalQuickAdd: { flexDirection: 'row', gap: 8 },
  modalTab: {
    flex: 1, backgroundColor: Colors.bg, borderRadius: Radius.pill,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalTabText: { ...Typography.captionBold, color: Colors.muted },
  modalClose: { alignItems: 'center', paddingVertical: 10 },
  modalCloseText: { ...Typography.bodyBold, color: Colors.danger },
});
