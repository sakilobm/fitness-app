import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import { SleepLog } from '@/types';
import { SLEEP_STAGE_COLORS, generateHypnoSegments, hypnoTimeLabels } from '@/constants/sleep';

const STAGE_ROWS = [
  { key: 'awake' as const, label: 'Awake', h: 5  },
  { key: 'rem'   as const, label: 'REM',   h: 13 },
  { key: 'light' as const, label: 'Light', h: 17 },
  { key: 'deep'  as const, label: 'Deep',  h: 21 },
] as const;

interface Props {
  log:    SleepLog;
  colors: ThemeColors;
}

export function SleepHypnogram({ log, colors }: Props) {
  const segments  = useMemo(() => generateHypnoSegments(log), [log.id]);
  const timeLabels = useMemo(
    () => hypnoTimeLabels(log.bedtime, log.totalMin, 4),
    [log.bedtime, log.totalMin],
  );

  return (
    <View style={st.wrap}>
      {STAGE_ROWS.map(({ key, label, h }, rowIdx) => (
        <Animated.View
          key={key}
          entering={FadeIn.delay(rowIdx * 60).duration(300)}
          style={st.row}
        >
          <Text style={[st.rowLabel, { color: SLEEP_STAGE_COLORS[key] }]}>{label}</Text>
          <View style={[st.track, { height: h, borderRadius: h / 2 }]}>
            {segments.map((seg, i) => (
              <View
                key={i}
                style={{
                  width:           `${seg.widthPct}%`,
                  height:          '100%',
                  backgroundColor: seg.type === key
                    ? SLEEP_STAGE_COLORS[key]
                    : colors.card + '60',
                }}
              />
            ))}
          </View>
        </Animated.View>
      ))}

      {/* Time axis */}
      <View style={st.timeRow}>
        <View style={st.timeOffset} />
        <View style={st.timeAxis}>
          {timeLabels.map((lbl, i) => (
            <Text
              key={i}
              style={[
                st.timeLabel,
                { color: colors.muted },
                i === 0 && { textAlign: 'left' },
                i === timeLabels.length - 1 && { textAlign: 'right' },
              ]}
            >
              {lbl}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const LABEL_W = 40;

const st = StyleSheet.create({
  wrap:       { marginTop: 4 },
  row:        { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  rowLabel:   { width: LABEL_W, fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  track:      { flex: 1, flexDirection: 'row', overflow: 'hidden' },
  timeRow:    { flexDirection: 'row', marginTop: 4 },
  timeOffset: { width: LABEL_W },
  timeAxis:   { flex: 1, flexDirection: 'row', justifyContent: 'space-between' },
  timeLabel:  { fontSize: 9, fontWeight: '500', textAlign: 'center', flex: 1 },
});
