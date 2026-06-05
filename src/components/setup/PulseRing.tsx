import React from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withRepeat, withSequence, withTiming, withDelay, Easing,
} from 'react-native-reanimated';

interface Props {
  color: string;
  size: number;
  delay?: number;
}

export default function PulseRing({ color, size, delay = 0 }: Props) {
  const opacity = useSharedValue(0.6);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withSequence(
      withTiming(0.05, { duration: 1400, easing: Easing.out(Easing.ease) }),
      withTiming(0.6, { duration: 0 }),
    ), -1));
    scale.value = withDelay(delay, withRepeat(withSequence(
      withTiming(1.8, { duration: 1400, easing: Easing.out(Easing.ease) }),
      withTiming(1, { duration: 0 }),
    ), -1));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[style, {
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }]}
    />
  );
}
