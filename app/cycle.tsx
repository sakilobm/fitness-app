import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import GlassCard from '@/components/ui/GlassCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SectionHeader from '@/components/ui/SectionHeader';
import { PhaseOrb, CycleCalendar, CycleLogSheet } from '@/components/cycle';
import { useCycle } from '@/hooks/useCycle';
import { PHASE_META, FLOW_META, MOOD_META, SYMPTOM_META, daysUntil, getTodayStr } from '@/constants/cycle';
import { CycleLog } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

export default function CycleScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const cycle = useCycle();

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate,    setSheetDate]    = useState(getTodayStr());

  const openLog = (date = getTodayStr()) => {
    setSheetDate(date);
    setSheetVisible(true);
  };

  const handleSave = (log: Omit<CycleLog, 'id'>) => {
    const existing = cycle.cycleLogs.find((l) => l.date === log.date);
    if (existing) {
      cycle.updateCycleLog(existing.id, log);
    } else {
      cycle.addCycleLog(log);
    }
    // If the log has flow and no period start is set (or this is earlier), update period start
    if (log.flow && (!cycle.cycleSettings.lastPeriodStart || log.date <= cycle.cycleSettings.lastPeriodStart)) {
      cycle.updateCycleSettings({ lastPeriodStart: log.date });
    }
  };

  const sheetExisting = cycle.cycleLogs.find((l) => l.date === sheetDate) ?? null;
  const phaseColor    = cycle.phaseMeta?.color ?? '#F87171';

  // Insight cards
  const insights = [
    cycle.nextPeriodDate && {
      icon: 'calendar' as const,
      label: 'Next Period',
      value: cycle.daysUntilPeriod === 0 ? 'Today' :
             cycle.daysUntilPeriod != null && cycle.daysUntilPeriod > 0 ?
               `in ${cycle.daysUntilPeriod}d` :
               `${Math.abs(cycle.daysUntilPeriod ?? 0)}d overdue`,
      color: '#F87171',
      sub: cycle.nextPeriodDate,
    },
    cycle.ovulationDate && {
      icon: 'star' as const,
      label: 'Ovulation',
      value: (() => {
        const d = daysUntil(cycle.ovulationDate!, getTodayStr());
        if (d === 0) return 'Today!';
        if (d > 0)   return `in ${d}d`;
        return `${Math.abs(d)}d ago`;
      })(),
      color: '#A78BFA',
      sub: cycle.ovulationDate,
    },
    cycle.inFertileWindow && {
      icon: 'sparkles' as const,
      label: 'Fertile Window',
      value: 'Active Now',
      color: '#A78BFA',
      sub: `${cycle.fertileStart} → ${cycle.fertileEnd}`,
    },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; color: string; sub: string }>;

  const recentLogs = cycle.cycleLogs.slice(0, 7);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      >
        <ScreenHeader
          title="Cycle"
          subtitle="TRACKING"
          icon={{ lib: 'Ionicons', name: 'flower' }}
          accentColor="#F87171"
          showBack
          onBack={() => router.back()}
        />

        {/* Phase Hero */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
          <LinearGradient
            colors={[phaseColor + '22', colors.card + 'E8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <PhaseOrb
              phase={cycle.currentPhase}
              dayOfCycle={cycle.dayOfCycle}
              cycleLength={cycle.cycleSettings.cycleLength}
              progress={cycle.cycleProgress}
            />

            {cycle.phaseMeta && (
              <Text style={[styles.phaseTip, { color: colors.text.secondary }]}>
                {cycle.phaseMeta.tip}
              </Text>
            )}

            {/* CTA buttons */}
            <View style={styles.ctaRow}>
              <TouchableOpacity
                style={[styles.ctaBtn, { backgroundColor: '#F87171' }]}
                onPress={() => { triggerHaptic('medium'); openLog(); }}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.ctaBtnTxt}>Log Today</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctaBtn, styles.ctaBtnOutline, { borderColor: phaseColor }]}
                onPress={() => { triggerHaptic('medium'); cycle.markPeriodStart(); }}
                activeOpacity={0.85}
              >
                <Ionicons name="play-circle-outline" size={18} color={phaseColor} />
                <Text style={[styles.ctaBtnTxt, { color: phaseColor }]}>Start Period</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Insight chips */}
        {insights.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).springify().damping(18)}>
            <View style={styles.insightRow}>
              {insights.map((ins) => (
                <View key={ins.label} style={[styles.insightChip, { backgroundColor: ins.color + '14', borderColor: ins.color + '40' }]}>
                  <Ionicons name={ins.icon} size={16} color={ins.color} />
                  <View>
                    <Text style={[styles.insightLabel, { color: ins.color }]}>{ins.label}</Text>
                    <Text style={[styles.insightValue, { color: colors.text.primary }]}>{ins.value}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Phase description */}
        {cycle.phaseMeta && (
          <Animated.View entering={FadeInDown.delay(160).springify().damping(18)}>
            <GlassCard accentColor={phaseColor}>
              <SectionHeader title={cycle.phaseMeta.label} accentColor={phaseColor} />
              <Text style={styles.phaseDescription}>{cycle.phaseMeta.description}</Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Calendar */}
        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
          <GlassCard>
            <SectionHeader title="Cycle Calendar" accentColor="#F87171" />
            <CycleCalendar
              cycleLogs={cycle.cycleLogs}
              cycleSettings={cycle.cycleSettings}
              fertileStart={cycle.fertileStart}
              fertileEnd={cycle.fertileEnd}
              ovulationDate={cycle.ovulationDate}
              onDayPress={(date) => openLog(date)}
            />
          </GlassCard>
        </Animated.View>

        {/* Today's log summary */}
        {cycle.todayLog && (
          <Animated.View entering={FadeInDown.delay(240).springify().damping(18)}>
            <GlassCard accentColor="#F87171">
              <SectionHeader
                title="Today's Log"
                accentColor="#F87171"
                action="Edit →"
                onAction={() => openLog()}
              />
              <View style={styles.todayLogRow}>
                {cycle.todayLog.flow && (
                  <View style={[styles.todayBadge, { backgroundColor: '#F87171' + '18', borderColor: '#F87171' + '40' }]}>
                    <Text style={{ fontSize: 12 }}>{'🩸'.repeat(FLOW_META[cycle.todayLog.flow].drops)}</Text>
                    <Text style={[styles.todayBadgeText, { color: '#F87171' }]}>
                      {FLOW_META[cycle.todayLog.flow].label}
                    </Text>
                  </View>
                )}
                {cycle.todayLog.mood && (
                  <View style={[styles.todayBadge, { backgroundColor: MOOD_META[cycle.todayLog.mood].color + '18', borderColor: MOOD_META[cycle.todayLog.mood].color + '40' }]}>
                    <Text style={{ fontSize: 12 }}>{MOOD_META[cycle.todayLog.mood].emoji}</Text>
                    <Text style={[styles.todayBadgeText, { color: MOOD_META[cycle.todayLog.mood].color }]}>
                      {MOOD_META[cycle.todayLog.mood].label}
                    </Text>
                  </View>
                )}
              </View>
              {cycle.todayLog.symptoms.length > 0 && (
                <View style={styles.symptomRow}>
                  {cycle.todayLog.symptoms.map((sym) => (
                    <View key={sym} style={styles.symptomPill}>
                      <Ionicons name={SYMPTOM_META[sym].icon as never} size={11} color={colors.muted} />
                      <Text style={styles.symptomPillText}>{SYMPTOM_META[sym].label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          </Animated.View>
        )}

        {/* Cycle Settings */}
        <Animated.View entering={FadeInDown.delay(280).springify().damping(18)}>
          <GlassCard>
            <SectionHeader title="Cycle Settings" accentColor={colors.lime} />
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="repeat" size={18} color={colors.lime} />
                <View>
                  <Text style={styles.settingLabel}>Cycle Length</Text>
                  <Text style={styles.settingSub}>Average days between periods</Text>
                </View>
              </View>
              <View style={styles.nudgeWrap}>
                <TouchableOpacity style={styles.nudge} onPress={() => cycle.updateCycleSettings({ cycleLength: Math.max(21, cycle.cycleSettings.cycleLength - 1) })}>
                  <Ionicons name="remove" size={14} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.nudgeVal, { color: colors.lime }]}>{cycle.cycleSettings.cycleLength}d</Text>
                <TouchableOpacity style={styles.nudge} onPress={() => cycle.updateCycleSettings({ cycleLength: Math.min(35, cycle.cycleSettings.cycleLength + 1) })}>
                  <Ionicons name="add" size={14} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: colors.cardBorder, marginTop: 8, paddingTop: 12 }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="water" size={18} color="#F87171" />
                <View>
                  <Text style={styles.settingLabel}>Period Length</Text>
                  <Text style={styles.settingSub}>Average days of flow</Text>
                </View>
              </View>
              <View style={styles.nudgeWrap}>
                <TouchableOpacity style={styles.nudge} onPress={() => cycle.updateCycleSettings({ periodLength: Math.max(2, cycle.cycleSettings.periodLength - 1) })}>
                  <Ionicons name="remove" size={14} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.nudgeVal, { color: '#F87171' }]}>{cycle.cycleSettings.periodLength}d</Text>
                <TouchableOpacity style={styles.nudge} onPress={() => cycle.updateCycleSettings({ periodLength: Math.min(10, cycle.cycleSettings.periodLength + 1) })}>
                  <Ionicons name="add" size={14} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Recent log history */}
        {recentLogs.length > 0 && (
          <Animated.View entering={FadeInDown.delay(320).springify().damping(18)}>
            <GlassCard>
              <SectionHeader title="Recent Logs" accentColor={colors.text.secondary} />
              <View style={{ gap: 10 }}>
                {recentLogs.map((log) => {
                  const d = new Date(log.date + 'T00:00:00');
                  const dateStr = d.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <TouchableOpacity
                      key={log.id}
                      style={styles.logRow}
                      activeOpacity={0.8}
                      onPress={() => openLog(log.date)}
                    >
                      <View style={[styles.logDot, { backgroundColor: log.flow ? '#F87171' : colors.cardBorder }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.logDate}>{dateStr}</Text>
                        <View style={styles.logMeta}>
                          {log.flow && <Text style={styles.logMetaText}>{FLOW_META[log.flow].label} flow</Text>}
                          {log.mood && <Text style={styles.logMetaText}>{MOOD_META[log.mood].emoji} {MOOD_META[log.mood].label}</Text>}
                          {log.symptoms.length > 0 && <Text style={styles.logMetaText}>{log.symptoms.length} symptom{log.symptoms.length > 1 ? 's' : ''}</Text>}
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={14} color={colors.muted} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Empty state */}
        {cycle.cycleLogs.length === 0 && !cycle.cycleSettings.lastPeriodStart && (
          <Animated.View entering={FadeInUp.delay(200).springify().damping(18)}>
            <GlassCard>
              <View style={styles.emptyState}>
                <Text style={{ fontSize: 52 }}>🌸</Text>
                <Text style={styles.emptyTitle}>Start tracking your cycle</Text>
                <Text style={styles.emptySub}>
                  Tap "Start Period" to mark today as day 1 of your cycle, or tap "Log Today" to add symptoms and mood.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        )}
      </ScrollView>

      <CycleLogSheet
        visible={sheetVisible}
        date={sheetDate}
        existing={sheetExisting}
        onSave={handleSave}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  scroll: { paddingHorizontal: 16, gap: 16 },

  heroGradient: {
    borderRadius: 24, paddingVertical: 28, paddingHorizontal: 20,
    gap: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(248,113,113,0.20)',
  },
  phaseTip: { ...Typography.caption, textAlign: 'center', lineHeight: 18 },
  ctaRow: { flexDirection: 'row', gap: 10, width: '100%' },
  ctaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, borderRadius: Radius.pill,
  },
  ctaBtnOutline: {
    backgroundColor: 'transparent', borderWidth: 1.5,
  },
  ctaBtnTxt: { ...Typography.captionBold, color: '#fff' },

  insightRow: { flexDirection: 'row', gap: 10 },
  insightChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: Radius.md, borderWidth: 1,
  },
  insightLabel: { ...Typography.micro, letterSpacing: 0.3 },
  insightValue: { ...Typography.captionBold, marginTop: 1 },

  phaseDescription: { ...Typography.body, color: colors.text.secondary, lineHeight: 22 },

  todayLogRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  todayBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 10,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  todayBadgeText: { ...Typography.captionBold },
  symptomRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  symptomPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: 8,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  symptomPillText: { ...Typography.micro, color: colors.muted },

  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { ...Typography.captionBold, color: colors.text.primary },
  settingSub:   { ...Typography.micro, color: colors.muted, marginTop: 1 },
  nudgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nudge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  nudgeVal: { ...Typography.bodyBold, width: 34, textAlign: 'center' },

  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logDate: { ...Typography.captionBold, color: colors.text.primary },
  logMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  logMetaText: { ...Typography.micro, color: colors.muted },

  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  emptyTitle: { ...Typography.h4, color: colors.text.primary },
  emptySub:   { ...Typography.caption, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },
});
