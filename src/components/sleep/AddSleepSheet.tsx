import { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalSheet from '@/components/ui/ModalSheet';
import { ThemeColors } from '@/theme';
import { SleepLog } from '@/types';
import {
  computeTotalMin, estimateStages, computeSleepScore,
  formatDuration, sleepScoreColor, sleepScoreLabel,
  SLEEP_STAGE_COLORS,
} from '@/constants/sleep';
import { todayISO } from '@/constants/calendar';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave:  (log: Omit<SleepLog, 'id'>) => void;
  colors:  ThemeColors;
}

function clampH(h: number) { return ((h % 24) + 24) % 24; }
function stepM(m: number, dir: 1 | -1) {
  const snapped = Math.round(m / 5) * 5;
  return ((snapped + dir * 5) % 60 + 60) % 60;
}
function pad2(n: number) { return String(n).padStart(2, '0'); }

export function AddSleepSheet({ visible, onClose, onSave, colors }: Props) {
  const [bedH,    setBedH]    = useState(23);
  const [bedM,    setBedM]    = useState(0);
  const [wakeH,   setWakeH]   = useState(7);
  const [wakeM,   setWakeM]   = useState(0);
  const [wakeUps, setWakeUps] = useState(1);

  const bedtime  = `${pad2(bedH)}:${pad2(bedM)}`;
  const wakeTime = `${pad2(wakeH)}:${pad2(wakeM)}`;

  const { totalMin, stages, score } = useMemo(() => {
    const total  = computeTotalMin(bedtime, wakeTime);
    const stgs   = estimateStages(total, wakeUps);
    const sc     = computeSleepScore({ totalMin: total, ...stgs, wakeUps });
    return { totalMin: total, stages: stgs, score: sc };
  }, [bedtime, wakeTime, wakeUps]);

  const scoreColor = sleepScoreColor(score, colors.lime);

  function handleSave() {
    onSave({
      date:      todayISO(),
      bedtime,
      wakeTime,
      totalMin,
      ...stages,
      wakeUps,
      score,
    });
    onClose();
  }

  return (
    <ModalSheet visible={visible} onClose={onClose} minHeight={540}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={st.titleRow}>
          <Text style={[st.title, { color: colors.text.primary }]}>Log Sleep</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} style={[st.closeBtn, { backgroundColor: colors.cardBorder }]}>
            <Ionicons name="close" size={18} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Times */}
        <View style={st.timesRow}>
          <TimeStepper
            label="Bedtime"
            icon="moon-outline"
            hour={bedH} minute={bedM}
            onHourUp={() => setBedH(clampH(bedH + 1))}
            onHourDown={() => setBedH(clampH(bedH - 1))}
            onMinUp={() => setBedM(stepM(bedM, 1))}
            onMinDown={() => setBedM(stepM(bedM, -1))}
            colors={colors}
          />
          <View style={[st.timeDivider, { backgroundColor: colors.cardBorder }]} />
          <TimeStepper
            label="Wake up"
            icon="sunny-outline"
            hour={wakeH} minute={wakeM}
            onHourUp={() => setWakeH(clampH(wakeH + 1))}
            onHourDown={() => setWakeH(clampH(wakeH - 1))}
            onMinUp={() => setWakeM(stepM(wakeM, 1))}
            onMinDown={() => setWakeM(stepM(wakeM, -1))}
            colors={colors}
          />
        </View>

        {/* Live preview */}
        <View style={[st.preview, { backgroundColor: colors.overlay, borderColor: colors.cardBorder }]}>
          <View style={st.previewLeft}>
            <Text style={[st.previewDur, { color: colors.text.primary }]}>
              {formatDuration(totalMin)}
            </Text>
            <Text style={[st.previewCycles, { color: colors.muted }]}>
              {stages.cycles.toFixed(1)} cycles
            </Text>
          </View>
          <View style={st.previewRight}>
            <Text style={[st.previewScore, { color: scoreColor }]}>{score}</Text>
            <Text style={[st.previewScoreLbl, { color: colors.muted }]}>
              {sleepScoreLabel(score)}
            </Text>
          </View>
        </View>

        {/* Stage preview bar */}
        <View style={st.stageSection}>
          <Text style={[st.stageSectionTitle, { color: colors.muted }]}>Estimated Stages</Text>
          <View style={[st.stageBarWrap, { backgroundColor: colors.cardBorder }]}>
            {[
              { key: 'deep'  as const, min: stages.deepMin  },
              { key: 'rem'   as const, min: stages.remMin   },
              { key: 'light' as const, min: stages.lightMin },
              { key: 'awake' as const, min: stages.awakeMin },
            ].map(({ key, min }) => (
              <View
                key={key}
                style={[
                  st.stageSeg,
                  { width: `${(min / totalMin) * 100}%`, backgroundColor: SLEEP_STAGE_COLORS[key] },
                ]}
              />
            ))}
          </View>
          <View style={st.stageLegend}>
            {[
              { label: 'Deep',  color: SLEEP_STAGE_COLORS.deep,  min: stages.deepMin  },
              { label: 'REM',   color: SLEEP_STAGE_COLORS.rem,   min: stages.remMin   },
              { label: 'Light', color: SLEEP_STAGE_COLORS.light, min: stages.lightMin },
              { label: 'Awake', color: SLEEP_STAGE_COLORS.awake, min: stages.awakeMin },
            ].map(({ label, color, min }) => (
              <View key={label} style={st.legendItem}>
                <View style={[st.legendDot, { backgroundColor: color }]} />
                <Text style={[st.legendTxt, { color: colors.muted }]}>
                  {label} {pad2(Math.floor(min / 60))}:{pad2(min % 60)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Wake-up counter */}
        <View style={st.wakeRow}>
          <Text style={[st.wakeLabel, { color: colors.text.primary }]}>Wake-ups</Text>
          <View style={st.counter}>
            <CounterBtn onPress={() => setWakeUps(Math.max(0, wakeUps - 1))} icon="remove" colors={colors} />
            <Text style={[st.counterVal, { color: colors.text.primary }]}>{wakeUps}</Text>
            <CounterBtn onPress={() => setWakeUps(Math.min(15, wakeUps + 1))} icon="add" colors={colors} />
          </View>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          style={[st.saveBtn, { backgroundColor: scoreColor }]}
          activeOpacity={0.82}
        >
          <Text style={st.saveBtnTxt}>Save Sleep</Text>
        </TouchableOpacity>
      </ScrollView>
    </ModalSheet>
  );
}

function TimeStepper({
  label, icon, hour, minute,
  onHourUp, onHourDown, onMinUp, onMinDown, colors,
}: {
  label: string; icon: string;
  hour: number; minute: number;
  onHourUp: () => void; onHourDown: () => void;
  onMinUp: () => void; onMinDown: () => void;
  colors: ThemeColors;
}) {
  return (
    <View style={st.stepper}>
      <View style={st.stepperHeader}>
        <Ionicons name={icon as any} size={14} color={colors.muted} />
        <Text style={[st.stepperLabel, { color: colors.muted }]}>{label}</Text>
      </View>
      <View style={st.spinners}>
        <Spinner value={pad2(hour)} onUp={onHourUp} onDown={onHourDown} colors={colors} />
        <Text style={[st.colon, { color: colors.text.primary }]}>:</Text>
        <Spinner value={pad2(minute)} onUp={onMinUp} onDown={onMinDown} colors={colors} />
      </View>
    </View>
  );
}

function Spinner({
  value, onUp, onDown, colors,
}: { value: string; onUp: () => void; onDown: () => void; colors: ThemeColors }) {
  return (
    <View style={st.spinnerWrap}>
      <TouchableOpacity onPress={onUp} hitSlop={{ top: 8, bottom: 4, left: 12, right: 12 }} style={st.spinBtn}>
        <Ionicons name="chevron-up" size={18} color={colors.text.primary} />
      </TouchableOpacity>
      <Text style={[st.spinVal, { color: colors.text.primary }]}>{value}</Text>
      <TouchableOpacity onPress={onDown} hitSlop={{ top: 4, bottom: 8, left: 12, right: 12 }} style={st.spinBtn}>
        <Ionicons name="chevron-down" size={18} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

function CounterBtn({
  onPress, icon, colors,
}: { onPress: () => void; icon: 'add' | 'remove'; colors: ThemeColors }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[st.ctrBtn, { borderColor: colors.cardBorder }]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={18} color={colors.text.primary} />
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  titleRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title:             { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  closeBtn:          { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  timesRow:          { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  timeDivider:       { width: 1, height: 60, marginHorizontal: 8 },

  stepper:           { flex: 1, alignItems: 'center' },
  stepperHeader:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  stepperLabel:      { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  spinners:          { flexDirection: 'row', alignItems: 'center' },
  colon:             { fontSize: 28, fontWeight: '800', marginHorizontal: 2, paddingBottom: 4 },
  spinnerWrap:       { alignItems: 'center' },
  spinBtn:           { padding: 2 },
  spinVal:           { fontSize: 30, fontWeight: '800', letterSpacing: -1, width: 46, textAlign: 'center' },

  preview:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  previewLeft:       {},
  previewDur:        { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  previewCycles:     { fontSize: 12, marginTop: 2 },
  previewRight:      { alignItems: 'flex-end' },
  previewScore:      { fontSize: 28, fontWeight: '800' },
  previewScoreLbl:   { fontSize: 11, fontWeight: '600' },

  stageSection:      { marginBottom: 20 },
  stageSectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginBottom: 8 },
  stageBarWrap:      { flexDirection: 'row', height: 8, borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  stageSeg:          { height: '100%' },
  stageLegend:       { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot:         { width: 7, height: 7, borderRadius: 3.5 },
  legendTxt:         { fontSize: 10, fontWeight: '600' },

  wakeRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  wakeLabel:         { fontSize: 15, fontWeight: '700' },
  counter:           { flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctrBtn:            { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  counterVal:        { fontSize: 20, fontWeight: '800', width: 32, textAlign: 'center' },

  saveBtn:           { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnTxt:        { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
