import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { useCalendarNav } from '@/hooks/useCalendarNav';
import { useCalendarData } from '@/hooks/useCalendarData';
import {
  CalendarGrid,
  FilterPills,
  MonthStatsCard,
  DayDetailPanel,
} from '@/components/calendar';
import { DOT_COLORS, Filter, MONTH_NAMES, CAL_H_PAD, todayISO } from '@/constants/calendar';

export default function CalendarScreen() {
  const { colors }  = useTheme();
  const insets      = useSafeAreaInsets();

  const [filter,  setFilter]  = useState<Filter>('all');
  const [selDate, setSelDate] = useState<string>(todayISO());

  const nav  = useCalendarNav();
  const data = useCalendarData(nav.viewYear, nav.viewMonth, selDate);

  const handleDayPress = (dateStr: string) =>
    setSelDate(prev => prev === dateStr ? '' : dateStr);

  return (
    <View style={[styles.screen, { backgroundColor: colors.bg, paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
      >
        {/* ── Screen header ─────────────────────────────────────────────── */}
        <View style={styles.screenHeaderWrap}>
          <ScreenHeader
            title="Calendar"
            subtitle="ACTIVITY LOG"
            icon={{ lib: 'Ionicons', name: 'calendar' }}
            accentColor="#2DD4BF"
          />
        </View>

        {/* ── Month navigator ───────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable
            onPress={() => nav.navigateMonth('prev')}
            style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            hitSlop={10}
          >
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </Pressable>

          <Pressable
            onPress={nav.isCurrentMonth ? undefined : nav.goToToday}
            style={styles.titleWrap}
          >
            <Text style={[styles.monthTitle, { color: colors.text.primary }]}>
              {MONTH_NAMES[nav.viewMonth]}
            </Text>
            <Text style={[styles.yearLabel, { color: colors.muted }]}>
              {nav.viewYear}{!nav.isCurrentMonth ? '  ·  tap to return' : ''}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => nav.navigateMonth('next')}
            style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            hitSlop={10}
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* ── Filter pills ─────────────────────────────────────────────── */}
        <FilterPills filter={filter} onChange={setFilter} colors={colors} />

        {/* ── Calendar grid ────────────────────────────────────────────── */}
        <CalendarGrid
          calDays={data.calDays}
          viewYear={nav.viewYear}
          viewMonth={nav.viewMonth}
          selDate={selDate}
          filter={filter}
          getDayStatus={data.getDayStatus}
          animStyle={nav.calAnimStyle}
          colors={colors}
          onDayPress={handleDayPress}
        />

        {/* ── Dot legend ───────────────────────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.legend}>
          {(Object.entries(DOT_COLORS) as [string, string][]).map(([key, color]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendLabel, { color: colors.muted }]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </View>
          ))}
        </Animated.View>

        {/* ── Month overview stats ──────────────────────────────────────── */}
        <MonthStatsCard
          stats={data.monthStats}
          monthName={MONTH_NAMES[nav.viewMonth]}
          colors={colors}
        />

        {/* ── Day detail panel ─────────────────────────────────────────── */}
        {selDate && data.dayDetail && (
          <DayDetailPanel
            detail={data.dayDetail}
            colors={colors}
            onClose={() => setSelDate('')}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  screenHeaderWrap: {
    paddingHorizontal: CAL_H_PAD,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CAL_H_PAD,
    paddingTop: 12,
    paddingBottom: 8,
  },
  navBtn: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  titleWrap: { alignItems: 'center' },
  monthTitle: { fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  yearLabel:  { fontSize: 11, fontWeight: '500', marginTop: 1 },
  legend: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 18, paddingVertical: 6, marginBottom: 6,
  },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:   { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontSize: 11, fontWeight: '500' },
});
