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
    flex: 1,
  },
  compact: { padding: 8 },
  value: {
    ...Typography.h2,
    color: Colors.lime,
    marginBottom: 2,
  },
  label: {
    ...Typography.caption,
    color: Colors.muted,
    textAlign: 'center',
  },
});
