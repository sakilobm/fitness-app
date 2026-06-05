import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Props {
  bmi: number;
}

export default function BMIBar({ bmi }: Props) {
  const { colors } = useTheme();
  const bmiS = React.useMemo(() => getStyles(colors), [colors]);

  const BMI_CATEGORIES = [
    { label: 'Under', max: 18.5, color: colors.chart.water },
    { label: 'Normal', max: 24.9, color: colors.lime },
    { label: 'Over', max: 29.9, color: colors.amber },
    { label: 'Obese', max: 40, color: colors.danger },
  ];

  const pct = Math.max(0, Math.min((bmi - 15) / (40 - 15), 1));
  const category = BMI_CATEGORIES.find((c) => bmi <= c.max) ?? BMI_CATEGORIES[3];

  return (
    <View>
      <View style={bmiS.row}>
        {BMI_CATEGORIES.map((c, i) => (
          <View key={i} style={[bmiS.segment, { backgroundColor: c.color + '44' }]} />
        ))}
        <View style={[bmiS.pointer, { left: `${pct * 100}%` as any }]}>
          <View style={[bmiS.pointerDot, { backgroundColor: category.color }]} />
        </View>
      </View>
      <View style={bmiS.labels}>
        {BMI_CATEGORIES.map((c) => (
          <Text key={c.label} style={bmiS.catLabel}>{c.label}</Text>
        ))}
      </View>
      <View style={[bmiS.resultBadge, { backgroundColor: category.color + '15', borderColor: category.color + '35' }]}>
        <View style={[bmiS.resultDot, { backgroundColor: category.color }]} />
        <Text style={[bmiS.bmiValue, { color: category.color }]}>BMI {bmi} — {category.label}weight</Text>
      </View>
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  row: { height: 12, borderRadius: 6, flexDirection: 'row', overflow: 'visible', marginBottom: 6, position: 'relative' },
  segment: { flex: 1 },
  pointer: { position: 'absolute', top: -4, marginLeft: -8 },
  pointerDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: colors.card },
  labels: { flexDirection: 'row', justifyContent: 'space-between' },
  catLabel: { ...Typography.micro, color: colors.muted, flex: 1, textAlign: 'center' },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
  resultDot: { width: 8, height: 8, borderRadius: 4 },
  bmiValue: { ...Typography.bodyBold },
});
