import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { router } from 'expo-router';
import { useFitnessStore, useHydrationTracker } from '@/store/fitnessStore';
import { mlToOz, ozToMl } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';
import WaterCylinder from '@/components/charts/WaterCylinder';
import { useWaterLogger } from '@/hooks';

const { width: W } = Dimensions.get('window');

const QUICK_AMOUNTS = [150, 250, 500];

export default function WaterScreen() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const user = useFitnessStore((s) => s.user);
  const {
    waterLogs: log,
    addWaterLog: addWater,
    deleteWaterLog: handleDeleteLog,
    waterAvg: avgDay,
    waterBest: bestDay,
    waterStreak: streakVal,
  } = useHydrationTracker();

  const goalMl = user.waterGoal;

  const {
    isOz,
    showCustom, setShowCustom,
    customVal, setCustomVal,
    customError, setCustomError,
    showGoalModal, setShowGoalModal,
    tempGoalVal, setTempGoalVal,
    handleAddCustom,
    handleSaveGoal,
  } = useWaterLogger();

  // Dynamic Portions Calculations
  const totalMl = log.reduce((s, e) => s + e.ml, 0);
  const filled = Math.min(totalMl / goalMl, 1);
  const goalMet = totalMl >= goalMl;

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
        accentColor={colors.chart.water}
        showBack
        onBack={() => router.back()}
      />

      {/* Hero cylinder */}
      <GlassCard accentColor={colors.chart.water}>
        <View style={styles.heroSection}>
          <WaterCylinder filled={filled} />
          <View style={styles.heroText}>
            <Text style={styles.mlNum}>{isOz ? mlToOz(totalMl) : totalMl}<Text style={styles.mlUnit}>{isOz ? ' oz' : ' ml'}</Text></Text>
            <Text style={styles.mlGoal}>of {isOz ? mlToOz(goalMl) : goalMl} {isOz ? 'oz' : 'ml'} goal</Text>
            <View style={[styles.mlBadge, goalMet && styles.goalMetBadge]}>
              <Ionicons name={goalMet ? "trophy" : "water"} size={11} color={goalMet ? colors.amber : colors.chart.water} />
              <Text style={[styles.mlBadgeText, goalMet && styles.goalMetBadgeText]}>
                {goalMet ? 'Goal Achieved!' : `${Math.round(filled * 100)}% hydrated`}
              </Text>
            </View>
          </View>
        </View>

        {/* Goal met reward banner (Option A - Recommended) */}
        {goalMet && (
          <View style={styles.rewardBanner}>
            <Ionicons name="sparkles" size={16} color={colors.amber} />
            <Text style={styles.rewardText}>🎉 Daily Hydration Goal Achieved! Good job!</Text>
            <Ionicons name="sparkles" size={16} color={colors.amber} />
          </View>
        )}
      </GlassCard>

      {/* Quick add */}
      <GlassCard accentColor={colors.chart.water}>
        <SectionHeader title="Quick Add" accentColor={colors.chart.water} />
        <View style={styles.quickRow}>
          {(isOz ? [8, 12, 16] : [150, 250, 500]).map((amt) => {
            const mlValue = isOz ? ozToMl(amt) : amt;
            return (
              <TouchableOpacity
                key={amt}
                style={styles.quickBtn}
                onPress={() => { addWater(mlValue); triggerHaptic('selection'); }}
                activeOpacity={0.75}
              >
                <Ionicons name="water" size={20} color={colors.chart.water} />
                <Text style={styles.quickMl}>{amt} {isOz ? 'oz' : 'ml'}</Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            style={[styles.quickBtn, styles.customBtn]}
            onPress={() => {
              setCustomVal('');
              setCustomError('');
              triggerHaptic('selection');
              setShowCustom(true);
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={20} color={colors.muted} />
            <Text style={[styles.quickMl, { color: colors.muted }]}>Custom</Text>
          </TouchableOpacity>
        </View>
      </GlassCard>

      {/* Log history */}
      <GlassCard>
        <SectionHeader title="Today's Log" accentColor={colors.chart.water} />
        {log.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="water-outline" size={44} color={colors.muted} />
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
                    <Ionicons name="water" size={10} color={colors.chart.water} />
                    <Text style={styles.logPillText}>{isOz ? `${mlToOz(entry.ml)} oz` : `${entry.ml} ml`}</Text>
                  </View>
                  
                  {/* Delete button (Option A - Recommended) */}
                  <TouchableOpacity style={styles.deleteLogBtn} onPress={() => { handleDeleteLog(entry.id); triggerHaptic('selection'); }} activeOpacity={0.75}>
                    <Ionicons name="close-circle" size={16} color={colors.danger + '88'} />
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
          setTempGoalVal(isOz ? mlToOz(goalMl) : goalMl);
          triggerHaptic('selection');
          setShowGoalModal(true);
        }}
        activeOpacity={0.9}
      >
        <GlassCard accentColor={colors.chart.water}>
          <SectionHeader 
            title="Daily Goal Target" 
            accentColor={colors.chart.water}
            action="Change Target"
          />
          <View style={styles.goalRow}>
            <View style={styles.goalIconWrap}>
              <Ionicons name="trophy" size={20} color={colors.chart.water} />
            </View>
            <View style={styles.goalContent}>
              <Text style={styles.goalValue}>{isOz ? mlToOz(goalMl) : goalMl} {isOz ? 'oz' : 'ml'}</Text>
              <Text style={styles.goalRange}>Recommended: {isOz ? '70–100 oz' : '2,000–3,000 ml'}/day</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.chart.water} />
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Stats row connected to state */}
      <View style={styles.statsRow}>
        <StatBadge label="Streak" value={`${streakVal + (goalMet ? 1 : 0)}d 🔥`} color={colors.chart.water} />
        <StatBadge label="Best Day" value={isOz ? `${mlToOz(bestDay)} oz` : `${bestDay} ml`} color={colors.chart.water} />
        <StatBadge label="Avg/Day" value={isOz ? `${mlToOz(avgDay)} oz` : `${avgDay} ml`} color={colors.lime} />
      </View>

      {/* Reminder chip */}
      <TouchableOpacity style={styles.reminderChip} activeOpacity={0.8}>
        <View style={styles.reminderIconWrap}>
          <Ionicons name="alarm" size={18} color={colors.amber} />
        </View>
        <Text style={styles.reminderText}>Next reminder at 3:00 PM</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.amber} />
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
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Exact Value Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{isOz ? 'Fluid Ounces (oz)' : 'Milliliters (ml)'}</Text>
                <View style={[styles.inputFieldWrap, !!customError && styles.inputFieldError]}>
                  <Ionicons name="water-outline" size={16} color={colors.muted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    placeholder={isOz ? '8' : '250'}
                    placeholderTextColor={colors.muted}
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
                  const amt = parseInt(customVal, 10);
                  const minAmt = isOz ? 1 : 10;
                  const maxAmt = isOz ? 150 : 5000;
                  if (isNaN(amt) || amt <= minAmt || amt > maxAmt) {
                    setCustomError(`Enter amount between ${minAmt} and ${maxAmt} ${isOz ? 'oz' : 'ml'}`);
                    return;
                  }
                  const ml = isOz ? ozToMl(amt) : amt;
                  addWater(ml);
                  triggerHaptic('success');
                  setCustomVal('');
                  setShowCustom(false);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="water" size={16} color={colors.white} />
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
                  <Ionicons name="close" size={20} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              {/* Selection Pills Grid */}
              <View style={styles.goalPillsContainer}>
                <Text style={styles.inputLabel}>Quick Targets</Text>
                <View style={styles.goalPillsRow}>
                  {(isOz ? [50, 70, 85, 100, 120] : [1500, 2000, 2500, 3000, 3500]).map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.goalPill, tempGoalVal === g && styles.goalPillActive]}
                      onPress={() => { setTempGoalVal(g); triggerHaptic('selection'); }}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.goalPillText, tempGoalVal === g && styles.goalPillTextActive]}>{g} {isOz ? 'oz' : 'ml'}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Exact Custom goal input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Or Enter Precise Target ({isOz ? 'oz' : 'ml'})</Text>
                <View style={styles.inputFieldWrap}>
                  <Ionicons name="trophy-outline" size={16} color={colors.muted} style={styles.inputIcon} />
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
                {(() => {
                  const checkVal = isOz ? ozToMl(tempGoalVal) : tempGoalVal;
                  const isErr = (checkVal < 500 || checkVal > 10000) && tempGoalVal !== 0;
                  if (isErr) {
                    return (
                      <Text style={styles.errorText}>
                        {isOz ? 'Enter range between 17 and 338 oz' : 'Enter range between 500 and 10000 ml'}
                      </Text>
                    );
                  }
                  return null;
                })()}
              </View>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveGoal}
                disabled={(() => {
                  const val = isOz ? ozToMl(tempGoalVal) : tempGoalVal;
                  return val < 500 || val > 10000;
                })()}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={16} color={colors.white} />
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

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  heroSection: { flexDirection: 'row', alignItems: 'center', gap: 28, paddingVertical: 8, justifyContent: 'center' },
  heroText: { gap: 6 },
  mlNum: { ...Typography.hero, color: colors.chart.water },
  mlUnit: { ...Typography.h2, color: colors.chart.water },
  mlGoal: { ...Typography.caption, color: colors.muted },
  mlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.chart.water + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.chart.water + '40',
  },
  mlBadgeText: { ...Typography.captionBold, color: colors.chart.water },
  goalMetBadge: {
    backgroundColor: colors.amber + '18',
    borderColor: colors.amber + '40',
  },
  goalMetBadgeText: {
    color: colors.amber,
  },

  rewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.amber + '12',
    borderColor: colors.amber + '35',
    borderWidth: 1,
    padding: 10,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  rewardText: {
    ...Typography.captionBold,
    color: colors.amber,
  },

  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: colors.chart.water + '12',
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: colors.chart.water + '35',
    paddingVertical: 12,
  },
  customBtn: { backgroundColor: colors.card, borderColor: colors.cardBorder },
  quickMl: { ...Typography.captionBold, color: colors.text.primary },

  emptyState: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  emptyText: { ...Typography.body, color: colors.muted },

  logList: { gap: 0 },
  logEntry: { flexDirection: 'row', gap: 12, minHeight: 48 },
  logTimeline: { alignItems: 'center', width: 20 },
  logDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.chart.water, marginTop: 4 },
  logLine: { flex: 1, width: 1, backgroundColor: colors.cardBorder, marginTop: 4 },
  logInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 12 },
  logTime: { ...Typography.caption, color: colors.muted, width: 40 },
  logPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.chart.water + '18',
    borderRadius: Radius.pill,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.chart.water + '35',
  },
  logPillText: { ...Typography.captionBold, color: colors.chart.water },
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
    backgroundColor: colors.chart.water + '15',
    borderWidth: 1,
    borderColor: colors.chart.water + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalContent: { flex: 1, gap: 2 },
  goalValue: { ...Typography.h2, color: colors.chart.water },
  goalRange: { ...Typography.caption, color: colors.muted },

  statsRow: { flexDirection: 'row', gap: 8 },

  reminderChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.amberOverlay,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: colors.amber + '35',
    padding: 14,
  },
  reminderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.amber + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: { ...Typography.body, color: colors.text.primary, flex: 1 },

  // Modal styles
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28, 28, 30, 0.60)' },
  modalKeyboard: { flex: 1, justifyContent: 'flex-end', width: '100%' },
  modalSheet: {
    backgroundColor: colors.ivory, borderTopLeftRadius: Radius.lg, borderTopRightRadius: Radius.lg,
    paddingTop: 20, paddingHorizontal: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    minHeight: 400, maxHeight: '90%',
    borderTopWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderBottomWidth: 0,
    borderColor: colors.lime + '20',
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: colors.muted + '44', borderRadius: 2, marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  modalTitle: { ...Typography.h3, color: colors.text.primary },
  modalCloseBtn: {
    width: 32, height: 32, borderRadius: Radius.pill, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.cardBorder,
  },
  inputGroup: { gap: 6, marginBottom: 16 },
  inputLabel: { ...Typography.captionBold, color: colors.text.primary },
  inputFieldWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    paddingHorizontal: 12, height: 46,
  },
  inputFieldError: { borderColor: colors.danger, backgroundColor: colors.danger + '05' },
  inputIcon: { marginRight: 8 },
  textInput: { flex: 1, ...Typography.body, color: colors.text.primary, padding: 0 },
  errorText: { fontSize: 9, fontWeight: '600', color: colors.danger, marginTop: 2 },
  modalInput: {
    backgroundColor: colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    padding: 12, color: colors.text.primary, ...Typography.h3, textAlign: 'center',
  },
  modalSaveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.lime, borderRadius: Radius.md, height: 48, marginTop: 12,
  },
  modalSaveBtnText: { ...Typography.bodyBold, color: colors.white },
  modalCancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  modalCancelBtnText: { ...Typography.bodyBold, color: colors.danger },

  // Goal Editor Pills
  goalPillsContainer: { gap: 6, marginBottom: 16 },
  goalPillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalPill: {
    flex: 1, minWidth: '28%', height: 38, borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center',
  },
  goalPillActive: { borderColor: colors.amber, backgroundColor: colors.amber + '12' },
  goalPillText: { ...Typography.captionBold, color: colors.muted },
  goalPillTextActive: { color: colors.amber },
});
