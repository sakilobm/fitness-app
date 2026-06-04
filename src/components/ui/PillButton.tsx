import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Radius, Typography, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface PillButtonProps {
  label: string;
  icon?: string;
  onPress?: () => void;
  active?: boolean;
  color?: string;
  style?: ViewStyle;
  small?: boolean;
}

export default function PillButton({ label, icon, onPress, active, color, style, small }: PillButtonProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);
  const activeColor = color || colors.lime;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.pill,
        small && styles.small,
        active && { backgroundColor: activeColor + '22', borderColor: activeColor },
        style,
      ]}
    >
      {icon && <Text style={[styles.icon, small && styles.iconSmall]}>{icon}</Text>}
      <Text style={[styles.label, active && { color: activeColor }, small && styles.labelSmall]}>{label}</Text>
    </TouchableOpacity>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  small: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  icon: { fontSize: 15 },
  iconSmall: { fontSize: 12 },
  label: { ...Typography.captionBold, color: colors.muted },
  labelSmall: { fontSize: 11 },
});
