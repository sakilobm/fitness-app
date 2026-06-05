import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { DOT_COLORS, CAL_H_PAD } from '@/constants/calendar';
import { DayDetail } from '@/hooks/useCalendarData';
import { MetricCard, MiniBar } from './MetricCard';
import GlassCard from '@/components/ui/GlassCard';

interface DayDetailPanelProps {
  detail:  DayDetail;
  colors:  ThemeColors;
  onClose: () => void;
}

export function DayDetailPanel({ detail, colors, onClose }: DayDetailPanelProps) {
  return (
    <Animated.View entering={FadeInDown.duration(300).springify().damping(18)}>
      <GlassCard style={{ marginBottom: 12, marginHorizontal: CAL_H_PAD }} noPadding>
        <View style={st.inner}>
          {/* Date header */}
          <View style={st.header}>
            <View style={{ flex: 1 }}>
              <Text style={[st.date, { color: colors.text.primary }]}>{detail.label}</Text>
              {detail.isToday && (
                <View style={[st.todayChip, { backgroundColor: colors.lime + '20' }]}>
                  <View style={[st.todayDot, { backgroundColor: colors.lime }]} />
                  <Text style={[st.todayText, { color: colors.lime }]}>Today</Text>
                </View>
              )}
            </View>
            <Pressable onPress={onClose} style={[st.closeBtn, { backgroundColor: colors.overlay }]} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.muted} />
            </Pressable>
          </View>

          {/* 2 × 2 metric grid */}
          <View style={st.grid}>
            {/* Weight */}
            <MetricCard
              icon="scale-outline"
              label="Weight"
              color={DOT_COLORS.weight}
              colors={colors}
              isEmpty={!detail.wLog}
              emptyText="Not logged"
            >
              {detail.wLog && (
                <>
                  <Text style={[st.metVal, { color: DOT_COLORS.weight }]}>
                    {detail.wLog.weight}
                    <Text style={st.metUnit}> {detail.weightUnit}</Text>
                  </Text>
                  {detail.weightDelta !== null && (
                    <View style={st.deltaRow}>
                      <Ionicons
                        name={detail.weightDelta <= 0 ? 'arrow-down' : 'arrow-up'}
                        size={10}
                        color={detail.weightDelta <= 0 ? DOT_COLORS.steps : DOT_COLORS.meals}
                      />
                      <Text style={[st.deltaText, {
                        color: detail.weightDelta <= 0 ? DOT_COLORS.steps : DOT_COLORS.meals,
                      }]}>
                        {Math.abs(detail.weightDelta).toFixed(1)} kg
                      </Text>
                    </View>
                  )}
                  <Text style={[st.metSub, { color: colors.muted }]}>{detail.wLog.timeOfDay}</Text>
                </>
              )}
            </MetricCard>

            {/* Steps */}
            <MetricCard
              icon="footsteps-outline"
              label="Steps"
              color={DOT_COLORS.steps}
              colors={colors}
              isEmpty={!detail.sLog}
              emptyText="No data"
            >
              {detail.sLog && (
                <>
                  <Text style={[st.metVal, { color: DOT_COLORS.steps }]}>
                    {detail.sLog.steps.toLocaleString()}
                  </Text>
                  <MiniBar pct={detail.stepsPct} color={DOT_COLORS.steps} />
                  <Text style={[st.metSub, { color: colors.muted }]}>
                    {detail.sLog.distanceKm} km · {detail.sLog.caloriesBurned} kcal
                  </Text>
                </>
              )}
            </MetricCard>

            {/* Water */}
            <MetricCard
              icon="water-outline"
              label="Water"
              color={DOT_COLORS.water}
              colors={colors}
              isEmpty={detail.waterMl === 0}
              emptyText={detail.isToday ? 'Not logged yet' : 'No history'}
            >
              {detail.waterMl > 0 && (
                <>
                  <Text style={[st.metVal, { color: DOT_COLORS.water }]}>
                    {detail.waterMl}
                    <Text style={st.metUnit}> ml</Text>
                  </Text>
                  <MiniBar pct={detail.waterPct} color={DOT_COLORS.water} />
                  <Text style={[st.metSub, { color: colors.muted }]}>
                    {detail.waterPct}% of {detail.wGoal} ml
                  </Text>
                </>
              )}
            </MetricCard>

            {/* Meals */}
            <MetricCard
              icon="restaurant-outline"
              label="Meals"
              color={DOT_COLORS.meals}
              colors={colors}
              isEmpty={detail.caloriesKcal === 0}
              emptyText={detail.isToday ? 'Nothing logged' : 'No history'}
            >
              {detail.caloriesKcal > 0 && (
                <>
                  <Text style={[st.metVal, { color: DOT_COLORS.meals }]}>
                    {detail.caloriesKcal.toLocaleString()}
                    <Text style={st.metUnit}> kcal</Text>
                  </Text>
                  <MiniBar pct={detail.calPct} color={DOT_COLORS.meals} />
                  <Text style={[st.metSub, { color: colors.muted }]}>
                    {detail.mealsLogged}/4 meals · {detail.calPct}% of goal
                  </Text>
                </>
              )}
            </MetricCard>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card:      { marginBottom: 12 },
  inner:     { padding: 16 },
  header:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  date:      { fontSize: 17, fontWeight: '700', letterSpacing: -0.4 },
  todayChip: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 5, gap: 4,
  },
  todayDot:  { width: 5, height: 5, borderRadius: 2.5 },
  todayText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  closeBtn:  { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metVal:    { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  metUnit:   { fontSize: 12, fontWeight: '500' },
  deltaRow:  { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 3 },
  deltaText: { fontSize: 11, fontWeight: '600' },
  metSub:    { fontSize: 11, marginTop: 5 },
});
