import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/ui/DonutChart';
import AppIcon from '@/components/ui/AppIcon';
import { Colors, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useFitnessStore } from '@/store/fitnessStore';
import { useShallow } from 'zustand/react/shallow';
import { MetricCard, WidgetConfig, WidgetType } from '@/features/dashboard/components/WidgetRegistry';
import { getBMIResult } from '@/utils/bmi';
import { kgToLbs, mlToOz } from '@/utils/units';
import { useCycle } from '@/hooks/useCycle';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const _now = new Date();
const greetingStr = _now.getHours() < 12 ? 'Good morning' : _now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
const dateStr = `${DAY_NAMES[_now.getDay()]}, ${_now.getDate()} ${MONTH_NAMES[_now.getMonth()]}`;

export default function HomeScreen() {
  const { colors, isDark: isDarkMode } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);
  const insets = useSafeAreaInsets();
  const [isCustomizeVisible, setIsCustomizeVisible] = useState(false);
  const [cycleBannerDismissed, setCycleBannerDismissed] = useState(false);

  const cycle = useCycle();

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
    sleepLogs,
    heartRateLogs,
  } = useFitnessStore(useShallow((s) => ({
    user: s.user,
    meals: s.meals,
    waterLogs: s.waterLogs,
    weightLogs: s.weightLogs,
    stepsCount: s.stepsCount,
    activeMinutes: s.activeMinutes,
    dashboardGrid: s.dashboardGrid,
    setDashboardGrid: s.setDashboardGrid,
    toggleWidgetVisibility: s.toggleWidgetVisibility,
    sleepLogs: s.sleepLogs,
    heartRateLogs: s.heartRateLogs,
  })));

  const isLbs = user.weightUnit === 'lbs';
  const isOz = user.volumeUnit === 'oz';

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

  // Sleep — last log (most recent date)
  const lastSleep = sleepLogs.length > 0 ? sleepLogs[0] : null;
  const sleepHrs = lastSleep ? (lastSleep.totalMin / 60).toFixed(1) : '--';

  // Vitals — latest heart rate reading
  const lastHR = heartRateLogs.length > 0 ? heartRateLogs[0] : null;

  // Define configurations dynamically for Registry matching
  const widgetConfigs: Record<string, WidgetConfig<any>> = {
    steps: {
      id: 'steps',
      type: 'linear_progress',
      title: 'Daily Steps',
      icon: { lib: 'Ionicons', name: 'footsteps' },
      color: colors.lime,
      data: {
        value: stepsCount,
        target: user.stepsGoal,
        progressColor: colors.lime,
        unit: 'steps',
      },
      onPress: () => router.push('/steps'),
    },
    water: {
      id: 'water',
      type: 'radial_chart',
      title: 'Hydration',
      icon: { lib: 'Ionicons', name: 'water' },
      color: colors.chart.water,
      data: {
        value: isOz ? mlToOz(totalWaterMl) : totalWaterMl,
        target: isOz ? mlToOz(user.waterGoal) : user.waterGoal,
        segments: [{ value: isOz ? mlToOz(totalWaterMl) : totalWaterMl, color: colors.chart.water }],
        centerLabel: isOz ? `${mlToOz(totalWaterMl)} oz` : `${(totalWaterMl / 1000).toFixed(1)}L`,
        centerSublabel: 'Hydrated',
      },
      onPress: () => router.push('/water'),
    },
    nutrition: {
      id: 'nutrition',
      type: 'radial_chart',
      title: 'Nutrition',
      icon: { lib: 'MCI', name: 'food-apple' },
      color: colors.amber,
      data: {
        value: totalKcal,
        target: user.calorieGoal,
        segments: [
          { value: totalCarbs, color: colors.chart.carbs },
          { value: totalProtein, color: colors.chart.protein },
          { value: totalFat, color: colors.danger },
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
      color: colors.lime,
      data: {
        currentValue: isLbs ? kgToLbs(currentWeight) : currentWeight,
        previousValue: isLbs ? kgToLbs(previousWeight) : previousWeight,
        unit: isLbs ? 'lbs' : 'kg',
        trend: weightTrend,
      },
      onPress: () => router.push('/(tabs)/weight'),
    },
    workout_focus: {
      id: 'workout_focus',
      type: 'compact_chip',
      title: 'Today Focus',
      icon: { lib: 'MCI', name: 'dumbbell' },
      color: colors.amber,
      data: {
        value: 'Upper Body',
        status: '45 min',
        statusColor: colors.amber,
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
    { lib: 'Ionicons' as const, icon: 'flame', color: colors.amber, value: activeKcal.toLocaleString(), unit: 'kcal', label: 'Burned', route: '/steps' },
    { lib: 'Ionicons' as const, icon: 'footsteps', color: colors.lime, value: stepsCount.toLocaleString(), unit: 'steps', label: 'Steps', route: '/steps' },
    { lib: 'Ionicons' as const, icon: 'timer-outline', color: '#6366F1', value: activeMinutes.toString(), unit: 'min', label: 'Active', route: '/steps' },
  ];

  const QUICK_LOGS = [
    { lib: 'Ionicons' as const, icon: 'water', color: colors.chart.water, label: 'Water', value: isOz ? `${mlToOz(totalWaterMl)} oz` : `${(totalWaterMl / 1000).toFixed(1)} L`, route: '/water' },
    { lib: 'MCI' as const, icon: 'food-apple', color: colors.lime, label: 'Food', value: `${totalKcal.toLocaleString()} kcal`, route: '/(tabs)/nutrition' },
    { lib: 'MCI' as const, icon: 'scale-bathroom', color: colors.amber, label: 'Weight', value: isLbs ? `${kgToLbs(currentWeight).toFixed(1)} lbs` : `${currentWeight.toFixed(1)} kg`, route: '/(tabs)/weight' },
    { lib: 'Ionicons' as const, icon: 'footsteps', color: '#6366F1', label: 'Steps', value: stepsCount.toLocaleString(), route: '/steps' },
    { lib: 'Ionicons' as const, icon: 'moon', color: '#818CF8', label: 'Sleep', value: lastSleep ? `${sleepHrs} hr` : '--', route: '/(tabs)/sleep' },
    { lib: 'MCI' as const, icon: 'heart-pulse', color: '#EC4899', label: 'Vitals', value: lastHR ? `${lastHR.bpm} bpm` : '--', route: '/(tabs)/vitals' },
  ];

  const getTimeline = () => {
    const feed = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Sleep (last night's log)
    if (lastSleep) {
      feed.push({ time: lastSleep.wakeTime, label: `Slept ${sleepHrs} hr`, kcal: lastSleep.score, lib: 'Ionicons' as const, icon: 'moon', color: '#818CF8' });
    }
    // Meals
    const bfMeal = meals.find((m) => m.id === 'breakfast');
    const bfKcal = bfMeal ? bfMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (bfKcal > 0) {
      feed.push({ time: '07:30', label: 'Breakfast', kcal: bfKcal, lib: 'MCI' as const, icon: 'egg-fried', color: colors.amber });
    }
    if (stepsCount > 3000) {
      feed.push({ time: '09:15', label: 'Morning Walk', kcal: -150, lib: 'MCI' as const, icon: 'walk', color: colors.lime });
    }
    const lhMeal = meals.find((m) => m.id === 'lunch');
    const lhKcal = lhMeal ? lhMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (lhKcal > 0) {
      feed.push({ time: '12:30', label: 'Lunch', kcal: lhKcal, lib: 'MCI' as const, icon: 'food-apple', color: colors.amber });
    }
    const snMeal = meals.find((m) => m.id === 'snacks');
    const snKcal = snMeal ? snMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (snKcal > 0) {
      feed.push({ time: '15:30', label: 'Snack', kcal: snKcal, lib: 'Ionicons' as const, icon: 'nutrition', color: '#FB923C' });
    }
    if (waterLogs.length > 0) {
      const latestWater = waterLogs[waterLogs.length - 1];
      feed.push({ time: latestWater.time, label: 'Logged Hydration', kcal: latestWater.ml, lib: 'Ionicons' as const, icon: 'water', color: colors.chart.water });
    }
    const dnMeal = meals.find((m) => m.id === 'dinner');
    const dnKcal = dnMeal ? dnMeal.items.reduce((s, i) => s + i.kcal, 0) : 0;
    if (dnKcal > 0) {
      feed.push({ time: '19:30', label: 'Dinner', kcal: dnKcal, lib: 'MCI' as const, icon: 'silverware-fork-knife', color: colors.amber });
    }
    // Latest heart rate today
    const todayHR = heartRateLogs.find((l) => l.date === todayStr);
    if (todayHR) {
      feed.push({ time: todayHR.time, label: `Heart Rate`, kcal: todayHR.bpm, lib: 'MCI' as const, icon: 'heart-pulse', color: '#EC4899' });
    }
    // Cycle log today
    if (cycle.cycleSettings.cycleTrackingEnabled) {
      const todayCycleLog = cycle.cycleLogs.find((l) => l.date === todayStr);
      if (todayCycleLog) {
        feed.push({ time: '20:00', label: 'Cycle Logged', kcal: 0, lib: 'Ionicons' as const, icon: 'flower', color: '#F87171' });
      }
    }
    if (feed.length === 0) {
      feed.push({ time: '08:00', label: 'Start your journey!', kcal: 0, lib: 'Ionicons' as const, icon: 'rocket-outline', color: colors.lime });
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
            <TouchableOpacity
              style={styles.streakChip}
              onPress={() => router.push('/rewards')}
              activeOpacity={0.7}
            >
              <Ionicons name="flame" size={11} color={colors.amber} />
              <Text style={styles.streakTxt}>{user.streak}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.xpChip}
              onPress={() => router.push('/rewards')}
              activeOpacity={0.7}
            >
              <Ionicons name="flash" size={10} color={colors.lime} />
              <Text style={styles.xpTxt}>LVL {user.level}</Text>
            </TouchableOpacity>
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

      {/* ════════════════════ CYCLE FEATURE ANNOUNCEMENT (female) ════════════════════ */}
      {user.gender === 'female' && !cycle.cycleSettings.cycleTrackingEnabled && !cycleBannerDismissed && (
        <View style={styles.cycleBanner}>
          <View style={styles.cycleBannerLeft}>
            <View style={[styles.cycleBannerIcon, { backgroundColor: '#F87171' + '18' }]}>
              <Ionicons name="flower" size={22} color="#F87171" />
            </View>
            <View style={styles.cycleBannerText}>
              <Text style={styles.cycleBannerTitle}>Cycle Tracking Available 🌸</Text>
              <Text style={styles.cycleBannerSub}>
                Track your period, ovulation & symptoms. Enable it to add Cycle to your tab bar, or find it in Profile → Preferences.
              </Text>
              <TouchableOpacity
                style={styles.cycleBannerBtn}
                onPress={() => cycle.updateCycleSettings({ cycleTrackingEnabled: true })}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={13} color="#fff" />
                <Text style={styles.cycleBannerBtnTxt}>Enable Now</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity onPress={() => setCycleBannerDismissed(true)} style={styles.cycleBannerClose}>
            <Ionicons name="close" size={16} color={colors.muted} />
          </TouchableOpacity>
        </View>
      )}

      {/* ════════════════════ DYNAMIC METRICS GRID ════════════════════ */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <TouchableOpacity style={styles.editBtn} onPress={() => setIsCustomizeVisible(true)}>
          <Ionicons name="settings-outline" size={14} color={colors.lime} />
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
              <Ionicons name="timer-outline" size={14} color={colors.muted} />
              <Text style={styles.heroStatVal}>45 min</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <Ionicons name="flame" size={14} color={colors.amber} />
              <Text style={styles.heroStatVal}>380 kcal</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={colors.muted} />
              <Text style={styles.heroStatVal}>Strength</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85}>
            <Ionicons name="play" size={13} color={colors.bg} />
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll} contentContainerStyle={styles.timelineScrollContent}>
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
      <TouchableOpacity style={[styles.waterChip, { borderLeftWidth: 3, borderLeftColor: colors.chart.water }]} onPress={() => router.push('/water')} activeOpacity={0.8}>
        <View style={[styles.waterIconBox, { backgroundColor: colors.chart.water + '18' }]}>
          <Ionicons name="water" size={18} color={colors.chart.water} />
        </View>
        <View style={styles.waterText}>
          <Text style={styles.waterTitle}>Hydration reminder</Text>
          <Text style={styles.waterSub}>Next at 4:00 PM — tap to log now</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>

      {/* ════════════════════ BMI QUICK ACCESS ════════════════════ */}
      <TouchableOpacity style={[styles.waterChip, { borderLeftWidth: 3, borderLeftColor: colors.lime }]} onPress={() => router.push('/bmi')} activeOpacity={0.8}>
        <View style={[styles.waterIconBox, { backgroundColor: bmiResult.color + '18' }]}>
          <MaterialCommunityIcons name="human" size={20} color={bmiResult.color} />
        </View>
        <View style={styles.waterText}>
          <Text style={styles.waterTitle}>BMI: {bmiResult.value.toFixed(1)} — {bmiResult.label} {bmiResult.emoji}</Text>
          <Text style={styles.waterSub}>Tap to view trends & health suggestions</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>

      {/* ════════════════════ CYCLE QUICK ACCESS (when enabled) ════════════════════ */}
      {cycle.cycleSettings.cycleTrackingEnabled && (() => {
        const daysLate = (cycle.daysUntilPeriod !== null && cycle.daysUntilPeriod < 0)
          ? Math.abs(cycle.daysUntilPeriod) : 0;
        const lateAccent = daysLate <= 3 ? '#FBBF24' : daysLate <= 7 ? '#FB923C' : '#EF4444';
        const accent = daysLate > 0 ? lateAccent : '#F87171';
        const lateSub = daysLate <= 3
          ? 'Small delays are normal — tap to check in'
          : daysLate <= 7
            ? 'Common causes: stress, diet or illness'
            : 'Consider speaking with a healthcare provider';
        return (
          <TouchableOpacity
            style={[styles.waterChip, { borderLeftWidth: 3, borderLeftColor: accent }]}
            onPress={() => router.push('/(tabs)/cycle' as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.waterIconBox, { backgroundColor: accent + '18' }]}>
              <Ionicons name={daysLate > 0 ? 'time' : 'flower'} size={18} color={accent} />
            </View>
            <View style={styles.waterText}>
              <Text style={styles.waterTitle}>
                {daysLate > 0
                  ? `Period ${daysLate}d late`
                  : cycle.currentPhase && cycle.dayOfCycle
                    ? `${cycle.phaseMeta?.label} · Day ${cycle.dayOfCycle}`
                    : 'Cycle Tracking'}
              </Text>
              <Text style={[styles.waterSub, daysLate > 0 && { color: accent }]}>
                {cycle.daysUntilPeriod != null
                  ? cycle.daysUntilPeriod === 0
                    ? 'Period expected today — tap to log'
                    : cycle.daysUntilPeriod > 0
                      ? `Next period in ${cycle.daysUntilPeriod} days`
                      : lateSub
                  : 'Tap to log today'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>
        );
      })()}

      {/* ════════════════════ CUSTOMIZER MODAL ════════════════════ */}
      <Modal visible={isCustomizeVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.customizerPane}>
            <View style={styles.customizerHeader}>
              <Text style={styles.customizerTitle}>Customize Dashboard</Text>
              <TouchableOpacity onPress={() => setIsCustomizeVisible(false)}>
                <Ionicons name="close-circle-outline" size={26} color={colors.text.primary} />
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
                        <Text style={[styles.toggleBtnText, { color: isVisible ? colors.bg : colors.text.primary }]}>
                          {isVisible ? 'Visible' : 'Hidden'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!isVisible || gridIdx <= 0}
                        onPress={() => moveWidget(gridIdx, gridIdx - 1)}
                        style={[styles.reorderBtn, (!isVisible || gridIdx <= 0) && styles.reorderBtnDisabled]}
                      >
                        <Ionicons name="arrow-up" size={16} color={(!isVisible || gridIdx <= 0) ? colors.muted : colors.lime} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        disabled={!isVisible || gridIdx >= dashboardGrid.length - 1}
                        onPress={() => moveWidget(gridIdx, gridIdx + 1)}
                        style={[styles.reorderBtn, (!isVisible || gridIdx >= dashboardGrid.length - 1) && styles.reorderBtnDisabled]}
                      >
                        <Ionicons name="arrow-down" size={16} color={(!isVisible || gridIdx >= dashboardGrid.length - 1) ? colors.muted : colors.lime} />
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

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
    color: colors.muted,
    letterSpacing: 0.2,
  },
  name: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text.primary,
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
    color: colors.muted,
  },
  dot: {
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: colors.muted,
    opacity: 0.5,
  },
  streakChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.amberOverlay,
    borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.amber + '33',
  },
  streakTxt: { fontSize: 11, fontWeight: '700', color: colors.amber },
  xpChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.overlay,
    borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.lime + '33',
  },
  xpTxt: { fontSize: 11, fontWeight: '700', color: colors.lime },

  // Avatar
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.lime + '18',
    borderWidth: 2.5, borderColor: colors.lime,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 12,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarTxt: { fontSize: 15, fontWeight: '800', color: colors.lime },
  avatarDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 11, height: 11, borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2, borderColor: colors.card,
  },

  // Activity Strip
  activityStrip: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
  actCellLast: { borderTopRightRadius: Radius.lg },
  actCellBorder: {
    borderLeftWidth: 1,
    borderLeftColor: colors.cardBorder,
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
    color: colors.muted,
  },
  actLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.muted,
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
    borderColor: colors.lime + '28',
    minHeight: 170,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 4,
  },
  heroBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.statusBar === 'light-content' ? '#112218' : '#E8F5EE',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.lime + '0A',
  },
  heroBody: { padding: 22 },
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.lime + '20',
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.lime + '40',
    marginBottom: 12,
  },
  heroBadgeDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.lime,
  },
  heroBadgeTxt: { fontSize: 10, fontWeight: '700', color: colors.lime, letterSpacing: 0.8 },
  heroTitle: {
    fontSize: 26, fontWeight: '800', color: colors.text.primary,
    letterSpacing: -0.6, lineHeight: 30, marginBottom: 14,
  },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 0, marginBottom: 18 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStatVal: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  heroStatSep: {
    width: 1, height: 16,
    backgroundColor: colors.cardBorder,
    marginHorizontal: 12,
  },
  heroBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: colors.lime,
    borderRadius: Radius.pill,
    paddingHorizontal: 22, paddingVertical: 12,
    shadowColor: colors.lime,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  heroBtnTxt: { fontSize: 14, fontWeight: '700', color: colors.bg, letterSpacing: 0.1 },

  // Section headers
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.lime + '12',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
  },
  editBtnTxt: { fontSize: 12, fontWeight: '600', color: colors.lime },

  // Quick log — 3-column grid
  quickLogRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickLogCard: {
    width: (Dimensions.get('window').width - 40 - 20) / 3,
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
  quickLogLabel: { fontSize: 10, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickLogValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  // Timeline
  timelineScroll: { marginHorizontal: -20 },
  timelineScrollContent: { paddingLeft: 20, paddingRight: 20 },
  timelineCard: {
    width: 108, marginRight: 10,
    alignItems: 'center', gap: 4,
  },
  timelineTime: { fontSize: 10, fontWeight: '600', color: colors.muted, letterSpacing: 0.3 },
  timelineIconWrap: {
    width: 42, height: 42, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center', marginVertical: 4,
  },
  timelineLabel: { fontSize: 11, fontWeight: '600', color: colors.text.primary, textAlign: 'center' },
  timelineKcal: { fontSize: 11, fontWeight: '700' },

  // Water chip
  waterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1, borderColor: colors.cardBorder,
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
  waterTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  waterSub: { fontSize: 12, fontWeight: '400', color: colors.muted, marginTop: 1 },

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
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.text.primary,
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
    borderBottomColor: colors.cardBorder,
  },
  customizerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
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
    backgroundColor: colors.lime,
  },
  toggleBtnInactive: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reorderBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  reorderBtnDisabled: {
    opacity: 0.4,
  },
  closeCustomizer: {
    backgroundColor: colors.text.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCustomizerText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.bg,
  },

  // Cycle feature announcement banner
  cycleBanner: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    backgroundColor: '#F87171' + '10',
    borderRadius: Radius.lg, borderWidth: 1, borderColor: '#F87171' + '35',
    padding: 14, gap: 8,
  },
  cycleBannerLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  cycleBannerIcon: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cycleBannerText: { flex: 1, gap: 4 },
  cycleBannerTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  cycleBannerSub: { fontSize: 12, fontWeight: '400', color: colors.text.secondary, lineHeight: 17 },
  cycleBannerBtn: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 8, backgroundColor: '#F87171',
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 7,
  },
  cycleBannerBtnTxt: { fontSize: 12, fontWeight: '700', color: '#fff' },
  cycleBannerClose: { padding: 2 },
});
