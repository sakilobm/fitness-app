import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Spacing, Radius } from '@/constants/theme';
import { useT } from './SetupThemeContext';

interface Props {
  stepNum: number;
  label: string;
  title: string;
  subtitle: string;
  color: string;
}

export default function StepHeader({ stepNum, label, title, subtitle, color }: Props) {
  const D = useT();
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={{ marginBottom: 14 }}>
        <View style={[{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6,
          borderRadius: Radius.pill, borderWidth: 1,
          backgroundColor: color + '20', borderColor: color + '40',
        }]}>
          <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color }}>
            0{stepNum}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1, color }}>
            {label}
          </Text>
        </View>
      </Animated.View>
      <Animated.Text
        entering={FadeInUp.delay(60).springify().damping(18)}
        style={{ fontSize: 30, fontWeight: '800', color: D.textPrimary, letterSpacing: -0.5, marginBottom: 8 }}
      >
        {title}
      </Animated.Text>
      <Animated.Text
        entering={FadeInUp.delay(120).springify().damping(18)}
        style={{ fontSize: 15, color: D.textSecondary, lineHeight: 22 }}
      >
        {subtitle}
      </Animated.Text>
    </View>
  );
}
