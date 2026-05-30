import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/ui/DonutChart';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, Typography, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const dayOfMonth = new Date().getDate();

// ── Data ─────────────────────────────────────────────────────────────────────

const macros = [
  { label: 'Calories', current: 1420, goal: 2000, color: Colors.chart.calories, unit: 'kcal' },
  { label: 'Protein',  current: 87,   goal: 150,  color: Colors.chart.protein,  unit: 'g'    },
  { label: 'Carbs',    current: 165,  goal: 250,  color: Colors.chart.carbs,    unit: 'g'    },
  { label: 'Fibre',    current: 18,   goal: 30,   color: Colors.chart.fibre,    unit: 'g'    },
];

const caloriePct = Math.round((macros[0].current / macros[0].goal) * 100);

const quickLogs: {
  iconLib: 'Ionicons' | 'MCI'; iconName: string; iconColor: string;
  label: string; value: string; route: string;
}[] = [
  { iconLib: 'Ionicons', iconName: 'water',         iconColor: Colors.chart.water, label: 'Water',  value: '1.2L',     route: '/water'            },
  { iconLib: 'MCI',      iconName: 'food-apple',     iconColor: Colors.lime,        label: 'Food',   value: '1420 kcal', route: '/(tabs)/nutrition' },
  { iconLib: 'MCI',      iconName: 'scale-bathroom', iconColor: Colors.amber,       label: 'Weight', value: '78.4 kg',  route: '/(tabs)/weight'    },
  { iconLib: 'Ionicons', iconName: 'footsteps',       iconColor: Colors.lime,        label: 'Steps',  value: '6,240',    route: '/steps'            },
];

