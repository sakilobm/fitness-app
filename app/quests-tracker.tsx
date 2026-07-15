/**
 * @route quests-tracker
 * @module App Router Entrypoint
 * @description Orchestration screen layout for the Daily Quests and custom challenges tracker.
 * 
 * @param {None} - Route mapping controller.
 * @process (Internal Logic):
 *          - Connects custom hooks to pull fully processed datasets.
 *          - Standardizes widget configurations into generic templates.
 * @returns {React.ReactElement} (Outputs): Parent Screen layout container.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Dimensions, Share, Alert, Modal, TextInput, KeyboardAvoidingView, Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import ProgressRing from '@/components/ui/ProgressRing';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { router } from 'expo-router';
import { useQuestTracker } from '@/features/quests/hooks/useQuestTracker';
import { triggerHaptic } from '@/utils/haptics';

const { width: W } = Dimensions.get('window');

export default function QuestsTrackerScreen() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  const {
    viewYear,
    viewMonth,
    selectedDate,
    setSelectedDate,
    handlePrevMonth,
    handleNextMonth,
    calDays,
    selectedDayInfo,
    monthStats,
    handleShareSummary,
    getQuestStatus,
    customQuests,
    getCustomQuestsForDate,
    addCustomQuest,
    updateCustomQuest,
    deleteCustomQuest,
    logCustomQuestProgress,
  } = useQuestTracker();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [questName, setQuestName] = useState('');
  const [questTarget, setQuestTarget] = useState('10');
  const [questUnit, setQuestUnit] = useState('reps');
  const [questDurationDays, setQuestDurationDays] = useState('7');
  const [selectedIcon, setSelectedIcon] = useState('trophy');
  const [selectedColor, setSelectedColor] = useState('#10B981');

  // Quick log progress state
  const [showLogModal, setShowLogModal] = useState(false);
  const [loggingQuest, setLoggingQuest] = useState<any | null>(null);
  const [logAmount, setLogAmount] = useState('5');

  const customQuestsForSelectedDate = useMemo(() => {
    return getCustomQuestsForDate(selectedDate);
  }, [selectedDate, getCustomQuestsForDate]);

  const handleCreateOrUpdateQuest = () => {
    const targetVal = parseFloat(questTarget);
    const durationDaysVal = parseInt(questDurationDays, 10);
    if (!questName.trim()) {
      Alert.alert('Required Fields', 'Please enter a quest name.');
      return;
    }
    if (isNaN(targetVal) || targetVal <= 0) {
      Alert.alert('Invalid Target', 'Please enter a valid target number.');
      return;
    }
    if (isNaN(durationDaysVal) || durationDaysVal < 0) {
      Alert.alert('Invalid Duration', 'Please enter a duration greater than or equal to 0.');
      return;
    }

    triggerHaptic('success');
    if (editingQuestId) {
      updateCustomQuest(editingQuestId, {
        name: questName.trim(),
        target: targetVal,
        unit: questUnit.trim(),
        durationDays: durationDaysVal,
        icon: selectedIcon,
        color: selectedColor,
      });
      Alert.alert('Challenge Updated', 'Your custom challenge was successfully modified.');
    } else {
      addCustomQuest({
        name: questName.trim(),
        target: targetVal,
        unit: questUnit.trim(),
        durationDays: durationDaysVal,
        startDate: selectedDate, // Start date defaults to currently selected calendar day
        icon: selectedIcon,
        color: selectedColor,
      });
      Alert.alert('Challenge Created', 'Your custom challenge was successfully started for this date.');
    }
    setShowCreateModal(false);
  };

  const handleDeleteQuestLocal = (id: string) => {
    triggerHaptic('warning');
    Alert.alert(
      'Delete Challenge',
      'Are you sure you want to delete this custom challenge? All logged progress history will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            triggerHaptic('success');
            deleteCustomQuest(id);
            setShowCreateModal(false);
          }
        }
      ]
    );
  };

  const handleLogProgressLocal = () => {
    const amountVal = parseFloat(logAmount);
    if (isNaN(amountVal) || !loggingQuest) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }
    triggerHaptic('success');
    // Log absolute progress value = current progress + logged amount
    const currentProgress = loggingQuest.progress || 0;
    const newProgress = Math.max(0, currentProgress + amountVal);
    logCustomQuestProgress(loggingQuest.id, selectedDate, newProgress);
    setShowLogModal(false);
    setLoggingQuest(null);
  };

  const handleToggleComplete = (quest: any) => {
    triggerHaptic('success');
    const isCompleted = quest.progress >= quest.target;
    const newProgress = isCompleted ? 0 : quest.target;
    logCustomQuestProgress(quest.id, selectedDate, newProgress);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }, [today]);

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top }]}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <ScreenHeader
          title="Quest Calendar"
          accentColor={colors.lime}
          showBack
          onBack={() => router.back()}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* ── Calendar Controller Header ───────────────────────────────────── */}
        <View style={styles.calendarControlRow}>
          <TouchableOpacity style={styles.arrowButton} onPress={handlePrevMonth}>
            <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.calendarTitleTxt}>
            {monthNames[viewMonth]} {viewYear}
          </Text>
          <TouchableOpacity style={styles.arrowButton} onPress={handleNextMonth}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Calendar Grid ─────────────────────────────────────────────────── */}
        <GlassCard style={styles.calendarCard}>
          {/* Weekday Labels */}
          <View style={styles.weekdayLabelsRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, idx) => (
              <Text key={idx} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          {/* Grid Cells */}
          <View style={styles.calendarGrid}>
            {calDays.map((dayDate, idx) => {
              if (!dayDate) {
                return <View key={`empty-${idx}`} style={styles.dayCellDummy} />;
              }

              const status = getQuestStatus(dayDate);
              const isSelected = selectedDate === dayDate;
              const isToday = todayStr === dayDate;
              const dayNum = parseInt(dayDate.split('-')[2], 10);

              // Colors based on completion count
              let ringColor = 'rgba(0,0,0,0.06)';
              if (status.completedCount === 5) {
                ringColor = colors.lime;
              } else if (status.completedCount >= 3) {
                ringColor = '#38BDF8';
              } else if (status.completedCount >= 1) {
                ringColor = '#FB923C';
              }

              return (
                <TouchableOpacity
                  key={dayDate}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && styles.dayCellToday
                  ]}
                  onPress={() => {
                    triggerHaptic('selection');
                    setSelectedDate(dayDate);
                  }}
                >
                  <Text style={[
                    styles.dayCellText,
                    isSelected && styles.dayCellTextSelected,
                    isToday && { color: colors.lime, fontWeight: '800' }
                  ]}>
                    {dayNum}
                  </Text>

                  {/* Quest Completion Dots */}
                  <View style={styles.dotsIndicatorWrap}>
                    {status.completedCount === 5 ? (
                      <Ionicons name="trophy" size={10} color={colors.lime} />
                    ) : (
                      <View style={[styles.progressDotCircle, { backgroundColor: ringColor }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </GlassCard>

        {/* ── Selected Day Focus Card ────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quest Breakdown</Text>
          <Text style={styles.dateLabelBadge}>{selectedDate === todayStr ? 'Today' : selectedDate}</Text>
        </View>

        <GlassCard style={styles.breakdownCard}>
          <View style={styles.breakdownHeaderRow}>
            <View style={styles.completionScoreBox}>
              <Text style={styles.completionScoreVal}>{selectedDayInfo.completedCount}/5</Text>
              <Text style={styles.completionScoreLbl}>Done</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.breakdownCardTitle}>
                {selectedDayInfo.completedCount === 5 ? 'Perfect Day Achieved! 🌟' : 'Daily Quest Progress'}
              </Text>
              <Text style={styles.breakdownCardSub}>
                {selectedDayInfo.completedCount === 5
                  ? 'All 5 targets fully completed. You earned a total of +1,000 XP!'
                  : `Complete remaining targets to unlock additional XP rewards.`}
              </Text>
            </View>
          </View>

          {/* List of individual quests */}
          <View style={styles.questsList}>
            {selectedDayInfo.quests.map((quest) => {
              const progressPct = Math.round(Math.min(100, (quest.progress / quest.target) * 100));
              return (
                <View key={quest.id} style={styles.questItemRow}>
                  <View style={[styles.questIconBox, { backgroundColor: quest.color + '15' }]}>
                    <Ionicons name={quest.icon as any} size={16} color={quest.color} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={styles.questMetaRow}>
                      <Text style={styles.questName}>{quest.name}</Text>
                      <Text style={styles.questProgressText}>
                        {quest.progress.toLocaleString()} / {quest.target.toLocaleString()} {quest.unit}
                      </Text>
                    </View>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { backgroundColor: quest.color, width: `${progressPct}%` }]} />
                    </View>
                  </View>
                  <View style={styles.checkboxArea}>
                    {quest.completed ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.lime} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={20} color={colors.muted} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* ── Custom Challenges Section ───────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Custom Challenges</Text>
          <TouchableOpacity
            style={styles.addChallengeBtn}
            activeOpacity={0.8}
            onPress={() => {
              triggerHaptic('selection');
              setEditingQuestId(null);
              setQuestName('');
              setQuestTarget('10');
              setQuestUnit('reps');
              setQuestDurationDays('7');
              setSelectedIcon('trophy');
              setSelectedColor('#10B981');
              setShowCreateModal(true);
            }}
          >
            <Ionicons name="add" size={14} color={colors.lime} />
            <Text style={styles.addChallengeBtnTxt}>Create</Text>
          </TouchableOpacity>
        </View>

        {customQuestsForSelectedDate.length === 0 ? (
          <GlassCard style={styles.emptyCustomQuestsCard}>
            <Ionicons name="calendar-outline" size={24} color={colors.muted} style={{ marginBottom: 4 }} />
            <Text style={styles.emptyCustomQuestsTxt}>No active custom challenges for this day.</Text>
            <Text style={styles.emptyCustomQuestsSub}>Tap "Create" to set up custom daily targets.</Text>
          </GlassCard>
        ) : (
          <View style={styles.customQuestsList}>
            {customQuestsForSelectedDate.map((quest) => {
              const progressPct = Math.round(Math.min(100, (quest.progress / quest.target) * 100));
              const isCompleted = quest.progress >= quest.target;
              return (
                <GlassCard key={quest.id} style={styles.customQuestItemCard}>
                  <TouchableOpacity
                    style={styles.customQuestItemPressable}
                    activeOpacity={0.7}
                    onPress={() => {
                      triggerHaptic('selection');
                      setEditingQuestId(quest.id);
                      setQuestName(quest.name);
                      setQuestTarget(quest.target.toString());
                      setQuestUnit(quest.unit);
                      setQuestDurationDays(quest.durationDays.toString());
                      setSelectedIcon(quest.icon);
                      setSelectedColor(quest.color);
                      setShowCreateModal(true);
                    }}
                  >
                    <View style={[styles.questIconBox, { backgroundColor: quest.color + '15' }]}>
                      <Ionicons name={quest.icon as any} size={16} color={quest.color} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.questMetaRow}>
                        <Text style={styles.questName}>{quest.name}</Text>
                        <Text style={styles.questProgressText}>
                          {quest.progress} / {quest.target} {quest.unit}
                        </Text>
                      </View>
                      <View style={styles.barBg}>
                        <View style={[styles.barFill, { backgroundColor: quest.color, width: `${progressPct}%` }]} />
                      </View>
                      {quest.durationDays > 0 && (
                        <Text style={styles.durationDaysLabel}>
                          Runs for {quest.durationDays} days · Start: {quest.startDate}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Actions column */}
                  <View style={styles.customQuestActionCol}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={styles.quickLogIncrementBtn}
                      onPress={() => {
                        triggerHaptic('selection');
                        setLoggingQuest(quest);
                        setLogAmount('1');
                        setShowLogModal(true);
                      }}
                    >
                      <Ionicons name="add-circle" size={24} color={quest.color} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.checkboxArea}
                      onPress={() => handleToggleComplete(quest)}
                    >
                      {isCompleted ? (
                        <Ionicons name="checkmark-circle" size={24} color={colors.lime} />
                      ) : (
                        <Ionicons name="ellipse-outline" size={24} color={colors.muted} />
                      )}
                    </TouchableOpacity>
                  </View>
                </GlassCard>
              );
            })}
          </View>
        )}

        {/* ── Monthly Overview Statistics ──────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{monthNames[viewMonth]} Stats</Text>
        </View>

        <View style={styles.statsCardGrid}>
          <GlassCard style={styles.statMiniCard}>
            <ProgressRing size={60} strokeWidth={6} progress={monthStats.completionRate / 100} color={colors.lime}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text.primary }}>
                {monthStats.completionRate}%
              </Text>
            </ProgressRing>
            <Text style={styles.statMiniTitle}>Completion Rate</Text>
          </GlassCard>

          <GlassCard style={styles.statMiniCard}>
            <View style={[styles.circleBadgeBox, { backgroundColor: colors.lime + '15' }]}>
              <Ionicons name="trophy" size={22} color={colors.lime} />
            </View>
            <Text style={styles.statMiniValue}>{monthStats.perfectDays} Days</Text>
            <Text style={styles.statMiniTitle}>Perfect Days</Text>
          </GlassCard>
        </View>

        {/* Category Breakdown list */}
        <GlassCard style={styles.categoryStatsCard}>
          <Text style={styles.cardHeaderTitle}>Category Achievements</Text>
          <Text style={styles.cardHeaderSub}>Number of days you reached the daily goal this month:</Text>

          <View style={styles.categoryProgressLines}>
            {[
              { label: 'Steps Challenge', count: monthStats.questBreakdown.steps, color: '#6366F1' },
              { label: 'Hydration Target', count: monthStats.questBreakdown.water, color: '#38BDF8' },
              { label: 'Calorie Target', count: monthStats.questBreakdown.calories, color: '#FB923C' },
              { label: 'Sleep Target', count: monthStats.questBreakdown.sleep, color: '#818CF8' },
              { label: 'Workout Target', count: monthStats.questBreakdown.workouts, color: '#F43F5E' }
            ].map((cat, idx) => {
              const maxDays = monthStats.totalDays || 30;
              const pct = Math.round((cat.count / maxDays) * 100);
              return (
                <View key={idx} style={styles.catStatRow}>
                  <View style={styles.catStatLabelRow}>
                    <Text style={styles.catStatLabel}>{cat.label}</Text>
                    <Text style={styles.catStatCount}>{cat.count} / {maxDays} days</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.barFill, { backgroundColor: cat.color, width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </GlassCard>

        {/* Export / Share CTA */}
        <TouchableOpacity style={styles.shareButton} activeOpacity={0.8} onPress={handleShareSummary}>
          <Ionicons name="share-social" size={16} color="#FFF" style={{ marginRight: 6 }} />
          <Text style={styles.shareButtonTxt}>Share Monthly Quest Report</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Create / Edit Custom Challenge Modal ── */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => setShowCreateModal(false)}
          />
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>
                {editingQuestId ? 'Edit Challenge' : 'New Daily Challenge'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalInputLabel}>Challenge Name</Text>
              <TextInput
                style={[styles.modalTextInput, { color: colors.text.primary, borderColor: colors.cardBorder }]}
                placeholder="e.g. Pushups, 5K Run, Read Book"
                placeholderTextColor={colors.muted}
                value={questName}
                onChangeText={setQuestName}
              />

              <View style={styles.modalDoubleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalInputLabel}>Daily Target</Text>
                  <TextInput
                    style={[styles.modalTextInput, { color: colors.text.primary, borderColor: colors.cardBorder }]}
                    keyboardType="numeric"
                    placeholder="e.g. 50"
                    placeholderTextColor={colors.muted}
                    value={questTarget}
                    onChangeText={setQuestTarget}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalInputLabel}>Unit</Text>
                  <TextInput
                    style={[styles.modalTextInput, { color: colors.text.primary, borderColor: colors.cardBorder }]}
                    placeholder="e.g. reps, mins, km"
                    placeholderTextColor={colors.muted}
                    value={questUnit}
                    onChangeText={setQuestUnit}
                  />
                </View>
              </View>

              <Text style={styles.modalInputLabel}>Duration (Days · Set 0 for ongoing)</Text>
              <TextInput
                style={[styles.modalTextInput, { color: colors.text.primary, borderColor: colors.cardBorder }]}
                keyboardType="numeric"
                placeholder="e.g. 7 or 30 (0 for indefinite)"
                placeholderTextColor={colors.muted}
                value={questDurationDays}
                onChangeText={setQuestDurationDays}
              />

              {/* Icon Selector */}
              <Text style={styles.modalInputLabel}>Select Icon</Text>
              <View style={styles.iconSelectionGrid}>
                {['trophy', 'dumbbell', 'walk', 'heart', 'water', 'flash', 'bookmarks', 'medical', 'fitness'].map((iconName) => {
                  const isSelected = selectedIcon === iconName;
                  return (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconSelectionBox,
                        { borderColor: colors.cardBorder },
                        isSelected && { borderColor: colors.lime, backgroundColor: colors.lime + '15' }
                      ]}
                      onPress={() => setSelectedIcon(iconName)}
                    >
                      <Ionicons name={iconName as any} size={20} color={isSelected ? colors.lime : colors.text.secondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Color Selector */}
              <Text style={styles.modalInputLabel}>Select Color</Text>
              <View style={styles.colorSelectionGrid}>
                {['#6366F1', '#38BDF8', '#FB923C', '#818CF8', '#F43F5E', '#10B981', '#F59E0B'].map((colorCode) => {
                  const isSelected = selectedColor === colorCode;
                  return (
                    <TouchableOpacity
                      key={colorCode}
                      style={[
                        styles.colorSelectionCircle,
                        { backgroundColor: colorCode },
                        isSelected && { borderWidth: 3, borderColor: isDark ? '#FFFFFF' : '#000000' }
                      ]}
                      onPress={() => setSelectedColor(colorCode)}
                    />
                  );
                })}
              </View>

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Text style={[styles.modalBtnText, { color: colors.text.primary }]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalSaveBtn, { backgroundColor: colors.lime }]}
                  onPress={handleCreateOrUpdateQuest}
                >
                  <Text style={[styles.modalBtnText, { color: '#000000', fontWeight: '800' }]}>
                    {editingQuestId ? 'Update' : 'Start'}
                  </Text>
                </TouchableOpacity>
              </View>

              {editingQuestId && (
                <TouchableOpacity
                  style={styles.modalDeleteBtn}
                  onPress={() => handleDeleteQuestLocal(editingQuestId)}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  <Text style={styles.modalDeleteBtnText}>Delete Challenge</Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Log Progress Modal ── */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowLogModal(false);
          setLoggingQuest(null);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={styles.modalBackdropPressable}
            activeOpacity={1}
            onPress={() => {
              setShowLogModal(false);
              setLoggingQuest(null);
            }}
          />
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitleText}>Log Progress</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowLogModal(false);
                  setLoggingQuest(null);
                }}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {loggingQuest && (
              <View style={styles.modalLogContent}>
                <Text style={styles.modalLogQuestName}>{loggingQuest.name}</Text>
                <Text style={styles.modalLogQuestSub}>
                  Current: {loggingQuest.progress} / {loggingQuest.target} {loggingQuest.unit}
                </Text>

                <Text style={styles.modalInputLabel}>Log Progress Amount</Text>
                <TextInput
                  style={[styles.modalTextInput, { color: colors.text.primary, borderColor: colors.cardBorder, textAlign: 'center', fontSize: 18 }]}
                  keyboardType="numeric"
                  placeholder="e.g. 5"
                  placeholderTextColor={colors.muted}
                  value={logAmount}
                  onChangeText={setLogAmount}
                  autoFocus
                />

                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => {
                      setShowLogModal(false);
                      setLoggingQuest(null);
                    }}
                  >
                    <Text style={[styles.modalBtnText, { color: colors.text.primary }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, styles.modalSaveBtn, { backgroundColor: loggingQuest.color }]}
                    onPress={handleLogProgressLocal}
                  >
                    <Text style={[styles.modalBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>Save Logs</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const getStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 16,
  },
  calendarControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  arrowButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
  },
  calendarTitleTxt: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  calendarCard: {
    padding: 16,
  },
  weekdayLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: (W - 72) / 7,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
  },
  dayCellDummy: {
    width: (W - 72) / 7,
    height: 48,
  },
  dayCell: {
    width: (W - 72) / 7,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayCellSelected: {
    borderColor: colors.lime,
    backgroundColor: colors.lime + '15',
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: colors.muted + '40',
  },
  dayCellText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dayCellTextSelected: {
    color: colors.lime,
    fontWeight: '700',
  },
  dotsIndicatorWrap: {
    marginTop: 2,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotCircle: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  dateLabelBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.lime,
    backgroundColor: colors.lime + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  breakdownCard: {
    padding: 16,
    gap: 16,
  },
  breakdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  completionScoreBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionScoreVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text.primary,
  },
  completionScoreLbl: {
    fontSize: 8,
    fontWeight: '600',
    color: colors.muted,
    textTransform: 'uppercase',
  },
  breakdownCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  breakdownCardSub: {
    fontSize: 11,
    color: colors.muted,
    lineHeight: 14,
  },
  questsList: {
    gap: 12,
  },
  questItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.primary,
  },
  questProgressText: {
    fontSize: 11,
    color: colors.muted,
    fontWeight: '600',
  },
  barBg: {
    height: 5,
    borderRadius: 2.5,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2.5,
  },
  checkboxArea: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsCardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statMiniCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  circleBadgeBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statMiniValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
  statMiniTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.muted,
  },
  categoryStatsCard: {
    padding: 16,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  cardHeaderSub: {
    fontSize: 11,
    color: colors.muted,
    marginBottom: 16,
    marginTop: 2,
  },
  categoryProgressLines: {
    gap: 12,
  },
  catStatRow: {
    gap: 6,
  },
  catStatLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catStatLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  catStatCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  shareButton: {
    backgroundColor: colors.lime,
    paddingVertical: 14,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  shareButtonTxt: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addChallengeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.lime + '30',
    backgroundColor: colors.lime + '10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addChallengeBtnTxt: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.lime,
  },
  emptyCustomQuestsCard: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  emptyCustomQuestsTxt: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  emptyCustomQuestsSub: {
    fontSize: 10,
    color: colors.muted,
    textAlign: 'center',
  },
  customQuestsList: {
    gap: 12,
  },
  customQuestItemCard: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customQuestItemPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  customQuestActionCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quickLogIncrementBtn: {
    padding: 4,
  },
  durationDaysLabel: {
    fontSize: 9,
    color: colors.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBackdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollContent: {
    gap: 16,
    paddingBottom: 40,
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
    marginBottom: 6,
  },
  modalTextInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 14,
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  },
  modalDoubleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconSelectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconSelectionBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  colorSelectionGrid: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  colorSelectionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  modalSaveBtn: {
    // Background color determined dynamically
  },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalDeleteBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 12,
  },
  modalDeleteBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  modalLogContent: {
    gap: 16,
    paddingBottom: 24,
  },
  modalLogQuestName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
    textAlign: 'center',
  },
  modalLogQuestSub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
});
