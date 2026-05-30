import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Segment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  gapSize?: number;
  trackColor?: string;   // explicit track color (replaces trackOpacity)
  rounded?: boolean;
}

export default function DonutChart({
  segments,
  size = 160,
  strokeWidth = 14,
  children,
  gapSize = 0,
  trackColor = 'rgba(0,0,0,0.08)',   // light-theme default
  rounded = false,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const animProgress = useSharedValue(0);
  useEffect(() => {
    animProgress.value = withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, []);

  const capExtra = rounded ? strokeWidth : 0;
  const effectiveGap = gapSize + capExtra;
  let cumLen = 0;
  const rings = segments.map((seg) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const fullLen = fraction * circumference;
    const dash = Math.max(fullLen - effectiveGap, 2);
    const startOffset = cumLen + effectiveGap / 2;
    cumLen += fullLen;
    return { dash, startOffset, color: seg.color };
  });

  const linecap = rounded ? 'round' : 'butt';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2} cy={size / 2} r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {rings.map(({ dash, startOffset, color }, i) => (
            <Circle
              key={i}
              cx={size / 2} cy={size / 2} r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-startOffset}
              strokeLinecap={linecap}
            />
          ))}
        </G>
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
});
