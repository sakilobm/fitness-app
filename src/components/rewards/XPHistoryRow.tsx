import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { XPGainEvent } from '@/types';

interface Props {
  event:  XPGainEvent;
  colors: ThemeColors;
}

export function XPHistoryRow({ event, colors }: Props) {
  const Icon = event.icon.lib === 'MCI' ? MaterialCommunityIcons : Ionicons;

  return (
    <View style={[st.row, { borderColor: colors.cardBorder }]}>
      <View style={[st.bubble, { backgroundColor: colors.lime + '1A' }]}>
        <Icon name={event.icon.name as never} size={16} color={colors.lime} />
      </View>
      <View style={st.meta}>
        <Text style={[st.reason, { color: colors.text.primary }]} numberOfLines={1}>{event.reason}</Text>
        <Text style={[st.time, { color: colors.muted }]}>{event.date} · {event.time}</Text>
      </View>
      <Text style={[st.amount, { color: colors.lime }]}>+{event.amount} XP</Text>
    </View>
  );
}

const st = StyleSheet.create({
  row:    {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bubble: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  meta:   { flex: 1 },
  reason: { fontSize: 13, fontWeight: '700' },
  time:   { fontSize: 11, marginTop: 1 },
  amount: { fontSize: 13, fontWeight: '800' },
});
