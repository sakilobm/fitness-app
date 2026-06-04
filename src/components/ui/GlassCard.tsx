import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Radius, Shadows, useTheme } from '@/constants/theme';
import { ThemeColors } from '@/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  noPadding?: boolean;
}

export default function GlassCard({ children, style, accentColor, noPadding }: GlassCardProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => getStyles(colors), [colors]);

  console.log('[GlassCard Debug] cardColor:', colors.card, 'isDark:', isDark);

  return (
    <View
      style={[
        styles.card,
        noPadding ? null : styles.padded,
        Shadows.card,
        accentColor ? { borderColor: accentColor + '20' } : null,
        style,
      ]}
    >
      {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
      {children}
    </View>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  padded: {
    padding: 16,
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});

