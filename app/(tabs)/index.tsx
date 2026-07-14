import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Modal, Dimensions, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFitnessStore } from '@/store/fitnessStore';
import { triggerHaptic } from '@/utils/haptics';
import GlassCard from '@/components/ui/GlassCard';
import AppIcon from '@/components/ui/AppIcon';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { MetricCard } from '@/features/dashboard/components/WidgetRegistry';
import { ALL_WIDGETS } from '@/constants/dashboard';
import { useHomeDashboard } from '@/hooks/useHomeDashboard';
import ActivityStrip from '@/components/home/ActivityStrip';
import CycleBanner from '@/components/home/CycleBanner';
import CycleInfoChip from '@/components/home/CycleInfoChip';
import DailyQuests from '@/components/home/DailyQuests';

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();

  const {
    user, initials, greeting, dateStr,
    isLbs, isOz,
    nutrition, totalWaterMl, activeKcal,
    bmiResult, lastHR,
    waterDisplay, weightDisplay, hrDisplay, sleepDisplay,
    dashboardGrid, widgetConfigs, timeline,
    cycleChip, showCycleBanner,
    isCustomizeVisible,
    openCustomize, closeCustomize, toggleWidgetVisibility, moveWidget,
    dismissCycleBanner, enableCycleTracking,
    goToRewards, goToProfile, goToSteps, goToWater, goToBmi, goToCycle,
    stepsCount, activeMinutes,
  } = useHomeDashboard();

  const { setUser } = useFitnessStore();

  const [showFocusModal, setShowFocusModal] = useState(false);
  const [focusTitleInput, setFocusTitleInput] = useState('');
  const [focusDurationInput, setFocusDurationInput] = useState('45');
  const [focusCaloriesInput, setFocusCaloriesInput] = useState('380');
  const [focusTypeInput, setFocusTypeInput] = useState('Strength');

  // Days of the week preset list
  const defaultFocus = useMemo(() => {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const presets = [
      { title: "Rest & Stretch", duration: 20, calories: 120, type: "Stretch" }, // Sunday
      { title: "Chest & Triceps", duration: 50, calories: 420, type: "Strength" }, // Monday
      { title: "HIIT & Cardio", duration: 35, calories: 350, type: "Cardio" }, // Tuesday
      { title: "Legs & Lower Body", duration: 60, calories: 500, type: "Strength" }, // Wednesday
      { title: "Recovery Yoga", duration: 40, calories: 180, type: "Flexibility" }, // Thursday
      { title: "Back & Biceps Power", duration: 50, calories: 400, type: "Strength" }, // Friday
      { title: "Core & Abs Blast", duration: 30, calories: 250, type: "Core" } // Saturday
    ];
    return presets[day] || presets[1];
  }, []);

  const currentFocus = useMemo(() => {
    return {
      title: user.customFocusTitle || defaultFocus.title,
      duration: user.customFocusDuration || defaultFocus.duration,
      calories: user.customFocusCalories || defaultFocus.calories,
      type: user.customFocusType || defaultFocus.type,
    };
  }, [user, defaultFocus]);

  const openFocusCustomizer = () => {
    triggerHaptic('selection');
    setFocusTitleInput(currentFocus.title);
    setFocusDurationInput(currentFocus.duration.toString());
    setFocusCaloriesInput(currentFocus.calories.toString());
    setFocusTypeInput(currentFocus.type);
    setShowFocusModal(true);
  };

  const handleSaveFocus = () => {
    triggerHaptic('success');
    setUser({
      customFocusTitle: focusTitleInput,
      customFocusDuration: parseInt(focusDurationInput, 10) || 45,
      customFocusCalories: parseInt(focusCaloriesInput, 10) || 380,
      customFocusType: focusTypeInput,
    });
    setShowFocusModal(false);
  };

  const handleResetFocus = () => {
    triggerHaptic('selection');
    setUser({
      customFocusTitle: undefined,
      customFocusDuration: undefined,
      customFocusCalories: undefined,
      customFocusType: undefined,
    });
    setShowFocusModal(false);
  };

  // Activity metrics — built here to avoid import cycle; handlers come from hook.
  const activityMetrics = useMemo(() => [
    { lib: 'Ionicons' as const, icon: 'flame', color: colors.amber, value: activeKcal.toLocaleString(), unit: 'kcal', label: 'Burned', onPress: goToSteps },
    { lib: 'Ionicons' as const, icon: 'footsteps', color: colors.lime, value: stepsCount.toLocaleString(), unit: 'steps', label: 'Steps', onPress: goToSteps },
    { lib: 'Ionicons' as const, icon: 'timer-outline', color: '#6366F1', value: activeMinutes.toString(), unit: 'min', label: 'Active', onPress: goToSteps },
  ], [colors, activeKcal, stepsCount, activeMinutes, goToSteps]);

  const quickLogs = useMemo(() => [
    { lib: 'Ionicons' as const, icon: 'water', color: colors.chart.water, label: 'Water', value: waterDisplay, route: goToWater },
    { lib: 'MCI' as const, icon: 'food-apple', color: colors.lime, label: 'Food', value: `${nutrition.kcal.toLocaleString()} kcal`, route: () => { } },
    { lib: 'MCI' as const, icon: 'scale-bathroom', color: colors.amber, label: 'Weight', value: weightDisplay, route: () => { } },
    { lib: 'Ionicons' as const, icon: 'footsteps', color: '#6366F1', label: 'Steps', value: stepsCount.toLocaleString(), route: goToSteps },
    { lib: 'Ionicons' as const, icon: 'moon', color: '#818CF8', label: 'Sleep', value: sleepDisplay, route: () => { } },
    { lib: 'MCI' as const, icon: 'heart-pulse', color: '#EC4899', label: 'Vitals', value: hrDisplay, route: () => { } },
  ], [colors, waterDisplay, weightDisplay, hrDisplay, sleepDisplay, nutrition.kcal, stepsCount, goToWater, goToSteps]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{greeting},</Text>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.date}>{dateStr}</Text>
            <View style={styles.dot} />
            <TouchableOpacity style={styles.streakChip} onPress={goToRewards} activeOpacity={0.7}>
              <Ionicons name="flame" size={11} color={colors.amber} />
              <Text style={styles.streakTxt}>{user.streak}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.xpChip} onPress={goToRewards} activeOpacity={0.7}>
              <Ionicons name="flash" size={10} color={colors.lime} />
              <Text style={styles.xpTxt}>LVL {user.level}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.avatar} onPress={goToProfile} activeOpacity={0.85}>
          {user.profilePic
            ? <Image source={{ uri: user.profilePic }} style={styles.avatarImg} />
            : <Text style={styles.avatarTxt}>{initials}</Text>
          }
          <View style={styles.avatarDot} />
        </TouchableOpacity>
      </View>

      {/* ── Activity strip ─────────────────────────────────────────────────── */}
      <ActivityStrip metrics={activityMetrics} />

      {/* ── Cycle feature banner (female, not yet enabled) ─────────────────── */}
      {showCycleBanner && (
        <CycleBanner onEnable={enableCycleTracking} onDismiss={dismissCycleBanner} />
      )}

      {/* ── Daily Goals Checklist ────────────────────────────────────────── */}
      <DailyQuests />

      {/* ── Metrics grid ───────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Metrics</Text>
        <TouchableOpacity style={styles.editBtn} onPress={openCustomize}>
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

      {/* ── Today's focus hero ─────────────────────────────────────────────── */}
      <TouchableOpacity style={styles.hero} activeOpacity={0.9} onPress={() => router.push('/workouts')}>
        <View style={styles.heroBg} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroBody}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 }}>
            <View style={styles.heroBadge}>
              <View style={styles.heroBadgeDot} />
              <Text style={styles.heroBadgeTxt}>TODAY'S FOCUS</Text>
            </View>
            <TouchableOpacity
              style={styles.heroEditBtn}
              activeOpacity={0.8}
              onPress={openFocusCustomizer}
            >
              <Ionicons name="create-outline" size={15} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.heroTitle} numberOfLines={2} adjustsFontSizeToFit>{currentFocus.title}</Text>
          
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Ionicons name="timer-outline" size={14} color={colors.muted} />
              <Text style={styles.heroStatVal}>{currentFocus.duration} min</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <Ionicons name="flame" size={14} color={colors.amber} />
              <Text style={styles.heroStatVal}>{currentFocus.calories} kcal</Text>
            </View>
            <View style={styles.heroStatSep} />
            <View style={styles.heroStat}>
              <MaterialCommunityIcons name="dumbbell" size={14} color={colors.muted} />
              <Text style={styles.heroStatVal}>{currentFocus.type}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.heroBtn} activeOpacity={0.85} onPress={() => router.push('/workouts')}>
            <Ionicons name="play" size={13} color={colors.bg} />
            <Text style={styles.heroBtnTxt}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* ── Quick log ──────────────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Log</Text>
      </View>
      <View style={styles.quickLogRow}>
        {quickLogs.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.quickLogCard}
            activeOpacity={0.75}
            onPress={item.route}
          >
            <View style={[styles.quickLogIcon, { backgroundColor: item.color + '18' }]}>
              <AppIcon lib={item.lib as any} name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={styles.quickLogLabel}>{item.label}</Text>
            <Text style={[styles.quickLogValue, { color: item.color }]}>{item.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Activity timeline ─────────────────────────────────────────────── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Activity</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timelineScroll} contentContainerStyle={styles.timelineScrollContent}>
        {timeline.map((item, i) => (
          <GlassCard key={`${item.time}-${i}`} style={styles.timelineCard}>
            <Text style={styles.timelineTime}>{item.time}</Text>
            <View style={[styles.timelineIconWrap, { backgroundColor: item.color + '18' }]}>
              <AppIcon lib={item.lib as any} name={item.icon as any} size={22} color={item.color} />
            </View>
            <Text style={styles.timelineLabel}>{item.label}</Text>
            <Text style={[styles.timelineKcal, { color: item.color }]}>
              {item.kcal > 0 ? `+${item.kcal}` : item.kcal < 0 ? `${item.kcal}` : '0'} kcal
            </Text>
          </GlassCard>
        ))}
      </ScrollView>

      {/* ── Info chips ────────────────────────────────────────────────────── */}
      <TouchableOpacity style={[styles.infoChip, { borderLeftColor: colors.chart.water }]} onPress={goToWater} activeOpacity={0.8}>
        <View style={[styles.infoIconBox, { backgroundColor: colors.chart.water + '18' }]}>
          <Ionicons name="water" size={18} color={colors.chart.water} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>Hydration reminder</Text>
          <Text style={styles.infoSub}>Tap to log now</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.infoChip, { borderLeftColor: colors.lime }]} onPress={goToBmi} activeOpacity={0.8}>
        <View style={[styles.infoIconBox, { backgroundColor: bmiResult.color + '18' }]}>
          <MaterialCommunityIcons name="human" size={20} color={bmiResult.color} />
        </View>
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>BMI: {bmiResult.value.toFixed(1)} — {bmiResult.label} {bmiResult.emoji}</Text>
          <Text style={styles.infoSub}>Tap to view trends & health suggestions</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.muted} />
      </TouchableOpacity>

      {cycleChip && (
        <CycleInfoChip
          accent={cycleChip.accent}
          title={cycleChip.title}
          sub={cycleChip.sub}
          daysLate={cycleChip.daysLate}
          onPress={goToCycle}
        />
      )}

      {/* ── Customizer modal ──────────────────────────────────────────────── */}
      <Modal visible={isCustomizeVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.customizerPane}>
            <View style={styles.customizerHeader}>
              <Text style={styles.customizerTitle}>Customize Dashboard</Text>
              <TouchableOpacity onPress={closeCustomize}>
                <Ionicons name="close-circle-outline" size={26} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.customizerScroll}>
              {ALL_WIDGETS.map((widget) => {
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
            <TouchableOpacity style={styles.closeCustomizer} onPress={closeCustomize}>
              <Text style={styles.closeCustomizerText}>Done</Text>
            </TouchableOpacity>
          </GlassCard>
        </View>
      </Modal>

      {/* ── Today's Focus Customizer Modal ────────────────────────────────────────── */}
      <Modal visible={showFocusModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.customizerPane}>
            <View style={styles.customizerHeader}>
              <Text style={styles.customizerTitle}>Customize Today's Focus</Text>
              <TouchableOpacity onPress={() => setShowFocusModal(false)}>
                <Ionicons name="close-circle-outline" size={26} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.customizerScroll}>
              <Text style={styles.inputLabel}>Focus Workout Title</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder }]}
                placeholder="e.g. Upper Body Strength"
                placeholderTextColor={colors.muted}
                value={focusTitleInput}
                onChangeText={setFocusTitleInput}
              />

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Duration (Min)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder }]}
                    keyboardType="numeric"
                    maxLength={3}
                    placeholder="45"
                    placeholderTextColor={colors.muted}
                    value={focusDurationInput}
                    onChangeText={setFocusDurationInput}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Calories (kcal)</Text>
                  <TextInput
                    style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder }]}
                    keyboardType="numeric"
                    maxLength={4}
                    placeholder="380"
                    placeholderTextColor={colors.muted}
                    value={focusCaloriesInput}
                    onChangeText={setFocusCaloriesInput}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Workout Category</Text>
              <TextInput
                style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder, marginBottom: 12 }]}
                placeholder="e.g. Strength, Cardio, Flexibility"
                placeholderTextColor={colors.muted}
                value={focusTypeInput}
                onChangeText={setFocusTypeInput}
              />

              <Text style={styles.inputLabel}>Quick Focus Presets</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {[
                  { title: "Chest & Triceps", duration: 50, calories: 420, type: "Strength" },
                  { title: "HIIT Cardio Blast", duration: 35, calories: 350, type: "Cardio" },
                  { title: "Legs & Lower Body", duration: 60, calories: 500, type: "Strength" },
                  { title: "Recovery Yoga", duration: 40, calories: 180, type: "Flexibility" },
                  { title: "Back & Biceps Power", duration: 50, calories: 400, type: "Strength" },
                  { title: "Core & Abs Blast", duration: 30, calories: 250, type: "Core" }
                ].map((preset, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetChip, { borderColor: colors.cardBorder, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setFocusTitleInput(preset.title);
                      setFocusDurationInput(preset.duration.toString());
                      setFocusCaloriesInput(preset.calories.toString());
                      setFocusTypeInput(preset.type);
                    }}
                  >
                    <Text style={{ fontSize: 11, color: colors.text.secondary, fontWeight: '600' }}>{preset.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', flex: 1, borderColor: colors.cardBorder, borderWidth: 1 }]}
                onPress={handleResetFocus}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.secondary, textAlign: 'center' }}>Reset to Preset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colors.lime, flex: 2 }]}
                onPress={handleSaveFocus}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#FFF', textAlign: 'center' }}>Apply Focus</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, gap: 18 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: 6 },
  headerLeft: { flex: 1, gap: 2 },
  greeting: { fontSize: 13, fontWeight: '500', color: colors.muted, letterSpacing: 0.2 },
  name: { fontSize: 30, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.8, lineHeight: 34 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  date: { fontSize: 12, fontWeight: '500', color: colors.muted },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.muted, opacity: 0.5 },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.amberOverlay, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: colors.amber + '33' },
  streakTxt: { fontSize: 11, fontWeight: '700', color: colors.amber },
  xpChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.overlay, borderRadius: Radius.pill, paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderColor: colors.lime + '33' },
  xpTxt: { fontSize: 11, fontWeight: '700', color: colors.lime },

  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.lime + '18', borderWidth: 2.5, borderColor: colors.lime, alignItems: 'center', justifyContent: 'center', marginLeft: 12, shadowColor: colors.lime, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  avatarImg: { width: 48, height: 48, borderRadius: 24 },
  avatarTxt: { fontSize: 15, fontWeight: '800', color: colors.lime },
  avatarDot: { position: 'absolute', bottom: 1, right: 1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#22C55E', borderWidth: 2, borderColor: colors.card },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -4, },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.lime + '12', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.sm },
  editBtnTxt: { fontSize: 12, fontWeight: '600', color: colors.lime },

  hero: { borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.lime + '28', minHeight: 170, shadowColor: colors.lime, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 14, elevation: 4 },
  heroBg: { ...StyleSheet.absoluteFill, backgroundColor: colors.statusBar === 'light-content' ? '#112218' : '#E8F5EE' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.lime + '0A' },
  heroBody: { padding: 22 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', backgroundColor: colors.lime + '20', borderRadius: Radius.pill, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: colors.lime + '40', marginBottom: 12 },
  heroBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lime },
  heroBadgeTxt: { fontSize: 10, fontWeight: '700', color: colors.lime, letterSpacing: 0.8 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.6, lineHeight: 30, marginBottom: 14 },
  heroStats: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  heroStat: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroStatVal: { fontSize: 13, fontWeight: '600', color: colors.text.secondary },
  heroStatSep: { width: 1, height: 16, backgroundColor: colors.cardBorder, marginHorizontal: 12 },
  heroBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.lime, borderRadius: Radius.pill, paddingHorizontal: 22, paddingVertical: 12, shadowColor: colors.lime, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 10, elevation: 4 },
  heroBtnTxt: { fontSize: 14, fontWeight: '700', color: colors.bg, letterSpacing: 0.1 },

  quickLogRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickLogCard: { width: (SCREEN_W - 40 - 20) / 3, backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder, padding: 12, alignItems: 'center', gap: 6, shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  quickLogIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLogLabel: { fontSize: 10, fontWeight: '600', color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  quickLogValue: { fontSize: 13, fontWeight: '700', textAlign: 'center' },

  timelineScroll: { marginHorizontal: -20 },
  timelineScrollContent: { paddingLeft: 20, paddingRight: 20 },
  timelineCard: { width: 108, marginRight: 10, alignItems: 'center', gap: 4 },
  timelineTime: { fontSize: 10, fontWeight: '600', color: colors.muted, letterSpacing: 0.3 },
  timelineIconWrap: { width: 42, height: 42, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  timelineLabel: { fontSize: 11, fontWeight: '600', color: colors.text.primary, textAlign: 'center' },
  timelineKcal: { fontSize: 11, fontWeight: '700' },

  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: colors.cardBorder, borderLeftWidth: 3, padding: 14, shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  infoIconBox: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  infoSub: { fontSize: 12, fontWeight: '400', color: colors.muted, marginTop: 1 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  customizerPane: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  customizerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  customizerTitle: { fontSize: 20, fontWeight: '800', color: colors.text.primary },
  customizerScroll: { maxHeight: 340, marginBottom: 20 },
  customizerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.cardBorder },
  customizerLabel: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
  customizerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center', width: 70 },
  toggleBtnActive: { backgroundColor: colors.lime },
  toggleBtnInactive: { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', borderWidth: 1, borderColor: colors.cardBorder },
  toggleBtnText: { fontSize: 11, fontWeight: '700' },
  reorderBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder },
  reorderBtnDisabled: { opacity: 0.4 },
  closeCustomizer: { backgroundColor: colors.text.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  closeCustomizerText: { fontSize: 15, fontWeight: '700', color: colors.bg },
  heroEditBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 11, fontWeight: '700', color: colors.text.secondary, marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: 0.4 },
  inputField: { borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  presetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  actionBtn: { paddingVertical: 12, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
});
