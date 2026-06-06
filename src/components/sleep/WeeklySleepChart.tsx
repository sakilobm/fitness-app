import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import { SleepLog } from '@/types';
import { sleepScoreColor, SLEEP_GOAL_HOURS } from '@/constants/sleep';

const CHART_H  = 100;
const MAX_MIN  = 660;  // 11 h ceiling
const GOAL_MIN = SLEEP_GOAL_HOURS * 60;

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function dayLabel(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return DAY_LABELS[d.getDay()];
}

interface Props {
  weeklyLogs: (SleepLog | null)[];  // index 0 = today, 6 = 6 days ago
  colors:     ThemeColors;
}

export function WeeklySleepChart({ weeklyLogs, colors }: Props) {
  const chartData = [...weeklyLogs].reverse();  // index 0 = 6 days ago, 6 = today
  const goalPct   = GOAL_MIN / MAX_MIN;
  const goalTop   = CHART_H * (1 - goalPct);

  return (
    <View>
      {/* Header */}
      <View style={st.header}>
        <Text style={[st.title, { color: colors.text.primary }]}>7-Day Overview</Text>
        <Text style={[st.goalLbl, { color: '#818CF8' }]}>
          {SLEEP_GOAL_HOURS}h goal
        </Text>
      </View>

      {/* Chart area */}
      <View style={[st.chartArea, { height: CHART_H + 24 }]}>
        {/* Goal dashed line */}
        <View style={[st.goalLine, { top: goalTop, borderColor: '#818CF8' + '60' }]}>
          <Text style={[st.goalLineLabel, { color: '#818CF8' }]}>{SLEEP_GOAL_HOURS}h</Text>
        </View>

        {/* Bars */}
        <View style={st.barsRow}>
          {chartData.map((log, i) => {
            const daysAgo   = 6 - i;
            const barH      = log ? Math.round((log.totalMin / MAX_MIN) * CHART_H) : 0;
            const barColor  = log ? sleepScoreColor(log.score, colors.lime) : colors.cardBorder;
            const isToday   = daysAgo === 0;

            return (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(i * 60).springify().damping(22)}
                style={st.barCol}
              >
                {log && (
                  <Text style={[st.barHoursLabel, { color: colors.muted }]}>
                    {(log.totalMin / 60).toFixed(1)}
                  </Text>
                )}
                <View style={[st.barTrack, { height: CHART_H }]}>
                  <View
                    style={[
                      st.bar,
                      {
                        height:          barH,
                        backgroundColor: log ? barColor : colors.cardBorder,
                        opacity:         log ? 1 : 0.35,
                        borderRadius:    5,
                      },
                    ]}
                  />
                </View>
                <Text style={[
                  st.dayLbl,
                  { color: isToday ? '#818CF8' : colors.muted },
                  isToday && { fontWeight: '800' },
                ]}>
                  {isToday ? 'Today' : dayLabel(daysAgo)}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title:           { fontSize: 14, fontWeight: '700' },
  goalLbl:         { fontSize: 12, fontWeight: '700' },

  chartArea:       { position: 'relative' },
  goalLine:        {
    position:    'absolute',
    left:        0,
    right:       0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems:  'center',
    zIndex:      2,
  },
  goalLineLabel:   { fontSize: 9, fontWeight: '700', marginLeft: 2 },

  barsRow:         { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  barCol:          { flex: 1, alignItems: 'center' },
  barTrack:        { width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  bar:             { width: '70%' },
  barHoursLabel:   { fontSize: 8, fontWeight: '600', marginBottom: 2 },
  dayLbl:          { fontSize: 10, fontWeight: '600', marginTop: 4 },
});
