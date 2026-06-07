import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { CycleLog } from '@/types';
import {
  getDatesInMonth, getPhaseForDate, PHASE_META, getTodayStr,
} from '@/constants/cycle';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

interface Props {
  cycleLogs:    CycleLog[];
  cycleSettings: { cycleLength: number; periodLength: number; lastPeriodStart: string | null };
  fertileStart:  string | null;
  fertileEnd:    string | null;
  ovulationDate: string | null;
  onDayPress?:   (date: string) => void;
}

export default function CycleCalendar({
  cycleLogs, cycleSettings, fertileStart, fertileEnd, ovulationDate, onDayPress,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => getStyles(colors), [colors]);

  const today = getTodayStr();
  const [viewYear, setViewYear]   = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());

  const monthDates = useMemo(() => getDatesInMonth(viewYear, viewMonth), [viewYear, viewMonth]);

  const firstDOW = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const blanks   = Array.from({ length: firstDOW });

  const logMap = useMemo(
    () => new Map(cycleLogs.map((l) => [l.date, l])),
    [cycleLogs],
  );

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const monthLabel = new Date(viewYear, viewMonth, 1)
    .toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <Animated.View entering={FadeIn.duration(300)}>
      {/* Month nav */}
      <View style={styles.navRow}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={18} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekday headers */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {blanks.map((_, i) => <View key={`b${i}`} style={styles.cell} />)}
        {monthDates.map((date) => {
          const log     = logMap.get(date);
          const isToday = date === today;
          const isPeriod = !!log?.flow;
          const isFertile = fertileStart && fertileEnd
            && date >= fertileStart && date <= fertileEnd;
          const isOvulation = date === ovulationDate;

          let phase = null;
          if (cycleSettings.lastPeriodStart) {
            phase = getPhaseForDate(
              date, cycleSettings.lastPeriodStart,
              cycleSettings.periodLength, cycleSettings.cycleLength,
            );
          }

          const phaseColor = phase ? PHASE_META[phase].color : null;
          // Past dates: only tint if there is an actual log (deleting a log clears its colour).
          // Today / future: always show prediction tint.
          const showPhase = !!phaseColor && (date >= today || !!log);

          return (
            <TouchableOpacity
              key={date}
              style={styles.cell}
              activeOpacity={0.75}
              onPress={() => onDayPress?.(date)}
            >
              {/* Phase background blob */}
              {showPhase && (
                <View style={[styles.phaseDot, { backgroundColor: phaseColor + '22' }]} />
              )}
              {/* Period indicator */}
              {isPeriod && (
                <View style={[styles.periodRing, { borderColor: '#F87171' }]} />
              )}
              {/* Fertile window underline */}
              {isFertile && !isOvulation && (
                <View style={[styles.fertileLine, { backgroundColor: '#A78BFA' + '60' }]} />
              )}
              {/* Ovulation highlight */}
              {isOvulation && (
                <View style={[styles.ovulationCircle, { backgroundColor: '#A78BFA' + '30', borderColor: '#A78BFA' }]} />
              )}
              {/* Today ring */}
              {isToday && (
                <View style={[styles.todayRing, { borderColor: colors.lime }]} />
              )}
              <Text style={[
                styles.dayText,
                isToday && { color: colors.lime, fontWeight: '700' },
                showPhase && !isToday && { color: phaseColor },
              ]}>
                {new Date(date).getUTCDate()}
              </Text>
              {/* Symptom dot */}
              {log && log.symptoms.length > 0 && (
                <View style={[styles.logDot, { backgroundColor: phaseColor ?? colors.lime }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {[
          { color: '#F87171', label: 'Period' },
          { color: '#A78BFA', label: 'Fertile' },
          { color: '#FBBF24', label: 'Luteal' },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

const CELL = 44;

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  navRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn:       { padding: 6 },
  monthLabel:   { ...Typography.bodyBold, color: colors.text.primary },
  weekRow:      { flexDirection: 'row', marginBottom: 4 },
  weekDay:      { width: CELL, textAlign: 'center', ...Typography.micro, color: colors.muted },
  grid:         { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL, height: CELL,
    alignItems: 'center', justifyContent: 'center',
  },
  phaseDot: {
    position: 'absolute', width: 34, height: 34, borderRadius: 17,
  },
  periodRing: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5,
  },
  ovulationCircle: {
    position: 'absolute', width: 32, height: 32, borderRadius: 16,
    borderWidth: 1.5,
  },
  fertileLine: {
    position: 'absolute', bottom: 7, height: 3, width: 28, borderRadius: 2,
  },
  todayRing: {
    position: 'absolute', width: 34, height: 34, borderRadius: 17,
    borderWidth: 2,
  },
  dayText: { ...Typography.caption, color: colors.text.primary },
  logDot: {
    position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: 2,
  },
  legend: { flexDirection: 'row', gap: 14, marginTop: 12, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...Typography.micro, color: colors.muted },
});
