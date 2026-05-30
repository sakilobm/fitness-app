import React, { useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, ImageBackground, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import GlassCard from '../../components/ui/GlassCard';
import DonutChart from '../../components/ui/DonutChart';
import MacroBar from '../../components/ui/MacroBar';
import SectionHeader from '../../components/ui/SectionHeader';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';

const { width: W } = Dimensions.get('window');

const macros = [
  { label: 'Calories', current: 1420, goal: 2000, color: Colors.chart.calories, unit: 'kcal' },
  { label: 'Protein', current: 87, goal: 150, color: Colors.chart.protein, unit: 'g' },
  { label: 'Carbs', current: 165, goal: 250, color: Colors.chart.carbs, unit: 'g' },
  { label: 'Fibre', current: 18, goal: 30, color: Colors.chart.fibre, unit: 'g' },
];

const quickLogs = [
  { icon: '💧', label: 'Water', value: '1.2L', route: '/water' },
  { icon: '🥗', label: 'Food', value: '1420 kcal', route: '/(tabs)/nutrition' },
  { icon: '⚖️', label: 'Weight', value: '78.4 kg', route: '/(tabs)/weight' },
  { icon: '👟', label: 'Steps', value: '6,240', route: '/steps' },
];

const timeline = [
  { time: '07:30', label: 'Breakfast', kcal: 480, icon: '🍳', color: Colors.amber },
  { time: '09:15', label: 'Morning Walk', kcal: -210, icon: '🚶', color: Colors.lime },
  { time: '12:00', label: 'Lunch', kcal: 620, icon: '🥗', color: Colors.amber },
  { time: '15:30', label: 'Snack', kcal: 150, icon: '🍎', color: Colors.amber },
  { time: '18:00', label: 'Strength Train', kcal: -380, icon: '🏋️', color: Colors.lime },
];

const pct = Math.round((macros[0].current / macros[0].goal) * 100);

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
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>Alex Rivera</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFlame}>🔥</Text>
            <Text style={styles.streakCount}>14</Text>
          </View>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>LVL 8</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AR</Text>
          </View>
        </View>
      </View>

      {/* Macro Ring Card */}
      <GlassCard style={styles.macroCard} accentColor={Colors.lime} noPadding>
        <View style={styles.macroInner}>
          <View style={styles.ringWrap}>
            <DonutChart
              size={160}
              strokeWidth={14}
              segments={macros.map((m) => ({ value: m.current, color: m.color }))}
            >
              <Text style={styles.ringPct}>{pct}%</Text>
              <Text style={styles.ringLabel}>Daily Goal</Text>
            </DonutChart>
          </View>
          <View style={styles.macroLegend}>
            {macros.map((m) => (
              <View key={m.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                <Text style={styles.legendLabel}>{m.label}</Text>
                <Text style={[styles.legendValue, { color: m.color }]}>{m.current}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.macroBars}>
          {macros.map((m) => (
            <MacroBar
              key={m.label}
              label={m.label}
              current={m.current}
              goal={m.goal}
              color={m.color}
              unit={m.unit === 'kcal' ? ' kcal' : 'g'}
            />
          ))}
        </View>
      </GlassCard>

      {/* Today's Focus Hero */}
      <View style={styles.heroCard}>
        <View style={styles.heroGradientBg}>
          <View style={styles.heroGradientTop} />
        </View>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>TODAY'S FOCUS</Text>
          </View>
          <Text style={styles.heroTitle}>Upper Body Strength</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaIcon}>⏱</Text>
              <Text style={styles.heroMetaVal}>45 min</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaIcon}>🔥</Text>
              <Text style={styles.heroMetaVal}>380 kcal</Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Text style={styles.heroMetaIcon}>💪</Text>
              <Text style={styles.heroMetaVal}>Strength</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.8}>
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
            <Text style={styles.quickLogIcon}>{item.icon}</Text>
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
            <Text style={styles.timelineIcon}>{item.icon}</Text>
            <Text style={styles.timelineLabel}>{item.label}</Text>
            <Text style={[styles.timelineKcal, { color: item.color }]}>
              {item.kcal > 0 ? `+${item.kcal}` : item.kcal} kcal
            </Text>
          </GlassCard>
        ))}
      </ScrollView>

      {/* Water reminder */}
      <TouchableOpacity
        style={styles.waterChip}
        onPress={() => router.push('/water')}
        activeOpacity={0.8}
      >
        <Text style={styles.waterChipIcon}>💧</Text>
        <Text style={styles.waterChipText}>Next water reminder at 4:00 PM — tap to log now</Text>
        <Text style={styles.waterChipArrow}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { ...Typography.caption, color: Colors.muted, marginBottom: 2, textTransform: 'uppercase', letterSpacing: 1 },
  name: { ...Typography.h2, color: Colors.text.primary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.amberOverlay, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.amber + '44',
  },
  streakFlame: { fontSize: 16 },
  streakCount: { ...Typography.bodyBold, color: Colors.amber },
  xpBadge: {
    backgroundColor: Colors.overlay, borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.lime + '44',
  },
  xpText: { ...Typography.captionBold, color: Colors.lime },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.lime + '22',
    borderWidth: 2, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.captionBold, color: Colors.lime },

  // Macro Card
  macroCard: { padding: 0 },
  macroInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  ringWrap: { flex: 0 },
  ringPct: { ...Typography.h2, color: Colors.text.primary },
  ringLabel: { ...Typography.micro, color: Colors.muted },
  macroLegend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...Typography.caption, color: Colors.muted, flex: 1 },
  legendValue: { ...Typography.captionBold },
  macroBars: { paddingHorizontal: 16, paddingBottom: 16 },

  // Hero Card
  heroCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.lime + '33',
    minHeight: 160,
  },
  heroGradientBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1A3520',
  },
  heroGradientTop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.lime + '08',
  },
  heroContent: { padding: 20 },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lime + '22',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.lime + '44',
    marginBottom: 10,
  },
  heroBadgeText: { ...Typography.micro, color: Colors.lime },
  heroTitle: { ...Typography.h2, color: Colors.text.primary, marginBottom: 12 },
  heroMeta: { flexDirection: 'row', gap: 20, marginBottom: 16 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroMetaIcon: { fontSize: 14 },
  heroMetaVal: { ...Typography.caption, color: Colors.muted },
  heroBtn: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  heroBtnText: { ...Typography.bodyBold, color: Colors.bg },

  // Quick Log
  quickLogRow: { flexDirection: 'row', gap: 8 },
  quickLogPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 10,
    alignItems: 'center',
    gap: 4,
  },
  quickLogIcon: { fontSize: 20 },
  quickLogLabel: { ...Typography.micro, color: Colors.muted },
  quickLogValue: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },

  // Timeline
  timelineScroll: { marginHorizontal: -16, paddingLeft: 16 },
  timelineCard: {
    width: 110,
    marginRight: 10,
    alignItems: 'center',
    gap: 4,
  },
  timelineTime: { ...Typography.micro, color: Colors.muted },
  timelineIcon: { fontSize: 24, marginVertical: 4 },
  timelineLabel: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },
  timelineKcal: { ...Typography.captionBold },

  // Water chip
  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.chart.water + '15',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '44',
    padding: 14,
  },
  waterChipIcon: { fontSize: 20 },
  waterChipText: { ...Typography.caption, color: Colors.text.primary, flex: 1 },
  waterChipArrow: { ...Typography.h3, color: Colors.chart.water },
});
