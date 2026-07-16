import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import KeyboardSlideView from '@/components/ui/KeyboardSlideView';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import StatBadge from '@/components/ui/StatBadge';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import PillButton from '@/components/ui/PillButton';
import { Typography, Radius, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { router } from 'expo-router';
import { useWorkoutsScreen } from '@/features/workouts/hooks/useWorkoutsScreen';
import { triggerHaptic } from '@/utils/haptics';

const { width: W } = Dimensions.get('window');
const WORKOUT_COLOR = '#F43F5E'; // rose color for workout tracker

const WORKOUT_CATEGORIES = [
  { type: 'Full Body', icon: 'arm-flex', lib: 'MCI', color: '#10B981', desc: 'Total body conditioning & compound movements' },
  { type: 'Leg Day', icon: 'run', lib: 'MCI', color: '#3B82F6', desc: 'Quads, hamstrings, glutes & calves workout' },
  { type: 'Push Day', icon: 'weight-lifter', lib: 'MCI', color: '#8B5CF6', desc: 'Chest, shoulders & triceps exercises' },
  { type: 'Pull Day', icon: 'arrow-collapse-up', lib: 'MCI', color: '#EC4899', desc: 'Back, biceps & rear delts training' },
  { type: 'Cardio', icon: 'heart-pulse', lib: 'MCI', color: '#EF4444', desc: 'Aerobic fitness, running or cycling' },
  { type: 'Arms & Shoulders', icon: 'dumbbell', lib: 'MCI', color: '#F59E0B', desc: 'Biceps, triceps & shoulder sculpting' },
  { type: 'Core / Abs', icon: 'shield-half-full', lib: 'MCI', color: '#06B6D4', desc: 'Abdominals, obliques & lower back strength' },
  { type: 'Yoga & Stretch', icon: 'axis-arrow', lib: 'MCI', color: '#14B8A6', desc: 'Flexibility, balance & mind connection' }
];

export default function WorkoutsScreen() {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);
  const insets = useSafeAreaInsets();

  const {
    workoutLogs,
    workoutGoal,
    user,
    showAddModal,
    handleOpenAddModal,
    closeAddModal,
    selectedType,
    setSelectedType,
    durationInput,
    setDurationInput,
    intensity,
    setIntensity,
    notesInput,
    setNotesInput,
    durationHours,
    durationMins,
    handleManualTimeChange,
    isStopwatchMode,
    setIsStopwatchMode,
    stopwatchSeconds,
    setStopwatchSeconds,
    stopwatchRunning,
    setStopwatchRunning,
    stats,
    computedCaloriesPreview,
    handleSaveWorkout,
    handleDeleteWorkout,
  } = useWorkoutsScreen();

  const { totalWorkouts, currentWeekWorkouts, totalCaloriesBurned, avgWorkoutDuration } = stats;

  const setShowAddModal = (val: boolean) => {
    if (val) handleOpenAddModal();
    else closeAddModal();
  };

  const handleDeleteLog = (id: string) => {
    handleDeleteWorkout(id);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 }]}
      >
        {/* Header */}
        <View style={styles.screenHeaderWrap}>
          <ScreenHeader
            title="Gym & Workouts"
            subtitle="PUMP IRON & TRACK PROGRESS"
            icon={{ lib: 'MCI', name: 'dumbbell' }}
            accentColor={WORKOUT_COLOR}
            rightElement={
              <TouchableOpacity
                onPress={() => {
                  triggerHaptic('selection');
                  setShowAddModal(true);
                }}
                style={[styles.addBtn, { backgroundColor: WORKOUT_COLOR }]}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={22} color={colors.white} />
              </TouchableOpacity>
            }
          />
        </View>

        {/* Weekly Progress Rings / Stats Card */}
        <GlassCard style={styles.statsCard} accentColor={WORKOUT_COLOR}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text.primary }]}>Weekly Workout Goal</Text>
            <View style={[styles.badge, { backgroundColor: WORKOUT_COLOR + '20' }]}>
              <Text style={[styles.badgeText, { color: WORKOUT_COLOR }]}>
                {currentWeekWorkouts} / {workoutGoal} Days
              </Text>
            </View>
          </View>

          {/* Spacing and bar progress */}
          <View style={styles.goalProgressBg}>
            <View
              style={[
                styles.goalProgressBar,
                {
                  backgroundColor: WORKOUT_COLOR,
                  width: `${Math.min(100, Math.round((currentWeekWorkouts / workoutGoal) * 100))}%`,
                }
              ]}
            />
          </View>
          <Text style={[styles.cardSubText, { color: colors.muted }]}>
            {currentWeekWorkouts >= workoutGoal
              ? '🎉 Weekly goal achieved! Awesome dedication.'
              : `${workoutGoal - currentWeekWorkouts} more workout days left to meet your goal.`}
          </Text>

          {/* Grid Stats indicators */}
          <View style={styles.statGrid}>
            <StatBadge
              label="Workouts"
              value={`${totalWorkouts} logged`}
              color={colors.lime}
            />
            <StatBadge
              label="Burned"
              value={`${totalCaloriesBurned.toLocaleString()} kcal`}
              color={colors.amber}
            />
            <StatBadge
              label="Avg Time"
              value={`${avgWorkoutDuration} min`}
              color="#38BDF8"
            />
          </View>
        </GlassCard>

        {/* Quick Workout Templates */}
        <SectionHeader title="Workout Categories" accentColor={WORKOUT_COLOR} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll} contentContainerStyle={styles.templatesContent}>
          {WORKOUT_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              activeOpacity={0.8}
              onPress={() => {
                triggerHaptic('selection');
                setSelectedType(cat.type);
                setShowAddModal(true);
              }}
            >
              <View style={[styles.templateIconBox, { backgroundColor: cat.color + '15' }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={[styles.templateType, { color: colors.text.primary }]}>{cat.type}</Text>
              <Text style={[styles.templateDesc, { color: colors.muted }]}>{cat.desc}</Text>
              <Text style={[styles.templateQuickLog, { color: cat.color }]}>Log Session</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Workout History */}
        <SectionHeader title="Recent Workouts" accentColor={WORKOUT_COLOR} />
        {workoutLogs.length > 0 ? (
          workoutLogs.map((log) => {
            const cat = WORKOUT_CATEGORIES.find(c => c.type === log.type) || { icon: 'dumbbell', color: WORKOUT_COLOR };
            return (
              <GlassCard key={log.id} style={styles.historyCard}>
                <View style={styles.historyMainRow}>
                  <View style={[styles.historyIconBox, { backgroundColor: cat.color + '15' }]}>
                    <MaterialCommunityIcons name={cat.icon as any} size={22} color={cat.color} />
                  </View>

                  <View style={styles.historyDetails}>
                    <View style={styles.historyMetaRow}>
                      <Text style={[styles.historyTitle, { color: colors.text.primary }]}>{log.type}</Text>
                      <TouchableOpacity onPress={() => handleDeleteLog(log.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.historyDateTime, { color: colors.muted }]}>
                      {log.date} · {log.time}
                    </Text>

                    <View style={styles.historyStatsRow}>
                      <View style={styles.historyStatItem}>
                        <Ionicons name="time-outline" size={13} color={colors.muted} />
                        <Text style={[styles.historyStatTxt, { color: colors.text.secondary }]}>{log.durationMin} mins</Text>
                      </View>
                      <View style={styles.historyStatItem}>
                        <Ionicons name="flame-outline" size={13} color={colors.amber} />
                        <Text style={[styles.historyStatTxt, { color: colors.text.secondary }]}>{log.caloriesBurned} kcal</Text>
                      </View>
                      <View style={[styles.historyIntensityBadge, { backgroundColor: log.intensity === 'high' ? '#EF444420' : log.intensity === 'medium' ? '#F59E0B20' : '#10B98120' }]}>
                        <Text style={[styles.historyIntensityTxt, { color: log.intensity === 'high' ? '#EF4444' : log.intensity === 'medium' ? '#F59E0B' : '#10B981' }]}>
                          {log.intensity.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    {log.notes ? (
                      <View style={[styles.historyNotesWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                        <Text style={[styles.historyNotes, { color: colors.text.secondary }]}>{log.notes}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </GlassCard>
            );
          })
        ) : (
          <GlassCard style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={42} color={colors.muted} style={styles.emptyIcon} />
            <Text style={[styles.emptyTextTitle, { color: colors.text.primary }]}>No Workouts Yet</Text>
            <Text style={[styles.emptyTextSub, { color: colors.muted }]}>You haven't logged any workouts today. Log one to fill your rings!</Text>
          </GlassCard>
        )}
      </ScrollView>

      {/* Logging Bottom Sheet Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <KeyboardSlideView style={styles.modalOverlay}>
          <GlassCard style={styles.modalPane}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>Log Gym Workout</Text>
              <TouchableOpacity onPress={closeAddModal}>
                <Ionicons name="close-circle-outline" size={26} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
              {/* Type Select */}
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Select Workout Area</Text>
              <View style={styles.categoryPickerRow}>
                {WORKOUT_CATEGORIES.map((cat, i) => {
                  const isSelected = selectedType === cat.type;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.pickerItem,
                        {
                          backgroundColor: isSelected ? cat.color + '18' : 'transparent',
                          borderColor: isSelected ? cat.color : colors.cardBorder,
                        }
                      ]}
                      onPress={() => setSelectedType(cat.type)}
                    >
                      <MaterialCommunityIcons name={cat.icon as any} size={16} color={isSelected ? cat.color : colors.muted} />
                      <Text style={[styles.pickerItemText, { color: isSelected ? colors.text.primary : colors.muted }]}>{cat.type}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Mode Selector Tab */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabItem, !isStopwatchMode && styles.tabItemActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setIsStopwatchMode(false);
                  }}
                >
                  <Ionicons name="create-outline" size={15} color={!isStopwatchMode ? WORKOUT_COLOR : colors.muted} />
                  <Text style={[styles.tabLabel, { color: !isStopwatchMode ? colors.text.primary : colors.muted }]}>Manual Time</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabItem, isStopwatchMode && styles.tabItemActive]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setIsStopwatchMode(true);
                  }}
                >
                  <Ionicons name="stopwatch-outline" size={15} color={isStopwatchMode ? WORKOUT_COLOR : colors.muted} />
                  <Text style={[styles.tabLabel, { color: isStopwatchMode ? colors.text.primary : colors.muted }]}>Stopwatch</Text>
                </TouchableOpacity>
              </View>

              {!isStopwatchMode ? (
                /* Manual Hour and Minute Inputs */
                <View>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Duration</Text>
                  <View style={styles.durationRow}>
                    <View style={styles.durationInputBlock}>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder, textAlign: 'center' }]}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="0"
                        placeholderTextColor={colors.muted}
                        value={durationHours}
                        onChangeText={(val) => handleManualTimeChange(val, durationMins)}
                      />
                      <Text style={[styles.durationUnitText, { color: colors.muted }]}>Hours</Text>
                    </View>

                    <View style={styles.durationInputBlock}>
                      <TextInput
                        style={[styles.inputField, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder, textAlign: 'center' }]}
                        keyboardType="numeric"
                        maxLength={2}
                        placeholder="45"
                        placeholderTextColor={colors.muted}
                        value={durationMins}
                        onChangeText={(val) => handleManualTimeChange(durationHours, val)}
                      />
                      <Text style={[styles.durationUnitText, { color: colors.muted }]}>Minutes</Text>
                    </View>
                  </View>
                  <Text style={[styles.durationSummaryText, { color: colors.text.secondary }]}>
                    Total workout duration: <Text style={{ fontWeight: '800', color: WORKOUT_COLOR }}>{durationInput} min</Text>
                  </Text>
                </View>
              ) : (
                /* Live Stopwatch Interface */
                <View style={styles.stopwatchContainer}>
                  <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Stopwatch Timer</Text>
                  <View style={[styles.timerCircle, { borderColor: stopwatchRunning ? WORKOUT_COLOR : colors.cardBorder }]}>
                    <Text style={[styles.timerText, { color: colors.text.primary }]}>
                      {(() => {
                        const hrs = Math.floor(stopwatchSeconds / 3600);
                        const mins = Math.floor((stopwatchSeconds % 3600) / 60);
                        const secs = stopwatchSeconds % 60;
                        return `${hrs > 0 ? String(hrs).padStart(2, '0') + ':' : ''}${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
                      })()}
                    </Text>
                    <Text style={[styles.timerSubText, { color: colors.muted }]}>
                      {stopwatchRunning ? 'TICKING...' : 'PAUSED'}
                    </Text>
                  </View>

                  <View style={styles.stopwatchControls}>
                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic('selection');
                        setStopwatchSeconds(0);
                      }}
                      style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}
                    >
                      <Ionicons name="refresh" size={18} color={colors.text.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic('selection');
                        setStopwatchRunning(!stopwatchRunning);
                      }}
                      style={[styles.controlBtnPlay, { backgroundColor: stopwatchRunning ? '#EF4444' : WORKOUT_COLOR }]}
                    >
                      <Ionicons name={stopwatchRunning ? 'pause' : 'play'} size={24} color={colors.white} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        triggerHaptic('success');
                        setStopwatchRunning(false);
                        const minsValue = Math.max(1, Math.ceil(stopwatchSeconds / 60));
                        setDurationInput(minsValue.toString());
                        handleManualTimeChange(
                          Math.floor(minsValue / 60).toString(),
                          (minsValue % 60).toString()
                        );
                        setIsStopwatchMode(false);
                      }}
                      style={[styles.controlBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}
                    >
                      <Ionicons name="checkmark" size={18} color={colors.lime} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Intensity Picker */}
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Workout Intensity</Text>
              <View style={styles.intensityRow}>
                {(['low', 'medium', 'high'] as const).map((level) => {
                  const isSelected = intensity === level;
                  const btnColor = level === 'high' ? '#EF4444' : level === 'medium' ? '#F59E0B' : '#10B981';
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.intensityBtn,
                        {
                          backgroundColor: isSelected ? btnColor + '18' : 'transparent',
                          borderColor: isSelected ? btnColor : colors.cardBorder,
                        }
                      ]}
                      onPress={() => setIntensity(level)}
                    >
                      <Text style={[styles.intensityBtnText, { color: isSelected ? colors.text.primary : colors.muted }]}>
                        {level.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Notes Input */}
              <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Workout Notes / Exercises</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.textArea,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', color: colors.text.primary, borderColor: colors.cardBorder }
                ]}
                multiline
                numberOfLines={3}
                placeholder="Squats: 4x10 @ 60kg, Deadlifts: 3x8 @ 80kg..."
                placeholderTextColor={colors.muted}
                value={notesInput}
                onChangeText={setNotesInput}
              />

              {/* Action save button */}
              <View style={styles.saveBtnWrap}>
                <PillButton
                  label="Save Workout"
                  onPress={handleSaveWorkout}
                  color={WORKOUT_COLOR}
                  style={styles.saveBtn}
                />
              </View>
            </ScrollView>
          </GlassCard>
        </KeyboardSlideView>
      </Modal>
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20 },
  screenHeaderWrap: { marginBottom: 20 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  statsCard: {
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalProgressBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    marginVertical: 12,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: '100%',
    borderRadius: 4,
  },
  cardSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  templatesScroll: {
    marginHorizontal: -20,
    marginBottom: 24,
  },
  templatesContent: {
    paddingLeft: 20,
    paddingRight: 10,
    flexDirection: 'row',
    gap: 12,
  },
  templateCard: {
    width: 140,
    padding: 12,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
  },
  templateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  templateType: {
    fontSize: 12,
    fontWeight: '700',
  },
  templateDesc: {
    fontSize: 10,
    lineHeight: 13,
    height: 38,
  },
  templateQuickLog: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  historyCard: {
    marginBottom: 12,
  },
  historyMainRow: {
    flexDirection: 'row',
    gap: 12,
  },
  historyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDetails: {
    flex: 1,
  },
  historyMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  historyDateTime: {
    fontSize: 11,
    marginTop: 1,
  },
  historyStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  historyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  historyIntensityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  historyIntensityTxt: {
    fontSize: 9,
    fontWeight: '800',
  },
  historyNotesWrap: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  historyNotes: {
    fontSize: 11,
    lineHeight: 15,
  },
  emptyCard: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.6,
  },
  emptyTextTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyTextSub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalPane: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalForm: {
    maxHeight: 520,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerItemText: {
    fontSize: 11,
    fontWeight: '600',
  },
  inputField: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    height: 72,
    textAlignVertical: 'top',
  },
  intensityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  intensityBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  intensityBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  saveBtnWrap: {
    marginTop: 22,
    marginBottom: 24,
  },
  saveBtn: {
    width: '100%',
    backgroundColor: WORKOUT_COLOR,
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 8,
    borderRadius: Radius.md,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    padding: 3,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  tabItemActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  durationInputBlock: {
    flex: 1,
    gap: 4,
  },
  durationUnitText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  durationSummaryText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  stopwatchContainer: {
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
  },
  timerCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  timerText: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerSubText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 4,
  },
  stopwatchControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 6,
  },
  controlBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBtnPlay: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
