import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import { WEEK_DAYS, CELL_W, CAL_H_PAD, Filter } from '@/constants/calendar';
import { DayStatus } from '@/hooks/useCalendarData';
import { DayCell } from './DayCell';
import GlassCard from '@/components/ui/GlassCard';

interface CalendarGridProps {
  calDays:      (number | null)[];
  viewYear:     number;
  viewMonth:    number;
  selDate:      string;
  filter:       Filter;
  getDayStatus: (dateStr: string) => DayStatus;
  animStyle:    object;
  colors:       ThemeColors;
  onDayPress:   (dateStr: string) => void;
}

export function CalendarGrid({
  calDays, viewYear, viewMonth, selDate, filter,
  getDayStatus, animStyle, colors, onDayPress,
}: CalendarGridProps) {
  const rows = Math.ceil(calDays.length / 7);

  return (
    <GlassCard style={styles.card} noPadding>
      <View style={styles.inner}>
        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEK_DAYS.map(d => (
            <View key={d} style={{ width: CELL_W, alignItems: 'center' }}>
              <Text style={[styles.weekLabel, { color: colors.muted }]}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Day grid — animated for month swipe */}
        <Animated.View style={animStyle}>
          {Array.from({ length: rows }, (_, row) => (
            <View key={row} style={styles.gridRow}>
              {calDays.slice(row * 7, row * 7 + 7).map((day, col) => {
                const idx = row * 7 + col;
                // Pre-compute status so DayCell gets a stable object
                const dateStr = day
                  ? `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  : null;
                const status = dateStr ? getDayStatus(dateStr) : { hasWeight: false, stepsPct: 0, waterPct: 0, mealsPct: 0, sleepScore: null };

                return (
                  <DayCell
                    key={dateStr ?? `e${idx}`}
                    day={day}
                    row={row}
                    col={col}
                    viewYear={viewYear}
                    viewMonth={viewMonth}
                    selDate={selDate}
                    filter={filter}
                    status={status}
                    colors={colors}
                    onPress={onDayPress}
                  />
                );
              })}
            </View>
          ))}
        </Animated.View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card:    { marginHorizontal: CAL_H_PAD, marginBottom: 10 },
  inner:   { padding: 12 },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  gridRow: { flexDirection: 'row' },
});
