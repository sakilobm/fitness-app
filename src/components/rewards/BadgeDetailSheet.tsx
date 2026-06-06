import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Radius } from '@/constants/theme';
import { ThemeColors } from '@/theme';
import { Badge } from '@/types';
import { TIER_META, CATEGORY_LABELS } from '@/constants/rewards';

const SHEET_H = 360;

interface Props {
  badge:   Badge | null;
  onClose: () => void;
  colors:  ThemeColors;
}

export function BadgeDetailSheet({ badge, onClose, colors }: Props) {
  const translateY = useSharedValue(SHEET_H);
  const backdropOp = useSharedValue(0);
  const [rendered, setRendered] = useState(false);

  const visible = badge !== null;

  useEffect(() => {
    if (visible) {
      setRendered(true);
      translateY.value = withSpring(0, { damping: 22, stiffness: 260, mass: 0.9 });
      backdropOp.value = withTiming(1, { duration: 220 });
    } else {
      backdropOp.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(SHEET_H, { damping: 22, stiffness: 260, mass: 0.9 });
      const t = setTimeout(() => setRendered(false), 380);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const bgStyle    = useAnimatedStyle(() => ({ opacity: backdropOp.value }));

  if (!rendered || !badge) return null;

  const tier = TIER_META[badge.tier];
  const Icon = badge.icon.lib === 'MCI' ? MaterialCommunityIcons : Ionicons;
  const iconColor = badge.unlocked ? tier.color : colors.muted;

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[st.backdrop, bgStyle]}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[st.sheet, { backgroundColor: colors.card, borderColor: colors.cardBorder }, sheetStyle]}>
        <View style={[st.handle, { backgroundColor: colors.muted + '50' }]} />

        <View style={st.body}>
          <View
            style={[
              st.iconBubble,
              {
                backgroundColor: badge.unlocked ? tier.color + '1E' : colors.muted + '14',
                borderColor:     badge.unlocked ? tier.color + '55' : colors.cardBorder,
              },
            ]}
          >
            <Icon name={badge.icon.name as never} size={36} color={iconColor} />
          </View>

          <Text style={[st.label, { color: colors.text.primary }]}>{badge.label}</Text>
          <Text style={[st.desc, { color: colors.muted }]}>{badge.description}</Text>

          <View style={st.metaRow}>
            <View style={[st.metaChip, { backgroundColor: tier.color + '1A' }]}>
              <Text style={[st.metaTxt, { color: tier.color }]}>{tier.label}</Text>
            </View>
            <View style={[st.metaChip, { backgroundColor: colors.muted + '14' }]}>
              <Text style={[st.metaTxt, { color: colors.muted }]}>{CATEGORY_LABELS[badge.category]}</Text>
            </View>
            <View style={[st.metaChip, { backgroundColor: colors.lime + '1A' }]}>
              <Text style={[st.metaTxt, { color: colors.lime }]}>+{badge.xpReward} XP</Text>
            </View>
          </View>

          {badge.unlocked ? (
            <Text style={[st.unlockedTxt, { color: colors.lime }]}>
              Unlocked {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : ''}
            </Text>
          ) : (
            <View style={st.progressWrap}>
              <View style={[st.progTrack, { backgroundColor: colors.muted + '22' }]}>
                <View style={[st.progFill, { width: `${Math.round(badge.progress * 100)}%`, backgroundColor: colors.muted }]} />
              </View>
              <Text style={[st.progTxt, { color: colors.muted }]}>{Math.round(badge.progress * 100)}% there</Text>
            </View>
          )}

          <TouchableOpacity onPress={onClose} style={[st.closeBtn, { backgroundColor: colors.lime }]}>
            <Text style={st.closeTxt}>Got it</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const st = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    borderTopLeftRadius:  Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingTop: 10,
    paddingBottom: 28,
    elevation: 24,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center', marginBottom: 12,
  },
  body:   { alignItems: 'center', paddingHorizontal: 24 },
  iconBubble: {
    width: 76, height: 76, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginBottom: 14,
  },
  label:  { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, textAlign: 'center' },
  desc:   { fontSize: 13, marginTop: 4, textAlign: 'center', lineHeight: 18 },

  metaRow:  { flexDirection: 'row', gap: 8, marginTop: 14 },
  metaChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  metaTxt:  { fontSize: 11, fontWeight: '700' },

  unlockedTxt: { fontSize: 12, fontWeight: '700', marginTop: 16 },

  progressWrap: { width: '100%', marginTop: 16, alignItems: 'center' },
  progTrack:    { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  progFill:     { height: '100%', borderRadius: 4 },
  progTxt:      { fontSize: 11, fontWeight: '600', marginTop: 6 },

  closeBtn: {
    marginTop: 22, paddingHorizontal: 32, paddingVertical: 12,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
  },
  closeTxt: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});
