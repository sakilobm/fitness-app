import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Typography, Radius } from '@/constants/theme';
import { router } from 'expo-router';

const { width: W } = Dimensions.get('window');
const CYLINDER_W = 120;
const CYLINDER_H = 220;

interface LogEntry {
  id: string;
  time: string;
  ml: number;
}

const initialLog: LogEntry[] = [
  { id: '1', time: '07:15', ml: 250 },
  { id: '2', time: '09:30', ml: 500 },
  { id: '3', time: '11:00', ml: 250 },
  { id: '4', time: '13:45', ml: 200 },
];

function WaterCylinder({ filled }: { filled: number }) {
  const fillHeight = useSharedValue(0);

  useEffect(() => {
    fillHeight.value = withTiming(filled, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({
    height: fillHeight.value * CYLINDER_H,
  }));

  return (
    <View style={{ alignItems: 'center', width: CYLINDER_W, height: CYLINDER_H }}>
      {/* cylinder track */}
      <View style={cyS.track}>
        {/* fill */}
        <Animated.View style={[cyS.fill, fillStyle]} />
        {/* wave overlay */}
        <View style={[cyS.waveRow, { bottom: filled * CYLINDER_H - 10 }]}>
          <Text style={cyS.wave}>〰〰〰</Text>
        </View>
      </View>
    </View>
  );
}

const cyS = StyleSheet.create({
  track: {
    width: CYLINDER_W,
    height: CYLINDER_H,
    borderRadius: 60,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1.5,
    borderColor: Colors.chart.water + '66',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    backgroundColor: Colors.chart.water + 'BB',
  },
  waveRow: {
    position: 'absolute',
    left: 0, right: 0,
    alignItems: 'center',
  },
  wave: { color: Colors.chart.water, opacity: 0.4, fontSize: 16, letterSpacing: -2 },
});

const QUICK_AMOUNTS = [150, 250, 500];

export default function WaterScreen() {
  const insets = useSafeAreaInsets();

  // Dynamic States (Option A - Recommended)
  const [log, setLog] = useState<LogEntry[]>(initialLog);
  const [goalMl, setGoalMl] = useState(2500);
  const [bestDay, setBestDay] = useState(3200);
  const [avgDay, setAvgDay] = useState(2100);
  const [streakVal, setStreakVal] = useState(8);

  // Custom Amount Modal States
  const [showCustom, setShowCustom] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const [customError, setCustomError] = useState('');

  // Edit Goal Modal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoalVal, setTempGoalVal] = useState(2500);

  // Dynamic Portions Calculations
  const totalMl = log.reduce((s, e) => s + e.ml, 0);
  const filled = Math.min(totalMl / goalMl, 1);
  const goalMet = totalMl >= goalMl;

  // Track Peak Intake automatically
  useEffect(() => {
    if (totalMl > bestDay) {
      setBestDay(totalMl);
    }
  }, [totalMl, bestDay]);

  const addWater = (ml: number) => {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const newEntry: LogEntry = {
      id: Math.random().toString(),
      time,
      ml,
    };
    setLog((l) => [newEntry, ...l]);
  };

  // Delete Log entry (Option A - Recommended)
  const handleDeleteLog = (id: string) => {
    setLog((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSaveGoal = () => {
    if (tempGoalVal < 500 || tempGoalVal > 10000) {
      return;
    }
    setGoalMl(tempGoalVal);
    setShowGoalModal(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title="Water Tracking"
        subtitle="HYDRATION"
        icon={{ lib: 'Ionicons', name: 'water' }}
        accentColor={Colors.chart.water}
        showBack
        onBack={() => router.back()}
      />

      {/* Hero cylinder */}
      <GlassCard accentColor={Colors.chart.water}>
        <View style={styles.heroSection}>
          <WaterCylinder filled={filled} />
          <View style={styles.heroText}>
            <Text style={styles.mlNum}>{totalMl}<Text style={styles.mlUnit}> ml</Text></Text>
            <Text style={styles.mlGoal}>of {goalMl} ml goal</Text>
            <View style={[styles.mlBadge, goalMet && styles.goalMetBadge]}>
              <Ionicons name={goalMet ? "trophy" : "water"} size={11} color={goalMet ? Colors.amber : Colors.chart.water} />
              <Text style={[styles.mlBadgeText, goalMet && styles.goalMetBadgeText]}>
                {goalMet ? 'Goal Achieved!' : `${Math.round(filled * 100)}% hydrated`}
              </Text>
            </View>
          </View>
        </View>

        {/* Goal met reward banner (Option A - Recommended) */}
        {goalMet && (
          <View style={styles.rewardBanner}>
            <Ionicons name="sparkles" size={16} color={Colors.amber} />
            <Text style={styles.rewardText}>🎉 Daily Hydration Goal Achieved! Good job!</Text>
            <Ionicons name="sparkles" size={16} color={Colors.amber} />
          </View>
        )}
      </GlassCard>

      {/* Quick add */}
      <GlassCard accentColor={Colors.chart.water}>
        <SectionHeader title="Quick Add" accentColor={Colors.chart.water} />
        <View style={styles.quickRow}>
          {QUICK_AMOUNTS.map((ml) => (
            <TouchableOpacity
              key={ml}
              style={styles.quickBtn}
              onPress={() => addWater(ml)}
              activeOpacity={0.75}
            >
              <Ionicons name="water" size={20} color={Colors.chart.water} />
              <Text style={styles.quickMl}>{ml} ml</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.quickBtn, styles.customBtn]}
            onPress={() => {
              setCustomVal('');
              setCustomError('');
              setShowCustom(true);
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={20} color={Colors.muted} />
            <Text style={[styles.quickMl, { color: Colors.muted }]}>Custom</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Log history */}
      <GlassCard>
        <SectionHeader title="Today's Log" accentColor={Colors.chart.water} />
        {log.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="water-outline" size={44} color={Colors.muted} />
            <Text style={styles.emptyText}>No logs yet — start drinking!</Text>
          </View>
        ) : (
          <View style={styles.logList}>
            {log.map((entry, i) => (
              <View key={entry.id} style={styles.logEntry}>
                <View style={styles.logTimeline}>
                  <View style={styles.logDot} />
                  {i < log.length - 1 && <View style={styles.logLine} />}
                </View>
                <View style={styles.logInfo}>
                  <Text style={styles.logTime}>{entry.time}</Text>
                  <View style={styles.logPill}>
                    <Ionicons name="water" size={10} color={Colors.chart.water} />
                    <Text style={styles.logPillText}>{entry.ml} ml</Text>
                  </View>
                  
                  {/* Delete button (Option A - Recommended) */}
                  <TouchableOpacity style={styles.deleteLogBtn} onPress={() => handleDeleteLog(entry.id)} activeOpacity={0.75}>
                    <Ionicons name="close-circle" size={16} color={Colors.danger + '88'} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </GlassCard>

      {/* Goal & streak customizable */}
      <TouchableOpacity 
        style={styles.goalCardWrapper}
        onPress={() => {
          setTempGoalVal(goalMl);
          setShowGoalModal(true);
        }}
        activeOpacity={0.9}
      >
        <GlassCard accentColor={Colors.chart.water}>
          <SectionHeader 
            title="Daily Goal Target" 
            accentColor={Colors.chart.water}
            action="Change Target"
          />
          <View style={styles.goalRow}>
            <View style={styles.goalIconWrap}>
              <Ionicons name="trophy" size={20} color={Colors.chart.water} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalValue}>{goalMl} ml</Text>
              <Text style={styles.goalRange}>Recommended: 2,000–3,000 ml/day</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.chart.water} />
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Stats row connected to state */}
      <View style={styles.statsRow}>
        <StatBadge label="Streak" value={`${streakVal + (goalMet ? 1 : 0)}d 🔥`} color={Colors.chart.water} />
        <StatBadge label="Best Day" value={`${bestDay} ml`} color={Colors.chart.water} />
        <StatBadge label="Avg/Day" value={`${avgDay} ml`} color={Colors.lime} />
      </View>

      {/* Reminder chip */}
      <TouchableOpacity style={styles.reminderChip} activeOpacity={0.8}>
        <View style={styles.reminderIconWrap}>
          <Ionicons name="alarm" size={18} color={Colors.amber} />
        </View>
        <Text style={styles.reminderText}>Next reminder at 3:00 PM</Text>
        <Ionicons name="chevron-forward" size={18} color={Colors.amber} />
      </TouchableOpacity>

      {/* Custom Log entry Modal */}
      <Modal visible={showCustom} transparent animationType="slide" onRequestClose={() => setShowCustom(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Custom Amount</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowCustom(false)}>
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Exact Value Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Milliliters (ml)</Text>
                <View style={[styles.inputFieldWrap, !!customError && styles.inputFieldError]}>
                  <Ionicons name="water-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder="250"
                    placeholderTextColor={Colors.muted}
                    value={customVal}
                    onChangeText={(t) => {
                      setCustomVal(t);
                      if (customError) setCustomError('');
                    }}
                    autoFocus
                    maxLength={4}
                  />
                </View>
                {!!customError && <Text style={styles.errorText}>{customError}</Text>}
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={() => {
                  const ml = parseInt(customVal, 10);
                  if (isNaN(ml) || ml <= 0 || ml > 5000) {
                    setCustomError('Enter amount between 10 and 5000 ml');
                    return;
                  }
                  addWater(ml);
                  setCustomVal('');
                  setShowCustom(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="water" size={16} color={Colors.white} />
                <Text style={styles.modalSaveBtnText}>Add Water Intake</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowCustom(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Goal Edit Modal (Option A - Recommended Selection Grid) */}
      <Modal visible={showGoalModal} transparent animationType="slide" onRequestClose={() => setShowGoalModal(false)}>
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Daily Hydration Goal</Text>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowGoalModal(false)}>
                  <Ionicons name="close" size={20} color={Colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Selection Pills Grid */}
              <View style={styles.goalPillsContainer}>
                <Text style={styles.inputLabel}>Quick Targets</Text>
                <View style={styles.goalPillsRow}>
                  {[1500, 2000, 2500, 3000, 3500].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.goalPill, tempGoalVal === g && styles.goalPillActive]}
                      onPress={() => setTempGoalVal(g)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.goalPillText, tempGoalVal === g && styles.goalPillTextActive]}>{g} ml</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exact Custom goal input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Or Enter Precise Target (ml)</Text>
                <View style={styles.inputFieldWrap}>
                  <Ionicons name="trophy-outline" size={16} color={Colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={tempGoalVal === 0 ? '' : tempGoalVal.toString()}
                    onChangeText={(t) => {
                      const val = parseInt(t, 10);
                      if (!isNaN(val)) setTempGoalVal(val);
                      else setTempGoalVal(0);
                    }}
                    maxLength={4}
                  />
                </View>
                {(tempGoalVal < 500 || tempGoalVal > 10000) && tempGoalVal !== 0 && (
                  <Text style={styles.errorText}>Enter range between 500 and 10000 ml</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveGoal}
                disabled={tempGoalVal < 500 || tempGoalVal > 10000}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                <Text style={styles.modalSaveBtnText}>Save Daily Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowGoalModal(false)} style={styles.modalCancelBtn}>
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  heroSection: { flexDirection: 'row', alignItems: 'center', gap: 28, paddingVertical: 8, justifyContent: 'center' },
  heroText: { gap: 6 },
  mlNum: { ...Typography.hero, color: Colors.chart.water },
  mlUnit: { ...Typography.h2, color: Colors.chart.water },
  mlGoal: { ...Typography.caption, color: Colors.muted },
  mlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.chart.water + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: Colors.chart.water + '40',
  },
  mlBadgeText: { ...Typography.captionBold, color: Colors.chart.water },
  goalMetBadge: {
    backgroundColor: Colors.amber + '18',
    borderColor: Colors.amber + '40',
  },
  goalMetBadgeText: {
    color: Colors.amber,
  },

  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.amber + '12',
    borderColor: Colors.amber + '35',
    borderWidth: 1,
    padding: 10,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  rewardText: {
    ...Typography.captionBold,
    color: Colors.amber,
  },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: Colors.chart.water + '12',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.chart.water + '35',
    paddingVertical: 12,
  },
  customBtn: { backgroundColor: Colors.card, borderColor: Colors.cardBorder },
  quickMl: { ...Typography.captionBold, color: Colors.text.primary },

  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyText: { ...Typography.body, color: Colors.muted },

  logList: { gap: 0 },
  logEntry: { flexDirection: 'row', gap: 12, minHeight: 48 },
  logTimeline: { alignItems: 'center', width: 20 },
  logDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.chart.water, marginTop: 4 },
  logLine: { flex: 1, width: 1, backgroundColor: Colors.cardBorder, marginTop: 4 },
  logInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12 },
  logTime: { ...Typography.caption, color: Colors.muted, width: 40 },
  logPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.chart.water + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: Colors.chart.water + '35',
  },
  logPillText: { ...Typography.captionBold, color: Colors.chart.water },
  deleteLogBtn: {
    padding: 4,
    marginLeft: 'auto',
  },

  goalCardWrapper: {
    width: '100%',
  },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  goalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.chart.water + '15',
    borderWidth: 1,
    borderColor: Colors.chart.water + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: { flex: 1, gap: 2 },
  goalValue: { ...Typography.h2, color: Colors.chart.water },
  goalRange: { ...Typography.caption, color: Colors.muted },

  statsRow: { flexDirection: 'row', gap: 8 },

  reminderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.amberOverlay,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.amber + '35',
    padding: 14,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.amber + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: { ...Typography.body, color: Colors.text.primary, flex: 1 },

  // Modal styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28, 28, 30, 0.60)' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  modalSheet: {
    backgroundColor: Colors.ivory, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400, maxHeight: '90%',
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0,
    borderColor: Colors.lime + '20',
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: Colors.muted + '44', borderRadius: 2, marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: Colors.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.cardBorder,
  },
  inputGroup: { gap: 6, marginBottom: 16 },
  inputLabel: { ...Typography.captionBold, color: Colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: Colors.danger, backgroundColor: Colors.danger + '05' },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, ...Typography.body, color: Colors.text.primary, padding: 0 },
  errorText: { fontSize: 9, fontWeight: '600', color: Colors.danger, marginTop: 2 },
  modalInput: {
    backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    padding: 12, color: Colors.text.primary, ...Typography.h3, textAlign: 'center',
  },
  modalSaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.lime, borderRadius: Radius.md, height: 48, marginTop: 12,
  },
  modalSaveBtnText: { ...Typography.bodyBold, color: Colors.white },
  modalCancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  modalCancelBtnText: { ...Typography.bodyBold, color: Colors.danger },

  // Goal Editor Pills
  goalPillsContainer: { gap: 6, marginBottom: 16 },
  goalPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: {
    flex: 1, minWidth: '28%', height: 38, borderRadius: Radius.pill, borderWidth: 1, borderColor: Colors.cardBorder,
    backgroundColor: Colors.card, alignItems: 'center', justifyContent: 'center',
  },
  goalPillActive: { borderColor: Colors.amber, backgroundColor: Colors.amber + '12' },
  goalPillText: { ...Typography.captionBold, color: Colors.muted },
  goalPillTextActive: { color: Colors.amber },
});
