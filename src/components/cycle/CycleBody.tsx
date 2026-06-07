import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, FadeInUp, FadeIn,
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, Easing, cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import GlassCard from '@/components/ui/GlassCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import SectionHeader from '@/components/ui/SectionHeader';
import PhaseOrb from './PhaseOrb';
import CycleCalendar from './CycleCalendar';
import CycleLogSheet from './CycleLogSheet';
import { useCycle } from '@/hooks/useCycle';
import {
  PHASE_META, FLOW_META, MOOD_META, SYMPTOM_META,
  daysUntil, getTodayStr, getPhaseForDate,
} from '@/constants/cycle';
import { CycleLog } from '@/types';
import { triggerHaptic } from '@/utils/haptics';

interface CycleBodyProps {
  showBack?: boolean;
}

// ─── Period Late Card ─────────────────────────────────────────────────────────
function PeriodLateCard({
  daysLate, onMarkStarted, onLogSymptoms, colors,
}: {
  daysLate:       number;
  onMarkStarted:  () => void;
  onLogSymptoms:  () => void;
  colors:         ThemeColors;
}) {
  const s = lateStyles(colors);

  const { accent, headline, message } =
    daysLate <= 3 ? {
      accent:   '#FBBF24',
      headline: `${daysLate} day${daysLate > 1 ? 's' : ''} late`,
      message:  'Small variations are completely normal — stress, travel, or minor routine changes can shift your cycle by a few days.',
    } : daysLate <= 7 ? {
      accent:   '#FB923C',
      headline: `${daysLate} days late`,
      message:  'Common causes include stress, changes in diet or exercise, illness, or hormonal fluctuations. Your body has its own rhythm.',
    } : daysLate <= 14 ? {
      accent:   '#F87171',
      headline: `${daysLate} days late`,
      message:  "If you've been sexually active, consider taking a pregnancy test. Otherwise, tracking stress and recent lifestyle changes may help explain the delay.",
    } : {
      accent:   '#EF4444',
      headline: `${daysLate} days late`,
      message:  'Your period is significantly late. Speaking with a healthcare provider is a good idea to understand what may be going on.',
    };

  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <GlassCard accentColor={accent}>
        <View style={s.header}>
          <View style={[s.iconBubble, { backgroundColor: accent + '20' }]}>
            <Ionicons name="time" size={20} color={accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.badge, { color: accent }]}>PERIOD LATE</Text>
            <Text style={[s.headline, { color: colors.text.primary }]}>{headline}</Text>
          </View>
        </View>
        <Text style={[s.message, { color: colors.text.secondary }]}>{message}</Text>
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.btn, { backgroundColor: accent, flex: 2 }]}
            onPress={onMarkStarted}
            activeOpacity={0.85}
          >
            <Ionicons name="flag" size={14} color="#fff" />
            <Text style={s.btnTxt}>Period Started</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btnOutline, { borderColor: accent, flex: 1 }]}
            onPress={onLogSymptoms}
            activeOpacity={0.85}
          >
            <Ionicons name="pencil" size={14} color={accent} />
            <Text style={[s.btnTxt, { color: accent }]}>Log</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const lateStyles = (_colors: ThemeColors) => StyleSheet.create({
  header:     { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  iconBubble: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  badge:      { ...Typography.micro, fontWeight: '800' as const, letterSpacing: 0.8 },
  headline:   { ...Typography.bodyBold, marginTop: 2 },
  message:    { ...Typography.caption, lineHeight: 19, marginBottom: 14 },
  actions:    { flexDirection: 'row', gap: 8 },
  btn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: Radius.pill,
  },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 10, borderRadius: Radius.pill,
    backgroundColor: 'transparent', borderWidth: 1.5,
  },
  btnTxt: { ...Typography.captionBold, color: '#fff' },
});

