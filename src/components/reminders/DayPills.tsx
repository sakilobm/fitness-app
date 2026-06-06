import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, Typography } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface Props {
  days: string[];
  selected: string[];
  onToggle?: (day: string) => void;
}

export default function DayPills({ days, selected, onToggle }: Props) {
  const { colors, isDark } = useTheme();
  const st = useMemo(() => getStyles(colors, isDark), [colors, isDark]);

  return (
    <View style={st.row}>
      {days.map((d, i) => {
        const isSel = selected.includes(d);
        const Component = onToggle ? TouchableOpacity : View;
        return (
          <Component
            key={i}
            onPress={onToggle ? () => onToggle(d) : undefined}
            style={[st.pill, isSel && st.pillActive]}
            activeOpacity={onToggle ? 0.75 : 1}
          >
            <Text style={[st.text, isSel && st.textActive]}>{d}</Text>
          </Component>
        );
      })}
    </View>
  );
}

const getStyles = (colors: ThemeColors, isDark: boolean) => StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  pill: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.cardBorder,
  },
  pillActive: { backgroundColor: colors.lime + '33', borderColor: colors.lime },
  text: { ...Typography.micro, color: colors.muted },
  textActive: { color: colors.lime },
});
