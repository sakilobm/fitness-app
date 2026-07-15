import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import { useTheme } from '@/constants/theme';

interface BMIGridHeroProps {
  currentBMI: number;
  bmiResult: { color: string; emoji: string; label: string };
  height: number;
  weight: number;
  idealRange: { min: number; max: number };
}

export const BMIGridHero = React.memo(function BMIGridHero({
  currentBMI,
  bmiResult,
  height,
  weight,
  idealRange,
}: BMIGridHeroProps) {
  const { colors } = useTheme();

  return (
    <GlassCard accentColor={bmiResult.color}>
      <View style={styles.heroRow}>
        <View style={[styles.heroIconWrap, { backgroundColor: bmiResult.color + '15', borderColor: bmiResult.color + '30' }]}>
          <MaterialCommunityIcons name="human" size={36} color={bmiResult.color} />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroValue, { color: bmiResult.color }]}>{currentBMI.toFixed(1)}</Text>
          <Text style={styles.heroLabel}>Body Mass Index</Text>
          <View style={[styles.heroBadge, { backgroundColor: bmiResult.color + '15', borderColor: bmiResult.color + '30' }]}>
            <Text style={styles.heroEmoji}>{bmiResult.emoji}</Text>
            <Text style={[styles.heroCatText, { color: bmiResult.color }]}>{bmiResult.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Height</Text>
          <Text style={[styles.quickStatVal, { color: colors.text.primary }]}>{height} cm</Text>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Weight</Text>
          <Text style={[styles.quickStatVal, { color: colors.text.primary }]}>{weight.toFixed(1)} kg</Text>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: colors.cardBorder }]} />
        <View style={styles.quickStat}>
          <Text style={styles.quickStatLabel}>Ideal Range</Text>
          <Text style={[styles.quickStatVal, { color: colors.text.primary }]}>{idealRange.min}–{idealRange.max} kg</Text>
        </View>
      </View>
    </GlassCard>
  );
}, (prev, next) => {
  return (
    prev.currentBMI === next.currentBMI &&
    prev.bmiResult.label === next.bmiResult.label &&
    prev.height === next.height &&
    prev.weight === next.weight &&
    prev.idealRange.min === next.idealRange.min &&
    prev.idealRange.max === next.idealRange.max
  );
});

const styles = StyleSheet.create({
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  heroText: {
    flex: 1,
  },
  heroValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
  },
  heroEmoji: {
    fontSize: 12,
  },
  heroCatText: {
    fontSize: 11,
    fontWeight: '700',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 14,
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  quickStatVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  quickStatDivider: {
    width: 1,
    height: 24,
    alignSelf: 'center',
  },
});
