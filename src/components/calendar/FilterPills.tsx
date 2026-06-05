import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { ThemeColors } from '@/theme';
import { Filter, FILTER_CONFIG, DOT_COLORS, CAL_H_PAD } from '@/constants/calendar';

interface FilterPillsProps {
  filter:   Filter;
  onChange: (f: Filter) => void;
  colors:   ThemeColors;
}

export function FilterPills({ filter, onChange, colors }: FilterPillsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[st.row, { paddingHorizontal: CAL_H_PAD }]}
    >
      {FILTER_CONFIG.map(f => {
        const active = filter === f.key;
        const color  = f.dotKey ? DOT_COLORS[f.dotKey] : colors.text.secondary;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[
              st.pill,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
              active && { backgroundColor: color + '22', borderColor: color + '70' },
            ]}
          >
            {f.dotKey && (
              <View style={[st.dot, { backgroundColor: active ? color : colors.muted }]} />
            )}
            <Text style={[st.label, { color: active ? color : colors.muted }]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const st = StyleSheet.create({
  row:   { paddingBottom: 12, gap: 8, flexDirection: 'row' },
  pill:  {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  dot:   { width: 6, height: 6, borderRadius: 3 },
  label: { fontSize: 12, fontWeight: '600' },
});