// ─── Hand Pointer Tutorial ────────────────────────────────────────────────────
function HandPointer({ colors }: { colors: ThemeColors }) {
  const bounce   = useSharedValue(0);
  const ripple   = useSharedValue(1);
  const rippleOp = useSharedValue(0.5);

  useEffect(() => {
    bounce.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 550, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,  { duration: 550, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    ripple.value = withRepeat(
      withSequence(
        withTiming(1,   { duration: 0 }),
        withTiming(2.6, { duration: 1100, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
    rippleOp.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 0 }),
        withTiming(0,    { duration: 1100, easing: Easing.out(Easing.quad) }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(bounce);
      cancelAnimation(ripple);
      cancelAnimation(rippleOp);
    };
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bounce.value }] }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ripple.value }],
    opacity:   rippleOp.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(220)} style={hp.wrap}>
      <View style={hp.iconArea}>
        <Animated.View style={[hp.ripple, { backgroundColor: '#F87171' + '38' }, rippleStyle]} />
        <Animated.View style={bounceStyle}>
          <View style={[hp.circle, { backgroundColor: '#F87171' }]}>
            <Ionicons name="chevron-down" size={16} color="#fff" />
          </View>
        </Animated.View>
      </View>
      <Text style={[hp.label, { color: colors.muted }]}>tap any date on the calendar</Text>
    </Animated.View>
  );
}

const hp = StyleSheet.create({
  wrap:     { alignItems: 'center', paddingVertical: 10, gap: 6 },
  iconArea: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  ripple:   { position: 'absolute', width: 36, height: 36, borderRadius: 18 },
  circle:   { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  label:    { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.4, opacity: 0.75 },
});

// ─── Inline Date Detail Panel ─────────────────────────────────────────────────
function DateDetailPanel({
  date, cycle, onEditLog, onSetPeriodStart, onClose, colors,
}: {
  date: string;
  cycle: ReturnType<typeof useCycle>;
  onEditLog: () => void;
  onSetPeriodStart: () => void;
  onClose: () => void;
  colors: ThemeColors;
}) {
  const s = detailStyles(colors);
  const phase = cycle.cycleSettings.lastPeriodStart
    ? getPhaseForDate(
      date,
      cycle.cycleSettings.lastPeriodStart,
      cycle.cycleSettings.periodLength,
      cycle.cycleSettings.cycleLength,
    )
    : null;
  const phaseMeta = phase ? PHASE_META[phase] : null;
  const log = cycle.cycleLogs.find((l) => l.date === date) ?? null;
  const accentColor = phaseMeta?.color ?? '#F87171';

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('default', {
    weekday: 'long', month: 'short', day: 'numeric',
  });

  const handleDelete = () => {
    if (!log) return;
    triggerHaptic('medium');
    cycle.deleteCycleLog(log.id);
    onClose();
  };

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <GlassCard accentColor={accentColor}>
        {/* Date row */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <View style={[s.phaseDot, { backgroundColor: accentColor }]} />
            <View>
              <Text style={s.dateText}>{displayDate}</Text>
              {phaseMeta && (
                <Text style={[s.phaseLabel, { color: accentColor }]}>{phaseMeta.label}</Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={s.closeBtn}>
            <Ionicons name="close" size={18} color={colors.muted} />
          </TouchableOpacity>
        </View>

        {/* Phase tip */}
        {phaseMeta && (
          <Text style={s.tip}>{phaseMeta.tip}</Text>
        )}

        {/* Log summary */}
        {log && (
          <>
            <View style={[s.divider, { backgroundColor: colors.cardBorder }]} />
            <View style={s.badgeRow}>
              {log.flow && (
                <View style={[s.badge, { backgroundColor: '#F87171' + '18', borderColor: '#F87171' + '40' }]}>
                  <Text style={{ fontSize: 11 }}>{'🩸'.repeat(FLOW_META[log.flow].drops)}</Text>
                  <Text style={[s.badgeText, { color: '#F87171' }]}>{FLOW_META[log.flow].label}</Text>
                </View>
              )}
              {log.mood && (
                <View style={[s.badge, { backgroundColor: MOOD_META[log.mood].color + '18', borderColor: MOOD_META[log.mood].color + '40' }]}>
                  <Text style={{ fontSize: 11 }}>{MOOD_META[log.mood].emoji}</Text>
                  <Text style={[s.badgeText, { color: MOOD_META[log.mood].color }]}>{MOOD_META[log.mood].label}</Text>
                </View>
              )}
            </View>
            {log.symptoms.length > 0 && (
              <View style={s.symptomsRow}>
                {log.symptoms.slice(0, 5).map((sym) => (
                  <View key={sym} style={[s.symptomPill, { borderColor: colors.cardBorder, backgroundColor: colors.bg }]}>
                    <Ionicons name={SYMPTOM_META[sym].icon as never} size={10} color={colors.muted} />
                    <Text style={[s.symptomText, { color: colors.muted }]}>{SYMPTOM_META[sym].label}</Text>
                  </View>
                ))}
                {log.symptoms.length > 5 && (
                  <Text style={[s.symptomText, { color: colors.muted }]}>+{log.symptoms.length - 5}</Text>
                )}
              </View>
            )}
            {log.note ? <Text style={[s.noteText, { color: colors.text.secondary }]}>"{log.note}"</Text> : null}
          </>
        )}

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: accentColor + '15', borderColor: accentColor + '50' }]}
            onPress={onEditLog}
            activeOpacity={0.8}
          >
            <Ionicons name={log ? 'pencil' : 'add-circle-outline'} size={14} color={accentColor} />
            <Text style={[s.actionText, { color: accentColor }]}>
              {log ? 'Edit Log' : 'Add Log'}
            </Text>
          </TouchableOpacity>
          {log && (
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
              <Text style={[s.actionText, { color: '#EF4444' }]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Period start anchor — subtle secondary link */}
        <TouchableOpacity onPress={onSetPeriodStart} style={s.setPeriodRow} activeOpacity={0.65}>
          <Ionicons name="flag" size={11} color={colors.muted} />
          <Text style={s.setPeriodTxt}>Set as new period start</Text>
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
  );
}

const detailStyles = (colors: ThemeColors) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  phaseDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  dateText: { ...Typography.captionBold, color: colors.text.primary },
  phaseLabel: { ...Typography.micro, marginTop: 1 },
  closeBtn: { padding: 4 },
  tip: { ...Typography.caption, color: colors.text.secondary, lineHeight: 18, marginBottom: 8 },
  divider: { height: 1, marginVertical: 8 },
  badgeRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 6 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: 8,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  badgeText: { ...Typography.micro },
  symptomsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  symptomPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingVertical: 3, paddingHorizontal: 7,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  symptomText: { ...Typography.micro },
  noteText: { ...Typography.caption, fontStyle: 'italic', marginTop: 6 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 9, borderRadius: Radius.pill, borderWidth: 1,
  },
  actionText: { ...Typography.captionBold },
  setPeriodRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingTop: 10, marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.cardBorder,
  },
  setPeriodTxt: { ...Typography.micro, color: colors.muted },
});

