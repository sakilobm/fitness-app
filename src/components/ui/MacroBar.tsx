import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Colors, Radius, Typography } from '@/constants/theme';

interface MacroBarProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export default function MacroBar({ label, current, goal, color, unit = 'g' }: MacroBarProps) {
  const progress = Math.min(current / goal, 1);
  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withTiming(progress, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          <Text style={{ color }}>{current}{unit}</Text>
          <Text style={styles.goal}> / {goal}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: color }, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { ...Typography.caption, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  value: { ...Typography.captionBold, color: Colors.text.primary },
  goal: { color: Colors.muted },
  track: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.07)',   // light-theme track
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
  },
});
