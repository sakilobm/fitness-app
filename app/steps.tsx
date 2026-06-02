import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText, G, Line, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PillButton from '@/components/ui/PillButton';
import { Colors, Typography, Radius, Shadows } from '@/constants/theme';
import { router } from 'expo-router';
import { useAppStore } from '@/store';
import { stepsToCalories, stepsToDistanceKm, formatStepCount, getDayLabel } from '@/utils/steps';
import { generateSuggestions, getBMIResult } from '@/utils/bmi';

const { width: W } = Dimensions.get('window');
const STEPS_COLOR = '#6366F1';

// ─── Dynamic Weekly Bars Chart ───────────────────────────────────────────────

function WeekBars({ data, goal }: { data: { date: string; steps: number }[]; goal: number }) {
  const barW = (W - 80) / 7;
  const maxVal = Math.max(...data.map((d) => d.steps), goal);
  const chartH = 110;

  return (
    <Svg width={W - 64} height={chartH + 28}>
      {/* Goal line */}
      <Line
        x1={0} y1={chartH - (goal / maxVal) * chartH}
        x2={W - 64} y2={chartH - (goal / maxVal) * chartH}
        stroke={STEPS_COLOR + '30'} strokeWidth={1} strokeDasharray="4,4"
      />
      <SvgText
        x={W - 68} y={chartH - (goal / maxVal) * chartH - 4}
        fill={STEPS_COLOR + '60'} fontSize={8} textAnchor="end"
      >
        Goal
      </SvgText>

      {data.map((d, i) => {
        const h = maxVal > 0 ? (d.steps / maxVal) * chartH : 0;
        const x = i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const isToday = i === data.length - 1;
        const color =
          d.steps === 0 ? 'rgba(0,0,0,0.06)'
          : d.steps >= goal ? Colors.amber
          : isToday ? STEPS_COLOR
          : Colors.muted + '55';
        
        const label = getDayLabel(d.date);

        return (
          <G key={i}>
            {/* Bar with gradient fill for today */}
            <Defs>
              <SvgGrad id={`barGrad_${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isToday ? STEPS_COLOR : color} stopOpacity="1" />
                <Stop offset="1" stopColor={isToday ? STEPS_COLOR : color} stopOpacity={isToday ? '0.6' : '1'} />
              </SvgGrad>
            </Defs>
            <Rect
              x={x} y={chartH - h}
              width={bw} height={Math.max(h, 2)}
              rx={5} fill={d.steps === 0 ? color : `url(#barGrad_${i})`}
            />
            {/* Day label */}
            <SvgText
              x={x + bw / 2} y={chartH + 18}
              fill={isToday ? STEPS_COLOR : Colors.muted}
              fontSize={11} textAnchor="middle" fontWeight={isToday ? '700' : '400'}
            >
              {label.charAt(0)}
            </SvgText>
            {/* Value label */}
            {d.steps > 0 && (
              <SvgText
                x={x + bw / 2} y={chartH - h - 5}
                fill={color === Colors.muted + '55' ? Colors.muted : color}
                fontSize={9} textAnchor="middle"
              >
                {formatStepCount(d.steps)}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Streak Dots Component ───────────────────────────────────────────────────

function StreakDots({ history, goal }: { history: { steps: number }[]; goal: number }) {
  const days = history.slice(-14);
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {days.map((d, i) => {
          const hit = d.steps >= goal;
          const isLast = i === days.length - 1;
          return (
            <View
              key={i}
              style={[
                streakS.dot,
                hit ? streakS.dotHit : streakS.dotMiss,
                isLast && streakS.dotToday,
              ]}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const streakS = StyleSheet.create({
  dot: { width: 20, height: 20, borderRadius: 10 },
  dotHit: { backgroundColor: STEPS_COLOR + '66' },
  dotMiss: { backgroundColor: Colors.danger + '44' },
  dotToday: { borderWidth: 2, borderColor: STEPS_COLOR, backgroundColor: STEPS_COLOR },
});

// ─── Motion Breakdown ────────────────────────────────────────────────────────

function MotionBreakdown({ stepsCount }: { stepsCount: number }) {
  // Simulate walking/running/stationary distribution based on step count
  const walkPct = stepsCount > 0 ? Math.min(0.7, stepsCount / 15000) : 0;
  const runPct = stepsCount > 5000 ? Math.min(0.2, (stepsCount - 5000) / 20000) : 0;
  const statPct = Math.max(0, 1 - walkPct - runPct);

  const MOTION = [
    { label: 'Walking', pct: walkPct, color: STEPS_COLOR },
    { label: 'Running', pct: runPct, color: Colors.amber },
    { label: 'Stationary', pct: statPct, color: Colors.muted + '55' },
  ];

  return (
    <View style={styles.motionRow}>
      {MOTION.map((m) => (
        <View key={m.label} style={styles.motionItem}>
          <ProgressRing size={70} strokeWidth={7} progress={m.pct} color={m.color}>
            <Text style={[styles.motionPct, { color: m.color }]}>{Math.round(m.pct * 100)}%</Text>
          </ProgressRing>
          <Text style={styles.motionLabel}>{m.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Quick Add Pills ─────────────────────────────────────────────────────────

const QUICK_ADD_AMOUNTS = [500, 1000, 2000, 5000];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function StepsScreen() {
  const insets = useSafeAreaInsets();
  const {
    stepsCount, addManualSteps, activeMinutes,
    user, stepHistory, updateStepsGoal,
    waterLogs, weightTrend, currentBMI,
  } = useAppStore();

  const [goalView, setGoalView] = useState<'daily' | 'weekly'>('daily');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [goalInput, setGoalInput] = useState(user.stepsGoal.toString());

  const goal = user.stepsGoal;
  const progress = Math.min(stepsCount / goal, 1);
  const caloriesBurned = stepsToCalories(stepsCount, user.weight);
  const distanceKm = stepsToDistanceKm(stepsCount, user.height);

  // Last 7 days for the chart
  const weekData = stepHistory.slice(-7);

  // Streak: consecutive days meeting goal (from end of history)
  const streakCount = (() => {
    let count = 0;
    // Start from second-to-last (skip today since it's in progress)
    for (let i = stepHistory.length - 2; i >= 0; i--) {
      if (stepHistory[i].steps >= goal) count++;
      else break;
    }
    return count;
  })();

  // Best day
  const bestDay = stepHistory.reduce((max, d) => Math.max(max, d.steps), 0);

  // Average
  const avgSteps = stepHistory.length > 0
    ? Math.round(stepHistory.reduce((s, d) => s + d.steps, 0) / stepHistory.length)
    : 0;

  // Weekly total
  const weeklyTotal = weekData.reduce((s, d) => s + d.steps, 0);

  // Suggestions
  const waterTotal = waterLogs.reduce((s, l) => s + l.ml, 0);
  const bmiResult = getBMIResult(user.weight, user.height);
  const stepSuggestions = generateSuggestions({
    bmiResult,
    stepsPct: progress,
    weightTrend,
    waterPct: waterTotal / user.waterGoal,
  }).filter((s) => s.category === 'exercise').slice(0, 2);

  const handleAddSteps = useCallback(() => {
    const val = parseInt(manualInput, 10);
    if (!isNaN(val) && val > 0) {
      addManualSteps(val);
      setManualInput('');
      setShowAddModal(false);
    }
  }, [manualInput, addManualSteps]);

  const handleQuickAdd = useCallback((amount: number) => {
    addManualSteps(amount);
    setShowAddModal(false);
    setManualInput('');
  }, [addManualSteps]);

  const handleSaveGoal = useCallback(() => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val >= 1000) {
      updateStepsGoal(val);
      setShowGoalModal(false);
    }
  }, [goalInput, updateStepsGoal]);

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
          <Text style={styles.stepsNum}>{stepsCount.toLocaleString()}</Text>
          <Text style={styles.stepsGoal}>/ {goal.toLocaleString()} steps</Text>
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Ionicons name="flame" size={14} color={Colors.amber} />
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
          <Ionicons name="add-circle" size={20} color={Colors.bg} />
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
            { label: 'Goal hit', color: Colors.amber },
            { label: 'Below goal', color: Colors.muted },
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
            <Text style={[styles.weekSumVal, { color: Colors.amber }]}>
              {stepsToCalories(weeklyTotal, user.weight).toLocaleString()}
            </Text>
            <Text style={styles.weekSumLabel}>kcal burned</Text>
          </View>
          <View style={styles.weekSumDivider} />
          <View style={styles.weekSumItem}>
            <Text style={[styles.weekSumVal, { color: Colors.lime }]}>
              {stepsToDistanceKm(weeklyTotal, user.height)}
            </Text>
            <Text style={styles.weekSumLabel}>km walked</Text>
          </View>
        </View>
      </GlassCard>

      {/* ════════ Motion Breakdown ════════ */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Time in Motion" accentColor={Colors.amber} />
        <MotionBreakdown stepsCount={stepsCount} />
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
          <StatBadge label="Best Day" value={bestDay.toLocaleString()} color={Colors.amber} />
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
          <View style={styles.modalSheet}>
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
                placeholderTextColor={Colors.muted}
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
                  <Ionicons name="flame" size={14} color={Colors.amber} />
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
              <Ionicons name="checkmark-circle" size={18} color={Colors.bg} />
              <Text style={styles.saveBtnTxt}>Add Steps</Text>
            </TouchableOpacity>
          </View>
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
          <View style={styles.modalSheet}>
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
                placeholderTextColor={Colors.muted}
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
              <Ionicons name="checkmark-circle" size={18} color={Colors.bg} />
              <Text style={styles.saveBtnTxt}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  // Ring section
  ringSection: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepsNum: { ...Typography.hero, color: Colors.text.primary },
  stepsGoal: { ...Typography.caption, color: Colors.muted },
  ringStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 },
  ringStat: { alignItems: 'center', gap: 2 },
  ringStatVal: { ...Typography.h4, color: Colors.text.primary },
  ringStatLabel: { ...Typography.micro, color: Colors.muted },
  ringStatDivider: { width: 1, height: 30, backgroundColor: Colors.cardBorder },
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
  logStepsTxt: { ...Typography.bodyBold, color: Colors.bg },

  // Chart
  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { ...Typography.caption, color: Colors.muted },

  // Weekly summary
  weekSummary: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 16, paddingTop: 12,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  weekSumItem: { alignItems: 'center', gap: 2 },
  weekSumVal: { ...Typography.h4 },
  weekSumLabel: { ...Typography.micro, color: Colors.muted },
  weekSumDivider: { width: 1, height: 32, backgroundColor: Colors.cardBorder, alignSelf: 'center' },

  // Motion
  motionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  motionItem: { alignItems: 'center', gap: 8 },
  motionPct: { ...Typography.captionBold },
  motionLabel: { ...Typography.caption, color: Colors.muted },

  // Goal
  goalToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  goalInfo: { alignItems: 'center', marginBottom: 8 },
  goalValue: { ...Typography.hero },
  goalUnit: { ...Typography.body, color: Colors.muted },
  goalSub: { ...Typography.caption, color: Colors.muted, textAlign: 'center' },
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
    borderTopWidth: 1, borderTopColor: Colors.cardBorder,
  },
  tipIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  tipEmoji: { fontSize: 22 },
  tipContent: { flex: 1, gap: 3 },
  tipTitle: { ...Typography.bodyBold, color: Colors.text.primary },
  tipDesc: { ...Typography.caption, color: Colors.muted, lineHeight: 17 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalDismiss: { flex: 1 },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
    ...Shadows.card,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: Colors.muted + '40',
    alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { ...Typography.h2, color: Colors.text.primary, textAlign: 'center' },
  modalSubtitle: { ...Typography.caption, color: Colors.muted, textAlign: 'center', marginTop: 4, marginBottom: 20 },

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
    borderColor: Colors.cardBorder, backgroundColor: Colors.card,
  },
  goalPillActive: { backgroundColor: STEPS_COLOR + '18', borderColor: STEPS_COLOR },
  goalPillTxt: { ...Typography.captionBold, color: Colors.muted },
  goalPillTxtActive: { color: STEPS_COLOR },

  // Input
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bg, borderRadius: Radius.md,
    paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  stepInput: {
    flex: 1, height: 52,
    ...Typography.h3, color: Colors.text.primary,
  },
  inputUnit: { ...Typography.caption, color: Colors.muted },

  // Preview
  previewRow: {
    flexDirection: 'row', gap: 20,
    justifyContent: 'center', marginBottom: 16,
  },
  previewItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewVal: { ...Typography.captionBold, color: Colors.text.secondary },

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
  saveBtnTxt: { ...Typography.bodyBold, color: Colors.bg },
});
