import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, {
  Path, Circle, Text as SvgText, Rect,
  Defs, LinearGradient as SvgGrad, Stop,
} from 'react-native-svg';
import { Colors, Typography } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const BMI_COLOR = '#0EA5E9';
const CHART_W = W - 64;
const CHART_H = 120;

interface Props {
  data: { date: string; bmi: number }[];
}

export default function BMISparkline({ data }: Props) {
  if (data.length < 2) {
    return (
      <View style={{ alignItems: 'center', padding: 24 }}>
        <Text style={{ ...Typography.caption, color: Colors.muted }}>Need more data for trend</Text>
      </View>
    );
  }

  const recent = data.slice(-14);
  const values = recent.map((d) => d.bmi);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  const pts = values.map((v, i) => ({
    x: (i / (values.length - 1)) * CHART_W,
    y: CHART_H - ((v - min) / range) * CHART_H,
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = `${pathD} L${CHART_W},${CHART_H} L0,${CHART_H} Z`;

  const normalMinY = CHART_H - ((18.5 - min) / range) * CHART_H;
  const normalMaxY = CHART_H - ((25 - min) / range) * CHART_H;

  return (
    <Svg width={CHART_W} height={CHART_H + 8}>
      <Defs>
        <SvgGrad id="bmiAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={BMI_COLOR} stopOpacity="0.25" />
          <Stop offset="1" stopColor={BMI_COLOR} stopOpacity="0" />
        </SvgGrad>
      </Defs>

      {normalMinY >= 0 && normalMaxY >= 0 && (
        <Rect x={0} y={Math.min(normalMinY, normalMaxY)}
          width={CHART_W} height={Math.abs(normalMinY - normalMaxY)}
          fill="#2E7D5E" opacity={0.08} rx={4}
        />
      )}

      <Path d={areaD} fill="url(#bmiAreaGrad)" />
      <Path d={pathD} stroke={BMI_COLOR} strokeWidth={2.5} fill="none"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {pts.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y}
          r={i === pts.length - 1 ? 5 : 3}
          fill={i === pts.length - 1 ? BMI_COLOR : BMI_COLOR + '88'}
        />
      ))}

      {normalMaxY >= 0 && normalMaxY <= CHART_H && (
        <SvgText x={CHART_W - 2} y={normalMaxY - 3}
          fill="#2E7D5E" fontSize={8} textAnchor="end" opacity={0.6}
        >
          25.0
        </SvgText>
      )}
      {normalMinY >= 0 && normalMinY <= CHART_H && (
        <SvgText x={CHART_W - 2} y={normalMinY + 10}
          fill="#2E7D5E" fontSize={8} textAnchor="end" opacity={0.6}
        >
          18.5
        </SvgText>
      )}
    </Svg>
  );
}
