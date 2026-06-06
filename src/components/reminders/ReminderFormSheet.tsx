import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, TextInput, Platform, KeyboardAvoidingView, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { ALL_DAYS, CATEGORIES, FREQUENCIES } from '@/constants/reminders';
import { ReminderFormResult } from '@/hooks/useReminderForm';
import DayPills from './DayPills';

interface Props {
  form: ReminderFormResult;
  categoryColors: Record<string, string>;
  accentColorOptions: string[];
}

export default function ReminderFormSheet({ form, categoryColors, accentColorOptions }: Props) {
  const { colors, isDark } = useTheme();
  const st = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <Modal visible={form.visible} transparent animationType="slide" onRequestClose={form.close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={st.backdrop}
      >
        <View style={st.sheet}>
          <View style={st.handle} />
          <View style={st.headerRow}>
            <Text style={st.title}>{form.isEditing ? 'Edit Reminder' : 'New Reminder'}</Text>
            {form.isEditing && (
              <TouchableOpacity onPress={form.removeEditing} style={st.deleteHeaderBtn}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </TouchableOpacity>
            )}
          </View>

          {form.error ? <Text style={st.errorText}>⚠️ {form.error}</Text> : null}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scrollBody}>
            {/* Category Picker Grid */}
            <Text style={st.fieldLabel}>Category</Text>
            <View style={st.categoryGrid}>
              {CATEGORIES.slice(1).map((c) => {
                const color = categoryColors[c] || colors.lime;
                const isSel = form.category === c;
                return (
                  <TouchableOpacity
                    key={c}
                    style={[
                      st.catBtn,
                      { borderColor: color + '40' },
                      isSel && { backgroundColor: color + '18', borderColor: color },
                    ]}
                    onPress={() => form.setCategory(c)}
                  >
                    <Text style={[st.catBtnText, { color }, isSel && { fontWeight: '800' }]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title input */}
            <Text style={st.fieldLabel}>Reminder Label</Text>
            <TextInput
              style={st.titleInput}
              placeholder="e.g. Drink 250ml Water"
              placeholderTextColor={colors.muted}
              value={form.title}
              onChangeText={form.setTitle}
            />

            {/* Custom Segmented Time Selector */}
            <Text style={st.fieldLabel}>Scheduled Time</Text>
            <View style={st.timeCard}>
              <View style={st.timeRow}>
                <View style={st.timeColumn}>
                  <Text style={st.timeColumnLabel}>HR</Text>
                  <TextInput
                    style={st.timeValueInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={form.hour}
                    onChangeText={form.setHour}
                    selectTextOnFocus
                  />
                </View>
                <Text style={st.timeSeparator}>:</Text>
                <View style={st.timeColumn}>
                  <Text style={st.timeColumnLabel}>MIN</Text>
                  <TextInput
                    style={st.timeValueInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={form.minute}
                    onChangeText={form.setMinute}
                    selectTextOnFocus
                  />
                </View>
                <View style={st.ampmWrapper}>
                  <TouchableOpacity
                    onPress={() => form.setAmPm('AM')}
                    style={[st.ampmBtn, form.ampm === 'AM' && [st.ampmBtnActive, { backgroundColor: form.accent }]]}
                  >
                    <Text style={[st.ampmText, form.ampm === 'AM' && st.ampmTextActive]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => form.setAmPm('PM')}
                    style={[st.ampmBtn, form.ampm === 'PM' && [st.ampmBtnActive, { backgroundColor: form.accent }]]}
                  >
                    <Text style={[st.ampmText, form.ampm === 'PM' && st.ampmTextActive]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={st.adjustRow}>
                <TouchableOpacity style={st.adjustBtn} onPress={() => form.adjustTime(0, -15)}>
                  <Text style={st.adjustText}>-15m</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.adjustBtn} onPress={() => form.adjustTime(-1, 0)}>
                  <Text style={st.adjustText}>-1h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.adjustBtn} onPress={() => form.adjustTime(1, 0)}>
                  <Text style={st.adjustText}>+1h</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.adjustBtn} onPress={() => form.adjustTime(0, 15)}>
                  <Text style={st.adjustText}>+15m</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Repeat Frequency Preset pills */}
            <Text style={st.fieldLabel}>Repeat Frequency</Text>
            <View style={st.frequencyRow}>
              {FREQUENCIES.map((freq) => {
                const isSel = form.frequency === freq;
                return (
                  <TouchableOpacity
                    key={freq}
                    onPress={() => form.setFrequency(freq)}
                    style={[st.freqPill, isSel && { backgroundColor: form.accent + '18', borderColor: form.accent }]}
                  >
                    <Text style={[st.freqText, isSel && { color: form.accent }]}>{freq}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Days multi selector row */}
            <View style={st.daysSection}>
              <Text style={st.fieldSubLabel}>Days of Week</Text>
              <View style={st.daysSelectorPills}>
                <DayPills days={ALL_DAYS} selected={form.days} onToggle={form.toggleDay} />
              </View>
            </View>

            {/* Color accent Picker */}
            <Text style={st.fieldLabel}>Indicator Theme Color</Text>
            <View style={st.accentColorsRow}>
              {accentColorOptions.map((col) => {
                const isSel = form.accent === col;
                return (
                  <TouchableOpacity
                    key={col}
                    onPress={() => form.setAccent(col)}
                    style={[st.colorCircle, { backgroundColor: col }, isSel && st.colorCircleSelected]}
                  />
                );
              })}
            </View>
          </ScrollView>

          <View style={st.actionButtons}>
            <TouchableOpacity onPress={form.close} style={st.cancelBtn}>
              <Text style={st.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={form.save}
              style={[st.saveBtn, { backgroundColor: form.accent }]}
              activeOpacity={0.8}
            >
              <Text style={st.saveText}>Save Reminder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 44 : 24,
    gap: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
    maxHeight: '94%',
  },
  handle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: colors.muted + '55', borderRadius: 2,
    marginBottom: 4,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.h3, color: colors.text.primary },
  deleteHeaderBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.danger + '12',
    alignItems: 'center', justifyContent: 'center',
  },
  errorText: {
    ...Typography.captionBold,
    color: colors.danger,
    backgroundColor: colors.danger + '10',
    padding: 8,
    borderRadius: Radius.md,
  },
  scrollBody: { gap: 14, paddingBottom: 24 },
  fieldLabel: {
    ...Typography.caption,
    fontWeight: '800',
    color: colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 6,
  },
  fieldSubLabel: {
    ...Typography.micro,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catBtn: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  catBtnText: { ...Typography.captionBold },
  titleInput: {
    ...Typography.body,
    color: colors.text.primary,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  timeCard: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    gap: 12,
  },
  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  timeColumn: { alignItems: 'center', gap: 4 },
  timeColumnLabel: { ...Typography.micro, color: colors.muted },
  timeValueInput: {
    ...Typography.h2,
    color: colors.text.primary,
    backgroundColor: colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    width: 64,
    height: 52,
    textAlign: 'center',
  },
  timeSeparator: { ...Typography.h2, color: colors.muted, paddingBottom: 4 },
  ampmWrapper: { flexDirection: 'column', gap: 4, justifyContent: 'center' },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  ampmBtnActive: { borderColor: 'transparent' },
  ampmText: { ...Typography.micro, fontWeight: '700', color: colors.muted },
  ampmTextActive: { color: colors.bg },
  adjustRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  adjustBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  adjustText: { ...Typography.micro, color: colors.text.secondary, fontWeight: '600' },

  frequencyRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  freqPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  freqText: { ...Typography.captionBold, color: colors.muted },
  daysSection: {
    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 4,
  },
  daysSelectorPills: { alignItems: 'center', paddingVertical: 4 },

  accentColorsRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap', paddingVertical: 4 },
  colorCircle: { width: 32, height: 32, borderRadius: 16 },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: colors.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },

  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
  },
  cancelText: { ...Typography.bodyBold, color: colors.text.secondary },
  saveBtn: { flex: 2, paddingVertical: 14, borderRadius: Radius.md, alignItems: 'center' },
  saveText: { ...Typography.bodyBold, color: colors.bg },
});
