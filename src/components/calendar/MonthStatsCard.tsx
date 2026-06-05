import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { DOT_COLORS, CAL_H_PAD } from '@/constants/calendar';
import { MonthStats } from '@/hooks/useCalendarData';
import GlassCard from '@/components/ui/GlassCard';

interface StatChipProps {
  icon:   string;
  label:  string;
  value:  string;
  color:  string;
  colors: ThemeColors;
}

function StatChip({ icon, label, value, color, colors }: StatChipProps) {
  return (
    <View style={[ch.chip, { backgroundColor: color + '18' }]}>
      <Ionicons name={icon as any} size={15} color={color} style={{ marginBottom: 5 }} />
      <Text style={[ch.value, { color }]}>{value}</Text>
      <Text style={[ch.label, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}
const ch = StyleSheet.create({
  chip:  { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 14, marginHorizontal: 3 },
  value: { fontSize: 14, fontWeight: '700', letterSpacing: -0.3 },
  label: { fontSize: 9, fontWeight: '600', marginTop: 2, letterSpacing: 0.3, textTransform: 'uppercase' },
});

interface MonthStatsCardProps {
  stats:     MonthStats;
  monthName: string;
  colors:    ThemeColors;
}

export function MonthStatsCard({ stats, monthName, colors }: MonthStatsCardProps) {
  const trendPositive = stats.trend !== null && stats.trend > 0;
  return (
    <GlassCard style={{ marginBottom: 12, marginHorizontal: CAL_H_PAD }} noPadding>
      <View style={st.inner}>
        <Text style={[st.heading, { color: colors.muted }]}>{monthName} overview</Text>
        <View style={st.row}>
          <StatChip
            icon="scale-outline"
            label="Weigh-ins"
            value={`${stats.weightEntries}`}
            color={DOT_COLORS.weight}
            colors={colors}
          />
          <StatChip
            icon="footsteps-outline"
            label="Active days"
            value={`${stats.activeDays}`}
            color={DOT_COLORS.steps}
            colors={colors}
          />
          <StatChip
            icon="bar-chart-outline"
            label="Avg steps"
            value={stats.avgSteps > 0 ? `${(stats.avgSteps / 1000).toFixed(1)}k` : '—'}
            color={colors.lime}
            colors={colors}
          />
          <StatChip
            icon={trendPositive ? 'trending-up-outline' : 'trending-down-outline'}
            label="Wt trend"
            value={stats.trend !== null
              ? `${stats.trend > 0 ? '+' : ''}${stats.trend}kg`
              : '—'}
            color={trendPositive ? DOT_COLORS.meals : DOT_COLORS.steps}
            colors={colors}
          />
        </View>
      </View>
    </GlassCard>
  );
}

const st = StyleSheet.create({
  card:    { marginBottom: 12 },
  inner:   { padding: 16 },
  heading: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  row:     { flexDirection: 'row' },
});
