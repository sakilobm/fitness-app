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
      {/* Subtle inner glow at top */}
      {accentColor && (
        <View style={[styles.innerGlow, { backgroundColor: accentColor + '06' }]} />
      )}
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
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
});
