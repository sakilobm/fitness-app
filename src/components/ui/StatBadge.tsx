/**
 * @component StatBadge
 * @module Shared/UI/Components
 * @description Pure presentational rendering component for displaying specific metric statistics with custom brand accent colors. Handles zero business logic.
 * 
 * @param {StatBadgeProps} props - (Inputs): Receives UI configuration interfaces including label, value, color, styling and layout options.
 * @process (Internal Logic):
 *          - Performance: Wrapped in `React.memo` to skip Virtual DOM diffing unless props mutate.
 *          - Dynamic accent line coloring and relative opacity calculations.
 * @returns {React.ReactElement} (Outputs): Smooth, 60 FPS visual layout container.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Typography, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface StatBadgeProps {
  label: string;
  value: string;
  color?: string;
  style?: ViewStyle;
  compact?: boolean;
}

const StatBadge = React.memo(function StatBadge({ label, value, color, style, compact }: StatBadgeProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const activeColor = color || colors.lime;

  return (
    <View style={[styles.container, compact && styles.compact, Shadows.card, style]}>
      {/* Accent top bar */}
      <View style={[styles.topBar, { backgroundColor: activeColor }]} />
      {/* Icon dot */}
      <View style={[styles.colorDot, { backgroundColor: activeColor + '25', borderColor: activeColor + '40' }]}>
        <View style={[styles.colorDotInner, { backgroundColor: activeColor }]} />
      </View>
      <Text style={[styles.value, { color: activeColor }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

export default StatBadge;

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.muted,
    textAlign: 'center',
  },
});
