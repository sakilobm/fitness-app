import { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ModalSheet from '@/components/ui/ModalSheet';
import { ThemeColors } from '@/theme';
import {
  HeartRateLog, BloodPressureLog, BloodGlucoseLog, OxygenLog,
  HeartRateContext, BPPosition, BPArm, GlucoseUnit, GlucoseContext,
} from '@/types';
import {
  VitalType, VITAL_CONFIG,
  hrCategory, bpCategory, glucoseCategory, spo2Category,
  formatBP, formatGlucose, mgdlToMmol,
  HR_CONTEXTS, BP_POSITIONS, GLUCOSE_CONTEXTS,
  nowHHMM,
} from '@/constants/vitals';
import { todayISO } from '@/constants/calendar';

interface Props {
  visible:          boolean;
  initialType?:     VitalType;
  onClose:          () => void;
  onSaveHR:         (log: Omit<HeartRateLog,       'id'>) => void;
  onSaveBP:         (log: Omit<BloodPressureLog,   'id'>) => void;
  onSaveGlucose:    (log: Omit<BloodGlucoseLog,    'id'>) => void;
  onSaveOxygen:     (log: Omit<OxygenLog,          'id'>) => void;
  colors:           ThemeColors;
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function pad2(n: number) { return String(n).padStart(2, '0'); }

const TYPES: VitalType[] = ['heartRate', 'bloodPressure', 'bloodGlucose', 'oxygen'];

export function AddVitalSheet({
  visible, initialType = 'heartRate', onClose,
  onSaveHR, onSaveBP, onSaveGlucose, onSaveOxygen, colors,
}: Props) {
  const [activeType,  setActiveType]  = useState<VitalType>(initialType);

  // Heart Rate state
  const [bpm,        setBpm]        = useState(70);
  const [hrCtx,      setHrCtx]      = useState<HeartRateContext>('resting');

  // Blood Pressure state
  const [sys,        setSys]        = useState(120);
  const [dia,        setDia]        = useState(80);
  const [bpPulse,    setBpPulse]    = useState(72);
  const [bpPos,      setBpPos]      = useState<BPPosition>('sitting');
  const [bpArm,      setBpArm]      = useState<BPArm>('left');

  // Glucose state
  const [glucoseVal, setGlucoseVal] = useState(95);
  const [glucoseUnit,setGlucoseUnit]= useState<GlucoseUnit>('mg/dL');
  const [glcCtx,     setGlcCtx]    = useState<GlucoseContext>('fasting');

  // SpO2 state
  const [spo2,       setSpo2]       = useState(98);
  const [o2Pulse,    setO2Pulse]    = useState(72);

  const cfg = VITAL_CONFIG[activeType];

  // Live category preview
  const preview = useMemo(() => {
    switch (activeType) {
      case 'heartRate':     return hrCategory(bpm);
      case 'bloodPressure': return bpCategory(sys, dia);
      case 'bloodGlucose':  return glucoseCategory(glucoseVal);
      case 'oxygen':        return spo2Category(spo2);
    }
  }, [activeType, bpm, sys, dia, glucoseVal, spo2]);

  function handleSave() {
    const date = todayISO();
    const time = nowHHMM();
    switch (activeType) {
      case 'heartRate':
        onSaveHR({ date, time, bpm, context: hrCtx }); break;
      case 'bloodPressure':
        onSaveBP({ date, time, systolic: sys, diastolic: dia, pulse: bpPulse, position: bpPos, arm: bpArm }); break;
      case 'bloodGlucose':
        onSaveGlucose({ date, time, value: glucoseVal, unit: glucoseUnit, context: glcCtx }); break;
      case 'oxygen':
        onSaveOxygen({ date, time, spo2, pulse: o2Pulse }); break;
    }
    onClose();
  }

  return (
    <ModalSheet visible={visible} onClose={onClose} minHeight={520}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={st.header}>
          <Text style={[st.title, { color: colors.text.primary }]}>Log Vital</Text>
          <TouchableOpacity onPress={onClose} style={[st.closeBtn, { backgroundColor: colors.cardBorder }]} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close" size={18} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Type selector */}
        <View style={st.typeRow}>
          {TYPES.map(t => {
            const tc    = VITAL_CONFIG[t];
            const active = t === activeType;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setActiveType(t)}
                style={[st.typePill, active
                  ? { backgroundColor: tc.color + '22', borderColor: tc.color }
                  : { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <Ionicons name={tc.icon as any} size={13} color={active ? tc.color : colors.muted} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Vital label */}
        <Text style={[st.vitalLabel, { color: cfg.color }]}>{cfg.label}</Text>

        {/* ── Heart Rate form ─────────────────────────────── */}
        {activeType === 'heartRate' && (
          <View>
            <SpinRow label="BPM" value={bpm} onInc={() => setBpm(clamp(bpm + 1, 20, 250))} onDec={() => setBpm(clamp(bpm - 1, 20, 250))} color={cfg.color} colors={colors} />
            <Label text="Context" colors={colors} />
            <PillPicker items={HR_CONTEXTS} selected={hrCtx} onSelect={setHrCtx} color={cfg.color} colors={colors} />
          </View>
        )}

        {/* ── Blood Pressure form ─────────────────────────── */}
        {activeType === 'bloodPressure' && (
          <View>
            <View style={st.dualSpinRow}>
              <View style={{ flex: 1 }}>
                <SpinRow label="Systolic" value={sys} onInc={() => setSys(clamp(sys + 2, 60, 300))} onDec={() => setSys(clamp(sys - 2, 60, 300))} color={cfg.color} colors={colors} compact />
              </View>
              <Text style={[st.slash, { color: colors.muted }]}>/</Text>
              <View style={{ flex: 1 }}>
                <SpinRow label="Diastolic" value={dia} onInc={() => setDia(clamp(dia + 2, 40, 200))} onDec={() => setDia(clamp(dia - 2, 40, 200))} color={cfg.color} colors={colors} compact />
              </View>
            </View>
            <SpinRow label="Pulse (bpm)" value={bpPulse} onInc={() => setBpPulse(clamp(bpPulse + 1, 30, 220))} onDec={() => setBpPulse(clamp(bpPulse - 1, 30, 220))} color={cfg.color} colors={colors} />
            <Label text="Position" colors={colors} />
            <PillPicker items={BP_POSITIONS} selected={bpPos} onSelect={setBpPos} color={cfg.color} colors={colors} />
            <Label text="Arm" colors={colors} />
            <PillPicker
              items={[{ key: 'left' as BPArm, label: 'Left' }, { key: 'right' as BPArm, label: 'Right' }]}
              selected={bpArm}
              onSelect={setBpArm}
              color={cfg.color}
              colors={colors}
            />
          </View>
        )}

        {/* ── Glucose form ────────────────────────────────── */}
        {activeType === 'bloodGlucose' && (
          <View>
            <View style={st.unitToggleRow}>
              {(['mg/dL', 'mmol/L'] as GlucoseUnit[]).map(u => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setGlucoseUnit(u)}
                  style={[st.unitBtn, u === glucoseUnit
                    ? { backgroundColor: cfg.color + '22', borderColor: cfg.color }
                    : { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <Text style={[st.unitBtnTxt, { color: u === glucoseUnit ? cfg.color : colors.muted }]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <SpinRow
              label={`Value (${glucoseUnit})`}
              value={glucoseUnit === 'mmol/L' ? mgdlToMmol(glucoseVal) : glucoseVal}
              onInc={() => setGlucoseVal(clamp(glucoseVal + (glucoseUnit === 'mmol/L' ? 2 : 1), 20, 600))}
              onDec={() => setGlucoseVal(clamp(glucoseVal - (glucoseUnit === 'mmol/L' ? 2 : 1), 20, 600))}
              color={cfg.color}
              colors={colors}
              decimals={glucoseUnit === 'mmol/L' ? 1 : 0}
            />
            <Label text="Context" colors={colors} />
            <PillPicker items={GLUCOSE_CONTEXTS} selected={glcCtx} onSelect={setGlcCtx} color={cfg.color} colors={colors} />
          </View>
        )}

        {/* ── SpO2 form ────────────────────────────────────── */}
        {activeType === 'oxygen' && (
          <View>
            <SpinRow label="SpO2 (%)" value={spo2} onInc={() => setSpo2(clamp(spo2 + 1, 50, 100))} onDec={() => setSpo2(clamp(spo2 - 1, 50, 100))} color={cfg.color} colors={colors} />
            <SpinRow label="Pulse (bpm)" value={o2Pulse} onInc={() => setO2Pulse(clamp(o2Pulse + 1, 30, 220))} onDec={() => setO2Pulse(clamp(o2Pulse - 1, 30, 220))} color={cfg.color} colors={colors} />
          </View>
        )}

        {/* Category preview */}
        <View style={[st.previewRow, { backgroundColor: preview.bg, borderColor: preview.color + '40' }]}>
          <View style={[st.previewDot, { backgroundColor: preview.color }]} />
          <Text style={[st.previewTxt, { color: preview.color }]}>{preview.label}</Text>
          <Text style={[st.previewDesc, { color: colors.muted }]}>{cfg.description}</Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          style={[st.saveBtn, { backgroundColor: cfg.color }]}
          activeOpacity={0.82}
        >
          <Text style={st.saveTxt}>Save Reading</Text>
        </TouchableOpacity>
      </ScrollView>
    </ModalSheet>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SpinRow({
  label, value, onInc, onDec, color, colors, compact = false, decimals = 0,
}: {
  label: string; value: number; onInc: () => void; onDec: () => void;
  color: string; colors: ThemeColors; compact?: boolean; decimals?: number;
}) {
  return (
    <View style={[st.spinRow, compact && { marginBottom: 4 }]}>
      <Text style={[st.spinLabel, { color: colors.muted }]}>{label}</Text>
      <View style={st.spinner}>
        <TouchableOpacity onPress={onDec} style={[st.spinBtn, { borderColor: colors.cardBorder }]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="remove" size={18} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[st.spinVal, { color: color }]}>{value.toFixed(decimals)}</Text>
        <TouchableOpacity onPress={onInc} style={[st.spinBtn, { borderColor: colors.cardBorder }]} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name="add" size={18} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function Label({ text, colors }: { text: string; colors: ThemeColors }) {
  return <Text style={[st.fieldLabel, { color: colors.muted }]}>{text}</Text>;
}

function PillPicker<T extends string>({
  items, selected, onSelect, color, colors,
}: {
  items: { key: T; label: string }[];
  selected: T;
  onSelect: (v: T) => void;
  color: string;
  colors: ThemeColors;
}) {
  return (
    <View style={st.pillRow}>
      {items.map(({ key, label }) => {
        const active = key === selected;
        return (
          <TouchableOpacity
            key={key}
            onPress={() => onSelect(key)}
            style={[st.optionPill, active
              ? { backgroundColor: color + '22', borderColor: color }
              : { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <Text style={[st.optionTxt, { color: active ? color : colors.muted }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const st = StyleSheet.create({
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  title:        { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  closeBtn:     { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },

  typeRow:      { flexDirection: 'row', gap: 8, marginBottom: 16, justifyContent: 'space-between' },
  typePill:     { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },

  vitalLabel:   { fontSize: 14, fontWeight: '800', letterSpacing: 0.2, marginBottom: 12 },

  dualSpinRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slash:        { fontSize: 24, fontWeight: '300', marginTop: 12, paddingHorizontal: 4 },

  spinRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  spinLabel:    { fontSize: 13, fontWeight: '600' },
  spinner:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spinBtn:      { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  spinVal:      { fontSize: 22, fontWeight: '800', width: 64, textAlign: 'center', letterSpacing: -0.5 },

  fieldLabel:   { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, marginBottom: 8, marginTop: 4 },
  pillRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  optionPill:   { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1 },
  optionTxt:    { fontSize: 12, fontWeight: '700' },

  unitToggleRow:{ flexDirection: 'row', gap: 8, marginBottom: 12 },
  unitBtn:      { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  unitBtnTxt:   { fontSize: 13, fontWeight: '700' },

  previewRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16, marginTop: 4 },
  previewDot:   { width: 10, height: 10, borderRadius: 5 },
  previewTxt:   { fontSize: 14, fontWeight: '800' },
  previewDesc:  { fontSize: 11, flex: 1, textAlign: 'right' },

  saveBtn:      { borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  saveTxt:      { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
