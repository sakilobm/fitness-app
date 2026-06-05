import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import { SleepLog } from '@/types';
import ProgressRing from '@/components/ui/ProgressRing';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import GlassCard from '@/components/ui/GlassCard';
import {
  sleepScoreColor, sleepScoreLabel, formatTime12, formatDuration,
  SLEEP_STAGE_COLORS,
} from '@/constants/sleep';

interface Props {
  log:          SleepLog | null;
  avgScore:     number;
  sleepDebtMin: number;
  colors:       ThemeColors;
}

const STAGES = [
  { key: 'deep'  as const, label: 'Deep'  },
  { key: 'rem'   as const, label: 'REM'   },
  { key: 'light' as const, label: 'Light' },
  { key: 'awake' as const, label: 'Awake' },
];

const STAGE_MIN_KEYS = {
  deep: 'deepMin', rem: 'remMin', light: 'lightMin', awake: 'awakeMin',
} as const;

export function SleepHeroCard({ log, sleepDebtMin, colors }: Props) {
  if (!log) {
    return (
      <Animated.View entering={FadeInDown.springify().damping(18)}>
        <GlassCard style={st.card}>
          <Text style={[st.emptyTitle, { color: colors.text.primary }]}>No sleep logged</Text>
          <Text style={[st.emptySub, { color: colors.muted }]}>Tap + to log last night</Text>
        </GlassCard>
      </Animated.View>
    );
  }

  const scoreColor = sleepScoreColor(log.score, colors.lime);

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <GlassCard style={st.card} accentColor={scoreColor}>
        {/* Top: ring + details */}
        <View style={st.topRow}>
          <ProgressRing size={112} strokeWidth={9} progress={log.score / 100} color={scoreColor}>
            <View style={st.ringContent}>
              <AnimatedNumber
                value={log.score}
                style={{ ...st.scoreNum, color: scoreColor }}
                duration={1200}
              />
              <Text style={[st.scoreLabel, { color: colors.muted }]}>
                {sleepScoreLabel(log.score)}
              </Text>
            </View>
          </ProgressRing>

          <View style={st.details}>
            <AnimatedNumber
              value={log.totalMin / 60}
              decimals={1}
              suffix="h"
              style={{ ...st.durNum, color: colors.text.primary }}
              duration={1000}
            />
            <Text style={[st.durSub, { color: colors.muted }]}>
              {formatDuration(log.totalMin)} · {log.cycles.toFixed(1)} cycles
            </Text>

            <View style={st.timesRow}>
              <TimeChip icon="🌙" label="Bed"  time={formatTime12(log.bedtime)}  colors={colors} />
              <TimeChip icon="☀️" label="Wake" time={formatTime12(log.wakeTime)} colors={colors} />
            </View>

            {sleepDebtMin > 30 && (
              <Text style={[st.debtText, { color: colors.amber }]}>
                {Math.round(sleepDebtMin / 60 * 10) / 10}h debt this week
              </Text>
            )}
          </View>
        </View>

        {/* Stage proportion bar */}
        <View style={st.stageBarWrap}>
          {STAGES.map(({ key }) => {
            const minKey = STAGE_MIN_KEYS[key];
            const min = log[minKey];
            return (
              <View
                key={key}
                style={[
                  st.stageSegment,
                  { width: `${(min / log.totalMin) * 100}%`, backgroundColor: SLEEP_STAGE_COLORS[key] },
                ]}
              />
            );
          })}
        </View>

        {/* Stage legend */}
        <View style={st.legend}>
          {STAGES.map(({ key, label }) => {
            const minKey = STAGE_MIN_KEYS[key];
            const min = log[minKey];
            return (
              <View key={key} style={st.legendItem}>
                <View style={[st.legendDot, { backgroundColor: SLEEP_STAGE_COLORS[key] }]} />
                <Text style={[st.legendTxt, { color: colors.muted }]}>
                  {label} {Math.round(min / 60 * 10) / 10}h
                </Text>
              </View>
            );
          })}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function TimeChip({
  icon, label, time, colors,
}: { icon: string; label: string; time: string; colors: ThemeColors }) {
  return (
    <View style={[st.chip, { backgroundColor: colors.bg + 'CC', borderColor: colors.cardBorder }]}>
      <Text style={st.chipIcon}>{icon}</Text>
      <View>
        <Text style={[st.chipLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[st.chipTime, { color: colors.text.primary }]}>{time}</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card:         { marginHorizontal: 16 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  emptySub:     { fontSize: 13, textAlign: 'center', marginTop: 4, marginBottom: 8 },

  topRow:       { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ringContent:  { alignItems: 'center' },
  scoreNum:     { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  scoreLabel:   { fontSize: 10, fontWeight: '600', marginTop: 1 },

  details:      { flex: 1 },
  durNum:       { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  durSub:       { fontSize: 12, marginTop: 2, marginBottom: 8 },
  timesRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  debtText:     { fontSize: 11, fontWeight: '600', marginTop: 6 },

  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 5, paddingHorizontal: 8, borderRadius: 10, borderWidth: 1 },
  chipIcon:     { fontSize: 14 },
  chipLabel:    { fontSize: 9, fontWeight: '600', letterSpacing: 0.3 },
  chipTime:     { fontSize: 12, fontWeight: '700' },

  stageBarWrap: { flexDirection: 'row', height: 7, borderRadius: 4, overflow: 'hidden', marginTop: 14, marginBottom: 10, gap: 2 },
  stageSegment: { height: '100%', borderRadius: 4 },

  legend:       { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:    { width: 7, height: 7, borderRadius: 3.5 },
  legendTxt:    { fontSize: 10, fontWeight: '600' },
});
