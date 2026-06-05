import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

const STEPS_COLOR = '#6366F1';

interface Props {
  history: { steps: number }[];
  goal: number;
}

export default function StreakDots({ history, goal }: Props) {
  const { colors } = useTheme();
  const days = history.slice(-14);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.row}>
        {days.map((d, i) => {
          const hit = d.steps >= goal;
          const isLast = i === days.length - 1;
          return (
            <View
              key={i}
              style={[
                styles.dot,
                hit ? { backgroundColor: STEPS_COLOR + '66' } : { backgroundColor: colors.danger + '44' },
                isLast && { borderWidth: 2, borderColor: STEPS_COLOR, backgroundColor: STEPS_COLOR },
              ]}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  dot: { width: 20, height: 20, borderRadius: 10 },
});
