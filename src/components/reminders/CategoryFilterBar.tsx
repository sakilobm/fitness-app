import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Props {
  categories: string[];
  active: string;
  categoryColors: Record<string, string>;
  onSelect: (category: string) => void;
}

export default function CategoryFilterBar({ categories, active, categoryColors, onSelect }: Props) {
  const { colors } = useTheme();
  const st = useMemo(() => getStyles(colors), [colors]);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.scroll}>
      <View style={st.row}>
        {categories.map((c) => {
          const isActive = active === c;
          const color = categoryColors[c] || colors.lime;
          return (
            <TouchableOpacity
              key={c}
              style={[st.pill, isActive && { backgroundColor: color + '18', borderColor: color }]}
              onPress={() => onSelect(c)}
              activeOpacity={0.75}
            >
              <Text style={[st.text, isActive && { color }]}>{c}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  scroll: { marginHorizontal: -16 },
  row: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 2 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  text: { ...Typography.captionBold, color: colors.muted },
});
