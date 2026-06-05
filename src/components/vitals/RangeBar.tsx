import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import {
  VitalType, RangeZone,
  getHRRangeZones, getBPRangeZones, getGlucoseRangeZones, getSpO2RangeZones,
} from '@/constants/vitals';

interface Props {
  type:    VitalType;
  value:   number;
  colors:  ThemeColors;
}

function getZones(type: VitalType): RangeZone[] {
  switch (type) {
    case 'heartRate':     return getHRRangeZones();
    case 'bloodPressure': return getBPRangeZones();
    case 'bloodGlucose':  return getGlucoseRangeZones();
    case 'oxygen':        return getSpO2RangeZones();
  }
}

export function RangeBar({ type, value, colors }: Props) {
  const zones    = getZones(type);
  const totalMin = zones[0].min;
  const totalMax = zones[zones.length - 1].max;
  const span     = totalMax - totalMin;

  // Pointer position as percentage
  const clampedVal = Math.max(totalMin, Math.min(totalMax, value));
  const pct = ((clampedVal - totalMin) / span) * 100;

  // Find current zone
  const current = zones.find(z => value >= z.min && value <= z.max) ?? zones[zones.length - 1];

  return (
    <Animated.View entering={FadeIn.duration(400)} style={st.wrap}>
      <View style={st.labelRow}>
        <Text style={[st.zoneLabel, { color: current.color }]}>{current.label}</Text>
        <Text style={[st.descLabel, { color: colors.muted }]}>
          {zones[0].min} – {zones[zones.length - 1].max}
        </Text>
      </View>

      <View style={st.barContainer}>
        {/* Colored zone segments */}
        <View style={st.segRow}>
          {zones.map((z, i) => {
            const segPct = ((z.max - z.min + 1) / span) * 100;
            return (
              <View
                key={i}
                style={[
                  st.segment,
                  {
                    width:           `${segPct}%`,
                    backgroundColor: z.color + '50',
                    borderTopLeftRadius:    i === 0 ? 4 : 0,
                    borderBottomLeftRadius: i === 0 ? 4 : 0,
                    borderTopRightRadius:    i === zones.length - 1 ? 4 : 0,
                    borderBottomRightRadius: i === zones.length - 1 ? 4 : 0,
                    borderWidth: 1,
                    borderColor: z.color + '30',
                  },
                ]}
              />
            );
          })}
        </View>

        {/* Pointer (triangle + line) */}
        <View style={[st.pointer, { left: `${pct}%` as any }]}>
          <View style={[st.pointerLine, { backgroundColor: current.color }]} />
          <View style={[st.pointerDot,  { backgroundColor: current.color, borderColor: colors.card }]} />
        </View>
      </View>

      {/* Zone labels */}
      <View style={st.zoneLabelRow}>
        {zones.map((z, i) => {
          const segPct = ((z.max - z.min + 1) / span) * 100;
          return (
            <View key={i} style={[st.zoneLblWrap, { width: `${segPct}%` }]}>
              <Text style={[st.zoneLblTxt, { color: z.color }]} numberOfLines={1}>{z.label}</Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  wrap:        { marginTop: 4 },
  labelRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  zoneLabel:   { fontSize: 14, fontWeight: '800' },
  descLabel:   { fontSize: 11, fontWeight: '500' },

  barContainer:{ position: 'relative', marginBottom: 14 },
  segRow:      { flexDirection: 'row', height: 10, overflow: 'hidden' },
  segment:     { height: '100%' },

  pointer:     { position: 'absolute', top: -3, marginLeft: -1, alignItems: 'center' },
  pointerLine: { width: 2, height: 16, borderRadius: 1 },
  pointerDot:  { width: 8, height: 8, borderRadius: 4, borderWidth: 2, marginTop: -2 },

  zoneLabelRow:{ flexDirection: 'row' },
  zoneLblWrap: { alignItems: 'center' },
  zoneLblTxt:  { fontSize: 8, fontWeight: '700', letterSpacing: 0.2, textAlign: 'center' },
});
