import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';

// ── MiniBar ───────────────────────────────────────────────────────────────────
export function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <View style={bar.track}>
      <View style={[bar.fill, { width: `${Math.min(100, pct)}%`, backgroundColor: color }]} />
    </View>
  );
}
const bar = StyleSheet.create({
  track: { height: 3, borderRadius: 2, backgroundColor: 'rgba(150,150,150,0.15)', marginTop: 6, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 2 },
});

// ── MetricCard ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  icon:      string;
  label:     string;
  color:     string;
  colors:    ThemeColors;
  isEmpty:   boolean;
  emptyText: string;
  children?: React.ReactNode;
}

function MetricCardBase({ icon, label, color, colors, isEmpty, emptyText, children }: MetricCardProps) {
  return (
    <View style={[mc.card, { backgroundColor: color + '0E', borderColor: color + '35' }]}>
      <View style={mc.header}>
        <View style={[mc.bubble, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon as any} size={13} color={color} />
        </View>
        <Text style={[mc.label, { color: colors.muted }]}>{label}</Text>
      </View>
      {isEmpty
        ? <Text style={[mc.empty, { color: colors.muted }]}>{emptyText}</Text>
        : children}
    </View>
  );
}

export const MetricCard = React.memo(MetricCardBase);

const mc = StyleSheet.create({
  card:   { width: '48%', borderRadius: 16, padding: 13, borderWidth: 1, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  bubble: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  label:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  empty:  { fontSize: 11, fontWeight: '500', opacity: 0.7, marginTop: 2 },
});
