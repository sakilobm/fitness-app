import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { makeChartPoints, smoothLinePath, areaPath } from '@/constants/vitals';

interface Props {
  values:    number[];
  width?:    number;
  height?:   number;
  color:     string;
  showArea?: boolean;
  strokeWidth?: number;
}

export function SparkLine({
  values, width = 80, height = 32, color, showArea = true, strokeWidth = 1.8,
}: Props) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const pts = makeChartPoints(values, width, height, 2, 3, min, max);
  const linePath = smoothLinePath(pts);
  const fillPath = areaPath(pts, height, 3);

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="spark_fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor={color} stopOpacity={0.35} />
          <Stop offset="1"   stopColor={color} stopOpacity={0}    />
        </LinearGradient>
      </Defs>

      {showArea && <Path d={fillPath} fill="url(#spark_fill)" />}
      <Path d={linePath} stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
