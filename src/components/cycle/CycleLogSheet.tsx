import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, Modal, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { CycleLog, FlowLevel, CycleSymptom, CycleMood } from '@/types';
import {
  FLOW_META, FLOW_LEVELS, MOOD_META, MOODS, SYMPTOM_META, SYMPTOMS,
} from '@/constants/cycle';
import { triggerHaptic } from '@/utils/haptics';

interface Props {
  visible:   boolean;
  date:      string;
  existing?: CycleLog | null;
  onSave:    (log: Omit<CycleLog, 'id'>) => void;
  onClose:   () => void;
  onDelete?: () => void;
}

export default function CycleLogSheet({ visible, date, existing, onSave, onClose, onDelete }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  const [flow,     setFlow]     = useState<FlowLevel | null>(null);
  const [symptoms, setSymptoms] = useState<CycleSymptom[]>([]);
  const [mood,     setMood]     = useState<CycleMood | null>(null);
  const [note,     setNote]     = useState('');

  const [mounted, setMounted] = useState(false);

  const translateY = useSharedValue(400);
  const opacity    = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      setFlow(existing?.flow ?? null);
      setSymptoms(existing?.symptoms ?? []);
      setMood(existing?.mood ?? null);
      setNote(existing?.note ?? '');
      translateY.value = withTiming(0,  { duration: 320, easing: Easing.out(Easing.cubic) });
      opacity.value    = withTiming(1,  { duration: 240 });
    } else {
      translateY.value = withTiming(420, { duration: 220 });
      opacity.value    = withTiming(0,   { duration: 200 });
      const t = setTimeout(() => setMounted(false), 260);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const sheetStyle   = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const toggleSymptom = (s: CycleSymptom) => {
    triggerHaptic('selection');
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
  };

  const handleSave = () => {
    triggerHaptic('success');
    onSave({ date, flow, symptoms, mood, note: note.trim(), bbt: null });
    onClose();
  };

  const displayDate = new Date(date + 'T00:00:00')
    .toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' });

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)' }, backdropStyle]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
        pointerEvents="box-none"
      >
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}>
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>{existing ? 'Edit Log' : 'Log Day'}</Text>
              <Text style={styles.headerDate}>{displayDate}</Text>
            </View>
            <View style={styles.headerActions}>
              {existing && onDelete && (
                <TouchableOpacity
                  onPress={() => { triggerHaptic('medium'); onDelete(); }}
                  style={[styles.closeBtn, { backgroundColor: '#F8717118' }]}
                >
                  <Ionicons name="trash-outline" size={18} color="#F87171" />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 8 }}>
            {/* Flow */}
            <View>
              <Text style={styles.sectionTitle}>Flow</Text>
              <View style={styles.flowRow}>
                {FLOW_LEVELS.map((level) => {
                  const m = FLOW_META[level];
                  const active = flow === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[styles.flowChip, active && { backgroundColor: m.color + '25', borderColor: m.color }]}
                      activeOpacity={0.8}
                      onPress={() => { setFlow(active ? null : level); triggerHaptic('selection'); }}
                    >
                      <Text style={{ fontSize: 16 }}>
                        {'🩸'.repeat(m.drops)}
                      </Text>
                      <Text style={[styles.flowLabel, active && { color: m.color }]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Mood */}
            <View>
              <Text style={styles.sectionTitle}>How are you feeling?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => {
                  const meta   = MOOD_META[m];
                  const active = mood === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.moodChip, active && { backgroundColor: meta.color + '25', borderColor: meta.color }]}
                      activeOpacity={0.8}
                      onPress={() => { setMood(active ? null : m); triggerHaptic('selection'); }}
                    >
                      <Text style={{ fontSize: 22 }}>{meta.emoji}</Text>
                      <Text style={[styles.moodLabel, active && { color: meta.color }]}>{meta.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Symptoms */}
            <View>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <View style={styles.symptomGrid}>
                {SYMPTOMS.map((sym) => {
                  const m      = SYMPTOM_META[sym];
                  const active = symptoms.includes(sym);
                  return (
                    <TouchableOpacity
                      key={sym}
                      style={[styles.symptomChip, active && { backgroundColor: '#F8717125', borderColor: '#F87171' }]}
                      activeOpacity={0.8}
                      onPress={() => toggleSymptom(sym)}
                    >
                      <Ionicons
                        name={m.icon as never}
                        size={14}
                        color={active ? '#F87171' : colors.muted}
                      />
                      <Text style={[styles.symptomLabel, active && { color: '#F87171' }]}>{m.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Note */}
            <View>
              <Text style={styles.sectionTitle}>Notes (optional)</Text>
              <TextInput
                style={styles.noteInput}
                placeholder="How are you doing today..."
                placeholderTextColor={colors.muted}
                multiline
                value={note}
                onChangeText={setNote}
              />
            </View>
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: '#F87171' }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveTxt}>Save Log</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  kav:          { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12,
    gap: 16, maxHeight: '90%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: colors.cardBorder,
    alignSelf: 'center', marginBottom: 4,
  },
  header:        { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...Typography.h4, color: colors.text.primary },
  headerDate:  { ...Typography.caption, color: colors.muted, marginTop: 2 },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { ...Typography.captionBold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  flowRow:  { flexDirection: 'row', gap: 8 },
  flowChip: {
    flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  flowLabel: { ...Typography.micro, color: colors.text.secondary },
  moodRow:  { flexDirection: 'row', gap: 6 },
  moodChip: {
    flex: 1, alignItems: 'center', gap: 3, paddingVertical: 10,
    borderRadius: Radius.md, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  moodLabel: { ...Typography.micro, color: colors.text.secondary },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 7, paddingHorizontal: 11,
    borderRadius: Radius.pill, borderWidth: 1, borderColor: colors.cardBorder,
    backgroundColor: colors.bg,
  },
  symptomLabel: { ...Typography.caption, color: colors.text.secondary },
  noteInput: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: Radius.md, padding: 12, minHeight: 72,
    ...Typography.body, color: colors.text.primary,
    textAlignVertical: 'top',
  },
  saveBtn: {
    marginTop: 4, borderRadius: Radius.pill,
    paddingVertical: 15, alignItems: 'center',
  },
  saveTxt: { ...Typography.bodyBold, color: '#FFFFFF' },
});
