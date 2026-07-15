import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import KeyboardSlideView from '@/components/ui/KeyboardSlideView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PillButton from '@/components/ui/PillButton';
import { Typography, Radius, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { router } from 'expo-router';
import { stepsToCalories, stepsToDistanceKm } from '@/utils/steps';
import { useStepsScreen } from '@/features/steps/hooks/useStepsScreen';
import WeekBars from '@/components/charts/WeekBars';
import StreakDots from '@/components/charts/StreakDots';
import MotionBreakdown from '@/components/charts/MotionBreakdown';

const { width: W } = Dimensions.get('window');
const STEPS_COLOR = '#6366F1';

// ─── Quick Add Pills ─────────────────────────────────────────────────────────

const QUICK_ADD_AMOUNTS = [500, 1000, 2000, 5000];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StepsScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const {
    stepsCount,
    activeMinutes,
    stepHistory,
    user,
    goal,
    progress,
    caloriesBurned,
    distanceKm,
    weekData,
    streakCount,
    bestDay,
    avgSteps,
    weeklyTotal,
    stepSuggestions,
    goalView,
    setGoalView,
    showAddModal,
    handleOpenAddModal,
    handleCloseAddModal,
    showGoalModal,
    handleOpenGoalModal,
    handleCloseGoalModal,
    manualInput,
    setManualInput,
    goalInput,
    setGoalInput,
    handleAddSteps,
    handleQuickAdd,
    handleSaveGoal,
  } = useStepsScreen();

  const setShowAddModal = (val: boolean) => {
    if (val) handleOpenAddModal();
    else handleCloseAddModal();
  };

  const setShowGoalModal = (val: boolean) => {
    if (val) handleOpenGoalModal();
    else handleCloseGoalModal();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Steps & Walking"
        subtitle="ACTIVITY"
        icon={{ lib: 'Ionicons', name: 'footsteps' }}
        accentColor={STEPS_COLOR}
        showBack
        onBack={() => router.back()}
      />

      {/* ════════ Giant Progress Ring ════════ */}
      <View style={styles.ringSection}>
        <ProgressRing size={220} strokeWidth={18} progress={progress} color={STEPS_COLOR} glowing>
          <Text style={[styles.stepsNum, { fontSize: stepsCount.toLocaleString().length >= 7 ? 30 : stepsCount.toLocaleString().length >= 6 ? 36 : 42 }]}>
            {stepsCount.toLocaleString()}
          </Text>
          <Text style={styles.stepsGoal}>/ {goal.toLocaleString()} steps</Text>
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Ionicons name="flame" size={14} color={colors.amber} />
              <Text style={styles.ringStatVal}>{caloriesBurned}</Text>
              <Text style={styles.ringStatLabel}>kcal</Text>
            </View>
            <View style={styles.ringStatDivider} />
            <View style={styles.ringStat}>
              <Ionicons name="location" size={14} color={STEPS_COLOR} />
              <Text style={styles.ringStatVal}>{distanceKm}</Text>
              <Text style={styles.ringStatLabel}>km</Text>
            </View>
          </View>
        </ProgressRing>

        <View style={styles.ringPctBadge}>
          <Ionicons name="trending-up" size={14} color={STEPS_COLOR} />
          <Text style={styles.ringPct}>{Math.round(progress * 100)}% of daily goal</Text>
        </View>

        {/* Log Steps CTA */}
        <TouchableOpacity
          style={styles.logStepsCta}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.logStepsTxt}>Log Steps</Text>
        </TouchableOpacity>
      </View>

      {/* ════════ Weekly Bars ════════ */}
      <GlassCard accentColor={STEPS_COLOR}>
        <SectionHeader title="This Week" accentColor={STEPS_COLOR} />
        <WeekBars data={weekData} goal={goal} />
        <View style={styles.chartLegend}>
          {[
            { label: 'Today', color: STEPS_COLOR },
            { label: 'Goal hit', color: colors.amber },
            { label: 'Below goal', color: colors.muted },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
        {/* Weekly summary */}
        <View style={styles.weekSummary}>
          <View style={styles.weekSumItem}>
            <Text style={[styles.weekSumVal, { color: STEPS_COLOR }]}>{weeklyTotal.toLocaleString()}</Text>
            <Text style={styles.weekSumLabel}>Total steps</Text>
          </View>
          <View style={styles.weekSumDivider} />
          <View style={styles.weekSumItem}>
            <Text style={[styles.weekSumVal, { color: colors.amber }]}>
              {stepsToCalories(weeklyTotal, user.weight).toLocaleString()}
            </Text>
            <Text style={styles.weekSumLabel}>kcal burned</Text>
          </View>
          <View style={styles.weekSumDivider} />
          <View style={styles.weekSumItem}>
            <Text style={[styles.weekSumVal, { color: colors.lime }]}>
              {stepsToDistanceKm(weeklyTotal, user.height)}
            </Text>
            <Text style={styles.weekSumLabel}>km walked</Text>
          </View>
        </View>
      </GlassCard>

      {/* ════════ Motion Breakdown ════════ */}
      <GlassCard accentColor={colors.amber}>
        <SectionHeader title="Time in Motion" accentColor={colors.amber} />
        <MotionBreakdown stepsCount={stepsCount} styles={styles} />
      </GlassCard>

      {/* ════════ Goal Settings ════════ */}
      <GlassCard>
        <SectionHeader title="Goal Settings" accentColor={STEPS_COLOR} />
        <View style={styles.goalToggle}>
          {(['daily', 'weekly'] as const).map((v) => (
            <PillButton
              key={v}
              label={v.charAt(0).toUpperCase() + v.slice(1)}
              active={goalView === v}
              onPress={() => setGoalView(v)}
              color={STEPS_COLOR}
              style={{ flex: 1 }}
            />
          ))}
        </View>
        <View style={styles.goalInfo}>
          <Text style={[styles.goalValue, { color: STEPS_COLOR }]}>
            {goalView === 'daily' ? goal.toLocaleString() : (goal * 7).toLocaleString()}
          </Text>
          <Text style={styles.goalUnit}>steps {goalView === 'daily' ? 'per day' : 'per week'}</Text>
        </View>
        <Text style={styles.goalSub}>Recommended: 7,000–10,000 steps/day for general health</Text>
        <TouchableOpacity
          style={styles.editGoalBtn}
          onPress={() => {
            setGoalInput(goal.toString());
            setShowGoalModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="pencil" size={14} color={STEPS_COLOR} />
          <Text style={styles.editGoalTxt}>Edit Goal</Text>
        </TouchableOpacity>
      </GlassCard>

      {/* ════════ Streak & Stats ════════ */}
      <GlassCard>
        <SectionHeader title="Last 14 Days" accentColor={STEPS_COLOR} />
        <StreakDots history={stepHistory.slice(-14)} goal={goal} />
        <View style={styles.streakStats}>
          <StatBadge label="Streak" value={`${streakCount}d 🔥`} color={STEPS_COLOR} />
          <StatBadge label="Best Day" value={bestDay.toLocaleString()} color={colors.amber} />
          <StatBadge label="Avg/Day" value={avgSteps.toLocaleString()} color={STEPS_COLOR} />
        </View>
      </GlassCard>

      {/* ════════ Activity Tips ════════ */}
      {stepSuggestions.length > 0 && (
        <GlassCard>
          <SectionHeader title="Activity Tips" accentColor={STEPS_COLOR} />
          {stepSuggestions.map((tip) => (
            <View key={tip.id} style={styles.tipCard}>
              <View style={[styles.tipIconWrap, { backgroundColor: tip.accentColor + '15' }]}>
                <Text style={styles.tipEmoji}>{tip.icon}</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.description}</Text>
              </View>
            </View>
          ))}
        </GlassCard>
      )}

      {/* ════════ ADD STEPS MODAL ════════ */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => { setShowAddModal(false); setManualInput(''); }}
          />
          <KeyboardSlideView style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Log Steps</Text>
            <Text style={styles.modalSubtitle}>Add steps manually from your walk, run, or workout</Text>

            {/* Quick add pills */}
            <View style={styles.quickAddRow}>
              {QUICK_ADD_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={styles.quickAddPill}
                  onPress={() => handleQuickAdd(amt)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="footsteps" size={12} color={STEPS_COLOR} />
                  <Text style={styles.quickAddTxt}>+{amt.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.stepInput}
                placeholder="Enter steps..."
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                value={manualInput}
                onChangeText={setManualInput}
                maxLength={6}
              />
              <Text style={styles.inputUnit}>steps</Text>
            </View>

            {/* Preview */}
            {manualInput.length > 0 && parseInt(manualInput, 10) > 0 && (
              <View style={styles.previewRow}>
                <View style={styles.previewItem}>
                  <Ionicons name="flame" size={14} color={colors.amber} />
                  <Text style={styles.previewVal}>
                    +{stepsToCalories(parseInt(manualInput, 10), user.weight)} kcal
                  </Text>
                </View>
                <View style={styles.previewItem}>
                  <Ionicons name="location" size={14} color={STEPS_COLOR} />
                  <Text style={styles.previewVal}>
                    +{stepsToDistanceKm(parseInt(manualInput, 10), user.height)} km
                  </Text>
                </View>
              </View>
            )}

            {/* Save button */}
            <TouchableOpacity
              style={[styles.saveBtn, (!manualInput || parseInt(manualInput, 10) <= 0) && styles.saveBtnDisabled]}
              onPress={handleAddSteps}
              activeOpacity={0.85}
              disabled={!manualInput || parseInt(manualInput, 10) <= 0}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
              <Text style={styles.saveBtnTxt}>Add Steps</Text>
            </TouchableOpacity>
          </KeyboardSlideView>
        </KeyboardAvoidingView>
      </Modal>

      {/* ════════ EDIT GOAL MODAL ════════ */}
      <Modal visible={showGoalModal} transparent animationType="slide">
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <TouchableOpacity
            style={styles.modalDismiss}
            activeOpacity={1}
            onPress={() => setShowGoalModal(false)}
          />
          <KeyboardSlideView style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set Step Goal</Text>
            <Text style={styles.modalSubtitle}>Choose your daily target</Text>

            {/* Preset goals */}
            <View style={styles.quickAddRow}>
              {[5000, 7500, 10000, 12000, 15000].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[styles.goalPill, parseInt(goalInput, 10) === val && styles.goalPillActive]}
                  onPress={() => setGoalInput(val.toString())}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[styles.goalPillTxt, parseInt(goalInput, 10) === val && styles.goalPillTxtActive]}
                  >
                    {(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom input */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.stepInput}
                placeholder="Custom goal..."
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                value={goalInput}
                onChangeText={setGoalInput}
                maxLength={6}
              />
              <Text style={styles.inputUnit}>steps/day</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, (parseInt(goalInput, 10) < 1000) && styles.saveBtnDisabled]}
              onPress={handleSaveGoal}
              activeOpacity={0.85}
              disabled={parseInt(goalInput, 10) < 1000}
            >
              <Ionicons name="checkmark-circle" size={18} color={colors.white} />
              <Text style={styles.saveBtnTxt}>Save Goal</Text>
            </TouchableOpacity>
          </KeyboardSlideView>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  // Ring section
  ringSection: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepsNum: { ...Typography.hero, color: colors.text.primary },
  stepsGoal: { ...Typography.caption, color: colors.muted },
  ringStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 },
  ringStat: { alignItems: 'center', gap: 2 },
  ringStatVal: { ...Typography.h4, color: colors.text.primary },
  ringStatLabel: { ...Typography.micro, color: colors.muted },
  ringStatDivider: { width: 1, height: 30, backgroundColor: colors.cardBorder },
  ringPctBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: STEPS_COLOR + '15',
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: STEPS_COLOR + '30',
  },
  ringPct: { ...Typography.captionBold, color: STEPS_COLOR },

  // Log steps CTA
  logStepsCta: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: STEPS_COLOR,
    borderRadius: Radius.pill,
    paddingHorizontal: 28, paddingVertical: 14,
    marginTop: 4,
    shadowColor: STEPS_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logStepsTxt: { ...Typography.bodyBold, color: colors.white },

  // Chart
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { ...Typography.caption, color: colors.muted },

  // Weekly summary
  weekSummary: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  weekSumItem: { alignItems: 'center', gap: 2 },
  weekSumVal: { ...Typography.h4 },
  weekSumLabel: { ...Typography.micro, color: colors.muted },
  weekSumDivider: { width: 1, height: 32, backgroundColor: colors.cardBorder, alignSelf: 'center' },

  // Motion
  motionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  motionItem: { alignItems: 'center', gap: 8 },
  motionPct: { ...Typography.captionBold },
  motionLabel: { ...Typography.caption, color: colors.muted },

  // Goal
  goalToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  goalInfo: { alignItems: 'center', marginBottom: 8 },
  goalValue: { ...Typography.hero },
  goalUnit: { ...Typography.body, color: colors.muted },
  goalSub: { ...Typography.caption, color: colors.muted, textAlign: 'center' },
  editGoalBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'center', marginTop: 12,
    backgroundColor: STEPS_COLOR + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 8,
    borderWidth: 1, borderColor: STEPS_COLOR + '25',
  },
  editGoalTxt: { ...Typography.captionBold, color: STEPS_COLOR },

  // Streak
  streakStats: { flexDirection: 'row', gap: 8, marginTop: 12 },

  // Tips
  tipCard: {
    flexDirection: 'row', gap: 12,
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: colors.cardBorder,
  },
  tipIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  tipEmoji: { fontSize: 22 },
  tipContent: { flex: 1, gap: 3 },
  tipTitle: { ...Typography.bodyBold, color: colors.text.primary },
  tipDesc: { ...Typography.caption, color: colors.muted, lineHeight: 17 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    ...Shadows.card,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.muted + '40',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { ...Typography.h2, color: colors.text.primary, textAlign: 'center' },
  modalSubtitle: { ...Typography.caption, color: colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 20 },

  // Quick add
  quickAddRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap', justifyContent: 'center' },
  quickAddPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: STEPS_COLOR + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: STEPS_COLOR + '25',
  },
  quickAddTxt: { ...Typography.captionBold, color: STEPS_COLOR },

  // Goal pills
  goalPill: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: Radius.pill, borderWidth: 1,
    borderColor: colors.cardBorder, backgroundColor: colors.card,
  },
  goalPillActive: { backgroundColor: STEPS_COLOR + '18', borderColor: STEPS_COLOR },
  goalPillTxt: { ...Typography.captionBold, color: colors.muted },
  goalPillTxtActive: { color: STEPS_COLOR },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg, borderRadius: Radius.md,
    paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  stepInput: {
    flex: 1, height: 52,
    ...Typography.h3, color: colors.text.primary,
  },
  inputUnit: { ...Typography.caption, color: colors.muted },

  // Preview
  previewRow: {
    flexDirection: 'row', gap: 20,
    justifyContent: 'center', marginBottom: 16,
  },
  previewItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewVal: { ...Typography.captionBold, color: colors.text.secondary },

  // Save
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: STEPS_COLOR, borderRadius: Radius.pill,
    paddingVertical: 16,
    shadowColor: STEPS_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnTxt: { ...Typography.bodyBold, color: colors.white },
});
