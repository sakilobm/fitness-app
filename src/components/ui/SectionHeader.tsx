import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Typography, Radius, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
  /** Optional accent color for the left bar */
  accentColor?: string;
}

export default function SectionHeader({ title, action, onAction, accentColor }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        {accentColor && (
          <View style={[styles.accentDot, { backgroundColor: accentColor }]} />
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity onPress={onAction} style={styles.actionBtn}>
          <Text style={styles.action}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
  },
  titleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accentDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  title: { ...Typography.h4, color: colors.text.primary },
  actionBtn: {
    backgroundColor: colors.lime + '12',
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.lime + '25',
  },
  action: { ...Typography.captionBold, color: colors.lime, letterSpacing: 0.4 },
});
