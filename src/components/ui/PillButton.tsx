import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, Typography } from '@/constants/theme';

interface PillButtonProps {
  label: string;
  icon?: string;
  onPress?: () => void;
  active?: boolean;
  color?: string;
  style?: ViewStyle;
  small?: boolean;
}

export default function PillButton({ label, icon, onPress, active, color = Colors.lime, style, small }: PillButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.pill,
        small && styles.small,
        active && { backgroundColor: color + '22', borderColor: color },
        style,
      ]}
    >
      {icon && <Text style={[styles.icon, small && styles.iconSmall]}>{icon}</Text>}
      <Text style={[styles.label, active && { color }, small && styles.labelSmall]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
  label: { ...Typography.captionBold, color: Colors.muted },
  labelSmall: { fontSize: 11 },
});
