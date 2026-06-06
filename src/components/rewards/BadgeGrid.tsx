import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import { Badge, BadgeCategory } from '@/types';
import { CATEGORY_LABELS } from '@/constants/rewards';
import { BadgeTile } from './BadgeTile';

interface Props {
  groups:    { category: BadgeCategory; badges: Badge[] }[];
  onSelect:  (badge: Badge) => void;
  colors:    ThemeColors;
}

export function BadgeGrid({ groups, onSelect, colors }: Props) {
  return (
    <View>
      {groups.map((group, gi) => (
        <Animated.View
          key={group.category}
          entering={FadeInDown.springify().damping(18).delay(gi * 60)}
          style={st.section}
        >
          <Text style={[st.sectionTitle, { color: colors.text.primary }]}>
            {CATEGORY_LABELS[group.category]}
          </Text>
          <View style={st.row}>
            {group.badges.map((badge) => (
              <BadgeTile key={badge.id} badge={badge} colors={colors} onPress={() => onSelect(badge)} />
            ))}
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const st = StyleSheet.create({
  section:      { marginBottom: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '800', letterSpacing: 0.6, marginBottom: 12, marginLeft: 16 },
  row:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16 },
});
