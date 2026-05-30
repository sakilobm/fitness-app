import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedNumberProps {
  value: number;
  style?: TextStyle;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function AnimatedNumber({
  value,
  style,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 1000,
}: AnimatedNumberProps) {
  const animValue = useSharedValue(0);

  useEffect(() => {
    animValue.value = withTiming(value, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  const derived = useDerivedValue(() => animValue.value);

  const [display, setDisplay] = React.useState(`${prefix}${(0).toFixed(decimals)}${suffix}`);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(`${prefix}${derived.value.toFixed(decimals)}${suffix}`);
    }, 16);
    return () => clearInterval(interval);
  }, [prefix, suffix, decimals]);

  return <Text style={style}>{display}</Text>;
}
