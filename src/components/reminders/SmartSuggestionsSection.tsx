import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import SectionHeader from '@/components/ui/SectionHeader';
import { AppIconDef } from '@/components/ui';
import { SmartSuggestion, getCategoryIcon } from '@/constants/reminders';

interface Props {
  suggestions: SmartSuggestion[];
  onApply: (suggestion: SmartSuggestion) => void;
}

export default function SmartSuggestionsSection({ suggestions, onApply }: Props) {
  const { colors } = useTheme();
  const st = useMemo(() => getStyles(colors), [colors]);

  return (
    <>
      <SectionHeader title="Smart Suggestions" accentColor="#6366F1" />
      <View style={st.col}>
        {suggestions.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[st.chip, { borderColor: s.color + '25' }]}
            activeOpacity={0.8}
            onPress={() => onApply(s)}
          >
            <View style={[st.iconWrap, { backgroundColor: s.color + '15' }]}>
              <AppIconDef icon={getCategoryIcon(s.category, s.title)} color={s.color} size={18} />
            </View>
            <View style={st.texts}>
              <Text style={st.text}>{s.text}</Text>
              <Text style={st.subText}>{s.title} • {s.time}</Text>
            </View>
            <View style={[st.addBtn, { backgroundColor: s.color + '18', borderColor: s.color + '40' }]}>
              <Ionicons name="add" size={12} color={s.color} />
              <Text style={[st.addText, { color: s.color }]}>Setup</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  col: { gap: 8 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: colors.cardBorder, padding: 14,
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  texts: { flex: 1, gap: 2 },
  text: { ...Typography.captionBold, color: colors.text.primary },
  subText: { ...Typography.micro, color: colors.muted },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: Radius.pill,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1,
  },
  addText: { ...Typography.captionBold },
});
