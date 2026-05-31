import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/ui/DonutChart';
import { Colors, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

// ─── Date / greeting ─────────────────────────────────────────────────────────

const _now = new Date();
const _h = _now.getHours();
const greetingStr = _h < 12 ? 'Good morning' : _h < 17 ? 'Good afternoon' : 'Good evening';
const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const dateStr = `${DAY_NAMES[_now.getDay()]}, ${_now.getDate()} ${MONTH_NAMES[_now.getMonth()]}`;

// ─── Static data ──────────────────────────────────────────────────────────────

const DONUT_KCAL  = { current: 1320, goal: 2300 };
const DONUT_DAY   = 8;
const DONUT_PCT   = 64;
const DONUT_TREND = '+3%';
const DONUT_SEGS  = [
  { label: 'Carbs',    current: 112, goal: 240, color: '#FB923C' },
  { label: 'Proteins', current: 48,  goal: 140, color: '#A78BFA' },
  { label: 'Fats',     current: 32,  goal: 110, color: '#0D9488' },
];

const ACTIVITY_METRICS: {
  lib: 'Ionicons' | 'MCI'; icon: string; color: string;
  value: string; unit: string; label: string; route: string;
}[] = [
  { lib: 'Ionicons', icon: 'flame',        color: Colors.amber,       value: '1,420', unit: 'kcal',  label: 'Calories', route: '/(tabs)/nutrition' },
  { lib: 'Ionicons', icon: 'footsteps',    color: Colors.lime,        value: '6,240', unit: 'steps', label: 'Steps',    route: '/steps'            },
  { lib: 'Ionicons', icon: 'timer-outline',color: '#6366F1',          value: '48',    unit: 'min',   label: 'Active',   route: '/steps'            },
];

const QUICK_LOGS: {
  lib: 'Ionicons' | 'MCI'; icon: string; color: string;
  label: string; value: string; route: string;
}[] = [
  { lib: 'Ionicons', icon: 'water',         color: Colors.chart.water, label: 'Water',  value: '1.2 L',    route: '/water'            },
  { lib: 'MCI',      icon: 'food-apple',    color: Colors.lime,        label: 'Food',   value: '1,320 kcal',route: '/(tabs)/nutrition' },
  { lib: 'MCI',      icon: 'scale-bathroom',color: Colors.amber,       label: 'Weight', value: '78.4 kg',  route: '/(tabs)/weight'    },
  { lib: 'Ionicons', icon: 'footsteps',     color: '#6366F1',          label: 'Steps',  value: '6,240',    route: '/steps'            },
];

const TIMELINE: {
  time: string; label: string; kcal: number;
  lib: 'Ionicons' | 'MCI'; icon: string; color: string;
}[] = [
  { time: '07:30', label: 'Breakfast',    kcal:  480, lib: 'MCI',      icon: 'egg-fried',  color: Colors.amber },
  { time: '09:15', label: 'Morning Walk', kcal: -210, lib: 'MCI',      icon: 'walk',       color: Colors.lime  },
  { time: '12:00', label: 'Lunch',        kcal:  620, lib: 'MCI',      icon: 'food-apple', color: Colors.amber },
  { time: '15:30', label: 'Snack',        kcal:  150, lib: 'Ionicons', icon: 'nutrition',  color: '#FB923C'    },
  { time: '18:00', label: 'Strength',     kcal: -380, lib: 'MCI',      icon: 'dumbbell',   color: Colors.lime  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function AppIcon({ lib, name, size, color }: { lib: 'Ionicons' | 'MCI'; name: string; size: number; color: string }) {
  if (lib === 'MCI') return <MaterialCommunityIcons name={name as MCIName} size={size} color={color} />;
  return <Ionicons name={name as IoniconName} size={size} color={color} />;
}

// ─── Nutrition Card ───────────────────────────────────────────────────────────

function NutritionCard() {
  const [period, setPeriod] = useState<'Today' | 'Week'>('Today');
  return (
    <View style={card.shell}>
      {/* Title + period */}
      <View style={card.row1}>
        <Text style={card.title}>Nutrition</Text>
        <TouchableOpacity
          style={card.periodBtn}
          onPress={() => setPeriod((p) => (p === 'Today' ? 'Week' : 'Today'))}
          activeOpacity={0.75}
        >
          <Text style={card.periodTxt}>{period}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.lime} />
        </TouchableOpacity>
      </View>
      {/* Kcal */}
      <View style={card.row2}>
        <View style={card.kcalIconBox}>
          <MaterialCommunityIcons name="run" size={18} color={Colors.lime} />
        </View>
        <Text style={card.kcalBig}>
          <Text style={{ color: Colors.text.primary }}>{DONUT_KCAL.current.toLocaleString()}</Text>
          <Text style={card.kcalSep}>/{DONUT_KCAL.goal.toLocaleString()} kcal</Text>
        </Text>
      </View>
      {/* Donut + macros */}
      <View style={card.row3}>
        <DonutChart
          size={172} strokeWidth={20} gapSize={14}
          rounded
          trackColor="rgba(0,0,0,0.07)"
          innerFill="#F0EDE8"
          showInnerDots
          segments={DONUT_SEGS.map((s) => ({ value: s.current, color: s.color }))}
        >
          <View style={card.dayBadge}>
            <Text style={card.dayBadgeTxt}>Day {DONUT_DAY}</Text>
          </View>
          <Text style={card.donutPct}>{DONUT_PCT}%</Text>
          <Text style={card.donutTrend}>{DONUT_TREND}</Text>
        </DonutChart>
        <View style={card.macroList}>
          {DONUT_SEGS.map((m, i) => (
            <View key={m.label} style={[card.macroRow, i < DONUT_SEGS.length - 1 && card.macroRowBorder]}>
              <View style={[card.macroBorderBar, { backgroundColor: m.color }]} />
              <View style={card.macroTexts}>
                <Text style={card.macroLabel}>{m.label}</Text>
                <Text numberOfLines={1}>
                  <Text style={[card.macroCurrent, { color: m.color }]}>{m.current}</Text>
                  <Text style={card.macroGoal}>/{m.goal}g</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
      {/* Ask advice */}
      <View style={card.row4}>
        <TouchableOpacity style={card.adviceBtn} activeOpacity={0.8}>
          <Ionicons name="sparkles" size={14} color={Colors.lime} />
          <Text style={card.adviceTxt}>Ask advice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={card.actionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/nutrition')}>
          <Ionicons name="arrow-forward" size={18} color={Colors.bg} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════ APPLE-STYLE HEADER ════════════════════ */}
      <View style={styles.header}>
        {/* Left: greeting + name + date/chips row */}
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greetingStr},</Text>
          <Text style={styles.name}>Sakil</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{dateStr}</Text>
            <View style={styles.dot} />
            <View style={styles.streakChip}>
              <Ionicons name="flame" size={11} color={Colors.amber} />
              <Text style={styles.streakTxt}>14</Text>
            </View>
            <View style={styles.xpChip}>
              <Ionicons name="flash" size={10} color={Colors.lime} />
              <Text style={styles.xpTxt}>LVL 8</Text>
            </View>
          </View>
        </View>

        {/* Right: avatar */}
        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.85}>
          <Text style={styles.avatarTxt}>AR</Text>
          {/* Online dot */}
          <View style={styles.avatarDot} />
        </TouchableOpacity>
      </View>

      {/* ════════════════════ ACTIVITY STRIP ════════════════════ */}
      <View style={styles.activityStrip}>
        {ACTIVITY_METRICS.map((m, i) => (
          <TouchableOpacity
            key={m.label}
            style={[
              styles.actCell,
              i === 0 && styles.actCellFirst,
              i === ACTIVITY_METRICS.length - 1 && styles.actCellLast,
              i > 0 && styles.actCellBorder,
            ]}
            activeOpacity={0.75}
            onPress={() => router.push(m.route as any)}
          >
            <View style={[styles.actIconBubble, { backgroundColor: m.color + '18' }]}>
              <AppIcon lib={m.lib} name={m.icon} size={17} color={m.color} />
            </View>
            <Text style={[styles.actValue, { color: m.color }]}>{m.value}</Text>
            <Text style={styles.actUnit}>{m.unit}</Text>
            <Text style={styles.actLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════════ NUTRITION CARD ════════════════════ */}
      <NutritionCard />

      {/* ════════════════════ TODAY'S FOCUS HERO ════════════════════ */}
      <TouchableOpacity style={styles.hero} activeOpacity={0.9}>
        <View style={styles.heroBg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBody}>
          {/* Badge */}
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeTxt}>TODAY'S FOCUS</Text>
          </View>
          <Text style={styles.heroTitle}>Upper Body{'\n'}Strength</Text>
          {/* Stats row */}
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Ionicons name="timer-outline" size={14} color={Colors.muted} />
              <Text style={styles.heroStatVal}>45 min</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <Ionicons name="flame" size={14} color={Colors.amber} />
              <Text style={styles.heroStatVal}>380 kcal</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={Colors.muted} />
              <Text style={styles.heroStatVal}>Strength</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
            <Ionicons name="play" size={13} color={Colors.bg} />
            <Text style={styles.heroBtnTxt}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ════════════════════ QUICK LOG ════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
        <TouchableOpacity><Text style={styles.sectionAction}>See All</Text></TouchableOpacity>
      </View>
      <View style={styles.quickLogRow}>
        {QUICK_LOGS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.quickLogCard}
            activeOpacity={0.75}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.quickLogIcon, { backgroundColor: item.color + '18' }]}>
              <AppIcon lib={item.lib} name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={styles.quickLogLabel}>{item.label}</Text>
            <Text style={[styles.quickLogValue, { color: item.color }]}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════════ ACTIVITY TIMELINE ════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
        {TIMELINE.map((item, i) => (
          <GlassCard key={i} style={styles.timelineCard}>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <View style={[styles.timelineIconWrap, { backgroundColor: item.color + '18' }]}>
              <AppIcon lib={item.lib} name={item.icon} size={22} color={item.color} />
            </View>
            <Text style={styles.timelineLabel}>{item.label}</Text>
            <Text style={[styles.timelineKcal, { color: item.color }]}>
              {item.kcal > 0 ? `+${item.kcal}` : item.kcal} kcal
            </Text>
          </GlassCard>
        ))}
      </ScrollView>

      {/* ════════════════════ WATER REMINDER ════════════════════ */}
      <TouchableOpacity style={styles.waterChip} onPress={() => router.push('/water')} activeOpacity={0.8}>
        <View style={[styles.waterIconBox, { backgroundColor: Colors.chart.water + '18' }]}>
          <Ionicons name="water" size={18} color={Colors.chart.water} />
        </View>
        <View style={styles.waterText}>
          <Text style={styles.waterTitle}>Hydration reminder</Text>
          <Text style={styles.waterSub}>Next at 4:00 PM — tap to log now</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Nutrition Card Styles ────────────────────────────────────────────────────

const card = StyleSheet.create({
  shell: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 5,
  },
  row1: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6,
  },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text.primary, letterSpacing: -0.3 },
  periodBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.lime + '18', borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.lime + '33',
  },
  periodTxt: { fontSize: 12, fontWeight: '700', color: Colors.lime },
  row2: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4,
  },
  kcalIconBox: {
    width: 30, height: 30, borderRadius: 10,
    backgroundColor: Colors.lime + '18',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.lime + '30',
  },
  kcalBig: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  kcalSep: { fontSize: 15, fontWeight: '500', color: Colors.muted },
  row3: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, gap: 12,
  },
  dayBadge: {
    backgroundColor: 'rgba(0,0,0,0.07)', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6,
  },
  dayBadgeTxt: { fontSize: 12, fontWeight: '500', color: Colors.muted },
  donutPct: {
    fontSize: 38, fontWeight: '800', color: Colors.text.primary,
    lineHeight: 42, letterSpacing: -1.5,
  },
  donutTrend: { fontSize: 13, fontWeight: '700', color: Colors.lime, marginTop: 3 },
  macroList: { flex: 1 },
  macroRow: { flexDirection: 'row', alignItems: 'stretch', paddingVertical: 10 },
  macroRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  macroBorderBar: { width: 3, borderRadius: 3, marginRight: 12, alignSelf: 'stretch', minHeight: 36 },
  macroTexts: { flex: 1, justifyContent: 'center', gap: 3 },
  macroLabel: { fontSize: 11, fontWeight: '600', color: Colors.muted, letterSpacing: 0.3 },
  macroCurrent: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  macroGoal: { fontSize: 12, color: Colors.muted, fontWeight: '500' },
  row4: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 18, paddingTop: 4,
  },
  adviceBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.lime + '14', borderRadius: Radius.pill,
    paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.lime + '2A',
  },
  adviceTxt: { fontSize: 13, fontWeight: '700', color: Colors.lime },
  actionBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.text.primary,
    alignItems: 'center', justifyContent: 'center',
  },
});

