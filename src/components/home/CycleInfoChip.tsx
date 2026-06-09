import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Props {
  accent: string;
  title: string;
  sub: string;
  daysLate: number;
  onPress: () => void;
}

export default React.memo(function CycleInfoChip({ accent, title, sub, daysLate, onPress }: Props) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <TouchableOpacity
      style={[styles.chip, { borderLeftWidth: 3, borderLeftColor: accent }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: accent + '18' }]}>
        <Ionicons name={daysLate > 0 ? 'time' : 'flower'} size={18} color={accent} />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.sub, daysLate > 0 && { color: accent }]}>{sub}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.muted} />
    </TouchableOpacity>
  );
});

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  chip:      { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: colors.cardBorder, padding: 14, shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  iconBox:   { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  textBlock: { flex: 1 },
  title:     { fontSize: 14, fontWeight: '700', color: colors.text.primary },
  sub:       { fontSize: 12, fontWeight: '400', color: colors.muted, marginTop: 1 },
});
