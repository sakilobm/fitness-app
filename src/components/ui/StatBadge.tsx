import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Typography, Shadows } from '@/constants/theme';

interface StatBadgeProps {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
  compact?: boolean;
}

export default function StatBadge({ label, value, color = Colors.lime, style, compact }: StatBadgeProps) {
  return (
    <View style={[styles.container, compact && styles.compact, Shadows.card, style]}>
      {/* Accent top bar */}
      <View style={[styles.topBar, { backgroundColor: color }]} />
      {/* Icon dot */}
      <View style={[styles.colorDot, { backgroundColor: color + '25', borderColor: color + '40' }]}>
        <View style={[styles.colorDotInner, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 12,
    paddingTop: 14,
    flex: 1,
    overflow: 'hidden',
  },
  compact: { padding: 8, paddingTop: 10 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2.5,
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  colorDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    ...Typography.h3,
    marginBottom: 2,
  },
  label: {
    ...Typography.caption,
    color: Colors.muted,
    textAlign: 'center',
  },
});
