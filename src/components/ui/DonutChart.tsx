import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';

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
}

export default function DonutChart({ segments, size = 160, strokeWidth = 14, children }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  const animProgress = useSharedValue(0);
  useEffect(() => {
    animProgress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });
  }, []);

  let offset = 0;
  const rings = segments.map((seg, i) => {
    const fraction = total > 0 ? seg.value / total : 0;
    const dash = fraction * circumference;
    const gap = circumference - dash;
    const startOffset = offset * circumference;
    offset += fraction;
    return { dash, gap, startOffset, color: seg.color, i };
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* track */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {rings.map(({ dash, gap, startOffset, color }, i) => (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={-startOffset}
              strokeLinecap="butt"
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