// ─── Main CycleBody Component ─────────────────────────────────────────────────
export default function CycleBody({ showBack = false }: CycleBodyProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const cycle = useCycle();

  const scrollRef = useRef<ScrollView>(null);
  const [calendarY, setCalendarY] = useState(0);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetDate, setSheetDate] = useState(getTodayStr());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [periodStartMode, setPeriodStartMode] = useState(false);

  const openLog = (date = getTodayStr()) => {
    setPeriodStartMode(false);
    setSelectedDate(null);
    setSheetDate(date);
    setSheetVisible(true);
  };

  const onCalendarDayPress = (date: string) => {
    // Period-start selection mode — any tap anchors the cycle to that date
    if (periodStartMode) {
      triggerHaptic('medium');
      cycle.markPeriodStart(date);
      setPeriodStartMode(false);
      setSelectedDate(null);
      return;
    }
    if (selectedDate === date) { setSelectedDate(null); return; }
    const hasPhase = cycle.cycleSettings.lastPeriodStart !== null;
    const hasLog = cycle.cycleLogs.some((l) => l.date === date);
    if (hasPhase || hasLog) {
      setSelectedDate(date);
    } else {
      openLog(date);
    }
  };

  const handleSave = (log: Omit<CycleLog, 'id'>) => {
    const existing = cycle.cycleLogs.find((l) => l.date === log.date);
    if (existing) {
      cycle.updateCycleLog(existing.id, log);
    } else {
      cycle.addCycleLog(log);
    }
    if (log.flow && (!cycle.cycleSettings.lastPeriodStart || log.date <= cycle.cycleSettings.lastPeriodStart)) {
      cycle.updateCycleSettings({ lastPeriodStart: log.date });
    }
  };

  const handleDeleteFromSheet = () => {
    const existing = cycle.cycleLogs.find((l) => l.date === sheetDate);
    if (existing) cycle.deleteCycleLog(existing.id);
    setSheetVisible(false);
  };

  const sheetExisting = cycle.cycleLogs.find((l) => l.date === sheetDate) ?? null;
  const phaseColor = cycle.phaseMeta?.color ?? '#F87171';

  const insights = [
    cycle.nextPeriodDate && {
      icon: 'calendar' as const,
      label: 'Next Period',
      value: cycle.daysUntilPeriod === 0 ? 'Today'
        : cycle.daysUntilPeriod != null && cycle.daysUntilPeriod > 0
          ? `in ${cycle.daysUntilPeriod}d`
          : `${Math.abs(cycle.daysUntilPeriod ?? 0)}d overdue`,
      color: '#F87171',
    },
    cycle.ovulationDate && {
      icon: 'star' as const,
      label: 'Ovulation',
      value: (() => {
        const d = daysUntil(cycle.ovulationDate!, getTodayStr());
        if (d === 0) return 'Today!';
        if (d > 0) return `in ${d}d`;
        return `${Math.abs(d)}d ago`;
      })(),
      color: '#A78BFA',
    },
    cycle.inFertileWindow && {
      icon: 'sparkles' as const,
      label: 'Fertile',
      value: 'Active Now',
      color: '#A78BFA',
    },
  ].filter(Boolean) as Array<{ icon: any; label: string; value: string; color: string }>;

  const recentLogs = cycle.cycleLogs.slice(0, 7);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      >
        <ScreenHeader
          title="Cycle"
          subtitle="TRACKING"
          icon={{ lib: 'Ionicons', name: 'flower' }}
          accentColor="#F87171"
          showBack={showBack}
          onBack={showBack ? () => router.back() : undefined}
        />

        {/* Phase Hero */}
        <Animated.View entering={FadeInDown.delay(60).springify().damping(18)}>
          <LinearGradient
            colors={[phaseColor + '22', colors.card + 'E8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
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

        {/* Period late alert — shown when period is overdue */}
        {cycle.daysUntilPeriod !== null && cycle.daysUntilPeriod < 0 && (
          <PeriodLateCard
            daysLate={Math.abs(cycle.daysUntilPeriod)}
            onMarkStarted={() => { triggerHaptic('medium'); cycle.markPeriodStart(); }}
            onLogSymptoms={() => openLog()}
            colors={colors}
          />
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
        <Animated.View
          entering={FadeInDown.delay(200).springify().damping(18)}
          onLayout={(e) => setCalendarY(e.nativeEvent.layout.y)}
        >
          <GlassCard>
            <SectionHeader title="Cycle Calendar" accentColor="#F87171" />

            {/* Period-start selection mode banner + tutorial hand */}
            {periodStartMode && (
              <>
                <Animated.View
                  entering={FadeIn.duration(180)}
                  style={[styles.periodBanner, { backgroundColor: '#F87171' + '12', borderColor: '#F87171' + '35' }]}
                >
                  <Ionicons name="flag" size={14} color="#F87171" />
                  <Text style={[styles.periodBannerTxt, { color: '#F87171' }]}>
                    Tap any date to set as period start
                  </Text>
                  <TouchableOpacity onPress={() => setPeriodStartMode(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={17} color={colors.muted} />
                  </TouchableOpacity>
                </Animated.View>
                <HandPointer colors={colors} />
              </>
            )}

            <CycleCalendar
              cycleLogs={cycle.cycleLogs}
              cycleSettings={cycle.cycleSettings}
              fertileStart={cycle.fertileStart}
              fertileEnd={cycle.fertileEnd}
              ovulationDate={cycle.ovulationDate}
              onDayPress={onCalendarDayPress}
            />
          </GlassCard>
        </Animated.View>

        {/* Inline date detail panel — shown when a colored date is tapped */}
        {selectedDate && (
          <DateDetailPanel
            date={selectedDate}
            cycle={cycle}
            onEditLog={() => openLog(selectedDate)}
            onSetPeriodStart={() => {
              cycle.markPeriodStart(selectedDate);
              setSelectedDate(null);
            }}
            onClose={() => setSelectedDate(null)}
            colors={colors}
          />
        )}

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
                    <Text style={[styles.todayBadgeText, { color: '#F87171' }]}>{FLOW_META[cycle.todayLog.flow].label}</Text>
                  </View>
                )}
                {cycle.todayLog.mood && (
                  <View style={[styles.todayBadge, { backgroundColor: MOOD_META[cycle.todayLog.mood].color + '18', borderColor: MOOD_META[cycle.todayLog.mood].color + '40' }]}>
                    <Text style={{ fontSize: 12 }}>{MOOD_META[cycle.todayLog.mood].emoji}</Text>
                    <Text style={[styles.todayBadgeText, { color: MOOD_META[cycle.todayLog.mood].color }]}>{MOOD_META[cycle.todayLog.mood].label}</Text>
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

            {/* Enable / Disable toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="flower" size={18} color="#F87171" />
                <View>
                  <Text style={styles.settingLabel}>Show in Tab Bar</Text>
                  <Text style={styles.settingSub}>Quick access from the main navigation</Text>
                </View>
              </View>
              <Switch
                value={cycle.cycleSettings.cycleTrackingEnabled}
                onValueChange={(v) => {
                  triggerHaptic('selection');
                  cycle.updateCycleSettings({ cycleTrackingEnabled: v });
                }}
                trackColor={{ false: colors.cardBorder, true: '#F87171' + '70' }}
                thumbColor={cycle.cycleSettings.cycleTrackingEnabled ? '#F87171' : colors.muted}
              />
            </View>

            <View style={[styles.settingRow, styles.settingBorder]}>
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

            <View style={[styles.settingRow, styles.settingBorder]}>
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

            {/* Period Start anchor — change or reset */}
            <View style={[styles.settingRow, styles.settingBorder]}>
              <View style={styles.settingInfo}>
                <Ionicons name="flag" size={18} color="#F87171" />
                <View>
                  <Text style={styles.settingLabel}>Period Start</Text>
                  <Text style={styles.settingSub}>
                    {cycle.cycleSettings.lastPeriodStart
                      ? new Date(cycle.cycleSettings.lastPeriodStart + 'T00:00:00')
                          .toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Not set — tap calendar or "Start Period"'}
                  </Text>
                </View>
              </View>
              <View style={styles.periodActions}>
                <TouchableOpacity
                  onPress={() => {
                    triggerHaptic('selection');
                    setPeriodStartMode(true);
                    setTimeout(() => scrollRef.current?.scrollTo({ y: calendarY - 60, animated: true }), 80);
                  }}
                  style={[styles.periodBtn, { backgroundColor: '#F87171' + '15', borderColor: '#F87171' + '40' }]}
                >
                  <Ionicons name="calendar-outline" size={13} color="#F87171" />
                  <Text style={[styles.periodBtnTxt, { color: '#F87171' }]}>Change</Text>
                </TouchableOpacity>
                {cycle.cycleSettings.lastPeriodStart && (
                  <TouchableOpacity
                    onPress={() => { triggerHaptic('medium'); cycle.updateCycleSettings({ lastPeriodStart: null }); }}
                    style={[styles.periodBtn, { backgroundColor: colors.bg, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="trash-outline" size={13} color={colors.muted} />
                    <Text style={[styles.periodBtnTxt, { color: colors.muted }]}>Reset</Text>
                  </TouchableOpacity>
                )}
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
                      onPress={() => onCalendarDayPress(log.date)}
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
                      <View style={styles.logActions}>
                        <TouchableOpacity
                          onPress={() => openLog(log.date)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="pencil" size={15} color={colors.muted} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => { triggerHaptic('medium'); cycle.deleteCycleLog(log.id); }}
                          hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="trash-outline" size={15} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
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
                  Tap "Start Period" to mark today as day 1, or tap "Log Today" to add symptoms and mood.
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
        onDelete={sheetExisting ? handleDeleteFromSheet : undefined}
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
  ctaBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5 },
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
  settingBorder: { borderTopWidth: 1, borderTopColor: colors.cardBorder, marginTop: 8, paddingTop: 12 },
  settingInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  settingLabel: { ...Typography.captionBold, color: colors.text.primary },
  settingSub: { ...Typography.micro, color: colors.muted, marginTop: 1 },
  nudgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nudge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  nudgeVal: { ...Typography.bodyBold, width: 34, textAlign: 'center' },

  logRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  logDot: { width: 10, height: 10, borderRadius: 5 },
  logDate: { ...Typography.captionBold, color: colors.text.primary },
  logMeta: { flexDirection: 'row', gap: 8, marginTop: 2 },
  logMetaText: { ...Typography.micro, color: colors.muted },

  emptyState: { alignItems: 'center', gap: 10, paddingVertical: 16 },
  emptyTitle: { ...Typography.h4, color: colors.text.primary },
  emptySub: { ...Typography.caption, color: colors.text.secondary, textAlign: 'center', lineHeight: 20 },

  periodBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: Radius.md, borderWidth: 1, marginBottom: 10,
  },
  periodBannerTxt: { ...Typography.captionBold, flex: 1 },
  periodActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  periodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 10,
    borderRadius: Radius.pill, borderWidth: 1,
  },
  periodBtnTxt: { ...Typography.micro, fontWeight: '700' as const },
});
