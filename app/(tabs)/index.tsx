import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/ui/DonutChart';
import AppIcon from '@/components/ui/AppIcon';
import { Colors, Radius } from '@/constants/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { MetricCard, WidgetConfig, WidgetType } from '@/features/dashboard/components/WidgetRegistry';
import { getBMIResult } from '@/utils/bmi';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const _now = new Date();
const greetingStr = _now.getHours() < 12 ? 'Good morning' : _now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
const dateStr = `${DAY_NAMES[_now.getDay()]}, ${_now.getDate()} ${MONTH_NAMES[_now.getMonth()]}`;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [isCustomizeVisible, setIsCustomizeVisible] = useState(false);
  
  // Zustand State hooks
  const {
    user,
    meals,
    waterLogs,
    weightLogs,
    stepsCount,
    activeMinutes,
    dashboardGrid,
    setDashboardGrid,
    toggleWidgetVisibility,
  } = useFitnessStore();

  // Dynamic calculations
  const totalKcal = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.kcal, 0), 0);
  const totalProtein = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.protein, 0), 0);
  const totalCarbs = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.carbs, 0), 0);
  const totalFat = meals.reduce((sum, m) => sum + m.items.reduce((s, i) => s + i.fat, 0), 0);
  
  const totalWaterMl = waterLogs.reduce((sum, item) => sum + item.ml, 0);
  
  const currentWeight = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1].weight : 78.4;
  const previousWeight = weightLogs.length > 1 ? weightLogs[weightLogs.length - 2].weight : 78.4;
  const weightTrend = currentWeight < previousWeight ? 'losing' as const : currentWeight > previousWeight ? 'gaining' as const : 'stable' as const;

  const bmiResult = getBMIResult(currentWeight, user.height);
  const activeKcal = Math.round(stepsCount * 0.045 + activeMinutes * 7.5);

  // Define configurations dynamically for Registry matching
  const widgetConfigs: Record<string, WidgetConfig<any>> = {
    steps: {
      id: 'steps',
      type: 'linear_progress',
      title: 'Daily Steps',
      icon: { lib: 'Ionicons', name: 'footsteps' },
      color: Colors.lime,
      data: {
        value: stepsCount,
        target: user.stepsGoal,
        progressColor: Colors.lime,
        unit: 'steps',
      },
      onPress: () => router.push('/steps'),
    },
    water: {
      id: 'water',
      type: 'radial_chart',
      title: 'Hydration',
      icon: { lib: 'Ionicons', name: 'water' },
      color: Colors.chart.water,
      data: {
        value: totalWaterMl,
        target: user.waterGoal,
        segments: [{ value: totalWaterMl, color: Colors.chart.water }],
        centerLabel: `${(totalWaterMl / 1000).toFixed(1)}L`,
        centerSublabel: 'Hydrated',
      },
      onPress: () => router.push('/water'),
    },
    nutrition: {
      id: 'nutrition',
      type: 'radial_chart',
      title: 'Nutrition',
      icon: { lib: 'MCI', name: 'food-apple' },
      color: Colors.amber,
      data: {
        value: totalKcal,
        target: user.calorieGoal,
        segments: [
          { value: totalCarbs, color: '#FB923C' },
          { value: totalProtein, color: '#A78BFA' },
          { value: totalFat, color: '#0D9488' },
        ],
        centerLabel: `${totalKcal} kcal`,
        centerSublabel: 'Consumed',
      },
      onPress: () => router.push('/(tabs)/nutrition'),
    },
    weight: {
      id: 'weight',
      type: 'numeric_delta',
      title: 'Weight Tracker',
      icon: { lib: 'MCI', name: 'scale-bathroom' },
      color: '#6366F1',
      data: {
        currentValue: currentWeight,
        previousValue: previousWeight,
        unit: 'kg',
        trend: weightTrend,
      },
      onPress: () => router.push('/(tabs)/weight'),
    },
    workout_focus: {
      id: 'workout_focus',
      type: 'compact_chip',
      title: 'Today Focus',
      icon: { lib: 'MCI', name: 'dumbbell' },
      color: '#EC4899',
      data: {
        value: 'Upper Body',
        status: '45 min',
        statusColor: '#EC4899',
      },
    },
  };

  const ALL_WIDGETS = [
    { id: 'steps', label: 'Steps Tracker' },
    { id: 'nutrition', label: 'Nutrition & Macros' },
    { id: 'water', label: 'Hydration Tracking' },
    { id: 'weight', label: 'Weight Analysis' },
    { id: 'workout_focus', label: 'Workout Focus' },
  ];

  const moveWidget = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= dashboardGrid.length) return;
    const newGrid = [...dashboardGrid];
    const [movedItem] = newGrid.splice(fromIdx, 1);
    newGrid.splice(toIdx, 0, movedItem);
    setDashboardGrid(newGrid);
  };

  const ACTIVITY_METRICS = [
    { lib: 'Ionicons' as const, icon: 'flame',         color: Colors.amber,       value: activeKcal.toLocaleString(), unit: 'kcal',  label: 'Burned', route: '/steps' },
    { lib: 'Ionicons' as const, icon: 'footsteps',     color: Colors.lime,        value: stepsCount.toLocaleString(), unit: 'steps', label: 'Steps',    route: '/steps'  },
    { lib: 'Ionicons' as const, icon: 'timer-outline', color: '#6366F1',          value: activeMinutes.toString(),    unit: 'min',   label: 'Active',   route: '/steps'  },
  ];

  const QUICK_LOGS = [
    { lib: 'Ionicons' as const, icon: 'water',         color: Colors.chart.water, label: 'Water',  value: `${(totalWaterMl / 1000).toFixed(1)} L`, route: '/water'            },
    { lib: 'MCI' as const,      icon: 'food-apple',    color: Colors.lime,        label: 'Food',   value: `${totalKcal.toLocaleString()} kcal`,     route: '/(tabs)/nutrition' },
    { lib: 'MCI' as const,      icon: 'scale-bathroom',color: Colors.amber,       label: 'Weight', value: `${currentWeight.toFixed(1)} kg`,         route: '/(tabs)/weight'    },
    { lib: 'Ionicons' as const, icon: 'footsteps',     color: '#6366F1',          label: 'Steps',  value: stepsCount.toLocaleString(),               route: '/steps'            },
  ];

  const getTimeline = () => {
    const feed = [];
    const bfMeal = meals.find((m) => m.id === 'breakfast');
    const bfKcal = bfMeal ? bfMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (bfKcal > 0) {
      feed.push({ time: '07:30', label: 'Breakfast', kcal: bfKcal, lib: 'MCI' as const, icon: 'egg-fried', color: Colors.amber });
    }
    if (stepsCount > 3000) {
      feed.push({ time: '09:15', label: 'Morning Walk', kcal: -150, lib: 'MCI' as const, icon: 'walk', color: Colors.lime });
    }
    const lhMeal = meals.find((m) => m.id === 'lunch');
    const lhKcal = lhMeal ? lhMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (lhKcal > 0) {
      feed.push({ time: '12:30', label: 'Lunch', kcal: lhKcal, lib: 'MCI' as const, icon: 'food-apple', color: Colors.amber });
    }
    const snMeal = meals.find((m) => m.id === 'snacks');
    const snKcal = snMeal ? snMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (snKcal > 0) {
      feed.push({ time: '15:30', label: 'Snack', kcal: snKcal, lib: 'Ionicons' as const, icon: 'nutrition', color: '#FB923C' });
    }
    if (waterLogs.length > 0) {
      const latestWater = waterLogs[waterLogs.length - 1];
      feed.push({ time: latestWater.time, label: `Logged Hydration`, kcal: latestWater.ml, lib: 'Ionicons' as const, icon: 'water', color: Colors.chart.water });
    }
    const dnMeal = meals.find((m) => m.id === 'dinner');
    const dnKcal = dnMeal ? dnMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (dnKcal > 0) {
      feed.push({ time: '19:30', label: 'Dinner', kcal: dnKcal, lib: 'MCI' as const, icon: 'silverware-fork-knife', color: Colors.amber });
    }
    if (feed.length === 0) {
      feed.push({ time: '08:00', label: 'Start your journey!', kcal: 0, lib: 'Ionicons' as const, icon: 'rocket-outline', color: Colors.lime });
    }
    return feed.sort((a, b) => a.time.localeCompare(b.time));
  };

  const TIMELINE = getTimeline();

  const initials = user.name
    .split(' ')
    .map((n) => n[0] || '')
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ════════════════════ APPLE-STYLE HEADER ════════════════════ */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greetingStr},</Text>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{dateStr}</Text>
            <View style={styles.dot} />
            <View style={styles.streakChip}>
              <Ionicons name="flame" size={11} color={Colors.amber} />
              <Text style={styles.streakTxt}>{user.streak}</Text>
            </View>
            <View style={styles.xpChip}>
              <Ionicons name="flash" size={10} color={Colors.lime} />
              <Text style={styles.xpTxt}>LVL {user.level}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.85}>
          {user.profilePic ? (
            <Image source={{ uri: user.profilePic }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarTxt}>{initials}</Text>
          )}
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

      {/* ════════════════════ DYNAMIC METRICS GRID ════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsCustomizeVisible(true)}>
          <Ionicons name="settings-outline" size={14} color={Colors.lime} />
          <Text style={styles.editBtnTxt}>Customize</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.gridContainer}>
        {dashboardGrid.map((widgetId) => {
          const config = widgetConfigs[widgetId];
          if (!config) return null;
          return <MetricCard key={widgetId} config={config} />;
        })}
      </View>

      {/* ════════════════════ TODAY'S FOCUS HERO ════════════════════ */}
      <TouchableOpacity style={styles.hero} activeOpacity={0.9}>
        <View style={styles.heroBg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBody}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeTxt}>TODAY'S FOCUS</Text>
          </View>
          <Text style={styles.heroTitle}>Upper Body{'\n'}Strength</Text>
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
              {item.kcal > 0 ? `+${item.kcal}` : item.kcal < 0 ? `${item.kcal}` : '0'} kcal
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

      {/* ════════════════════ BMI QUICK ACCESS ════════════════════ */}
      <TouchableOpacity style={styles.waterChip} onPress={() => router.push('/bmi')} activeOpacity={0.8}>
        <View style={[styles.waterIconBox, { backgroundColor: bmiResult.color + '18' }]}>
          <MaterialCommunityIcons name="human" size={20} color={bmiResult.color} />
        </View>
        <View style={styles.waterText}>
          <Text style={styles.waterTitle}>BMI: {bmiResult.value.toFixed(1)} — {bmiResult.label} {bmiResult.emoji}</Text>
          <Text style={styles.waterSub}>Tap to view trends & health suggestions</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.muted} />
      </TouchableOpacity>

      {/* ════════════════════ CUSTOMIZER MODAL ════════════════════ */}
      <Modal visible={isCustomizeVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.customizerPane}>
            <View style={styles.customizerHeader}>
              <Text style={styles.customizerTitle}>Customize Dashboard</Text>
              <TouchableOpacity onPress={() => setIsCustomizeVisible(false)}>
                <Ionicons name="close-circle-outline" size={26} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.customizerScroll}>
              {ALL_WIDGETS.map((widget, idx) => {
                const isVisible = dashboardGrid.includes(widget.id);
                const gridIdx = dashboardGrid.indexOf(widget.id);
                return (
                  <View key={widget.id} style={styles.customizerRow}>
                    <Text style={styles.customizerLabel}>{widget.label}</Text>
                    <View style={styles.customizerActions}>
                      <TouchableOpacity
                        onPress={() => toggleWidgetVisibility(widget.id)}
                        style={[styles.toggleBtn, isVisible ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                      >
                        <Text style={[styles.toggleBtnText, { color: isVisible ? Colors.bg : Colors.text.primary }]}>
                          {isVisible ? 'Visible' : 'Hidden'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!isVisible || gridIdx <= 0}
                        onPress={() => moveWidget(gridIdx, gridIdx - 1)}
                        style={[styles.reorderBtn, (!isVisible || gridIdx <= 0) && styles.reorderBtnDisabled]}
                      >
                        <Ionicons name="arrow-up" size={16} color={(!isVisible || gridIdx <= 0) ? Colors.muted : Colors.lime} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!isVisible || gridIdx >= dashboardGrid.length - 1}
                        onPress={() => moveWidget(gridIdx, gridIdx + 1)}
                        style={[styles.reorderBtn, (!isVisible || gridIdx >= dashboardGrid.length - 1) && styles.reorderBtnDisabled]}
                      >
                        <Ionicons name="arrow-down" size={16} color={(!isVisible || gridIdx >= dashboardGrid.length - 1) ? Colors.muted : Colors.lime} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.closeCustomizer} onPress={() => setIsCustomizeVisible(false)}>
              <Text style={styles.closeCustomizerText}>Done</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 20, gap: 18 },

  // Header
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

  // Avatar
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
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarTxt: { fontSize: 15, fontWeight: '800', color: Colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: Colors.card,
  },

  // Activity Strip
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

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },

  // Hero card
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

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, letterSpacing: -0.3 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.lime + '12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  editBtnTxt: { fontSize: 12, fontWeight: '600', color: Colors.lime },

  // Quick log
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

  // Timeline
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

  // Water chip
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

  // Customizer styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  customizerPane: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  customizerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  customizerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text.primary,
  },
  customizerScroll: {
    maxHeight: 340,
    marginBottom: 20,
  },
  customizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  customizerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  customizerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  toggleBtnActive: {
    backgroundColor: Colors.lime,
  },
  toggleBtnInactive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reorderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  closeCustomizer: {
    backgroundColor: Colors.text.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCustomizerText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.bg,
  },
});
