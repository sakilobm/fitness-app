import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Radius, useTheme } from '@/constants/theme';
import ProgressRing from './ProgressRing';

interface Props {
  score: 'A' | 'B' | 'C';
}

export default function NutritionScore({ score }: Props) {
  const { colors: tc } = useTheme();
  const colorMap: Record<string, string> = { A: tc.lime, B: tc.amber, C: tc.danger };
  const pctMap: Record<string, number> = { A: 0.92, B: 0.72, C: 0.52 };
  const labelMap: Record<string, string> = { A: 'Excellent', B: 'Good', C: 'Needs Work' };

  const color = colorMap[score];

  return (
    <View style={styles.container}>
      <ProgressRing size={64} strokeWidth={6} progress={pctMap[score]} color={color}>
        <Text style={[styles.letter, { color }]}>{score}</Text>
      </ProgressRing>
      <View style={[styles.labelBadge, { backgroundColor: color + '15', borderColor: color + '35' }]}>
        <Text style={[styles.labelText, { color }]}>{labelMap[score]}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 6 },
  letter: { ...Typography.h2 },
  labelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  labelText: { ...Typography.micro },
});
