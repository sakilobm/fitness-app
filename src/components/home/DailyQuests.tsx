import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { FontAwesome6, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/constants/theme';
import GlassCard from '../ui/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { router } from 'expo-router';
import { useQuestList } from '@/features/quests/hooks/useQuestList';
import QuestItem from '@/features/quests/components/QuestItem';
import GoalCustomizer from '@/features/quests/components/GoalCustomizer';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DailyQuests() {
  const { colors } = useTheme();
  const {
    quests,
    activeQuests,
    completedQuests,
    completedExpanded,
    toggleCompletedSection,
    showGoalsModal,
    openGoalsModal,
    closeGoalsModal,
    handleSaveGoals,
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
    isOz,
  } = useQuestList();

  const handleToggleCompleted = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    toggleCompletedSection();
  };

  return (
    <View style={st.container}>
      <View style={st.sectionHeader}>
        <View style={st.headerMainRow}>
          <View style={st.headerTitleRow}>
            <Text style={[st.sectionTitle, { color: colors.text.primary }]}>Daily Quests</Text>
            <View style={[st.badge, { backgroundColor: colors.lime + '20' }]}>
              <Text style={[st.badgeText, { color: colors.lime }]}>
                {completedQuests.length} / {quests.length} Done
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={[st.editGoalsShortcut, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '35' }]}
              activeOpacity={0.85}
              onPress={() => { triggerHaptic('selection'); router.push('/quests-tracker'); }}
            >
              <Ionicons name="calendar-outline" size={13} color={colors.lime} style={{ marginRight: 2 }} />
              <Text style={[st.editGoalsText, { color: colors.lime }]}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[st.editGoalsShortcut, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '35' }]}
              activeOpacity={0.85}
              onPress={openGoalsModal}
            >
              {/* <Ionicons name="options-outline" size={13} color={colors.lime} style={{ marginRight: 2 }} /> */}
              <FontAwesome6 name="edit" size={13} color={colors.lime} style={{ marginRight: 2 }} />
              <Text style={[st.editGoalsText, { color: colors.lime }]}>Adjust Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={[st.sectionSubtitle, { color: colors.muted }]}>Hit your goals to level up and earn XP</Text>
      </View>

      {/* ── Active Quests ─────────────────────────────────────────────────── */}
      {activeQuests.length > 0 ? (
        activeQuests.map((quest) => (
          <QuestItem key={quest.id} quest={quest} />
        ))
      ) : (
        /* Celebration when all quests are complete */
        <GlassCard style={st.celebrationCard} accentColor={colors.lime}>
          <View style={st.celebrationContent}>
            <View style={[st.celebrationIconBox, { backgroundColor: colors.lime + '15' }]}>
              <Ionicons name="trophy" size={28} color={colors.lime} />
            </View>
            <View style={st.celebrationText}>
              <Text style={[st.celebrationTitle, { color: colors.text.primary }]}>All Quests Finished! 🎉</Text>
              <Text style={[st.celebrationSub, { color: colors.muted }]}>You reached every single goal today. Keep it up!</Text>
            </View>
          </View>
        </GlassCard>
      )}

      {/* ── Completed Quests Drawer ────────────────────────────────────────── */}
      {completedQuests.length > 0 && (
        <View style={st.completedSection}>
          <TouchableOpacity
            style={[st.completedHeader, { borderColor: colors.cardBorder }]}
            activeOpacity={0.8}
            onPress={handleToggleCompleted}
          >
            <View style={st.completedTitleRow}>
              <Ionicons name="checkmark-done-circle" size={18} color={colors.lime} />
              <Text style={[st.completedHeaderTxt, { color: colors.text.secondary }]}>
                Completed Quests ({completedQuests.length})
              </Text>
            </View>
            <Ionicons
              name={completedExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.muted}
            />
          </TouchableOpacity>

          {completedExpanded && (
            <View style={st.completedList}>
              {completedQuests.map((quest) => (
                <View key={quest.id} style={[st.completedRow, { borderColor: colors.cardBorder }]}>
                  <View style={st.completedInfo}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.lime} style={st.checkIcon} />
                    <Text style={[st.completedTitle, { color: colors.muted }]}>{quest.title}</Text>
                  </View>
                  <Text style={[st.completedProgress, { color: colors.lime }]}>{quest.subtext} (100%)</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* ── Goal Customizer Bottom Sheet Modal ── */}
      <GoalCustomizer
        visible={showGoalsModal}
        onClose={closeGoalsModal}
        onSave={handleSaveGoals}
        stepsInput={stepsInput}
        setStepsInput={setStepsInput}
        waterInput={waterInput}
        setWaterInput={setWaterInput}
        calorieInput={calorieInput}
        setCalorieInput={setCalorieInput}
        sleepInput={sleepInput}
        setSleepInput={setSleepInput}
        workoutInput={workoutInput}
        setWorkoutInput={setWorkoutInput}
        exerciseInput={exerciseInput}
        setExerciseInput={setExerciseInput}
        isOz={isOz}
      />
    </View>
  );
}

const st = StyleSheet.create({
  container: {
    marginHorizontal: 0,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  headerMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editGoalsShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editGoalsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  celebrationCard: {
    marginBottom: 12,
  },
  celebrationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  celebrationIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationText: {
    flex: 1,
    gap: 2,
  },
  celebrationTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  celebrationSub: {
    fontSize: 12,
  },
  completedSection: {
    marginTop: 4,
  },
  completedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  completedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedHeaderTxt: {
    fontSize: 13,
    fontWeight: '600',
  },
  completedList: {
    paddingTop: 4,
    gap: 4,
  },
  completedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    marginRight: 2,
  },
  completedTitle: {
    fontSize: 13,
    textDecorationLine: 'line-through',
  },
  completedProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
});
