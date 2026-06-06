import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeColors } from '@/theme';
import { Badge } from '@/types';
import { TIER_META } from '@/constants/rewards';
import { Radius } from '@/constants/theme';

interface Props {
  badge:   Badge;
  onPress: () => void;
  colors:  ThemeColors;
}

export function BadgeTile({ badge, onPress, colors }: Props) {
  const tier = TIER_META[badge.tier];
  const iconColor = badge.unlocked ? tier.color : colors.muted;
  const Icon = badge.icon.lib === 'MCI' ? MaterialCommunityIcons : Ionicons;

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={st.wrap}>
      <View
        style={[
          st.bubble,
          {
            backgroundColor: badge.unlocked ? tier.color + '1E' : colors.muted + '14',
            borderColor:     badge.unlocked ? tier.color + '55' : colors.cardBorder,
          },
        ]}
      >
        <Icon name={badge.icon.name as never} size={26} color={iconColor} />
        {badge.unlocked && (
          <View style={[st.tierDot, { backgroundColor: tier.color }]} />
        )}
      </View>

      <Text numberOfLines={1} style={[st.label, { color: badge.unlocked ? colors.text.primary : colors.muted }]}>
        {badge.label}
      </Text>

      {badge.unlocked ? (
        <Text style={[st.tierTxt, { color: tier.color }]}>{tier.label}</Text>
      ) : (
        <View style={[st.progTrack, { backgroundColor: colors.muted + '22' }]}>
          <View style={[st.progFill, { width: `${Math.round(badge.progress * 100)}%`, backgroundColor: colors.muted }]} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  wrap:    { width: 92, alignItems: 'center' },
  bubble:  {
    width: 64, height: 64, borderRadius: Radius.lg,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  tierDot: {
    position: 'absolute', top: 4, right: 4,
    width: 8, height: 8, borderRadius: 4,
  },
  label:   { fontSize: 11, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  tierTxt: { fontSize: 9, fontWeight: '700', marginTop: 2, letterSpacing: 0.4 },

  progTrack: { width: 56, height: 4, borderRadius: 2, marginTop: 5, overflow: 'hidden' },
  progFill:  { height: '100%', borderRadius: 2 },
});