const timeline: {
  time: string; label: string; kcal: number;
  iconLib: 'Ionicons' | 'MCI'; iconName: string; color: string;
}[] = [
  { time: '07:30', label: 'Breakfast',    kcal:  480, iconLib: 'MCI',      iconName: 'egg-fried',  color: Colors.amber },
  { time: '09:15', label: 'Morning Walk', kcal: -210, iconLib: 'MCI',      iconName: 'walk',       color: Colors.lime  },
  { time: '12:00', label: 'Lunch',        kcal:  620, iconLib: 'MCI',      iconName: 'food-apple', color: Colors.amber },
  { time: '15:30', label: 'Snack',        kcal:  150, iconLib: 'Ionicons', iconName: 'nutrition',  color: Colors.amber },
  { time: '18:00', label: 'Strength',     kcal: -380, iconLib: 'MCI',      iconName: 'dumbbell',   color: Colors.lime  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

function AppIcon({ lib, name, size, color }: { lib: 'Ionicons' | 'MCI'; name: string; size: number; color: string }) {
  if (lib === 'MCI') return <MaterialCommunityIcons name={name as MCIName} size={size} color={color} />;
  return <Ionicons name={name as IoniconName} size={size} color={color} />;
}

// ── Nutrition Card (exact reference layout) ───────────────────────────────────

function NutritionCard() {
  const [period, setPeriod] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [showPeriod, setShowPeriod] = useState(false);

  return (
    <View style={card.shell}>

      {/* ── Row 1: Title  +  Period dropdown ── */}
      <View style={card.row1}>
        <Text style={card.title}>Nutrition</Text>
        <TouchableOpacity
          style={card.periodBtn}
          onPress={() => setShowPeriod((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={card.periodTxt}>{period}</Text>
          <Ionicons name="chevron-down" size={13} color={Colors.lime} />
        </TouchableOpacity>
      </View>

      {/* ── Row 2: Kcal display ── */}
      <View style={card.row2}>
        <View style={card.kcalIconBox}>
          <MaterialCommunityIcons name="run" size={18} color={Colors.lime} />
        </View>
        <Text style={card.kcalBig}>
          <Text style={{ color: Colors.text.primary }}>
            {macros[0].current.toLocaleString()}
          </Text>
          <Text style={card.kcalSep}>/{macros[0].goal.toLocaleString()} kcal</Text>
        </Text>
      </View>

      {/* ── Row 3: Donut  +  Macro list ── */}
      <View style={card.row3}>

        {/* Donut with centre info */}
        <DonutChart
          size={148}
          strokeWidth={15}
          gapSize={6}
          rounded
          trackColor="rgba(0,0,0,0.08)"
          segments={macros.map((m) => ({ value: m.current, color: m.color }))}
        >
          <Text style={card.donutDay}>Day {dayOfMonth}</Text>
          <Text style={card.donutPct}>{caloriePct}%</Text>
          <View style={card.donutTrend}>
            <Ionicons name="trending-up" size={9} color={Colors.lime} />
            <Text style={card.donutTrendTxt}> +8%</Text>
          </View>
        </DonutChart>

        {/* Macro list — left border style matching reference */}
        <View style={card.macroList}>
          {macros.map((m, i) => {
            const unitLabel = m.unit === 'kcal' ? ' kcal' : 'g';
            const isLast = i === macros.length - 1;
            return (
              <View key={m.label} style={[card.macroRow, !isLast && card.macroRowBorder]}>
                {/* Coloured left border bar */}
                <View style={[card.macroBorderBar, { backgroundColor: m.color }]} />
                <View style={card.macroTexts}>
                  <Text style={card.macroLabel}>{m.label}</Text>
                  <Text style={card.macroVal} numberOfLines={1}>
                    <Text style={[card.macroCurrent, { color: m.color }]}>
                      {m.current}
                    </Text>
                    <Text style={card.macroGoal}>/{m.goal}{unitLabel}</Text>
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Row 4: Ask advice  +  Action button ── */}
      <View style={card.row4}>
        <TouchableOpacity style={card.adviceBtn} activeOpacity={0.8}>
          <Ionicons name="sparkles" size={14} color={Colors.lime} />
          <Text style={card.adviceTxt}>Ask advice</Text>
        </TouchableOpacity>
        <TouchableOpacity style={card.actionBtn} activeOpacity={0.8} onPress={() => router.push('/(tabs)/nutrition')}>
          <Ionicons name="arrow-forward" size={18} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.name}>Alex Rivera</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={15} color={Colors.amber} />
            <Text style={styles.streakCount}>14</Text>
          </View>
          <View style={styles.xpBadge}>
            <Ionicons name="flash" size={11} color={Colors.lime} />
            <Text style={styles.xpText}>LVL 8</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
          </View>
        </View>
      </View>

      {/* ── Nutrition Card (exact reference layout) ── */}
      <NutritionCard />

      {/* Today's Focus Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroBg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>TODAY'S FOCUS</Text>
          </View>
          <Text style={styles.heroTitle}>Upper Body Strength</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="timer-outline" size={14} color={Colors.muted} />
              <Text style={styles.heroMetaVal}>45 min</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="flame" size={14} color={Colors.amber} />
              <Text style={styles.heroMetaVal}>380 kcal</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={Colors.muted} />
              <Text style={styles.heroMetaVal}>Strength</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.8}>
            <Ionicons name="play" size={14} color={Colors.bg} />
            <Text style={styles.heroBtnText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Log */}
      <SectionHeader title="Quick Log" action="See All" />
      <View style={styles.quickLogRow}>
        {quickLogs.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.quickLogPill}
            activeOpacity={0.75}
            onPress={() => router.push(item.route as any)}
          >
            <View style={[styles.quickLogIconWrap, { borderColor: item.iconColor + '44', backgroundColor: item.iconColor + '15' }]}>
              <AppIcon lib={item.iconLib} name={item.iconName} size={20} color={item.iconColor} />
            </View>
            <Text style={styles.quickLogLabel}>{item.label}</Text>
            <Text style={styles.quickLogValue}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timeline */}
      <SectionHeader title="Today's Activity" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll}>
        {timeline.map((item, i) => (
          <GlassCard key={i} style={styles.timelineCard}>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <View style={[styles.timelineIconWrap, { backgroundColor: item.color + '18' }]}>
              <AppIcon lib={item.iconLib} name={item.iconName} size={22} color={item.color} />
            </View>
            <Text style={styles.timelineLabel}>{item.label}</Text>
            <Text style={[styles.timelineKcal, { color: item.color }]}>
              {item.kcal > 0 ? `+${item.kcal}` : item.kcal} kcal
            </Text>
          </GlassCard>
        ))}
      </ScrollView>

      {/* Water reminder */}
      <TouchableOpacity style={styles.waterChip} onPress={() => router.push('/water')} activeOpacity={0.8}>
        <Ionicons name="water" size={20} color={Colors.chart.water} />
        <Text style={styles.waterChipText}>Next water reminder at 4:00 PM — tap to log now</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.chart.water} />
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── Nutrition Card styles ─────────────────────────────────────────────────────

const CARD_RADIUS = 22;
const CARD_BG = Colors.card;

const card = StyleSheet.create({
  shell: {
    backgroundColor: CARD_BG,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 6,
  },

  // ── Row 1: title + period ──
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  periodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lime + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.lime + '33',
  },
  periodTxt: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.lime,
  },

  // ── Row 2: kcal display ──
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  kcalIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.lime + '18',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.lime + '30',
  },
  kcalBig: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  kcalSep: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.muted,
  },

  // ── Row 3: donut + macro list ──
  row3: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 16,
  },

  // Donut centre labels
  donutDay: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  donutPct: {
    fontSize: 30,
    fontWeight: '800',
    color: Colors.text.primary,
    lineHeight: 34,
    letterSpacing: -1,
  },
  donutTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: Colors.lime + '1A',
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  donutTrendTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.lime,
  },

  // Macro list (right column)
  macroList: {
    flex: 1,
  },
  macroRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingVertical: 10,
    gap: 0,
  },
  macroRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  macroBorderBar: {
    width: 3,
    borderRadius: 3,
    marginRight: 12,
    alignSelf: 'stretch',
    minHeight: 36,
  },
  macroTexts: {
    flex: 1,
    justifyContent: 'center',
    gap: 3,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.muted,
    letterSpacing: 0.3,
  },
  macroVal: {
    fontSize: 14,
  },
  macroCurrent: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  macroGoal: {
    fontSize: 12,
    color: Colors.muted,
    fontWeight: '500',
  },

  // ── Row 4: ask advice + action ──
  row4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 18,
    paddingTop: 4,
  },
  adviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.lime + '14',
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.lime + '2A',
  },
  adviceTxt: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.lime,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.text.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ── Screen styles ─────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 20 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...Typography.caption, color: Colors.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  name: { ...Typography.h2, color: Colors.text.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.amberOverlay, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.amber + '44',
  },
  streakCount: { ...Typography.bodyBold, color: Colors.amber },
  xpBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.overlay, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: Colors.lime + '44',
  },
  xpText: { ...Typography.captionBold, color: Colors.lime },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lime + '22', borderWidth: 2, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.captionBold, color: Colors.lime },

  heroCard: {
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.lime + '33', minHeight: 160,
  },
  heroBg: { ...StyleSheet.absoluteFill, backgroundColor: '#E8F5EE' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: Colors.lime + '0C' },
  heroContent: { padding: 20 },
  heroBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.lime + '22',
    borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '44', marginBottom: 10,
  },
  heroBadgeText: { ...Typography.micro, color: Colors.lime },
  heroTitle: { ...Typography.h2, color: Colors.text.primary, marginBottom: 12 },
  heroMeta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroMetaVal: { ...Typography.caption, color: Colors.muted },
  heroBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.lime, borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  heroBtnText: { ...Typography.bodyBold, color: Colors.bg },

  quickLogRow: { flexDirection: 'row', gap: 8 },
  quickLogPill: {
    flex: 1, backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 10, alignItems: 'center', gap: 6,
  },
  quickLogIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  quickLogLabel: { ...Typography.micro, color: Colors.muted },
  quickLogValue: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },

  timelineScroll: { marginHorizontal: -16, paddingLeft: 16 },
  timelineCard: { width: 110, marginRight: 10, alignItems: 'center', gap: 4 },
  timelineTime: { ...Typography.micro, color: Colors.muted },
  timelineIconWrap: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginVertical: 4,
  },
  timelineLabel: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },
  timelineKcal: { ...Typography.captionBold },

  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.chart.water + '15', borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '44', padding: 14,
  },
  waterChipText: { ...Typography.caption, color: Colors.text.primary, flex: 1 },
});
