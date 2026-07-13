import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFitnessStore } from '@/store/fitnessStore';
import { useTheme } from '@/constants/theme';
import GlassCard from '../ui/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { mlToOz, ozToMl } from '@/utils/units';
import { router } from 'expo-router';

// Enable layout animations for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface QuestItem {
  id: string;
  title: string;
  subtext: string;
  icon: string;
  iconLib: 'Ionicons' | 'MCI';
  color: string;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
  actions: { label: string; amount: number }[];
  onQuickLog: (amount: number) => void;
  onCompleteRemaining: () => void;
  onPress: () => void;
}

export default function DailyQuests() {
  const { colors, isDark } = useTheme();
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const {
    user,
    meals,
    waterLogs,
    stepsCount,
    activeMinutes,
    sleepLogs,
    addWaterLog,
    addSteps,
    addFoodToMeal,
    addSleepLog,
    addActiveMinutes,
  } = useFitnessStore();

  const isOz = user.volumeUnit === 'oz';
  const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Derived state values
  const totalWaterMl = useMemo(
    () => waterLogs.reduce((sum, w) => sum + w.ml, 0),
    [waterLogs]
  );

  const nutritionKcal = useMemo(() => {
    let kcal = 0;
    for (const m of meals) {
      for (const item of m.items) {
        kcal += item.kcal;
      }
    }
    return kcal;
  }, [meals]);

  const todaySleepMin = useMemo(() => {
    const todaySleep = sleepLogs.find(l => l.date === todayISO);
    return todaySleep ? todaySleep.totalMin : 0;
  }, [sleepLogs, todayISO]);

  // Quests configuration mapping
  const quests: QuestItem[] = useMemo(() => {
    const list: QuestItem[] = [];

    // 1. Water Intake
    const waterTarget = isOz ? Math.round(mlToOz(user.waterGoal)) : user.waterGoal;
    const waterProgress = isOz ? Math.round(mlToOz(totalWaterMl)) : totalWaterMl;
    list.push({
      id: 'water',
      title: 'Stay Hydrated',
      subtext: isOz ? `${waterProgress} / ${waterTarget} oz` : `${(waterProgress / 1000).toFixed(1)} / ${(waterTarget / 1000).toFixed(1)} L`,
      icon: 'water',
      iconLib: 'Ionicons',
      color: '#38BDF8', // light blue
      progress: waterProgress,
      target: waterTarget,
      unit: isOz ? 'oz' : 'ml',
      completed: totalWaterMl >= user.waterGoal,
      actions: isOz
        ? [{ label: '+8oz', amount: 8 }, { label: '+16oz', amount: 16 }, { label: '+24oz', amount: 24 }]
        : [{ label: '+250ml', amount: 250 }, { label: '+500ml', amount: 500 }, { label: '+1L', amount: 1000 }],
      onQuickLog: (amount) => {
        triggerHaptic('selection');
        const ml = isOz ? ozToMl(amount) : amount;
        addWaterLog(ml);
      },
      onCompleteRemaining: () => {
        triggerHaptic('success');
        const remaining = Math.max(0, user.waterGoal - totalWaterMl);
        if (remaining > 0) addWaterLog(remaining);
      },
      onPress: () => {
        triggerHaptic('selection');
        router.push('/water');
      }
    });

    // 2. Steps Target
    list.push({
      id: 'steps',
      title: 'Active Walk Steps',
      subtext: `${stepsCount.toLocaleString()} / ${user.stepsGoal.toLocaleString()} steps`,
      icon: 'footsteps',
      iconLib: 'Ionicons',
      color: '#A3E635', // lime
      progress: stepsCount,
      target: user.stepsGoal,
      unit: 'steps',
      completed: stepsCount >= user.stepsGoal,
      actions: [{ label: '+1k', amount: 1000 }, { label: '+2k', amount: 2000 }, { label: '+5k', amount: 5000 }],
      onQuickLog: (amount) => {
        triggerHaptic('selection');
        addSteps(amount);
      },
      onCompleteRemaining: () => {
        triggerHaptic('success');
        const remaining = Math.max(0, user.stepsGoal - stepsCount);
        if (remaining > 0) addSteps(remaining);
      },
      onPress: () => {
        triggerHaptic('selection');
        router.push('/steps');
      }
    });

    // 3. Calorie Goal
    list.push({
      id: 'calories',
      title: 'Calorie Intake target',
      subtext: `${nutritionKcal.toLocaleString()} / ${user.calorieGoal.toLocaleString()} kcal`,
      icon: 'food-apple',
      iconLib: 'MCI',
      color: '#FB923C', // orange
      progress: nutritionKcal,
      target: user.calorieGoal,
      unit: 'kcal',
      completed: nutritionKcal >= user.calorieGoal,
      actions: [{ label: '+150kcal', amount: 150 }, { label: '+300kcal', amount: 300 }, { label: '+500kcal', amount: 500 }],
      onQuickLog: (amount) => {
        triggerHaptic('selection');
        addFoodToMeal('snacks', {
          name: 'Quick Log',
          grams: 100,
          kcal: amount,
          protein: 0,
          carbs: 0,
          fat: 0,
        });
      },
      onCompleteRemaining: () => {
        triggerHaptic('success');
        const remaining = Math.max(0, user.calorieGoal - nutritionKcal);
        if (remaining > 0) {
          addFoodToMeal('snacks', {
            name: 'Goal Completion Log',
            grams: 100,
            kcal: remaining,
            protein: 0,
            carbs: 0,
            fat: 0,
          });
        }
      },
      onPress: () => {
        triggerHaptic('selection');
        router.push('/(tabs)/nutrition' as any);
      }
    });

    // 4. Sleep Target
    const sleepTargetHours = 8;
    const sleepProgressHours = parseFloat((todaySleepMin / 60).toFixed(1));
    list.push({
      id: 'sleep',
      title: 'Night Sleep Rest',
      subtext: `${sleepProgressHours} / ${sleepTargetHours} hrs`,
      icon: 'moon',
      iconLib: 'Ionicons',
      color: '#818CF8', // indigo
      progress: todaySleepMin,
      target: sleepTargetHours * 60,
      unit: 'min',
      completed: todaySleepMin >= (sleepTargetHours * 60),
      actions: [{ label: 'Log 8h', amount: 480 }],
      onQuickLog: (amount) => {
        triggerHaptic('selection');
        addSleepLog({
          date: todayISO,
          bedtime: '23:00',
          wakeTime: '07:00',
          totalMin: amount,
          deepMin: 90,
          remMin: 90,
          lightMin: 270,
          awakeMin: 30,
          wakeUps: 1,
          cycles: 5,
          score: 82,
          notes: 'Logged from Daily Quests widget',
        });
      },
      onCompleteRemaining: () => {
        triggerHaptic('success');
        const remaining = Math.max(0, (sleepTargetHours * 60) - todaySleepMin);
        if (remaining > 0) {
          addSleepLog({
            date: todayISO,
            bedtime: '23:00',
            wakeTime: '07:00',
            totalMin: remaining,
            deepMin: Math.round(remaining * 0.2),
            remMin: Math.round(remaining * 0.2),
            lightMin: Math.round(remaining * 0.5),
            awakeMin: Math.round(remaining * 0.1),
            wakeUps: 0,
            cycles: 3,
            score: 75,
            notes: 'Completed remaining sleep target',
          });
        }
      },
      onPress: () => {
        triggerHaptic('selection');
        router.push('/(tabs)/sleep' as any);
      }
    });

    // 5. Workout / Active Minutes
    const activeTarget = 30; // standard daily minutes target
    list.push({
      id: 'workouts',
      title: 'Active Exercise',
      subtext: `${activeMinutes} / ${activeTarget} active min`,
      icon: 'dumbbell',
      iconLib: 'MCI',
      color: '#F43F5E', // rose
      progress: activeMinutes,
      target: activeTarget,
      unit: 'min',
      completed: activeMinutes >= activeTarget,
      actions: [{ label: '+15 min', amount: 15 }, { label: '+30 min', amount: 30 }],
      onQuickLog: (amount) => {
        triggerHaptic('selection');
        addActiveMinutes(amount);
      },
      onCompleteRemaining: () => {
        triggerHaptic('success');
        const remaining = Math.max(0, activeTarget - activeMinutes);
        if (remaining > 0) addActiveMinutes(remaining);
      },
      onPress: () => {
        triggerHaptic('selection');
        router.push('/workouts');
      }
    });

    return list;
  }, [
    user, totalWaterMl, stepsCount, nutritionKcal, todaySleepMin, activeMinutes,
    isOz, todayISO, addWaterLog, addSteps, addFoodToMeal, addSleepLog, addActiveMinutes
  ]);

  // Split into active and completed quests
  const activeQuests = useMemo(() => quests.filter(q => !q.completed), [quests]);
  const completedQuests = useMemo(() => quests.filter(q => q.completed), [quests]);

  const toggleCompletedSection = () => {
    triggerHaptic('selection');
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCompletedExpanded(!completedExpanded);
  };

  return (
    <View style={st.container}>
      <View style={st.sectionHeader}>
        <View style={st.headerTitleRow}>
          <Text style={[st.sectionTitle, { color: colors.text.primary }]}>Daily Quests</Text>
          <View style={[st.badge, { backgroundColor: colors.lime + '20' }]}>
            <Text style={[st.badgeText, { color: colors.lime }]}>
              {completedQuests.length} / {quests.length} Done
            </Text>
          </View>
        </View>
        <Text style={[st.sectionSubtitle, { color: colors.muted }]}>Hit your goals to level up and earn XP</Text>
      </View>

      {/* ── Active Quests ─────────────────────────────────────────────────── */}
      {activeQuests.length > 0 ? (
        activeQuests.map((quest) => {
          const progressPercent = Math.min(100, Math.round((quest.progress / quest.target) * 100));
          return (
            <GlassCard key={quest.id} style={st.questCard} accentColor={quest.color}>
              <View style={st.questMainRow}>
                <TouchableOpacity
                  style={st.questClickableRow}
                  activeOpacity={0.7}
                  onPress={quest.onPress}
                >
                  {/* Icon wrapper */}
                  <View style={[st.iconBubble, { backgroundColor: quest.color + '15' }]}>
                    {quest.iconLib === 'Ionicons' ? (
                      <Ionicons name={quest.icon as any} size={20} color={quest.color} />
                    ) : (
                      <MaterialCommunityIcons name={quest.icon as any} size={20} color={quest.color} />
                    )}
                  </View>

                  {/* Progress Details */}
                  <View style={st.detailsContainer}>
                    <View style={st.metaTextRow}>
                      <Text style={[st.questTitle, { color: colors.text.primary }]}>{quest.title}</Text>
                      <Text style={[st.questSub, { color: colors.muted }]}>{quest.subtext}</Text>
                    </View>

                    {/* Progress Bar */}
                    <View style={[st.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                      <View
                        style={[
                          st.progressBarFill,
                          {
                            backgroundColor: quest.color,
                            width: `${progressPercent}%`,
                          }
                        ]}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Quick Checkbox button to complete remaining */}
                <TouchableOpacity
                  style={[st.completeCheckbox, { borderColor: quest.color + '60' }]}
                  activeOpacity={0.6}
                  onPress={quest.onCompleteRemaining}
                >
                  <Ionicons name="checkmark" size={16} color="transparent" />
                </TouchableOpacity>
              </View>

              {/* Action Quick Logs */}
              <View style={st.actionsRow}>
                {quest.actions.map((act, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[st.actionButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.cardBorder }]}
                    activeOpacity={0.7}
                    onPress={() => quest.onQuickLog(act.amount)}
                  >
                    <Text style={[st.actionLabel, { color: colors.text.secondary }]}>{act.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          );
        })
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
            onPress={toggleCompletedSection}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  questCard: {
    marginBottom: 12,
  },
  questMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  questClickableRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    gap: 8,
  },
  metaTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  questSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  completeCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
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
