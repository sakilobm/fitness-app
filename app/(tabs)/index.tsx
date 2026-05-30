import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/ui/DonutChart';
import MacroBar from '@/components/ui/MacroBar';
import SectionHeader from '@/components/ui/SectionHeader';
import { Colors, Typography, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const { width: W } = Dimensions.get('window');

const macros = [
  { label: 'Calories', current: 1420, goal: 2000, color: Colors.chart.calories, unit: 'kcal' },
  { label: 'Protein', current: 87, goal: 150, color: Colors.chart.protein, unit: 'g' },
  { label: 'Carbs', current: 165, goal: 250, color: Colors.chart.carbs, unit: 'g' },
  { label: 'Fibre', current: 18, goal: 30, color: Colors.chart.fibre, unit: 'g' },
];

const pct = Math.round((macros[0].current / macros[0].goal) * 100);

const quickLogs: {
  iconLib: 'Ionicons' | 'MCI';
  iconName: string;
  iconColor: string;
  label: string;
  value: string;
  route: string;
}[] = [
  { iconLib: 'Ionicons', iconName: 'water', iconColor: Colors.chart.water, label: 'Water', value: '1.2L', route: '/water' },
  { iconLib: 'MCI', iconName: 'food-apple', iconColor: Colors.lime, label: 'Food', value: '1420 kcal', route: '/(tabs)/nutrition' },
  { iconLib: 'MCI', iconName: 'scale-bathroom', iconColor: Colors.amber, label: 'Weight', value: '78.4 kg', route: '/(tabs)/weight' },
  { iconLib: 'Ionicons', iconName: 'footsteps', iconColor: Colors.lime, label: 'Steps', value: '6,240', route: '/steps' },
];

const timeline: {
  time: string;
  label: string;
  kcal: number;
  iconLib: 'Ionicons' | 'MCI';
  iconName: string;
  color: string;
}[] = [
  { time: '07:30', label: 'Breakfast', kcal: 480, iconLib: 'MCI', iconName: 'egg-fried', color: Colors.amber },
  { time: '09:15', label: 'Morning Walk', kcal: -210, iconLib: 'MCI', iconName: 'walk', color: Colors.lime },
  { time: '12:00', label: 'Lunch', kcal: 620, iconLib: 'MCI', iconName: 'food-apple', color: Colors.amber },
  { time: '15:30', label: 'Snack', kcal: 150, iconLib: 'Ionicons', iconName: 'nutrition', color: Colors.amber },
  { time: '18:00', label: 'Strength', kcal: -380, iconLib: 'MCI', iconName: 'dumbbell', color: Colors.lime },
];

function AppIcon({
  lib, name, size, color,
}: { lib: 'Ionicons' | 'MCI'; name: string; size: number; color: string }) {
  if (lib === 'MCI') {
    return <MaterialCommunityIcons name={name as MCIName} size={size} color={color} />;
  }
  return <Ionicons name={name as IoniconName} size={size} color={color} />;
}

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
        <View style={styles.heroGradientBg} />
        <View style={styles.heroGradientTop} />
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
      <TouchableOpacity
        style={styles.waterChip}
        onPress={() => router.push('/water')}
        activeOpacity={0.8}
      >
        <Ionicons name="water" size={20} color={Colors.chart.water} />
        <Text style={styles.waterChipText}>Next water reminder at 4:00 PM — tap to log now</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.chart.water} />
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    backgroundColor: Colors.lime + '22',
    borderWidth: 2, borderColor: Colors.lime,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...Typography.captionBold, color: Colors.lime },

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
  heroMetaVal: { ...Typography.caption, color: Colors.muted },
  heroBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 10,
  },
  heroBtnText: { ...Typography.bodyBold, color: Colors.bg },

  quickLogRow: { flexDirection: 'row', gap: 8 },
  quickLogPill: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 10,
    alignItems: 'center',
    gap: 6,
  },
  quickLogIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  quickLogLabel: { ...Typography.micro, color: Colors.muted },
  quickLogValue: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },

  timelineScroll: { marginHorizontal: -16, paddingLeft: 16 },
  timelineCard: {
    width: 110, marginRight: 10,
    alignItems: 'center', gap: 4,
  },
  timelineTime: { ...Typography.micro, color: Colors.muted },
  timelineIconWrap: {
    width: 40, height: 40, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    marginVertical: 4,
  },
  timelineLabel: { ...Typography.captionBold, color: Colors.text.primary, textAlign: 'center' },
  timelineKcal: { ...Typography.captionBold },

  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.chart.water + '15',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '44',
    padding: 14,
  },
  waterChipText: { ...Typography.caption, color: Colors.text.primary, flex: 1 },
});
