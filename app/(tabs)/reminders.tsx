import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import GlassCard from '@/components/ui/GlassCard';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ToastBanner from '@/components/ui/ToastBanner';
import {
  ReminderCard, CategoryFilterBar, SmartSuggestionsSection, ReminderFormSheet,
} from '@/components/reminders';
import { CATEGORIES } from '@/constants/reminders';
import { useReminders } from '@/hooks/useReminders';
import { useReminderForm } from '@/hooks/useReminderForm';
import { useToast } from '@/hooks/useToast';
import { ReminderItem } from '@/types';

export default function RemindersScreen() {
  const { colors } = useTheme();
  const st = React.useMemo(() => getStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const {
    filtered, activeCount, category, setCategory,
    categoryColors, accentColorOptions, smartSuggestions,
    toggleReminder, deleteReminder,
  } = useReminders();

  const { toastMessage, toastType, showToast } = useToast();
  const form = useReminderForm({ categoryColors, showToast });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = (r: ReminderItem) => {
    deleteReminder(r.id);
    setExpandedId(null);
    showToast(`Deleted reminder "${r.title}"`, 'alert');
  };

  const handleToggleEnabled = (r: ReminderItem) => {
    toggleReminder(r.id);
    showToast(`${r.enabled ? 'Disabled' : 'Enabled'} reminder "${r.title}"`, 'info');
  };

  const handleSimulateTrigger = (r: ReminderItem) => {
    showToast(`🔔 [SIMULATION] ${r.title}! (${r.time})`, 'info');
  };

  return (
    <View style={st.container}>
      <ToastBanner message={toastMessage} type={toastType} />

      <ScrollView
        contentContainerStyle={[st.content, { paddingTop: insets.top + 16, paddingBottom: 160 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Reminders"
          subtitle={`${activeCount} ACTIVE`}
          icon={{ lib: 'Ionicons', name: 'notifications' }}
          accentColor="#6366F1"
          rightIcon="settings-outline"
        />

        <CategoryFilterBar
          categories={CATEGORIES}
          active={category}
          categoryColors={categoryColors}
          onSelect={setCategory}
        />

        <View style={st.reminderList}>
          {filtered.length === 0 ? (
            <GlassCard style={st.emptyCard}>
              <Ionicons name="notifications-off-outline" size={32} color={colors.muted} />
              <Text style={st.emptyTitle}>No reminders in this category</Text>
              <Text style={st.emptySub}>Tap "Add Reminder" below to create one!</Text>
            </GlassCard>
          ) : (
            filtered.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                expanded={expandedId === r.id}
                onToggleExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
                onToggleEnabled={() => handleToggleEnabled(r)}
                onTest={() => handleSimulateTrigger(r)}
                onEdit={() => form.openEdit(r)}
                onDelete={() => handleDelete(r)}
              />
            ))
          )}
        </View>

        <SmartSuggestionsSection suggestions={smartSuggestions} onApply={form.applySuggestion} />
      </ScrollView>

      <TouchableOpacity
        style={[st.fab, { bottom: insets.bottom + 90 }]}
        onPress={form.openAdd}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={colors.bg} />
        <Text style={st.fabText}>Add Reminder</Text>
      </TouchableOpacity>

      <ReminderFormSheet form={form} categoryColors={categoryColors} accentColorOptions={accentColorOptions} />
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  reminderList: { gap: 8 },

  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
    borderStyle: 'dashed',
    borderColor: colors.muted + '40',
  },
  emptyTitle: { ...Typography.bodyBold, color: colors.text.primary, marginTop: 4 },
  emptySub: { ...Typography.caption, color: colors.muted, textAlign: 'center' },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#6366F1',
    borderRadius: Radius.pill,
    paddingHorizontal: 20, paddingVertical: 14,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  fabText: { ...Typography.bodyBold, color: colors.bg },
});
