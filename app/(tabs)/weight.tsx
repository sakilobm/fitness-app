import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PillButton from '@/components/ui/PillButton';
import { useAppStore } from '@/store';
import ProgressRing from '@/components/ui/ProgressRing';
import { Colors, Typography, Radius, Spacing } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;
const CHART_H = 140;

type Period = 'week' | 'month' | '3m';

function SparkLine({ data }: { data: number[] }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const pts = data.map((v, i) => ({
    x: data.length > 1 ? (i / (data.length - 1)) * CHART_W : CHART_W / 2,
    y: CHART_H - ((v - min) / (max - min)) * CHART_H,
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  const lastPt = pts[pts.length - 1];

  return (
    <Svg width={CHART_W} height={CHART_H + 20}>
      <Defs>
        <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.lime} stopOpacity="0.25" />
          <Stop offset="1" stopColor={Colors.lime} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Path d={areaD} fill="url(#lineGrad)" />
      <Path d={pathD} stroke={Colors.lime} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Today dot */}
      <Circle cx={lastPt.x} cy={lastPt.y} r={6} fill={Colors.lime} opacity={0.25} />
      <Circle cx={lastPt.x} cy={lastPt.y} r={4} fill={Colors.lime} />
      <SvgText x={lastPt.x - 30} y={lastPt.y - 12} fill={Colors.lime} fontSize={11} fontWeight="700">
        {data[data.length - 1]} kg
      </SvgText>
    </Svg>
  );
}

const CALENDAR_WEEKS = 8;
const today = new Date();

function CalHeatmap() {
  const days: { date: Date; status: 'logged' | 'missed' | 'goal' | 'future' }[] = [];
  for (let i = CALENDAR_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isFuture = d > today;
    const rand = Math.random();
    days.push({
      date: d,
      status: isFuture ? 'future' : rand > 0.7 ? 'goal' : rand > 0.3 ? 'logged' : 'missed',
    });
  }

  const statusColor: Record<string, string> = {
    logged: Colors.lime + '88',
    missed: Colors.danger + '55',
    goal: Colors.lime,
    future: 'rgba(0,0,0,0.06)',
  };

  return (
    <View style={cal.grid}>
      {Array.from({ length: CALENDAR_WEEKS }).map((_, wi) => (
        <View key={wi} style={cal.col}>
          {days.slice(wi * 7, wi * 7 + 7).map((d, di) => (
            <View
              key={di}
              style={[cal.day, { backgroundColor: statusColor[d.status] }]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const cal = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 4 },
  col: { gap: 4, flex: 1 },
  day: { height: 14, borderRadius: 3 },
});

const BMI_CATEGORIES = [
  { label: 'Under', max: 18.5, color: Colors.chart.water },
  { label: 'Normal', max: 24.9, color: Colors.lime },
  { label: 'Over', max: 29.9, color: Colors.amber },
  { label: 'Obese', max: 40, color: Colors.danger },
];

function BMIBar({ bmi }: { bmi: number }) {
  const pct = Math.min((bmi - 15) / (40 - 15), 1);
  const category = BMI_CATEGORIES.find((c) => bmi <= c.max) ?? BMI_CATEGORIES[3];
  return (
    <View>
      <View style={bmiS.row}>
        {BMI_CATEGORIES.map((c, i) => (
          <View key={i} style={[bmiS.segment, { backgroundColor: c.color + '44' }]} />
        ))}
        <View style={[bmiS.pointer, { left: `${pct * 100}%` as any }]}>
          <View style={[bmiS.pointerDot, { backgroundColor: category.color }]} />
        </View>
      </View>
      <View style={bmiS.labels}>
        {BMI_CATEGORIES.map((c) => (
          <Text key={c.label} style={bmiS.catLabel}>{c.label}</Text>
        ))}
      </View>
      <View style={[bmiS.resultBadge, { backgroundColor: category.color + '15', borderColor: category.color + '35' }]}>
        <View style={[bmiS.resultDot, { backgroundColor: category.color }]} />
        <Text style={[bmiS.bmiValue, { color: category.color }]}>BMI {bmi} — {category.label}weight</Text>
      </View>
    </View>
  );
}

const bmiS = StyleSheet.create({
  row: { height: 12, borderRadius: 6, flexDirection: 'row', overflow: 'visible', marginBottom: 6, position: 'relative' },
  segment: { flex: 1 },
  pointer: { position: 'absolute', top: -4, marginLeft: -8 },
  pointerDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: Colors.card },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { ...Typography.micro, color: Colors.muted, flex: 1, textAlign: 'center' },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  resultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bmiValue: { ...Typography.bodyBold },
});

const MILESTONES = [90, 85, 80, 75];

export default function WeightScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');

  const {
    user,
    weightLogs,
    addWeightLog,
  } = useAppStore();

  const streak = user.streak;

  // Modal control states
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logWeightValue, setLogWeightValue] = useState('78.4');
  const [logDateOffset, setLogDateOffset] = useState<'today' | 'yesterday'>('today');
  const [logError, setLogError] = useState('');

  // Derived stats
  const startWeight = 84.8;
  const goalWeight = 72.0;
  const currentWeight = weightLogs[weightLogs.length - 1];
  const lostWeight = parseFloat((startWeight - currentWeight).toFixed(1));

  // Weekly difference calculation
  const lastWeekWeight = weightLogs[Math.max(0, weightLogs.length - 8)];
  const weeklyChange = parseFloat((currentWeight - lastWeekWeight).toFixed(1));
  const weeklyChangeText = weeklyChange < 0 
    ? `${weeklyChange} this week` 
    : weeklyChange > 0 
      ? `+${weeklyChange} this week` 
      : 'stable this week';

  // Dynamic progress ring percentages
  const totalGoalDelta = startWeight - goalWeight;
  const currentGoalDelta = startWeight - currentWeight;
  const goalProgressPct = Math.min(Math.max(Math.round((currentGoalDelta / totalGoalDelta) * 100), 0), 100);
  const remainingWeight = parseFloat(Math.max(currentWeight - goalWeight, 0).toFixed(1));

  // Dynamic BMI
  const heightM = user.height / 100; // Dynamic height from profile
  const currentBmi = parseFloat((currentWeight / (heightM * heightM)).toFixed(1));

  // Slice chart data based on active period
  const chartData = period === 'week' 
    ? weightLogs.slice(-7) 
    : period === 'month' 
      ? weightLogs.slice(-30) 
      : weightLogs;

  const openLogModal = () => {
    setLogWeightValue(currentWeight.toString());
    setLogDateOffset('today');
    setLogError('');
    setLogModalVisible(true);
  };

  const handleAdjustWeight = (amount: number) => {
    const nextVal = parseFloat(logWeightValue) + amount;
    if (!isNaN(nextVal) && nextVal > 30 && nextVal < 300) {
      setLogWeightValue(nextVal.toFixed(1));
    }
  };

  const handleSaveWeightLog = () => {
    const val = parseFloat(logWeightValue);
    if (isNaN(val) || val <= 30 || val >= 300) {
      setLogError('Enter weight between 30 and 300 kg');
      return;
    }

    addWeightLog(parseFloat(val.toFixed(1)), logDateOffset);
    setLogModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Weight Tracking"
        subtitle="BODY METRICS"
        icon={{ lib: 'MCI', name: 'scale-bathroom' }}
        accentColor={Colors.amber}
        rightIcon="add-outline"
        onRightPress={openLogModal}
      />

      {/* Period toggle */}
      <View style={styles.periodRow}>
        {(['week', 'month', '3m'] as Period[]).map((p) => (
          <PillButton
            key={p}
            label={p === '3m' ? '3 Months' : p.charAt(0).toUpperCase() + p.slice(1)}
            active={period === p}
            onPress={() => setPeriod(p)}
            style={{ flex: 1 }}
          />
        ))}
      </View>

      {/* Graph Card */}
      <GlassCard accentColor={Colors.lime}>
        <SparkLine data={chartData} />
      </GlassCard>

      {/* Log Weight CTA card */}
      <GlassCard accentColor={Colors.lime}>
        <View style={styles.ctaRow}>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Track Your Body Weight</Text>
            <Text style={styles.ctaSub}>Log today's entry to keep goals and achievements aligned</Text>
          </View>
          <TouchableOpacity style={styles.ctaBtn} onPress={openLogModal} activeOpacity={0.8}>
            <Ionicons name="add" size={14} color={Colors.white} />
            <Text style={styles.ctaBtnText}>Log Weight</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Stats panel */}
      <GlassCard accentColor={Colors.lime}>
        <View style={styles.statsGrid}>
          {/* Current Weight */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: Colors.lime }]} />
            <View style={[styles.statIconBubble, { backgroundColor: Colors.lime + '15', borderColor: Colors.lime + '30' }]}>
              <MaterialCommunityIcons name="scale-bathroom" size={18} color={Colors.lime} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Current</Text>
              <Text style={[styles.statValue, { color: Colors.lime }]}>{currentWeight}<Text style={styles.statUnit}> kg</Text></Text>
            </View>
          </View>

          {/* Goal Weight */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: Colors.amber }]} />
            <View style={[styles.statIconBubble, { backgroundColor: Colors.amber + '15', borderColor: Colors.amber + '30' }]}>
              <Ionicons name="flag" size={16} color={Colors.amber} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Goal</Text>
              <Text style={[styles.statValue, { color: Colors.amber }]}>{goalWeight}<Text style={styles.statUnit}> kg</Text></Text>
            </View>
          </View>

          {/* Total Lost */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: Colors.lime }]} />
            <View style={[styles.statIconBubble, { backgroundColor: Colors.lime + '15', borderColor: Colors.lime + '30' }]}>
              <Ionicons name="trending-down" size={18} color={Colors.lime} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Lost</Text>
              <Text style={[styles.statValue, { color: Colors.lime }]}>{lostWeight}<Text style={styles.statUnit}> kg</Text></Text>
              <View style={[styles.statChip, { backgroundColor: weeklyChange <= 0 ? Colors.lime + '12' : Colors.danger + '12', borderColor: weeklyChange <= 0 ? Colors.lime + '25' : Colors.danger + '25' }]}>
                <Ionicons name={weeklyChange <= 0 ? "arrow-down" : "arrow-up"} size={8} color={weeklyChange <= 0 ? Colors.lime : Colors.danger} />
                <Text style={[styles.statChipText, { color: weeklyChange <= 0 ? Colors.lime : Colors.danger }]}>{weeklyChangeText}</Text>
              </View>
            </View>
          </View>

          {/* Streak */}
          <View style={styles.statCard}>
            <View style={[styles.statAccentBar, { backgroundColor: Colors.amber }]} />
            <View style={[styles.statIconBubble, { backgroundColor: Colors.amber + '15', borderColor: Colors.amber + '30' }]}>
              <Ionicons name="flame" size={18} color={Colors.amber} />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={[styles.statValue, { color: Colors.amber }]}>{streak}<Text style={styles.statUnit}> days</Text></Text>
              <View style={[styles.statChip, { backgroundColor: Colors.amber + '12', borderColor: Colors.amber + '25' }]}>
                <Text style={[styles.statChipText, { color: Colors.amber }]}>🔥 Personal best!</Text>
              </View>
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Goal / Slider */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Goal Progress" accentColor={Colors.amber} />
        <View style={styles.goalRow}>
          <ProgressRing size={90} strokeWidth={8} progress={goalProgressPct / 100} color={Colors.amber}>
            <Text style={styles.goalRingPct}>{goalProgressPct}%</Text>
          </ProgressRing>
          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>{goalWeight} kg target</Text>
            <Text style={styles.goalSub}>{remainingWeight} kg remaining</Text>
            <Text style={styles.goalEta}>Est. {Math.max(1, Math.round(remainingWeight / 0.7))} weeks at current pace</Text>
            <View style={styles.milestonesRow}>
              {MILESTONES.map((m) => {
                const unlocked = currentWeight <= m;
                return (
                  <View
                    key={m}
                    style={[styles.milestoneBadge, !unlocked && styles.milestoneLocked]}
                  >
                    <Text style={[styles.milestoneText, !unlocked && styles.milestoneLockedText]}>
                      {m}kg {unlocked ? '✓' : ''}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard>
        <SectionHeader title="Log Calendar" accentColor={Colors.lime} />
        <CalHeatmap />
        <View style={styles.heatmapLegend}>
          {[{ label: 'Logged', color: Colors.lime + '88' }, { label: 'Goal hit', color: Colors.lime }, { label: 'Missed', color: Colors.danger + '55' }].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* BMI */}
      <GlassCard accentColor={Colors.lime}>
        <SectionHeader title="BMI Indicator" accentColor={Colors.lime} />
        <BMIBar bmi={currentBmi} />
      </GlassCard>

      {/* Photo reminder */}
      <TouchableOpacity style={styles.photoCard} activeOpacity={0.8}>
        <View style={styles.photoIconWrap}>
          <Ionicons name="camera" size={22} color={Colors.lime} />
        </View>
        <View style={styles.photoText}>
          <Text style={styles.photoTitle}>Progress Photo</Text>
          <Text style={styles.photoSub}>Add this week's progress photo</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.lime} />
      </TouchableOpacity>

      {/* Slide-Up Weight Logger Modal (Option A - Recommended) */}
      <Modal
        visible={logModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLogModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderTitleBlock}>
                  <View style={[styles.modalHeaderIconWrap, { backgroundColor: Colors.amber + '15' }]}>
                    <Ionicons name="scale" size={18} color={Colors.amber} />
                  </View>
                  <View>
                    <Text style={styles.modalHeaderSub}>TRACK METRICS</Text>
                    <Text style={styles.modalHeaderTitle}>Log Weight</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setLogModalVisible(false)}>
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
                  {/* Dynamic Weight Display */}
                  <View style={styles.weightDisplayBox}>
                    <Text style={styles.weightDisplayLabel}>SELECTED WEIGHT</Text>
                    <Text style={styles.weightDisplayValue}>
                      {logWeightValue}
                      <Text style={styles.weightDisplayUnit}> kg</Text>
                    </Text>
                  </View>

                  {/* Quick adjustment pills */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.adjustLabel}>Quick Adjustments</Text>
                    <View style={styles.adjustRow}>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustWeight(-1.0)} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>-1.0 kg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustWeight(-0.1)} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>-0.1 kg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustWeight(0.1)} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>+0.1 kg</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.adjustBtn} onPress={() => handleAdjustWeight(1.0)} activeOpacity={0.75}>
                        <Text style={styles.adjustBtnText}>+1.0 kg</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Exact Value Input */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Or Enter Precise Weight</Text>
                    <View style={[styles.inputFieldWrap, !!logError && styles.inputFieldError]}>
                      <Ionicons name="create-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={logWeightValue}
                        onChangeText={(t) => {
                          setLogWeightValue(t);
                          if (logError) setLogError('');
                        }}
                        keyboardType="numeric"
                        placeholder="78.4"
                        placeholderTextColor={Colors.muted}
                        maxLength={5}
                      />
                    </View>
                    {!!logError && <Text style={styles.errorText}>{logError}</Text>}
                  </View>

                  {/* Log Date Offset Selector (Today vs Yesterday) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Logging For</Text>
                    <View style={styles.datePillRow}>
                      <TouchableOpacity
                        style={[styles.datePill, logDateOffset === 'today' && styles.datePillActive]}
                        onPress={() => setLogDateOffset('today')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.datePillText, logDateOffset === 'today' && styles.datePillTextActive]}>Today</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.datePill, logDateOffset === 'yesterday' && styles.datePillActive]}
                        onPress={() => setLogDateOffset('yesterday')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.datePillText, logDateOffset === 'yesterday' && styles.datePillTextActive]}>Yesterday</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Action Buttons Footer */}
              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogModalVisible(false)} activeOpacity={0.8}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveWeightLog} activeOpacity={0.8}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                  <Text style={styles.saveBtnText}>Log Weight</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },
  periodRow: { flexDirection: 'row', gap: 8 },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    flexDirection: 'column',
    gap: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  statIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  statContent: {
    gap: 2,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.muted,
  },
  statValue: {
    ...Typography.h3,
  },
  statUnit: {
    ...Typography.body,
    color: Colors.muted,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    marginTop: 4,
  },
  statChipText: {
    ...Typography.micro,
  },

  goalRow: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  goalRingPct: { ...Typography.bodyBold, color: Colors.amber },
  goalInfo: { flex: 1, gap: 4 },
  goalText: { ...Typography.h4, color: Colors.text.primary },
  goalSub: { ...Typography.caption, color: Colors.muted },
  goalEta: { ...Typography.micro, color: Colors.muted, marginTop: 2 },
  milestonesRow: { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  milestoneBadge: {
    backgroundColor: Colors.lime + '22', borderRadius: Radius.pill,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: Colors.lime + '55',
  },
  milestoneLocked: { backgroundColor: 'rgba(0,0,0,0.04)', borderColor: Colors.cardBorder },
  milestoneText: { ...Typography.micro, color: Colors.lime },
  milestoneLockedText: { color: Colors.muted },

  heatmapLegend: { flexDirection: 'row', gap: 16, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 2 },
  legendText: { ...Typography.caption, color: Colors.muted },

  photoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.card, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.lime + '33',
    padding: 16,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  photoIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.lime + '15',
    borderWidth: 1,
    borderColor: Colors.lime + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { flex: 1 },
  photoTitle: { ...Typography.bodyBold, color: Colors.text.primary },
  photoSub: { ...Typography.caption, color: Colors.muted },

  // Log Weight CTA Card
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  ctaText: {
    flex: 1,
    gap: 2,
  },
  ctaTitle: {
    ...Typography.bodyBold,
    color: Colors.text.primary,
  },
  ctaSub: {
    ...Typography.caption,
    color: Colors.muted,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaBtnText: {
    ...Typography.captionBold,
    color: Colors.white,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.60)',
    justifyContent: 'flex-end',
  },
  modalKeyboard: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.ivory,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    minHeight: 480,
    maxHeight: '100%',
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: Colors.lime + '20',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalHeaderIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeaderSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.amber,
  },
  modalHeaderTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  modalScroll: {
    maxHeight: 340,
  },
  modalForm: {
    gap: 20,
    paddingBottom: 20,
  },
  weightDisplayBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: 4,
  },
  weightDisplayLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: Colors.muted,
  },
  weightDisplayValue: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.lime,
  },
  weightDisplayUnit: {
    ...Typography.h3,
    color: Colors.muted,
  },
  adjustLabel: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  adjustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  adjustBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustBtnText: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.text.primary,
  },
  inputFieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 12,
    height: 46,
  },
  inputFieldError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.danger + '05',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    ...Typography.body,
    color: Colors.text.primary,
    padding: 0,
  },
  errorText: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.danger,
    marginTop: 2,
  },
  datePillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  datePill: {
    flex: 1,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePillActive: {
    borderColor: Colors.amber,
    backgroundColor: Colors.amber + '12',
  },
  datePillText: {
    ...Typography.captionBold,
    color: Colors.muted,
  },
  datePillTextActive: {
    color: Colors.amber,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cancelBtnText: {
    ...Typography.bodyBold,
    color: Colors.text.secondary,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    ...Typography.bodyBold,
    color: Colors.white,
  },
});
