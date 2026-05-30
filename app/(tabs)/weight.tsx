import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import GlassCard from '../../components/ui/GlassCard';
import StatBadge from '../../components/ui/StatBadge';
import SectionHeader from '../../components/ui/SectionHeader';
import PillButton from '../../components/ui/PillButton';
import ProgressRing from '../../components/ui/ProgressRing';
import { Colors, Typography, Radius, Spacing } from '../../constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;
const CHART_H = 140;

const WEEK_DATA = [79.2, 78.9, 79.1, 78.6, 78.4, 78.1, 78.4];
const MONTH_DATA = [80.5, 80.1, 79.8, 79.5, 79.2, 78.9, 79.1, 78.7, 78.4, 78.1, 78.3, 78.0, 77.8, 78.2, 78.0, 77.7, 77.5, 77.8, 78.0, 77.6, 77.4, 77.2, 77.5, 77.3, 77.1, 77.4, 77.2, 77.0, 76.8, 78.4];

type Period = 'week' | 'month' | '3m';

function SparkLine({ data }: { data: number[] }) {
  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * CHART_W,
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
      <SvgText x={lastPt.x + 6} y={lastPt.y - 8} fill={Colors.lime} fontSize={11} fontWeight="700">
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
    future: 'rgba(255,255,255,0.06)',
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
      <Text style={[bmiS.bmiValue, { color: category.color }]}>BMI {bmi} — {category.label}weight</Text>
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
  bmiValue: { ...Typography.bodyBold, marginTop: 8, textAlign: 'center' },
});

const MILESTONES = [75, 80, 85, 90];

export default function WeightScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('week');
  const chartData = period === 'week' ? WEEK_DATA : MONTH_DATA;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Weight Tracking</Text>

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

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatBadge label="Current" value="78.4 kg" color={Colors.lime} />
        <StatBadge label="Goal" value="72.0 kg" color={Colors.amber} />
        <StatBadge label="Lost" value="6.1 kg" color={Colors.lime} />
        <StatBadge label="Streak" value="14d 🔥" color={Colors.amber} />
      </View>

      {/* Goal / Slider */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Goal Progress" />
        <View style={styles.goalRow}>
          <ProgressRing size={90} strokeWidth={8} progress={0.46} color={Colors.amber}>
            <Text style={styles.goalRingPct}>46%</Text>
          </ProgressRing>
          <View style={styles.goalInfo}>
            <Text style={styles.goalText}>72.0 kg target</Text>
            <Text style={styles.goalSub}>6.4 kg remaining</Text>
            <Text style={styles.goalEta}>Est. 9 weeks at current pace</Text>
            <View style={styles.milestonesRow}>
              {MILESTONES.map((m) => (
                <View
                  key={m}
                  style={[styles.milestoneBadge, m >= 78.4 && styles.milestoneLocked]}
                >
                  <Text style={[styles.milestoneText, m >= 78.4 && styles.milestoneLockedText]}>
                    {m}kg {m < 78.4 ? '✓' : ''}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </GlassCard>

      {/* Heatmap */}
      <GlassCard>
        <SectionHeader title="Log Calendar" />
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
        <SectionHeader title="BMI Indicator" />
        <BMIBar bmi={24.2} />
      </GlassCard>

      {/* Photo reminder */}
      <TouchableOpacity style={styles.photoCard} activeOpacity={0.8}>
        <Text style={styles.photoIcon}>📸</Text>
        <View style={styles.photoText}>
          <Text style={styles.photoTitle}>Progress Photo</Text>
          <Text style={styles.photoSub}>Add this week's progress photo</Text>
        </View>
        <Text style={styles.photoArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },
  title: { ...Typography.h1, color: Colors.text.primary },
  periodRow: { flexDirection: 'row', gap: 8 },

  statsRow: { flexDirection: 'row', gap: 8 },

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
  milestoneLocked: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: Colors.cardBorder },
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
  },
  photoIcon: { fontSize: 32 },
  photoText: { flex: 1 },
  photoTitle: { ...Typography.bodyBold, color: Colors.text.primary },
  photoSub: { ...Typography.caption, color: Colors.muted },
  photoArrow: { ...Typography.h2, color: Colors.lime },
});
