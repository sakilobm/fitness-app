import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Share, Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { router } from 'expo-router';
import { useQuestTracker } from '@/features/quests/hooks/useQuestTracker';
import { triggerHaptic } from '@/utils/haptics';

const { width: W } = Dimensions.get('window');

export default function QuestsTrackerScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const {
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    handlePrevMonth,
    handleNextMonth,
    calDays,
    selectedDayInfo,
    monthStats,
    handleShareSummary,
    getQuestStatus,
  } = useQuestTracker();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }, [today]);

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <ScreenHeader
          title="Quest Calendar"
          accentColor={colors.lime}
          showBack
          onBack={() => router.back()}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ── Calendar Controller Header ───────────────────────────────────── */}
        <View style={styles.calendarControlRow}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarTitleTxt}>
            {monthNames[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Calendar Grid ─────────────────────────────────────────────────── */}
        <GlassCard style={styles.calendarCard}>
          {/* Weekday Labels */}
          <View style={styles.weekdayLabelsRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          {/* Grid Cells */}
          <View style={styles.calendarGrid}>
            {calDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <View key={`empty-${idx}`} style={styles.dayCellDummy} />;
              }

              const status = getQuestStatus(dayDate);
              const isSelected = selectedDate === dayDate;
              const isToday = todayStr === dayDate;
              const dayNum = parseInt(dayDate.split('-')[2], 10);

              // Colors based on completion count
              let ringColor = 'rgba(0,0,0,0.06)';
              if (status.completedCount === 5) {
                ringColor = colors.lime;
              } else if (status.completedCount >= 3) {
                ringColor = '#38BDF8';
              } else if (status.completedCount >= 1) {
                ringColor = '#FB923C';
              }

              return (
                <TouchableOpacity
                  key={dayDate}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && styles.dayCellToday
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedDate(dayDate);
                  }}
                >
                  <Text style={[
                    styles.dayCellText,
                    isSelected && styles.dayCellTextSelected,
                    isToday && { color: colors.lime, fontWeight: '800' }
                  ]}>
                    {dayNum}
                  </Text>

                  {/* Quest Completion Dots */}
                  <View style={styles.dotsIndicatorWrap}>
                    {status.completedCount === 5 ? (
                      <Ionicons name="trophy" size={10} color={colors.lime} />
                    ) : (
                      <View style={[styles.progressDotCircle, { backgroundColor: ringColor }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* ── Selected Day Focus Card ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quest Breakdown</Text>
          <Text style={styles.dateLabelBadge}>{selectedDate === todayStr ? 'Today' : selectedDate}</Text>
        </View>

        <GlassCard style={styles.breakdownCard}>
          <View style={styles.breakdownHeaderRow}>
            <View style={styles.completionScoreBox}>
              <Text style={styles.completionScoreVal}>{selectedDayInfo.completedCount}/5</Text>
              <Text style={styles.completionScoreLbl}>Done</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.breakdownCardTitle}>
                {selectedDayInfo.completedCount === 5 ? 'Perfect Day Achieved! 🌟' : 'Daily Quest Progress'}
              </Text>
              <Text style={styles.breakdownCardSub}>
                {selectedDayInfo.completedCount === 5
                  ? 'All 5 targets fully completed. You earned a total of +1,000 XP!'
                  : `Complete remaining targets to unlock additional XP rewards.`}
              </Text>
            </View>
          </View>

          {/* List of individual quests */}
          <View style={styles.questsList}>
            {selectedDayInfo.quests.map((quest) => {
              const progressPct = Math.round(Math.min(100, (quest.progress / quest.target) * 100));
              return (
                <View key={quest.id} style={styles.questItemRow}>
                  <View style={[styles.questIconBox, { backgroundColor: quest.color + '15' }]}>
                    <Ionicons name={quest.icon as any} size={16} color={quest.color} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.questMetaRow}>
                      <Text style={styles.questName}>{quest.name}</Text>
                      <Text style={styles.questProgressText}>
                        {quest.progress.toLocaleString()} / {quest.target.toLocaleString()} {quest.unit}
                      </Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { backgroundColor: quest.color, width: `${progressPct}%` }]} />
                    </View>
                  </View>
                  <View style={styles.checkboxArea}>
                    {quest.completed ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color={colors.muted} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* ── Monthly Overview Statistics ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{monthNames[viewMonth]} Stats</Text>
        </View>

        <View style={styles.statsCardGrid}>
          <GlassCard style={styles.statMiniCard}>
            <ProgressRing size={60} strokeWidth={6} progress={monthStats.completionRate / 100} color={colors.lime}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.primary }}>
                {monthStats.completionRate}%
              </Text>
            </ProgressRing>
            <Text style={styles.statMiniTitle}>Completion Rate</Text>
          </GlassCard>

          <GlassCard style={styles.statMiniCard}>
            <View style={[styles.circleBadgeBox, { backgroundColor: colors.lime + '15' }]}>
              <Ionicons name="trophy" size={22} color={colors.lime} />
            </View>
            <Text style={styles.statMiniValue}>{monthStats.perfectDays} Days</Text>
            <Text style={styles.statMiniTitle}>Perfect Days</Text>
          </GlassCard>
        </View>

        {/* Category Breakdown list */}
        <GlassCard style={styles.categoryStatsCard}>
          <Text style={styles.cardHeaderTitle}>Category Achievements</Text>
          <Text style={styles.cardHeaderSub}>Number of days you reached the daily goal this month:</Text>

          <View style={styles.categoryProgressLines}>
            {[
              { label: 'Steps Challenge', count: monthStats.questBreakdown.steps, color: '#6366F1' },
              { label: 'Hydration Target', count: monthStats.questBreakdown.water, color: '#38BDF8' },
              { label: 'Calorie Target', count: monthStats.questBreakdown.calories, color: '#FB923C' },
              { label: 'Sleep Target', count: monthStats.questBreakdown.sleep, color: '#818CF8' },
              { label: 'Workout Target', count: monthStats.questBreakdown.workouts, color: '#F43F5E' }
            ].map((cat, idx) => {
              const maxDays = monthStats.totalDays || 30;
              const pct = Math.round((cat.count / maxDays) * 100);
              return (
                <View key={idx} style={styles.catStatRow}>
                  <View style={styles.catStatLabelRow}>
                    <Text style={styles.catStatLabel}>{cat.label}</Text>
                    <Text style={styles.catStatCount}>{cat.count} / {maxDays} days</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { backgroundColor: cat.color, width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Export / Share CTA */}
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8} onPress={handleShareSummary}>
          <Ionicons name="share-social" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.shareButtonTxt}>Share Monthly Quest Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  calendarControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
  },
  calendarTitleTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  calendarCard: {
    padding: 16,
  },
  weekdayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: (W - 72) / 7,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCellDummy: {
    width: (W - 72) / 7,
    height: 48,
  },
  dayCell: {
    width: (W - 72) / 7,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellSelected: {
    borderColor: colors.lime,
    backgroundColor: colors.lime + '15',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.muted + '40',
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dayCellTextSelected: {
    color: colors.lime,
    fontWeight: '700',
  },
  dotsIndicatorWrap: {
    marginTop: 2,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  dateLabelBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.lime,
    backgroundColor: colors.lime + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  breakdownCard: {
    padding: 16,
    gap: 16,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  completionScoreBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionScoreVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  completionScoreLbl: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  breakdownCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  breakdownCardSub: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  questsList: {
    gap: 12,
  },
  questItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  questProgressText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  barBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  checkboxArea: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  circleBadgeBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statMiniTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  categoryStatsCard: {
    padding: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 16,
    marginTop: 2,
  },
  categoryProgressLines: {
    gap: 12,
  },
  catStatRow: {
    gap: 6,
  },
  catStatLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  catStatCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  shareButton: {
    backgroundColor: colors.lime,
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  shareButtonTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
