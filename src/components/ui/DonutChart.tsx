import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G, Defs, Pattern as SvgPattern } from 'react-native-svg';
import { useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/constants/theme';

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
  trackColor?: string;
  rounded?: boolean;
  innerFill?: string;
  showInnerDots?: boolean;
}

export default function DonutChart({
  segments,
  size = 160,
  strokeWidth = 14,
  children,
  gapSize = 0,
  trackColor,
  rounded = false,
  innerFill,
  showInnerDots = false,
}: DonutChartProps) {
  const { colors, isDark } = useTheme();
  
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
  const innerR = radius - strokeWidth / 2 - 1;
  const patId = `dp_${Math.round(size)}`;
  const cx = size / 2;
  const cy = size / 2;
  // SVG transform: rotate -90° around centre so 0° = 12 o'clock
  const rotate = `rotate(-90, ${cx}, ${cy})`;

  const activeTrack = trackColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)');
  const activeInner = innerFill === '#F0EDE8' || innerFill === '#F0EDE8'
    ? (isDark ? colors.ivory : '#F0EDE8')
    : (innerFill || (isDark ? colors.ivory : 'transparent'));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          {showInnerDots && (
            <SvgPattern
              id={patId}
              x="0" y="0"
              width="8" height="8"
              patternUnits="userSpaceOnUse"
            >
              <Circle cx="4" cy="4" r="1" fill={isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'} />
            </SvgPattern>
          )}
        </Defs>

        <G transform={rotate}>
          {/* ① Inner circle base fill */}
          {activeInner !== 'transparent' && (
            <Circle cx={cx} cy={cy} r={innerR} fill={activeInner} />
          )}
          {/* ② Dot-grid texture overlay */}
          {showInnerDots && (
            <Circle cx={cx} cy={cy} r={innerR} fill={`url(#${patId})`} />
          )}
          {/* ③ Track ring */}
          <Circle
            cx={cx} cy={cy} r={radius}
            stroke={activeTrack}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* ④ Coloured segment arcs */}
          {rings.map(({ dash, startOffset, color }, i) => (
            <Circle
              key={i}
              cx={cx} cy={cy} r={radius}
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
