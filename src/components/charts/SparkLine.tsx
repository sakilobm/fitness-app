import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Circle, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const CHART_W = W - 64;
const CHART_H = 140;

export type SparkLinePeriod = 'today' | 'week' | 'month' | '3m';

interface Props {
  data: number[];
  period?: SparkLinePeriod;
  statuses?: boolean[];
  onPointPress?: (idx: number) => void;
}

export default function SparkLine({ data, period, statuses, onPointPress }: Props) {
  const { colors } = useTheme();
  if (!data || data.length === 0) return null;

  const min = Math.min(...data) - 0.5;
  const max = Math.max(...data) + 0.5;
  const PADDING_X = 36;
  const pts = data.map((v, i) => ({
    x: data.length > 1
      ? PADDING_X + (i / (data.length - 1)) * (CHART_W - 2 * PADDING_X)
      : CHART_W / 2,
    y: CHART_H - ((v - min) / (max - min)) * CHART_H,
  }));

  const pathD = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
  const areaD = pts.length > 0
    ? `${pathD} L${pts[pts.length - 1].x},${CHART_H} L${pts[0].x},${CHART_H} Z`
    : '';

  const timeLabels = ['Morn 🌅', 'Aft ☀️', 'Ngt 🌙'];

  return (
    <Svg width={CHART_W} height={CHART_H + 30}>
      <Defs>
        <SvgLinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.lime} stopOpacity="0.25" />
          <Stop offset="1" stopColor={colors.lime} stopOpacity="0" />
        </SvgLinearGradient>
      </Defs>
      {areaD ? <Path d={areaD} fill="url(#lineGrad)" /> : null}
      <Path d={pathD} stroke={colors.lime} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {pts.map((pt, idx) => {
        const isTodayView = period === 'today';
        const isLogged = !isTodayView || (statuses && statuses[idx]);

        if (!isLogged) {
          return (
            <Circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={colors.card}
              stroke={colors.lime}
              strokeWidth={1.5}
              strokeDasharray="2,2"
            />
          );
        }

        return (
          <React.Fragment key={idx}>
            <Circle cx={pt.x} cy={pt.y} r={6} fill={colors.lime} opacity={0.25} />
            <Circle cx={pt.x} cy={pt.y} r={4} fill={colors.lime} />
            {onPointPress && (
              <Circle
                cx={pt.x}
                cy={pt.y}
                r={20}
                fill="transparent"
                onPress={() => onPointPress(idx)}
              />
            )}
            {(isTodayView || idx === pts.length - 1) && (
              <SvgText
                x={pt.x}
                y={pt.y - 12}
                textAnchor="middle"
                fill={colors.lime}
                fontSize={11}
                fontWeight="700"
              >
                {data[idx].toFixed(1)}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}

      {period === 'today' && pts.map((pt, idx) => (
        <SvgText
          key={`lbl-${idx}`}
          x={pt.x}
          y={CHART_H + 18}
          textAnchor="middle"
          fill={colors.text.primary}
          fontSize={10}
          fontWeight="600"
        >
          {timeLabels[idx]}
        </SvgText>
      ))}
    </Svg>
  );
}
