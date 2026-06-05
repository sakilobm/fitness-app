import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Path, Line, Circle, Text as SvgText, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { ThemeColors } from '@/theme';
import { HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog } from '@/types';
import {
  VitalType, VITAL_CONFIG,
  makeChartPoints, smoothLinePath, areaPath, ChartPt,
} from '@/constants/vitals';

const { width: SW } = Dimensions.get('window');
const CHART_W  = SW - 64;
const CHART_H  = 160;
const PAD      = { top: 12, right: 8, bottom: 28, left: 36 };

type AnyLog = HeartRateLog | BloodPressureLog | BloodGlucoseLog | OxygenLog;

interface Props {
  type:   VitalType;
  logs:   AnyLog[];   // chronological (oldest first)
  colors: ThemeColors;
}

function extractValues(type: VitalType, logs: AnyLog[]): { v1: number[]; v2?: number[] } {
  switch (type) {
    case 'heartRate':
      return { v1: (logs as HeartRateLog[]).map(l => l.bpm) };
    case 'bloodPressure': {
      const bl = logs as BloodPressureLog[];
      return { v1: bl.map(l => l.systolic), v2: bl.map(l => l.diastolic) };
    }
    case 'bloodGlucose':
      return { v1: (logs as BloodGlucoseLog[]).map(l => l.value) };
    case 'oxygen':
      return { v1: (logs as OxygenLog[]).map(l => l.spo2) };
  }
}

function gridValues(minY: number, maxY: number, count = 4): number[] {
  const step = Math.ceil((maxY - minY) / count / 10) * 10;
  const start = Math.floor(minY / step) * step;
  return Array.from({ length: count + 1 }, (_, i) => start + i * step).filter(v => v >= minY - 5 && v <= maxY + 5);
}

function yPos(v: number, minY: number, maxY: number): number {
  const range = maxY - minY || 1;
  return PAD.top + (1 - (v - minY) / range) * (CHART_H - PAD.top - PAD.bottom);
}

export function VitalChart({ type, logs, colors }: Props) {
  const cfg = VITAL_CONFIG[type];

  if (logs.length < 2) {
    return (
      <View style={[st.empty, { height: CHART_H }]}>
        <Text style={[st.emptyTxt, { color: colors.muted }]}>
          Need at least 2 readings for a chart
        </Text>
      </View>
    );
  }

  const { v1, v2 } = extractValues(type, logs);
  const allVals   = [...v1, ...(v2 ?? [])];
  const dataMin   = Math.min(...allVals);
  const dataMax   = Math.max(...allVals);
  const buffer    = Math.max(5, (dataMax - dataMin) * 0.2);
  const minY      = Math.max(cfg.chartMin, Math.floor(dataMin - buffer));
  const maxY      = Math.min(cfg.chartMax, Math.ceil(dataMax  + buffer));

  const innerW = CHART_W - PAD.left - PAD.right;
  const innerH = CHART_H - PAD.top  - PAD.bottom;

  const pts1: ChartPt[] = makeChartPoints(v1, CHART_W - PAD.right, CHART_H, PAD.left, PAD.top, minY, maxY);
  const pts2: ChartPt[] | undefined = v2
    ? makeChartPoints(v2, CHART_W - PAD.right, CHART_H, PAD.left, PAD.top, minY, maxY)
    : undefined;

  const line1 = smoothLinePath(pts1);
  const fill1 = areaPath(pts1, CHART_H, PAD.top);

  // BP fill polygon between systolic and diastolic
  let bpFill = '';
  if (pts2) {
    const topPath  = smoothLinePath(pts1);
    const botPts   = [...pts2].reverse();
    const botPath  = botPts.map((p, i) => `${i === 0 ? 'L' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    bpFill = `${topPath} ${botPath} Z`;
  }

  const line2 = pts2 ? smoothLinePath(pts2) : '';

  // X-axis date labels (up to 7)
  const step    = Math.max(1, Math.floor(logs.length / 6));
  const xLabels = logs
    .map((l, i) => ({ i, date: l.date }))
    .filter(({ i }) => i % step === 0 || i === logs.length - 1);

  const grids = gridValues(minY, maxY);

  // Reference band (normal range)
  const refLowY  = yPos(Math.min(cfg.refHigh, maxY), minY, maxY);
  const refHighY = yPos(Math.max(cfg.refLow,  minY), minY, maxY);

  return (
    <Animated.View entering={FadeIn.delay(100).duration(400)}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id={`area_${type}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={cfg.color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={cfg.color} stopOpacity={0}    />
          </LinearGradient>
          <LinearGradient id="bp_fill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#A78BFA" stopOpacity={0.18} />
            <Stop offset="1" stopColor="#A78BFA" stopOpacity={0.06} />
          </LinearGradient>
        </Defs>

        {/* Reference band */}
        <Rect
          x={PAD.left}
          y={refLowY}
          width={innerW}
          height={Math.max(0, refHighY - refLowY)}
          fill={cfg.color + '12'}
          rx={3}
        />

        {/* Grid lines */}
        {grids.map(v => {
          const gy = yPos(v, minY, maxY);
          return (
            <Line
              key={v}
              x1={PAD.left} y1={gy}
              x2={CHART_W - PAD.right} y2={gy}
              stroke={colors.cardBorder}
              strokeWidth={0.8}
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Y-axis labels */}
        {grids.map(v => (
          <SvgText
            key={`lbl_${v}`}
            x={PAD.left - 4}
            y={yPos(v, minY, maxY) + 4}
            fontSize={9}
            fill={colors.muted}
            textAnchor="end"
          >
            {v}
          </SvgText>
        ))}

        {/* BP fill polygon */}
        {bpFill ? <Path d={bpFill} fill="url(#bp_fill)" /> : null}

        {/* Area fill (single line) */}
        {!pts2 && <Path d={fill1} fill={`url(#area_${type})`} />}

        {/* Lines */}
        <Path d={line1} stroke={cfg.color} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {line2 ? <Path d={line2} stroke="#7C3AED" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}

        {/* Data dots — primary */}
        {pts1.map((p, i) => (
          <Circle key={`d1_${i}`} cx={p.x} cy={p.y} r={3} fill={cfg.color} stroke={colors.card} strokeWidth={1.5} />
        ))}
        {/* Data dots — secondary (diastolic) */}
        {pts2?.map((p, i) => (
          <Circle key={`d2_${i}`} cx={p.x} cy={p.y} r={2.5} fill="#7C3AED" stroke={colors.card} strokeWidth={1.5} />
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ i, date }) => {
          const x = pts1[i]?.x ?? 0;
          const d = new Date(date + 'T12:00:00');
          const lbl = `${d.getMonth() + 1}/${d.getDate()}`;
          return (
            <SvgText
              key={`xl_${i}`}
              x={x}
              y={CHART_H - 4}
              fontSize={9}
              fill={colors.muted}
              textAnchor="middle"
            >
              {lbl}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend for BP */}
      {pts2 && (
        <View style={st.legend}>
          <LegendDot color={cfg.color}  label="Systolic"  />
          <LegendDot color="#7C3AED"    label="Diastolic" />
        </View>
      )}
    </Animated.View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={st.legendItem}>
      <View style={[st.legendDot, { backgroundColor: color }]} />
      <Text style={st.legendTxt}>{label}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  empty:      { alignItems: 'center', justifyContent: 'center' },
  emptyTxt:   { fontSize: 13, fontStyle: 'italic' },
  legend:     { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 6 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 8, height: 8, borderRadius: 4 },
  legendTxt:  { fontSize: 11, fontWeight: '600', color: '#888' },
});
