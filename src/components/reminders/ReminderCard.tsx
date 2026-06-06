import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import GlassCard from '@/components/ui/GlassCard';
import { AppIconDef } from '@/components/ui';
import { ReminderItem } from '@/types';
import { ALL_DAYS } from '@/constants/reminders';
import DayPills from './DayPills';

interface Props {
  reminder: ReminderItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onTest: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ReminderCard({
  reminder: r, expanded, onToggleExpand, onToggleEnabled, onTest, onEdit, onDelete,
}: Props) {
  const { colors } = useTheme();
  const st = useMemo(() => getStyles(colors), [colors]);

  return (
    <GlassCard noPadding style={st.card}>
      <View style={[st.accentBar, { backgroundColor: r.accentColor }]} />
      <TouchableOpacity style={st.main} onPress={onToggleExpand} activeOpacity={0.8}>
        <View style={[st.iconWrap, { backgroundColor: r.accentColor + '15', borderColor: r.accentColor + '30' }]}>
          <AppIconDef icon={r.icon} color={r.accentColor} size={20} />
        </View>
        <View style={st.info}>
          <Text style={[st.title, !r.enabled && { color: colors.muted }]}>{r.title}</Text>
          <View style={st.metaRow}>
            <View style={[st.timeBadge, { backgroundColor: r.accentColor + '12' }]}>
              <Ionicons name="time-outline" size={10} color={r.accentColor} />
              <Text style={[st.timeTxt, { color: r.accentColor }]}>{r.time}</Text>
            </View>
            <Text style={st.subtitle}>{r.frequency}</Text>
          </View>
        </View>
        <Switch
          value={r.enabled}
          onValueChange={onToggleEnabled}
          trackColor={{ false: 'rgba(0,0,0,0.10)', true: r.accentColor + '88' }}
          thumbColor={r.enabled ? r.accentColor : colors.muted}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={st.expanded}>
          <View style={st.expandRow}>
            <Text style={st.expandLabel}>Scheduled Time</Text>
            <Text style={[st.expandValue, { color: r.accentColor }]}>{r.time}</Text>
          </View>
          <View style={st.expandRow}>
            <Text style={st.expandLabel}>Days Repeat</Text>
            <DayPills days={ALL_DAYS} selected={r.days} />
          </View>
          <View style={st.expandRow}>
            <Text style={st.expandLabel}>Frequency</Text>
            <Text style={st.expandValue}>{r.frequency}</Text>
          </View>
          <View style={st.expandRow}>
            <Text style={st.expandLabel}>Actions</Text>
            <View style={st.btnGroup}>
              <TouchableOpacity
                onPress={onTest}
                style={[st.actionIconBtn, { backgroundColor: colors.chart.water + '15', borderColor: colors.chart.water + '30' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="play" size={12} color={colors.chart.water} />
                <Text style={[st.actionIconText, { color: colors.chart.water }]}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onEdit}
                style={[st.actionIconBtn, { backgroundColor: colors.lime + '15', borderColor: colors.lime + '30' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={12} color={colors.lime} />
                <Text style={[st.actionIconText, { color: colors.lime }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDelete}
                style={[st.actionIconBtn, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '30' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={12} color={colors.danger} />
                <Text style={[st.actionIconText, { color: colors.danger }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </GlassCard>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  card: { marginBottom: 0, overflow: 'hidden' },
  accentBar: { height: 2.5 },
  main: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  iconWrap: {
    width: 40, height: 40, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  info: { flex: 1, gap: 4 },
  title: { ...Typography.bodyBold, color: colors.text.primary },
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
  subtitle: { ...Typography.caption, color: colors.muted },
  expanded: {
    paddingHorizontal: 14, paddingBottom: 14,
    borderTopWidth: 1, borderTopColor: colors.cardBorder, gap: 12,
    paddingTop: 12,
  },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandLabel: { ...Typography.caption, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8 },
  expandValue: { ...Typography.captionBold, color: colors.text.primary },
  btnGroup: { flexDirection: 'row', gap: 6 },
  actionIconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  actionIconText: { ...Typography.captionBold },
});
