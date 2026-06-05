import React from 'react';
import { View, Text } from 'react-native';
import ProgressRing from '@/components/ui/ProgressRing';
import { useTheme } from '@/constants/theme';

const STEPS_COLOR = '#6366F1';

interface Props {
  stepsCount: number;
  styles: any;
}

export default function MotionBreakdown({ stepsCount, styles }: Props) {
  const { colors } = useTheme();
  const walkPct = stepsCount > 0 ? Math.min(0.7, stepsCount / 15000) : 0;
  const runPct = stepsCount > 5000 ? Math.min(0.2, (stepsCount - 5000) / 20000) : 0;
  const statPct = Math.max(0, 1 - walkPct - runPct);

  const MOTION = [
    { label: 'Walking', pct: walkPct, color: STEPS_COLOR },
    { label: 'Running', pct: runPct, color: colors.amber },
    { label: 'Stationary', pct: statPct, color: colors.muted + '55' },
  ];

  return (
    <View style={styles.motionRow}>
      {MOTION.map((m) => (
        <View key={m.label} style={styles.motionItem}>
          <ProgressRing size={70} strokeWidth={7} progress={m.pct} color={m.color}>
            <Text style={[styles.motionPct, { color: m.color }]}>{Math.round(m.pct * 100)}%</Text>
          </ProgressRing>
          <Text style={styles.motionLabel}>{m.label}</Text>
        </View>
      ))}
    </View>
  );
}
