import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import { Typography } from '@/constants/theme';
import { CyclePhase } from '@/types';
import { PHASE_META } from '@/constants/cycle';

interface Props {
  phase:       CyclePhase | null;
  dayOfCycle:  number | null;
  cycleLength: number;
  progress:    number; // 0–1
}

export default function PhaseOrb({ phase, dayOfCycle, cycleLength, progress }: Props) {
  const meta   = phase ? PHASE_META[phase] : null;
  const color  = meta?.color  ?? '#6B7280';
  const glow   = meta?.glow   ?? 'rgba(107,114,128,0.3)';
  const emoji  = meta?.emoji  ?? '○';
  const label  = meta?.label  ?? 'No cycle data';

  const pulse  = useSharedValue(1);
  const orbIn  = useSharedValue(0);

  useEffect(() => {
    orbIn.value = withSpring(1, { damping: 14, stiffness: 90 });
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,    { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
  }, [phase]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity:   0.55,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: orbIn.value }],
    opacity:   orbIn.value,
  }));

  // Arc progress indicator — SVG-free, using border rotation trick
  const arcDeg = Math.round(progress * 360);

  return (
    <View style={st.wrap}>
      {/* Outer glow ring */}
      <Animated.View style={[st.glowRing, { backgroundColor: glow, borderColor: color + '40' }, glowStyle]} />

      {/* Phase orb */}
      <Animated.View style={[st.orb, { backgroundColor: color + '18', borderColor: color + '60' }, orbStyle]}>
        <Text style={st.emoji}>{emoji}</Text>
        <Text style={[st.phaseLabel, { color }]}>{label.replace(' Phase', '')}</Text>
        {dayOfCycle !== null && (
          <>
            <Text style={[st.dayNum, { color }]}>Day {dayOfCycle}</Text>
            <Text style={st.dayOf}>of {cycleLength}</Text>
          </>
        )}
        {dayOfCycle === null && (
          <Text style={st.noData}>Tap "Start Period"</Text>
        )}
      </Animated.View>
    </View>
  );
}

const ORB = 190;
const GLOW = 240;

const st = StyleSheet.create({
  wrap: {
    width: GLOW, height: GLOW,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: GLOW, height: GLOW, borderRadius: GLOW / 2,
    borderWidth: 1.5,
  },
  orb: {
    width: ORB, height: ORB, borderRadius: ORB / 2,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    gap: 2,
  },
  emoji:      { fontSize: 32, marginBottom: 2 },
  phaseLabel: { ...Typography.captionBold, letterSpacing: 0.5, textAlign: 'center' },
  dayNum:     { ...Typography.h2, marginTop: 2 },
  dayOf:      { ...Typography.caption, color: '#9CA3AF' },
  noData:     { ...Typography.caption, color: '#9CA3AF', textAlign: 'center', marginTop: 4 },
});
