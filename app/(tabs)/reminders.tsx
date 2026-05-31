import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import GlassCard from '@/components/ui/GlassCard';
import SectionHeader from '@/components/ui/SectionHeader';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { Colors, Typography, Radius } from '@/constants/theme';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

type IconDef =
  | { lib: 'Ionicons'; name: IoniconName }
  | { lib: 'MCI'; name: MCIName };

function ReminderIcon({ icon, color, size = 22 }: { icon: IconDef; color: string; size?: number }) {
  if (icon.lib === 'MCI') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}

interface ReminderItem {
  id: string;
  category: string;
  icon: IconDef;
  title: string;
  time: string;
  days: string[];
  frequency: string;
  enabled: boolean;
  accentColor: string;
}

const ALL_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const initialReminders: ReminderItem[] = [
  {
    id: 'r1', category: 'Water',
    icon: { lib: 'Ionicons', name: 'water' },
    title: 'Drink Water',
    time: '08:00', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: true, accentColor: Colors.chart.water,
  },
  {
    id: 'r2', category: 'Water',
    icon: { lib: 'Ionicons', name: 'water-outline' },
    title: 'Afternoon Hydration',
    time: '15:00', days: ['M', 'T', 'W', 'T', 'F'],
    frequency: 'Weekdays', enabled: true, accentColor: Colors.chart.water,
  },
  {
    id: 'r3', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant' },
    title: 'Log Breakfast',
    time: '07:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: true, accentColor: Colors.amber,
  },
  {
    id: 'r4', category: 'Meals',
    icon: { lib: 'Ionicons', name: 'restaurant-outline' },
    title: 'Log Dinner',
    time: '19:00', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: Colors.amber,
  },
  {
    id: 'r5', category: 'Weigh-in',
    icon: { lib: 'MCI', name: 'scale-bathroom' },
    title: 'Morning Weigh-in',
    time: '07:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r6', category: 'Body Photo',
    icon: { lib: 'Ionicons', name: 'camera' },
    title: 'Progress Photo',
    time: '08:00', days: ['M'],
    frequency: 'Weekly', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r7', category: 'Workout',
    icon: { lib: 'MCI', name: 'dumbbell' },
    title: 'Strength Training',
    time: '18:00', days: ['M', 'W', 'F'],
    frequency: '3×/week', enabled: true, accentColor: Colors.lime,
  },
  {
    id: 'r8', category: 'Supplements',
    icon: { lib: 'MCI', name: 'pill' },
    title: 'Take Vitamins',
    time: '08:30', days: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    frequency: 'Daily', enabled: false, accentColor: Colors.chart.fibre,
  },
];

const SMART_SUGGESTIONS: { icon: IconDef; text: string; color: string }[] = [
  { icon: { lib: 'Ionicons', name: 'water' }, text: 'You usually forget water after 4 PM', color: Colors.chart.water },
  { icon: { lib: 'MCI', name: 'scale-bathroom' }, text: 'Weigh-in consistency drops on weekends', color: Colors.amber },
  { icon: { lib: 'Ionicons', name: 'restaurant' }, text: 'Lunch log is often skipped on Tuesdays', color: Colors.chart.calories },
];