// ─── Screen Styles ────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, gap: 18 },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 6,
  },
  headerLeft: { flex: 1, gap: 2 },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.muted,
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.8,
    lineHeight: 34,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.muted,
  },
  dot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: Colors.muted,
    opacity: 0.5,
  },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.amberOverlay,
    borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.amber + '33',
  },
  streakTxt: { fontSize: 11, fontWeight: '700', color: Colors.amber },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.overlay,
    borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '33',
  },
  xpTxt: { fontSize: 11, fontWeight: '700', color: Colors.lime },

  // Avatar with online dot
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.lime + '18',
    borderWidth: 2.5, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarTxt: { fontSize: 15, fontWeight: '800', color: Colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: Colors.card,
  },

  // ── Activity Strip ──────────────────────────────────────────────────────────
  activityStrip: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  actCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 3,
  },
  actCellFirst: { borderTopLeftRadius: Radius.lg },
  actCellLast:  { borderTopRightRadius: Radius.lg },
  actCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.cardBorder,
  },
  actIconBubble: {
    width: 38, height: 38, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  actValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.muted,
  },
  actLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // ── Hero card ───────────────────────────────────────────────────────────────
  hero: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lime + '28',
    minHeight: 170,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  heroBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E8F5EE',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.lime + '0A',
  },
  heroBody: { padding: 22 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: Colors.lime + '20',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.lime + '40',
    marginBottom: 12,
  },
  heroBadgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: Colors.lime,
  },
  heroBadgeTxt: { fontSize: 10, fontWeight: '700', color: Colors.lime, letterSpacing: 0.8 },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: Colors.text.primary,
    letterSpacing: -0.6, lineHeight: 30, marginBottom: 14,
  },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 18 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStatVal: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
  heroStatSep: {
    width: 1, height: 16,
    backgroundColor: Colors.cardBorder,
    marginHorizontal: 12,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 12,
    shadowColor: Colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBtnTxt: { fontSize: 14, fontWeight: '700', color: Colors.bg, letterSpacing: 0.1 },

  // ── Section headers ─────────────────────────────────────────────────────────
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.3 },
  sectionAction: { fontSize: 13, fontWeight: '600', color: Colors.lime },

  // ── Quick log ───────────────────────────────────────────────────────────────
  quickLogRow: { flexDirection: 'row', gap: 10 },
  quickLogCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  quickLogIcon: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  quickLogLabel: { fontSize: 10, fontWeight: '600', color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickLogValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // ── Timeline ────────────────────────────────────────────────────────────────
  timelineScroll: { marginHorizontal: -20, paddingLeft: 20 },
  timelineCard: {
    width: 108, marginRight: 10,
    alignItems: 'center', gap: 4,
  },
  timelineTime: { fontSize: 10, fontWeight: '600', color: Colors.muted, letterSpacing: 0.3 },
  timelineIconWrap: {
    width: 42, height: 42, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginVertical: 4,
  },
  timelineLabel: { fontSize: 11, fontWeight: '600', color: Colors.text.primary, textAlign: 'center' },
  timelineKcal: { fontSize: 11, fontWeight: '700' },

  // ── Water chip ──────────────────────────────────────────────────────────────
  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 14,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  waterIconBox: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  waterText: { flex: 1 },
  waterTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary },
  waterSub: { fontSize: 12, fontWeight: '400', color: Colors.muted, marginTop: 1 },
});
