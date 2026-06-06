import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { triggerHaptic } from '@/utils/haptics';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export interface GoalDialQuickOption {
  key: string | number;
  label: string;
  selected: boolean;
  onPress: () => void;
}

interface Props {
  icon: IoniconName;
  iconColor: string;
  title: string;
  displayValue: string;
  quickOptions: GoalDialQuickOption[];
  onDecrement: () => void;
  onIncrement: () => void;
}

/** Shared "+/- with quick-pick pills" goal dial — drives both the Settings
 * calibration section and Profile's inline accordion off identical UI. */
export default function GoalDialRow({ icon, iconColor, title, displayValue, quickOptions, onDecrement, onIncrement }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const press = (fn: () => void) => () => { fn(); triggerHaptic('selection'); };

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeaderRow}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.goalCardTitle}>{title}</Text>
        <Text style={styles.goalCardValue}>{displayValue}</Text>
      </View>
      <View style={styles.adjustRow}>
        <TouchableOpacity style={styles.adjustBtn} onPress={press(onDecrement)}>
          <Ionicons name="remove" size={16} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.quickPillRow}>
          {quickOptions.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.quickGoalPill, opt.selected && { backgroundColor: iconColor + '20', borderColor: iconColor }]}
              onPress={press(opt.onPress)}
            >
              <Text style={[styles.quickGoalPillText, opt.selected && { color: iconColor }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={styles.adjustBtn} onPress={press(onIncrement)}>
          <Ionicons name="add" size={16} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  goalCard: { paddingVertical: 10 },
  goalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  goalCardTitle: { ...Typography.bodyBold, color: colors.text.primary, flex: 1 },
  goalCardValue: { ...Typography.bodyBold, color: colors.text.primary },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'space-between' },
  adjustBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  quickPillRow: { flexDirection: 'row', gap: 6, flex: 1, justifyContent: 'center' },
  quickGoalPill: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.card,
  },
  quickGoalPillText: { fontSize: 11, fontWeight: '600', color: colors.text.secondary },
});
