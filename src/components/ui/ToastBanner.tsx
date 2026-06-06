import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Typography, Radius } from '@/constants/theme';
import { ToastType } from '@/hooks/useToast';
import GlassCard from './GlassCard';

interface Props {
  message: string | null;
  type: ToastType;
}

const ICONS: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  alert: 'trash-outline',
  info: 'notifications',
};

/** Self-positioning, theme-aware toast banner — drop into any screen alongside useToast(). */
export default function ToastBanner({ message, type }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!message) return null;

  const accent = type === 'success' ? colors.lime : type === 'alert' ? colors.danger : colors.chart.water;

  return (
    <View style={[st.container, { top: insets.top + 10 }]}>
      <GlassCard noPadding style={StyleSheet.flatten([st.card, { borderColor: accent + '40' }])}>
        <View style={[st.accentBar, { backgroundColor: accent }]} />
        <View style={st.body}>
          <Ionicons name={ICONS[type]} size={18} color={accent} />
          <Text numberOfLines={2} style={[st.text, { color: colors.text.primary }]}>{message}</Text>
        </View>
      </GlassCard>
    </View>
  );
}

const st = StyleSheet.create({
  container: { position: 'absolute', left: 16, right: 16, zIndex: 9999 },
  card: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  accentBar: { height: 3 },
  body: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  text: { ...Typography.captionBold, flex: 1 },
});
