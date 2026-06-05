import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog } from '@/types';
import GlassCard from '@/components/ui/GlassCard';
import { SparkLine } from './SparkLine';
import {
  VitalType, VITAL_CONFIG,
  hrCategory, bpCategory, glucoseCategory, spo2Category,
  formatBP, formatGlucose, timeAgoLabel,
} from '@/constants/vitals';

type AnyLog = HeartRateLog | BloodPressureLog | BloodGlucoseLog | OxygenLog;

interface Props {
  type:       VitalType;
  latest:     AnyLog | null;
  weekValues: number[];        // primary y-values for sparkline
  avg:        number;
  min:        number;
  max:        number;
  colors:     ThemeColors;
}

function getDisplay(type: VitalType, log: AnyLog) {
  switch (type) {
    case 'heartRate': {
      const l = log as HeartRateLog;
      return { value: String(l.bpm), sub: l.context, category: hrCategory(l.bpm) };
    }
    case 'bloodPressure': {
      const l = log as BloodPressureLog;
      return { value: formatBP(l.systolic, l.diastolic), sub: `${l.pulse} bpm · ${l.position}`, category: bpCategory(l.systolic, l.diastolic) };
    }
    case 'bloodGlucose': {
      const l = log as BloodGlucoseLog;
      return { value: formatGlucose(l.value, l.unit), sub: l.context, category: glucoseCategory(l.value) };
    }
    case 'oxygen': {
      const l = log as OxygenLog;
      return { value: String(l.spo2), sub: `Pulse ${l.pulse} bpm`, category: spo2Category(l.spo2) };
    }
  }
}

export function VitalCard({ type, latest, weekValues, avg, min, max, colors }: Props) {
  const cfg = VITAL_CONFIG[type];

  if (!latest) {
    return (
      <Animated.View entering={FadeInDown.springify().damping(18)}>
        <GlassCard style={st.card} accentColor={cfg.color}>
          <Text style={[st.emptyTitle, { color: colors.text.primary }]}>No readings yet</Text>
          <Text style={[st.emptySub, { color: colors.muted }]}>Tap + to log your first reading</Text>
        </GlassCard>
      </Animated.View>
    );
  }

  const { value, sub, category } = getDisplay(type, latest);
  const timeAgo = timeAgoLabel(latest.date, latest.time);
  const trendUp = weekValues.length >= 2
    ? weekValues[weekValues.length - 1] > weekValues[0]
    : null;

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <GlassCard style={st.card} accentColor={cfg.color}>
        {/* Top row: value + sparkline */}
        <View style={st.topRow}>
          <View style={st.valueBlock}>
            {/* Category badge */}
            <View style={[st.badge, { backgroundColor: category.bg }]}>
              <View style={[st.badgeDot, { backgroundColor: category.color }]} />
              <Text style={[st.badgeTxt, { color: category.color }]}>{category.label}</Text>
            </View>

            <Text style={[st.mainValue, { color: colors.text.primary }]}>{value}</Text>
            <Text style={[st.unit, { color: cfg.color }]}>{cfg.unit}</Text>
            <Text style={[st.sub, { color: colors.muted }]}>{sub}</Text>
            <Text style={[st.timeAgo, { color: colors.muted }]}>{timeAgo}</Text>
          </View>

          <View style={st.sparkWrap}>
            {weekValues.length >= 2 && (
              <SparkLine values={weekValues} width={90} height={48} color={cfg.color} />
            )}
            {trendUp !== null && (
              <View style={st.trendRow}>
                <Ionicons
                  name={trendUp ? 'trending-up' : 'trending-down'}
                  size={13}
                  color={trendUp ? colors.danger : colors.lime}
                />
                <Text style={[st.trendTxt, { color: trendUp ? colors.danger : colors.lime }]}>
                  7-day trend
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats row: avg / min / max */}
        <View style={[st.statsRow, { borderTopColor: colors.cardBorder }]}>
          {[
            { label: 'Avg', v: avg },
            { label: 'Min', v: min },
            { label: 'Max', v: max },
          ].map(({ label, v }) => (
            <View key={label} style={st.statItem}>
              <Text style={[st.statVal, { color: colors.text.primary }]}>{v || '—'}</Text>
              <Text style={[st.statLbl, { color: colors.muted }]}>{label}</Text>
            </View>
          ))}
          <View style={st.statItem}>
            <Text style={[st.statVal, { color: colors.text.primary }]}>{cfg.unit}</Text>
            <Text style={[st.statLbl, { color: colors.muted }]}>Unit</Text>
          </View>
        </View>

        <Text style={[st.reference, { color: colors.muted }]}>{cfg.description}</Text>
      </GlassCard>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card:       { marginHorizontal: 16 },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  emptySub:   { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 8 },

  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  valueBlock: { flex: 1 },

  badge:      { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8, marginBottom: 6 },
  badgeDot:   { width: 6, height: 6, borderRadius: 3 },
  badgeTxt:   { fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },

  mainValue:  { fontSize: 44, fontWeight: '800', letterSpacing: -2, lineHeight: 50 },
  unit:       { fontSize: 14, fontWeight: '700', marginTop: -2, marginBottom: 4 },
  sub:        { fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  timeAgo:    { fontSize: 11, marginTop: 2 },

  sparkWrap:  { alignItems: 'flex-end', gap: 8 },
  trendRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendTxt:   { fontSize: 10, fontWeight: '600' },

  statsRow:   { flexDirection: 'row', borderTopWidth: 1, marginTop: 14, paddingTop: 12, justifyContent: 'space-between' },
  statItem:   { alignItems: 'center', flex: 1 },
  statVal:    { fontSize: 15, fontWeight: '800' },
  statLbl:    { fontSize: 10, fontWeight: '600', marginTop: 2 },

  reference:  { fontSize: 11, marginTop: 8, fontStyle: 'italic' },
});
