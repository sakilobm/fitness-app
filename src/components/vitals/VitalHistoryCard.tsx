import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog } from '@/types';
import {
  VitalType, VITAL_CONFIG,
  hrCategory, bpCategory, glucoseCategory, spo2Category,
  formatBP, formatGlucose,
} from '@/constants/vitals';

type AnyLog = HeartRateLog | BloodPressureLog | BloodGlucoseLog | OxygenLog;

interface Props {
  type:     VitalType;
  log:      AnyLog;
  index:    number;
  colors:   ThemeColors;
  onDelete: (id: string) => void;
}

function getCardData(type: VitalType, log: AnyLog) {
  const cfg = VITAL_CONFIG[type];
  switch (type) {
    case 'heartRate': {
      const l = log as HeartRateLog;
      return { value: `${l.bpm}`, unit: cfg.unit, meta: l.context, category: hrCategory(l.bpm), extra: '' };
    }
    case 'bloodPressure': {
      const l = log as BloodPressureLog;
      return { value: formatBP(l.systolic, l.diastolic), unit: cfg.unit, meta: `${l.position} · ${l.arm} arm`, category: bpCategory(l.systolic, l.diastolic), extra: `${l.pulse} bpm` };
    }
    case 'bloodGlucose': {
      const l = log as BloodGlucoseLog;
      return { value: formatGlucose(l.value, l.unit), unit: l.unit, meta: l.context, category: glucoseCategory(l.value), extra: '' };
    }
    case 'oxygen': {
      const l = log as OxygenLog;
      return { value: `${l.spo2}`, unit: cfg.unit, meta: `Pulse: ${l.pulse} bpm`, category: spo2Category(l.spo2), extra: '' };
    }
  }
}

function HistoryCardBase({ type, log, index, colors, onDelete }: Props) {
  const cfg   = VITAL_CONFIG[type];
  const { value, unit, meta, category, extra } = getCardData(type, log);

  const d = new Date(log.date + 'T12:00:00');
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).springify().damping(20)}
      exiting={FadeOutUp.duration(240)}
      style={[st.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={[st.accent, { backgroundColor: cfg.color }]} />

      <View style={st.body}>
        <View style={st.row}>
          <View style={st.left}>
            <Text style={[st.date, { color: colors.muted }]}>{dateLabel} · {log.time}</Text>
            <View style={st.valueRow}>
              <Text style={[st.value, { color: colors.text.primary }]}>{value}</Text>
              <Text style={[st.unit, { color: cfg.color }]}> {unit}</Text>
            </View>
            <Text style={[st.meta, { color: colors.muted }]} numberOfLines={1}>
              {meta}{extra ? `  ·  ${extra}` : ''}
            </Text>
          </View>
          <View style={[st.badge, { backgroundColor: category.bg }]}>
            <View style={[st.badgeDot, { backgroundColor: category.color }]} />
            <Text style={[st.badgeTxt, { color: category.color }]}>{category.label}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => onDelete(log.id)}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={st.delBtn}
      >
        <Ionicons name="trash-outline" size={15} color={colors.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export const VitalHistoryCard = React.memo(HistoryCardBase);

const st = StyleSheet.create({
  card:     { flexDirection: 'row', borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 8, marginHorizontal: 16 },
  accent:   { width: 3 },
  body:     { flex: 1, paddingVertical: 10, paddingHorizontal: 12 },
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  left:     { flex: 1 },
  date:     { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value:    { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  unit:     { fontSize: 12, fontWeight: '700' },
  meta:     { fontSize: 11, fontWeight: '500', marginTop: 2, textTransform: 'capitalize' },
  badge:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, alignSelf: 'flex-start' },
  badgeDot: { width: 5, height: 5, borderRadius: 2.5 },
  badgeTxt: { fontSize: 10, fontWeight: '800' },
  delBtn:   { padding: 12, justifyContent: 'center' },
});
