import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '@/constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  accentColor?: string;
  noPadding?: boolean;
}

export default function GlassCard({ children, style, accentColor, noPadding }: GlassCardProps) {
  return (
    <View style={[styles.card, noPadding ? null : styles.padded, Shadows.card, style]}>
      {accentColor && <View style={[styles.accent, { backgroundColor: accentColor }]} />}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
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
