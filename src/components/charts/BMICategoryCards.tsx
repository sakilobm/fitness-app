import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius } from '@/constants/theme';
import { BMI_CATEGORIES } from '@/utils/bmi';

interface Props {
  currentCategory: string;
}

export default function BMICategoryCards({ currentCategory }: Props) {
  return (
    <View style={styles.grid}>
      {BMI_CATEGORIES.map((cat) => {
        const isActive = cat.label.toLowerCase() === currentCategory;
        return (
          <View
            key={cat.label}
            style={[
              styles.card,
              isActive && { borderColor: cat.color, backgroundColor: cat.color + '08' },
            ]}
          >
            <View style={[styles.indicator, { backgroundColor: cat.color }]} />
            <View style={styles.cardContent}>
              <Text style={[styles.label, isActive && { color: cat.color, fontWeight: '700' }]}>
                {cat.label}
              </Text>
              <Text style={styles.range}>{cat.range}</Text>
            </View>
            {isActive && (
              <View style={[styles.activeBadge, { backgroundColor: cat.color + '18' }]}>
                <Text style={[styles.activeText, { color: cat.color }]}>You</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder,
    paddingVertical: 12, paddingHorizontal: 14, gap: 12,
  },
  indicator: { width: 4, height: 32, borderRadius: 2 },
  cardContent: { flex: 1, gap: 2 },
  label: { ...Typography.bodyBold, color: Colors.text.primary },
  range: { ...Typography.caption, color: Colors.muted },
  activeBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  activeText: { ...Typography.captionBold },
});
