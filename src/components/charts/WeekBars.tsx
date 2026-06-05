import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, G, Line, Defs, LinearGradient as SvgGrad, Stop } from 'react-native-svg';
import { useTheme } from '@/constants/theme';
import { formatStepCount, getDayLabel } from '@/utils/steps';

const { width: W } = Dimensions.get('window');
const STEPS_COLOR = '#6366F1';

interface Props {
  data: { date: string; steps: number }[];
  goal: number;
}

export default function WeekBars({ data, goal }: Props) {
  const { colors } = useTheme();
  const barW = (W - 80) / 7;
  const maxVal = Math.max(...data.map((d) => d.steps), goal);
  const chartH = 110;

  return (
    <Svg width={W - 64} height={chartH + 28}>
      <Line
        x1={0} y1={chartH - (goal / maxVal) * chartH}
        x2={W - 64} y2={chartH - (goal / maxVal) * chartH}
        stroke={STEPS_COLOR + '30'} strokeWidth={1} strokeDasharray="4,4"
      />
      <SvgText
        x={W - 68} y={chartH - (goal / maxVal) * chartH - 4}
        fill={STEPS_COLOR + '60'} fontSize={8} textAnchor="end"
      >
        Goal
      </SvgText>

      {data.map((d, i) => {
        const h = maxVal > 0 ? (d.steps / maxVal) * chartH : 0;
        const x = i * barW + barW * 0.15;
        const bw = barW * 0.7;
        const isToday = i === data.length - 1;
        const color =
          d.steps === 0 ? 'rgba(0,0,0,0.06)'
          : d.steps >= goal ? colors.amber
          : isToday ? STEPS_COLOR
          : colors.muted + '55';
        const label = getDayLabel(d.date);

        return (
          <G key={i}>
            <Defs>
              <SvgGrad id={`barGrad_${i}`} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={isToday ? STEPS_COLOR : color} stopOpacity="1" />
                <Stop offset="1" stopColor={isToday ? STEPS_COLOR : color} stopOpacity={isToday ? '0.6' : '1'} />
              </SvgGrad>
            </Defs>
            <Rect
              x={x} y={chartH - h}
              width={bw} height={Math.max(h, 2)}
              rx={5} fill={d.steps === 0 ? color : `url(#barGrad_${i})`}
            />
            <SvgText
              x={x + bw / 2} y={chartH + 18}
              fill={isToday ? STEPS_COLOR : colors.muted}
              fontSize={11} textAnchor="middle" fontWeight={isToday ? '700' : '400'}
            >
              {label.charAt(0)}
            </SvgText>
            {d.steps > 0 && (
              <SvgText
                x={x + bw / 2} y={chartH - h - 5}
                fill={color === colors.muted + '55' ? colors.muted : color}
                fontSize={9} textAnchor="middle"
              >
                {formatStepCount(d.steps)}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}
