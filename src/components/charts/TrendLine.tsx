import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;
const CHART_H = 100;

interface Props {
  data: number[];
}

export default function TrendLine({ data }: Props) {
  const min = Math.min(...data) - 20;
  const max = Math.max(...data) + 20;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * CHART_W,
    y: CHART_H - ((v - min) / (max - min)) * CHART_H,
  }));
  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  return (
    <Svg width={CHART_W} height={CHART_H + 8}>
      <Defs>
        <SvgLinearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={Colors.amber} stopOpacity="0.25" />
          <Stop offset="1" stopColor={Colors.amber} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      <Path d={areaD} fill="url(#trendGrad)" />
      <Path d={pathD} stroke={Colors.amber} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? Colors.amber : Colors.amber + '88'} />
      ))}
    </Svg>
  );
}
