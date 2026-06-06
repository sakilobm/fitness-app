import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown, FadeOutUp,
  useSharedValue, useAnimatedStyle, withTiming,
} from 'react-native-reanimated';
import GlassCard from '@/components/ui/GlassCard';
import GoalDialRow from '@/components/ui/GoalDialRow';
import { Typography, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { useProfileSettings } from '@/store/fitnessStore';
import { mlToOz, ozToMl } from '@/utils/units';
import { triggerHaptic } from '@/utils/haptics';

/** Collapsed by default to keep Profile tidy — tap to reveal the exact
 * calibration dials from Settings, wired straight to the live store so
 * changes apply instantly (no separate "Save" step needed). */
export default function GoalsCalibrationAccordion() {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const { user, setUser } = useProfileSettings();
  const [expanded, setExpanded] = useState(false);

  const rotation = useSharedValue(0);
  const chevronStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }));

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    rotation.value = withTiming(next ? 180 : 0, { duration: 220 });
    triggerHaptic('light');
  };

  const volumeUnit = user.volumeUnit ?? 'ml';

  return (
    <GlassCard accentColor={colors.amber}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggle} style={styles.summaryRow}>
        <View style={[styles.iconWrap, { backgroundColor: colors.amber + '15' }]}>
          <Ionicons name="speedometer" size={20} color={colors.amber} />
        </View>
        <View style={styles.summaryTextWrap}>
          <Text style={styles.summaryTitle}>Goals Calibration</Text>
          <Text style={styles.summarySub}>Calories, hydration, steps & workouts — applies instantly</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={18} color={colors.amber} />
        </Animated.View>
      </TouchableOpacity>

      {expanded && (
        <Animated.View entering={FadeInDown.duration(220).springify().damping(18)} exiting={FadeOutUp.duration(150)}>
          <View style={styles.divider} />

          <GoalDialRow
            icon="flame"
            iconColor={colors.amber}
            title="Daily Calories Target"
            displayValue={`${user.calorieGoal} kcal`}
            onDecrement={() => setUser({ calorieGoal: Math.max(1000, user.calorieGoal - 100) })}
            onIncrement={() => setUser({ calorieGoal: Math.min(6000, user.calorieGoal + 100) })}
            quickOptions={[1800, 2200, 2500, 3000].map((c) => ({
              key: c, label: `${c}`, selected: user.calorieGoal === c, onPress: () => setUser({ calorieGoal: c }),
            }))}
          />

          <View style={styles.divider} />

          <GoalDialRow
            icon="water"
            iconColor={colors.chart.water}
            title="Daily Hydration Target"
            displayValue={volumeUnit === 'oz' ? `${mlToOz(user.waterGoal)} oz` : `${user.waterGoal} ml`}
            onDecrement={() => {
              if (volumeUnit === 'oz') {
                setUser({ waterGoal: ozToMl(Math.max(16, mlToOz(user.waterGoal) - 8)) }); // min 16 oz
              } else {
                setUser({ waterGoal: Math.max(500, user.waterGoal - 250) });
              }
            }}
            onIncrement={() => {
              if (volumeUnit === 'oz') {
                setUser({ waterGoal: ozToMl(Math.min(340, mlToOz(user.waterGoal) + 8)) }); // max ~10L
              } else {
                setUser({ waterGoal: Math.min(10000, user.waterGoal + 250) });
              }
            }}
            quickOptions={volumeUnit === 'oz'
              ? [50, 70, 90, 100].map((ozVal) => ({
                key: ozVal, label: `${ozVal}oz`, selected: mlToOz(user.waterGoal) === ozVal, onPress: () => setUser({ waterGoal: ozToMl(ozVal) }),
              }))
              : [1500, 2000, 2500, 3000].map((w) => ({
                key: w, label: `${w}`, selected: user.waterGoal === w, onPress: () => setUser({ waterGoal: w }),
              }))}
          />

          <View style={styles.divider} />

          <GoalDialRow
            icon="footsteps"
            iconColor={colors.lime}
            title="Daily Steps Target"
            displayValue={user.stepsGoal.toLocaleString()}
            onDecrement={() => setUser({ stepsGoal: Math.max(2000, user.stepsGoal - 1000) })}
            onIncrement={() => setUser({ stepsGoal: Math.min(50000, user.stepsGoal + 1000) })}
            quickOptions={[5000, 8000, 10000, 12000].map((s) => ({
              key: s, label: `${s / 1000}k`, selected: user.stepsGoal === s, onPress: () => setUser({ stepsGoal: s }),
            }))}
          />

          <View style={styles.divider} />

          <GoalDialRow
            icon="fitness"
            iconColor={colors.amber}
            title="Weekly Workouts Target"
            displayValue={`${user.workoutGoal} days`}
            onDecrement={() => setUser({ workoutGoal: Math.max(1, user.workoutGoal - 1) })}
            onIncrement={() => setUser({ workoutGoal: Math.min(7, user.workoutGoal + 1) })}
            quickOptions={[3, 4, 5, 6].map((w) => ({
              key: w, label: `${w}d`, selected: user.workoutGoal === w, onPress: () => setUser({ workoutGoal: w }),
            }))}
          />
        </Animated.View>
      )}
    </GlassCard>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  summaryTextWrap: { flex: 1, gap: 2 },
  summaryTitle: { ...Typography.bodyBold, color: colors.text.primary },
  summarySub: { ...Typography.caption, color: colors.text.secondary },
  divider: { height: 1, backgroundColor: colors.cardBorder, marginVertical: 12 },
});
