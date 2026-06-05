import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { SleepLog } from '@/types';
import {
  sleepScoreColor, sleepScoreLabel, formatDuration, formatTime12, SLEEP_STAGE_COLORS,
} from '@/constants/sleep';

interface Props {
  log:      SleepLog;
  index:    number;
  colors:   ThemeColors;
  onDelete: (id: string) => void;
}

const STAGES = [
  { key: 'deep'  as const, minKey: 'deepMin'  as const },
  { key: 'rem'   as const, minKey: 'remMin'   as const },
  { key: 'light' as const, minKey: 'lightMin' as const },
  { key: 'awake' as const, minKey: 'awakeMin' as const },
] as const;

function SleepLogCardBase({ log, index, colors, onDelete }: Props) {
  const scoreColor = sleepScoreColor(log.score, colors.lime);

  const d = new Date(log.date + 'T12:00:00');
  const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 40).springify().damping(20)}
      exiting={FadeOutUp.duration(260)}
      style={[st.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      {/* Left accent */}
      <View style={[st.accent, { backgroundColor: scoreColor }]} />

      <View style={st.body}>
        {/* Row 1: date + score */}
        <View style={st.topRow}>
          <View>
            <Text style={[st.date, { color: colors.muted }]}>{dateLabel}</Text>
            <Text style={[st.duration, { color: colors.text.primary }]}>
              {formatDuration(log.totalMin)}
            </Text>
          </View>

          <View style={st.scoreWrap}>
            <Text style={[st.scoreNum, { color: scoreColor }]}>{log.score}</Text>
            <Text style={[st.scoreLabel, { color: colors.muted }]}>
              {sleepScoreLabel(log.score)}
            </Text>
          </View>
        </View>

        {/* Row 2: times + wake-ups */}
        <View style={st.metaRow}>
          <MetaChip label={formatTime12(log.bedtime)}  icon="moon-outline"      colors={colors} />
          <MetaChip label={formatTime12(log.wakeTime)} icon="sunny-outline"     colors={colors} />
          <MetaChip label={`${log.wakeUps}×`}          icon="refresh-outline"   colors={colors} />
          <MetaChip label={`${log.cycles.toFixed(1)} cycles`} icon="sync-circle-outline" colors={colors} />
        </View>

        {/* Stage bar */}
        <View style={st.stageBar}>
          {STAGES.map(({ key, minKey }) => (
            <View
              key={key}
              style={[
                st.stageSeg,
                { width: `${(log[minKey] / log.totalMin) * 100}%`, backgroundColor: SLEEP_STAGE_COLORS[key] },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Delete */}
      <TouchableOpacity
        onPress={() => onDelete(log.id)}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={st.delBtn}
      >
        <Ionicons name="trash-outline" size={16} color={colors.muted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

export const SleepLogCard = React.memo(SleepLogCardBase);

function MetaChip({ label, icon, colors }: { label: string; icon: string; colors: ThemeColors }) {
  return (
    <View style={[st.chip, { borderColor: colors.cardBorder }]}>
      <Ionicons name={icon as any} size={11} color={colors.muted} />
      <Text style={[st.chipTxt, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  card:      { flexDirection: 'row', borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 10, marginHorizontal: 16 },
  accent:    { width: 4 },
  body:      { flex: 1, padding: 12 },
  topRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  date:      { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  duration:  { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  scoreWrap: { alignItems: 'flex-end' },
  scoreNum:  { fontSize: 22, fontWeight: '800' },
  scoreLabel:{ fontSize: 10, fontWeight: '600' },
  metaRow:   { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 3, paddingHorizontal: 7, borderRadius: 8, borderWidth: 1 },
  chipTxt:   { fontSize: 10, fontWeight: '600' },
  stageBar:  { flexDirection: 'row', height: 5, borderRadius: 3, overflow: 'hidden', gap: 1 },
  stageSeg:  { height: '100%' },
  delBtn:    { padding: 12, justifyContent: 'center' },
});
