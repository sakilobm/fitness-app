import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import PillButton from '@/components/ui/PillButton';
import { Colors, Typography, Radius } from '@/constants/theme';
import { router } from 'expo-router';

const { width: W } = Dimensions.get('window');

const STEPS_GOAL = 10000;
const STEPS_TODAY = 6240;
const KCAL_BURNED = 310;
const DISTANCE_KM = 4.8;

const WEEK_STEPS = [8400, 5200, 10300, 9100, 6240, 0, 0];
const WEEK_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const today_idx = 4;

function WeekBars() {
  const barW = (W - 80) / 7;
  const maxVal = Math.max(...WEEK_STEPS, STEPS_GOAL);
  const chartH = 100;

  return (
    <Svg width={W - 64} height={chartH + 28}>
      {WEEK_STEPS.map((v, i) => {
        const h = (v / maxVal) * chartH;
        const x = i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const color =
          v === 0 ? 'rgba(255,255,255,0.06)'
          : v >= STEPS_GOAL ? Colors.amber
          : i === today_idx ? Colors.lime
          : Colors.muted + '55';
        return (
          <G key={i}>
            <Rect
              x={x} y={chartH - h}
              width={bw} height={Math.max(h, 2)}
              rx={4} fill={color}
            />
            <SvgText
              x={x + bw / 2} y={chartH + 18}
              fill={i === today_idx ? Colors.lime : Colors.muted}
              fontSize={11} textAnchor="middle" fontWeight={i === today_idx ? '700' : '400'}
            >
              {WEEK_LABELS[i]}
            </SvgText>
            {v > 0 && (
              <SvgText
                x={x + bw / 2} y={chartH - h - 5}
                fill={color === Colors.muted + '55' ? Colors.muted : color}
                fontSize={9} textAnchor="middle"
              >
                {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

const STREAK_DAYS = 14;
function StreakDots() {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {Array.from({ length: STREAK_DAYS }).map((_, i) => {
          const hit = i < 11;
          return (
            <View
              key={i}
              style={[
                streakS.dot,
                hit ? streakS.dotHit : streakS.dotMiss,
                i === STREAK_DAYS - 1 && streakS.dotToday,
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
  dotHit: { backgroundColor: Colors.lime + '88' },
  dotMiss: { backgroundColor: Colors.danger + '44' },
  dotToday: { borderWidth: 2, borderColor: Colors.lime, backgroundColor: Colors.lime },
});

const MOTION = [
  { label: 'Walking', pct: 0.55, color: Colors.lime },
  { label: 'Running', pct: 0.2, color: Colors.amber },
  { label: 'Stationary', pct: 0.25, color: Colors.muted + '55' },
];

export default function StepsScreen() {
  const insets = useSafeAreaInsets();
  const [goalView, setGoalView] = useState<'daily' | 'weekly'>('daily');
  const progress = STEPS_TODAY / STEPS_GOAL;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Steps & Walking</Text>
      </View>

      {/* Giant ring */}
      <View style={styles.ringSection}>
        <ProgressRing size={220} strokeWidth={18} progress={progress} color={Colors.lime} glowing>
          <Text style={styles.stepsNum}>{STEPS_TODAY.toLocaleString()}</Text>
          <Text style={styles.stepsGoal}>/ {STEPS_GOAL.toLocaleString()} steps</Text>
          <View style={styles.ringStats}>
            <View style={styles.ringStat}>
              <Ionicons name="flame" size={14} color={Colors.amber} />
              <Text style={styles.ringStatVal}>{KCAL_BURNED}</Text>
              <Text style={styles.ringStatLabel}>kcal</Text>
            </View>
            <View style={styles.ringStatDivider} />
            <View style={styles.ringStat}>
              <Ionicons name="location" size={14} color={Colors.lime} />
              <Text style={styles.ringStatVal}>{DISTANCE_KM}</Text>
              <Text style={styles.ringStatLabel}>km</Text>
            </View>
          </View>
        </ProgressRing>
        <Text style={styles.ringPct}>{Math.round(progress * 100)}% of daily goal</Text>
      </View>

      {/* Weekly bars */}
      <GlassCard accentColor={Colors.lime}>
        <SectionHeader title="This Week" />
        <WeekBars />
        <View style={styles.chartLegend}>
          {[
            { label: 'Today', color: Colors.lime },
            { label: 'Goal hit', color: Colors.amber },
            { label: 'Below goal', color: Colors.muted },
          ].map((l) => (
            <View key={l.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: l.color }]} />
              <Text style={styles.legendText}>{l.label}</Text>
            </View>
          ))}
        </View>
      </GlassCard>

      {/* Motion breakdown */}
      <GlassCard accentColor={Colors.amber}>
        <SectionHeader title="Time in Motion" />
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
      </GlassCard>

      {/* Goal setter */}
      <GlassCard>
        <SectionHeader title="Goal Settings" />
        <View style={styles.goalToggle}>
          {(['daily', 'weekly'] as const).map((v) => (
            <PillButton
              key={v}
              label={v.charAt(0).toUpperCase() + v.slice(1)}
              active={goalView === v}
              onPress={() => setGoalView(v)}
              style={{ flex: 1 }}
            />
          ))}
        </View>
        <View style={styles.goalInfo}>
          <Text style={styles.goalValue}>{goalView === 'daily' ? '10,000' : '70,000'}</Text>
          <Text style={styles.goalUnit}>steps {goalView === 'daily' ? 'per day' : 'per week'}</Text>
        </View>
        <Text style={styles.goalSub}>Recommended: 7,000–10,000 steps/day for general health</Text>
      </GlassCard>

      {/* Streak */}
      <GlassCard>
        <SectionHeader title="Last 14 Days" />
        <StreakDots />
        <View style={styles.streakStats}>
          <StatBadge label="Streak" value="11d 🔥" color={Colors.lime} />
          <StatBadge label="Best Day" value="12,400" color={Colors.amber} />
          <StatBadge label="Avg/Day" value="8,200" color={Colors.lime} />
        </View>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { padding: 4 },
  backText: { ...Typography.h4, color: Colors.lime },
  title: { ...Typography.h1, color: Colors.text.primary },

  ringSection: { alignItems: 'center', gap: 12, paddingVertical: 8 },
  stepsNum: { ...Typography.hero, color: Colors.text.primary },
  stepsGoal: { ...Typography.caption, color: Colors.muted },
  ringStats: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 16 },
  ringStat: { alignItems: 'center', gap: 2 },
  ringStatIcon: { fontSize: 14 },
  ringStatVal: { ...Typography.h4, color: Colors.text.primary },
  ringStatLabel: { ...Typography.micro, color: Colors.muted },
  ringStatDivider: { width: 1, height: 30, backgroundColor: Colors.cardBorder },
  ringPct: { ...Typography.bodyBold, color: Colors.lime },

  chartLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { ...Typography.caption, color: Colors.muted },

  motionRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  motionItem: { alignItems: 'center', gap: 8 },
  motionPct: { ...Typography.captionBold },
  motionLabel: { ...Typography.caption, color: Colors.muted },

  goalToggle: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  goalInfo: { alignItems: 'center', marginBottom: 8 },
  goalValue: { ...Typography.hero, color: Colors.lime },
  goalUnit: { ...Typography.body, color: Colors.muted },
  goalSub: { ...Typography.caption, color: Colors.muted, textAlign: 'center' },

  streakStats: { flexDirection: 'row', gap: 8, marginTop: 12 },
});