function DayPills({ days, selected }: { days: string[]; selected: string[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {days.map((d, i) => (
        <View key={i} style={[dayS.pill, selected.includes(d) && dayS.pillActive]}>
          <Text style={[dayS.text, selected.includes(d) && dayS.textActive]}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

const dayS = StyleSheet.create({
  pill: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  pillActive: { backgroundColor: Colors.lime + '33', borderColor: Colors.lime },
  text: { ...Typography.micro, color: Colors.muted },
  textActive: { color: Colors.lime },
});

function ReminderCard({
  reminder, onToggle, onExpand, expanded,
}: {
  reminder: ReminderItem;
  onToggle: () => void;
  onExpand: () => void;
  expanded: boolean;
}) {
  return (
    <GlassCard noPadding style={{ marginBottom: 0 }}>
      <View style={[remS.accentBar, { backgroundColor: reminder.accentColor }]} />
      <TouchableOpacity style={remS.main} onPress={onExpand} activeOpacity={0.8}>
        <View style={[remS.iconWrap, { backgroundColor: reminder.accentColor + '15', borderColor: reminder.accentColor + '30' }]}>
          <ReminderIcon icon={reminder.icon} color={reminder.accentColor} size={20} />
        </View>
        <View style={remS.info}>
          <Text style={remS.title}>{reminder.title}</Text>
          <View style={remS.metaRow}>
            <View style={[remS.timeBadge, { backgroundColor: reminder.accentColor + '12' }]}>
              <Ionicons name="time-outline" size={10} color={reminder.accentColor} />
              <Text style={[remS.timeTxt, { color: reminder.accentColor }]}>{reminder.time}</Text>
            </View>
            <Text style={remS.subtitle}>{reminder.frequency}</Text>
          </View>
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={onToggle}
          trackColor={{ false: 'rgba(0,0,0,0.10)', true: reminder.accentColor + '88' }}
          thumbColor={reminder.enabled ? reminder.accentColor : Colors.muted}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={remS.expanded}>
          <View style={remS.expandRow}>
            <Text style={remS.expandLabel}>Time</Text>
            <Text style={[remS.expandValue, { color: reminder.accentColor }]}>{reminder.time}</Text>
          </View>
          <View style={remS.expandRow}>
            <Text style={remS.expandLabel}>Days</Text>
            <DayPills days={ALL_DAYS} selected={reminder.days} />
          </View>
          <View style={remS.expandRow}>
            <Text style={remS.expandLabel}>Frequency</Text>
            <Text style={remS.expandValue}>{reminder.frequency}</Text>
          </View>
          <TouchableOpacity style={[remS.editBtn, { borderColor: reminder.accentColor + '50', backgroundColor: reminder.accentColor + '15' }]}>
            <Ionicons name="pencil" size={12} color={reminder.accentColor} />
            <Text style={[remS.editBtnText, { color: reminder.accentColor }]}>Edit Reminder</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassCard>
  );
}

const remS = StyleSheet.create({
  accentBar: { height: 2.5 },
  main: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  info: { flex: 1, gap: 4 },
  title: { ...Typography.bodyBold, color: Colors.text.primary },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  timeTxt: { ...Typography.micro },
  subtitle: { ...Typography.caption, color: Colors.muted },
  expanded: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: Colors.cardBorder, gap: 10,
  },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandLabel: { ...Typography.caption, color: Colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  expandValue: { ...Typography.captionBold, color: Colors.text.primary },
  editBtn: {
    marginTop: 4, alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.pill,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1,
  },
  editBtnText: { ...Typography.captionBold },
});

const CATEGORIES = ['All', 'Water', 'Meals', 'Weigh-in', 'Body Photo', 'Workout', 'Supplements'];

const CATEGORY_COLORS: Record<string, string> = {
  All: Colors.lime,
  Water: Colors.chart.water,
  Meals: Colors.amber,
  'Weigh-in': Colors.lime,
  'Body Photo': Colors.lime,
  Workout: Colors.lime,
  Supplements: Colors.chart.fibre,
};

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const [reminders, setReminders] = useState<ReminderItem[]>(initialReminders);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [category, setCategory] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  const toggle = (id: string) =>
    setReminders((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));

  const filtered = category === 'All' ? reminders : reminders.filter((r) => r.category === category);

  const activeCount = reminders.filter((r) => r.enabled).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Reminders"
          subtitle={`${activeCount} ACTIVE`}
          icon={{ lib: 'Ionicons', name: 'notifications' }}
          accentColor="#6366F1"
          rightIcon="settings-outline"
        />

        {/* Category filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              const color = CATEGORY_COLORS[c] || Colors.lime;
              return (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.catPill,
                    isActive && { backgroundColor: color + '18', borderColor: color },
                  ]}
                  onPress={() => setCategory(c)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.catText, isActive && { color }]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.reminderList}>
          {filtered.map((r) => (
            <ReminderCard
              key={r.id}
              reminder={r}
              onToggle={() => toggle(r.id)}
              onExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
              expanded={expandedId === r.id}
            />
          ))}
        </View>

        <SectionHeader title="Smart Suggestions" accentColor="#6366F1" />
        <View style={styles.suggestionsCol}>
          {SMART_SUGGESTIONS.map((s, i) => (
            <TouchableOpacity key={i} style={[styles.suggChip, { borderColor: s.color + '25' }]} activeOpacity={0.8}>
              <View style={[styles.suggIconWrap, { backgroundColor: s.color + '15' }]}>
                <ReminderIcon icon={s.icon} color={s.color} size={18} />
              </View>
              <Text style={styles.suggText}>{s.text}</Text>
              <View style={[styles.suggAddBtn, { backgroundColor: s.color + '18', borderColor: s.color + '40' }]}>
                <Ionicons name="add" size={12} color={s.color} />
                <Text style={[styles.suggAddText, { color: s.color }]}>Add</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 90 }]}
        onPress={() => setShowAdd(true)}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={18} color={Colors.bg} />
        <Text style={styles.fabText}>Add Reminder</Text>
      </TouchableOpacity>

      <Modal visible={showAdd} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New Reminder</Text>
            <View style={styles.modalCategoryGrid}>
              {CATEGORIES.slice(1).map((c) => {
                const color = CATEGORY_COLORS[c] || Colors.lime;
                return (
                  <TouchableOpacity key={c} style={[styles.modalCatBtn, { borderColor: color + '40' }]}>
                    <Text style={[styles.modalCatBtnText, { color }]}>{c}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.modalHint}>Select a category to configure your reminder</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: 16, gap: 16 },

  catScroll: { marginHorizontal: -16 },
  catRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  catPill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.card,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  catText: { ...Typography.captionBold, color: Colors.muted },

  reminderList: { gap: 8 },

  suggestionsCol: { gap: 8 },
  suggChip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, padding: 14,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  suggIconWrap: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  suggText: { ...Typography.caption, color: Colors.text.primary, flex: 1 },
  suggAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  suggAddText: { ...Typography.captionBold },

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
  fabText: { ...Typography.bodyBold, color: Colors.bg },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
    padding: 24, gap: 16,
    borderWidth: 1, borderColor: Colors.cardBorder,
  },
  modalHandle: {
    alignSelf: 'center', width: 40, height: 4,
    backgroundColor: Colors.muted + '55', borderRadius: 2,
  },
  modalTitle: { ...Typography.h3, color: Colors.text.primary },
  modalCategoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalCatBtn: {
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  modalCatBtnText: { ...Typography.captionBold },
  modalHint: { ...Typography.caption, color: Colors.muted, textAlign: 'center' },
  modalClose: { alignItems: 'center', paddingVertical: 6 },
  modalCloseText: { ...Typography.bodyBold, color: Colors.danger },
});
