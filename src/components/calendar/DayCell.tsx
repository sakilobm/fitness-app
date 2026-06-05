import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme';
import { Filter, DOT_COLORS, CELL_W, CELL_H, CIRCLE_SIZE, todayISO, toISO } from '@/constants/calendar';
import { DayStatus } from '@/hooks/useCalendarData';

interface DayCellProps {
  day:      number | null;
  row:      number;
  col:      number;
  viewYear: number;
  viewMonth: number;
  selDate:  string;
  filter:   Filter;
  status:   DayStatus;
  colors:   ThemeColors;
  onPress:  (dateStr: string) => void;
}

function DayCellBase({
  day, row, col, viewYear, viewMonth, selDate, filter, status, colors, onPress,
}: DayCellProps) {
  if (!day) {
    return <View style={{ width: CELL_W, height: CELL_H }} />;
  }

  const today   = todayISO();
  const dateStr = toISO(viewYear, viewMonth, day);
  const isToday  = dateStr === today;
  const isSel    = dateStr === selDate;
  const isFuture = dateStr > today;

  const showWeight = !isFuture && status.hasWeight  && (filter === 'all' || filter === 'weight');
  const showSteps  = !isFuture && status.stepsPct >= 40 && (filter === 'all' || filter === 'steps');
  const showWater  = !isFuture && status.waterPct >= 25 && (filter === 'all' || filter === 'water');
  const showMeals  = !isFuture && status.mealsPct >= 15 && (filter === 'all' || filter === 'meals');

  const tint = !isFuture && filter !== 'all' ? (() => {
    if (filter === 'weight' && status.hasWeight)       return DOT_COLORS.weight + '22';
    if (filter === 'steps'  && status.stepsPct >= 60)  return DOT_COLORS.steps  + '22';
    if (filter === 'water'  && status.waterPct >= 60)  return DOT_COLORS.water  + '22';
    if (filter === 'meals'  && status.mealsPct >= 50)  return DOT_COLORS.meals  + '22';
    return undefined;
  })() : undefined;

  return (
    <Pressable
      onPress={() => !isFuture && onPress(dateStr)}
      style={[st.cell, { width: CELL_W, height: CELL_H }]}
    >
      <View style={[
        st.circle,
        tint    ? { backgroundColor: tint }   : null,
        isToday && !isSel && [st.circleToday, { borderColor: colors.lime, backgroundColor: colors.lime + '14' }],
        isSel   && [st.circleSel,   { backgroundColor: colors.lime, shadowColor: colors.lime }],
      ]}>
        <Text style={[
          st.dayNum,
          { color: colors.text.primary },
          isFuture         && st.numFuture,
          isToday && !isSel && { color: colors.lime, fontWeight: '700' },
          isSel             && { color: '#0D0F0E',    fontWeight: '800' },
        ]}>
          {day}
        </Text>
      </View>

      <View style={st.dotRow}>
        {showWeight && <View style={[st.dot, { backgroundColor: DOT_COLORS.weight }]} />}
        {showSteps  && <View style={[st.dot, { backgroundColor: DOT_COLORS.steps  }]} />}
        {showWater  && <View style={[st.dot, { backgroundColor: DOT_COLORS.water  }]} />}
        {showMeals  && <View style={[st.dot, { backgroundColor: DOT_COLORS.meals  }]} />}
      </View>
    </Pressable>
  );
}

export const DayCell = React.memo(DayCellBase);

const st = StyleSheet.create({
  cell: { alignItems: 'center', paddingTop: 4 },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleToday: { borderWidth: 1.5 },
  circleSel: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 5,
  },
  dayNum:    { fontSize: 13, fontWeight: '500' },
  numFuture: { opacity: 0.35 },
  dotRow: {
    flexDirection: 'row',
    gap: 2.5,
    marginTop: 3,
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});
