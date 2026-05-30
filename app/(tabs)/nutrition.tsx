import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GlassCard from '../../components/ui/GlassCard';
import MacroBar from '../../components/ui/MacroBar';
import SectionHeader from '../../components/ui/SectionHeader';
import ProgressRing from '../../components/ui/ProgressRing';
import { Colors, Typography, Radius } from '../../constants/theme';

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
  return (
    <View style={scoreS.container}>
      <ProgressRing size={64} strokeWidth={6} progress={pcts[score]} color={colors[score]}>
        <Text style={[scoreS.letter, { color: colors[score] }]}>{score}</Text>
      </ProgressRing>
      <Text style={scoreS.label}>Daily Score</Text>
    </View>
  );
}

const scoreS = StyleSheet.create({
  container: { alignItems: 'center', gap: 4 },
  letter: { ...Typography.h2 },
  label: { ...Typography.micro, color: Colors.muted },
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
        <Text style={styles.title}>Nutrition</Text>

        {/* Water reminder chip */}
        <View style={styles.waterChip}>
          <Text style={styles.waterChipIcon}>💧</Text>
          <Text style={styles.waterChipText}>Water: 1.2 / 2.5 L today</Text>
          <View style={styles.waterBar}>
            <View style={[styles.waterFill, { width: `${(1.2 / 2.5) * 100}%` }]} />
          </View>
        </View>

        {/* Macro summary */}
        <GlassCard accentColor={Colors.lime}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryLeft}>
              <Text style={styles.kcalNum}>{totalKcal}</Text>
              <Text style={styles.kcalLabel}>/ {goalKcal} kcal</Text>
              <Text style={styles.kcalRemain}>{goalKcal - totalKcal} remaining</Text>
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
              <Text style={styles.mealChevron}>{meal.expanded ? '▲' : '▼'}</Text>
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
                      <View style={[styles.chip, { backgroundColor: Colors.chart.calories + '22' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.calories }]}>{item.kcal} kcal</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: Colors.chart.protein + '22' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.protein }]}>{item.protein}P</Text>
                      </View>
                      <View style={[styles.chip, { backgroundColor: Colors.chart.carbs + '22' }]}>
                        <Text style={[styles.chipText, { color: Colors.chart.carbs }]}>{item.carbs}C</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn}>
                      <Text style={styles.deleteTxt}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Photo card */}
                <TouchableOpacity style={styles.photoRow}>
                  <Text style={styles.photoIcon}>📸</Text>
                  <Text style={styles.photoText}>Log plate photo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.addFoodBtn}
                  onPress={() => { setActiveMeal(meal.id); setShowModal(true); }}
                >
                  <Text style={styles.addFoodBtnText}>+ Add Food</Text>
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
        <Text style={styles.fabText}>+ Log Food</Text>
      </TouchableOpacity>

      {/* Quick-add modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Food</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Search food or scan barcode..."
              placeholderTextColor={Colors.muted}
            />
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
  title: { ...Typography.h1, color: Colors.text.primary },

  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.chart.water + '15',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '44',
    padding: 12,
  },
  waterChipIcon: { fontSize: 18 },
  waterChipText: { ...Typography.caption, color: Colors.text.primary, flex: 1 },
  waterBar: { width: 60, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 },
  waterFill: { height: '100%', backgroundColor: Colors.chart.water, borderRadius: 2 },

  summaryTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryLeft: { gap: 2 },
  kcalNum: { ...Typography.h1, color: Colors.text.primary },
  kcalLabel: { ...Typography.caption, color: Colors.muted },
  kcalRemain: { ...Typography.captionBold, color: Colors.lime },

  mealHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: Radius.lg,
  },
  mealIcon: { fontSize: 24 },
  mealHeaderText: { flex: 1 },
  mealLabel: { ...Typography.h4, color: Colors.text.primary },
  mealKcal: { ...Typography.caption, color: Colors.muted },
  mealChevron: { ...Typography.caption, color: Colors.muted },

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
  deleteTxt: { ...Typography.caption, color: Colors.danger },

  photoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  photoIcon: { fontSize: 18 },
  photoText: { ...Typography.caption, color: Colors.muted },

  addFoodBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: Colors.lime + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: Colors.lime + '55',
  },
  addFoodBtnText: { ...Typography.captionBold, color: Colors.lime },

  fab: {
    position: 'absolute', right: 20,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 24, paddingVertical: 14,
    shadowColor: Colors.lime, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { ...Typography.bodyBold, color: Colors.bg },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#1A2E1C', borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: 24, gap: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: Colors.muted + '55', borderRadius: 2, marginBottom: 4,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalInput: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14, color: Colors.text.primary, ...Typography.body,
  },
  modalQuickAdd: { flexDirection: 'row', gap: 8 },
  modalTab: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.pill,
    paddingVertical: 10, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalTabText: { ...Typography.captionBold, color: Colors.muted },
  modalClose: { alignItems: 'center', paddingVertical: 10 },
  modalCloseText: { ...Typography.bodyBold, color: Colors.danger },
});
