import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect, Text as SvgText, Circle,
  Defs, LinearGradient as SvgGrad, Stop, Line,
} from 'react-native-svg';
import { bmiToGaugePosition, getBMIResult } from '@/utils/bmi';

const { width: W } = Dimensions.get('window');
const GAUGE_W = W - 80;
const GAUGE_H = 28;

export default function BMIGauge({ bmi }: { bmi: number }) {
  const position = bmiToGaugePosition(bmi);
  const markerX = 8 + position * (GAUGE_W - 16);

  return (
    <View style={styles.container}>
      <Svg width={GAUGE_W} height={GAUGE_H + 50}>
        <Defs>
          <SvgGrad id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#3B82F6" />
            <Stop offset="0.28" stopColor="#2E7D5E" />
            <Stop offset="0.6" stopColor="#F59E0B" />
            <Stop offset="1" stopColor="#EF4444" />
          </SvgGrad>
        </Defs>

        <Rect x={0} y={16} width={GAUGE_W} height={GAUGE_H} rx={14} fill="url(#gaugeGrad)" opacity={0.2} />
        <Rect x={0} y={16} width={GAUGE_W} height={GAUGE_H} rx={14} fill="url(#gaugeGrad)" opacity={0.85} />

        {[18.5, 25, 30].map((boundary) => {
          const x = 8 + bmiToGaugePosition(boundary) * (GAUGE_W - 16);
          return (
            <Line key={boundary} x1={x} y1={14} x2={x} y2={GAUGE_H + 18} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
          );
        })}

        <Circle cx={markerX} cy={16 + GAUGE_H / 2} r={14}
          fill="white" stroke={getBMIResult(bmi, 170).color} strokeWidth={3}
        />
        <SvgText
          x={markerX} y={16 + GAUGE_H / 2 + 4}
          fill={getBMIResult(bmi, 170).color}
          fontSize={10} fontWeight="800" textAnchor="middle"
        >
          {bmi.toFixed(1)}
        </SvgText>

        <SvgText x={GAUGE_W * 0.07} y={GAUGE_H + 38} fill="#3B82F6" fontSize={9} fontWeight="600" textAnchor="middle">Under</SvgText>
        <SvgText x={GAUGE_W * 0.35} y={GAUGE_H + 38} fill="#2E7D5E" fontSize={9} fontWeight="600" textAnchor="middle">Normal</SvgText>
        <SvgText x={GAUGE_W * 0.6} y={GAUGE_H + 38} fill="#F59E0B" fontSize={9} fontWeight="600" textAnchor="middle">Over</SvgText>
        <SvgText x={GAUGE_W * 0.85} y={GAUGE_H + 38} fill="#EF4444" fontSize={9} fontWeight="600" textAnchor="middle">Obese</SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 8 },
});
