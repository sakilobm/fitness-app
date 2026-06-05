import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

const CALENDAR_WEEKS = 8;

export default function CalHeatmap() {
  const { colors, isDark } = useTheme();
  const today = new Date();
  const days: { date: Date; status: 'logged' | 'missed' | 'goal' | 'future' }[] = [];

  for (let i = CALENDAR_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isFuture = d > today;
    const rand = Math.random();
    days.push({
      date: d,
      status: isFuture ? 'future' : rand > 0.7 ? 'goal' : rand > 0.3 ? 'logged' : 'missed',
    });
  }

  const statusColor: Record<string, string> = {
    logged: colors.lime + '88',
    missed: colors.danger + '55',
    goal: colors.lime,
    future: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  };

  return (
    <View style={styles.grid}>
      {Array.from({ length: CALENDAR_WEEKS }).map((_, wi) => (
        <View key={wi} style={styles.col}>
          {days.slice(wi * 7, wi * 7 + 7).map((d, di) => (
            <View
              key={di}
              style={[styles.day, { backgroundColor: statusColor[d.status] }]}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 4 },
  col: { gap: 4, flex: 1 },
  day: { height: 14, borderRadius: 3 },
});
