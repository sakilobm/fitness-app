/**
 * @component GoalCustomizer
 * @module Features/Quests/Components
 * @description Presentational modal sheet to customize step counters, water volume, calorie intakes, sleep targets, and active workouts.
 * 
 * @param {GoalCustomizerProps} props - (Inputs): Visual configuration properties, active input levels, callback change handlers, and save triggers.
 * @process (Internal Logic):
 *          - Performance: Wrapped in `React.memo` to skip Virtual DOM diffing unless active values or visibility change.
 *          - Resolves theme-adaptive layouts using dynamic styling matrices.
 * @returns {React.ReactElement} (Outputs): Smooth slide-up adjustment layout container.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/constants/theme';
import { triggerHaptic } from '@/utils/haptics';
import { ThemeColors } from '@/theme/tokens';

interface GoalCustomizerProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  stepsInput: number;
  setStepsInput: React.Dispatch<React.SetStateAction<number>>;
  waterInput: number;
  setWaterInput: React.Dispatch<React.SetStateAction<number>>;
  calorieInput: number;
  setCalorieInput: React.Dispatch<React.SetStateAction<number>>;
  sleepInput: number;
  setSleepInput: React.Dispatch<React.SetStateAction<number>>;
  workoutInput: number;
  setWorkoutInput: React.Dispatch<React.SetStateAction<number>>;
  exerciseInput: number;
  setExerciseInput: React.Dispatch<React.SetStateAction<number>>;
  goalsDurationInput: number;
  setGoalsDurationInput: React.Dispatch<React.SetStateAction<number>>;
  isOz: boolean;
}

const GoalCustomizer = React.memo<GoalCustomizerProps>(function GoalCustomizer({
  visible,
  onClose,
  onSave,
  stepsInput,
  setStepsInput,
  waterInput,
  setWaterInput,
  calorieInput,
  setCalorieInput,
  sleepInput,
  setSleepInput,
  workoutInput,
  setWorkoutInput,
  exerciseInput,
  setExerciseInput,
  goalsDurationInput,
  setGoalsDurationInput,
  isOz,
}) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <GlassCard style={styles.modalPane}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderTitleRow}>
              <Ionicons name="options-outline" size={20} color={colors.lime} />
              <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                Adjust Daily Goals
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle-outline" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.modalForm}>
            {/* 1. Steps Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#A3E63515' }]}>
                    <Ionicons name="footsteps" size={18} color="#A3E635" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Daily Steps
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#A3E635' }]}>
                  {stepsInput.toLocaleString()} steps
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setStepsInput((prev) => Math.max(1000, prev - 500));
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +150 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setStepsInput((prev) => Math.min(30000, prev + 500));
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. Water Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#38BDF815' }]}>
                    <Ionicons name="water" size={18} color="#38BDF8" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Hydration Target
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#38BDF8' }]}>
                  {waterInput} {isOz ? 'oz' : 'ml'}
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setWaterInput((prev) =>
                      Math.max(isOz ? 16 : 500, prev - (isOz ? 8 : 250))
                    );
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +100 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setWaterInput((prev) =>
                      Math.min(isOz ? 320 : 10000, prev + (isOz ? 8 : 250))
                    );
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 3. Calories Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#FB923C15' }]}>
                    <MaterialCommunityIcons name="food-apple" size={18} color="#FB923C" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Calorie Intake
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#FB923C' }]}>
                  {calorieInput.toLocaleString()} kcal
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setCalorieInput((prev) => Math.max(1000, prev - 100));
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +200 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setCalorieInput((prev) => Math.min(6000, prev + 100));
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Sleep Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#818CF815' }]}>
                    <Ionicons name="moon" size={18} color="#818CF8" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Sleep Duration
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#818CF8' }]}>
                  {sleepInput} hrs
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSleepInput((prev) => Math.max(4, prev - 0.5));
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +150 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSleepInput((prev) => Math.min(12, prev + 0.5));
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Daily Exercise Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#F43F5E15' }]}>
                    <Ionicons name="timer" size={18} color="#F43F5E" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Daily Exercise
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#F43F5E' }]}>
                  {exerciseInput} mins
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setExerciseInput((prev) => Math.max(5, prev - 5));
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +250 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setExerciseInput((prev) => Math.min(300, prev + 5));
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 6. Workouts Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#F43F5E15' }]}>
                    <MaterialCommunityIcons name="dumbbell" size={18} color="#F43F5E" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Weekly Workouts
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#F43F5E' }]}>
                  {workoutInput} days / wk
                </Text>
              </View>
              <View style={styles.adjustControls}>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setWorkoutInput((prev) => Math.max(1, prev - 1));
                  }}
                >
                  <Ionicons name="remove" size={18} color={colors.text.primary} />
                </TouchableOpacity>
                <View style={styles.adjustIndicator}>
                  <Text style={[styles.adjustSub, { color: colors.muted }]}>
                    XP Reward: +300 XP
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setWorkoutInput((prev) => Math.min(7, prev + 1));
                  }}
                >
                  <Ionicons name="add" size={18} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* 7. Commitment Duration Goal */}
            <View style={styles.goalEditCard}>
              <View style={styles.goalMetaRow}>
                <View style={styles.goalMetaLabelRow}>
                  <View style={[styles.goalIconBox, { backgroundColor: '#818CF815' }]}>
                    <Ionicons name="calendar-outline" size={18} color="#818CF8" />
                  </View>
                  <Text style={[styles.goalTitle, { color: colors.text.primary }]}>
                    Challenge Period
                  </Text>
                </View>
                <Text style={[styles.goalValue, { color: '#818CF8' }]}>
                  {goalsDurationInput === 0 ? 'Ongoing' : `${goalsDurationInput} Days`}
                </Text>
              </View>

              {/* Quick Pills for Duration */}
              <View style={styles.durationPillsRow}>
                {[
                  { label: 'Ongoing', value: 0 },
                  { label: '7 Days', value: 7 },
                  { label: '30 Days', value: 30 },
                  { label: 'Custom', value: -1 }
                ].map((dur) => {
                  const isCustomSelected = dur.value === -1 && goalsDurationInput !== 0 && goalsDurationInput !== 7 && goalsDurationInput !== 30;
                  const isSelected = dur.value === -1 ? isCustomSelected : goalsDurationInput === dur.value;
                  return (
                    <TouchableOpacity
                      key={dur.label}
                      style={[
                        styles.durationPill,
                        { borderColor: colors.cardBorder },
                        isSelected && { borderColor: colors.lime, backgroundColor: colors.lime + '15' }
                      ]}
                      onPress={() => {
                        triggerHaptic('selection');
                        if (dur.value === -1) {
                          setGoalsDurationInput(14); // Default custom value
                        } else {
                          setGoalsDurationInput(dur.value);
                        }
                      }}
                    >
                      <Text style={[
                        styles.durationPillText,
                        { color: colors.text.secondary },
                        isSelected && { color: colors.lime, fontWeight: '700' }
                      ]}>
                        {dur.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Custom Duration Adjuster */}
              {goalsDurationInput !== 0 && goalsDurationInput !== 7 && goalsDurationInput !== 30 && (
                <View style={styles.adjustControls}>
                  <TouchableOpacity
                    style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setGoalsDurationInput((prev) => Math.max(1, prev - 1));
                    }}
                  >
                    <Ionicons name="remove" size={18} color={colors.text.primary} />
                  </TouchableOpacity>
                  <View style={styles.adjustIndicator}>
                    <Text style={[styles.adjustSub, { color: colors.muted }]}>
                      Configure Target Days
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.adjustBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => {
                      triggerHaptic('selection');
                      setGoalsDurationInput((prev) => Math.min(365, prev + 1));
                    }}
                  >
                    <Ionicons name="add" size={18} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Save Button */}
            <View style={styles.modalSaveBtnWrap}>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.lime }]}
                activeOpacity={0.85}
                onPress={onSave}
              >
                <Ionicons name="checkmark-circle" size={18} color={isDark ? '#0D0F0E' : '#FFFFFF'} />
                <Text style={[styles.modalSaveBtnTxt, { color: isDark ? '#0D0F0E' : '#FFFFFF' }]}>Apply Goal Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </GlassCard>
      </View>
    </Modal>
  );
});

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalPane: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalForm: {
    marginBottom: 20,
  },
  goalEditCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(46, 125, 94, 0.04)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  goalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalMetaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  goalValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  adjustControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adjustBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(46, 125, 94, 0.05)',
  },
  adjustIndicator: {
    alignItems: 'center',
  },
  adjustSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  modalSaveBtnWrap: {
    marginTop: 8,
    marginBottom: 40,
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 16,
  },
  modalSaveBtnTxt: {
    fontSize: 14,
    fontWeight: '700',
  },
  durationPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  durationPill: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default GoalCustomizer;
