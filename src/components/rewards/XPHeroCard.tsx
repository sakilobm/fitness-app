import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ThemeColors } from '@/theme';
import ProgressRing from '@/components/ui/ProgressRing';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import GlassCard from '@/components/ui/GlassCard';

interface Props {
  level:        number;
  xp:           number;
  nextLevelXp:  number;
  xpProgress:   number;
  streak:       number;
  colors:       ThemeColors;
}

export function XPHeroCard({ level, xp, nextLevelXp, xpProgress, streak, colors }: Props) {
  return (
    <Animated.View entering={FadeInDown.springify().damping(18)}>
      <GlassCard style={st.card} accentColor={colors.lime}>
        <View style={st.topRow}>
          <ProgressRing size={112} strokeWidth={9} progress={xpProgress} color={colors.lime}>
            <View style={st.ringContent}>
              <Text style={[st.levelLabel, { color: colors.muted }]}>LEVEL</Text>
              <AnimatedNumber
                value={level}
                style={{ ...st.levelNum, color: colors.text.primary }}
                duration={900}
              />
            </View>
          </ProgressRing>

          <View style={st.details}>
            <Text style={[st.xpHeading, { color: colors.text.primary }]}>
              {xp.toLocaleString()} <Text style={{ color: colors.muted, fontWeight: '600' }}>/ {nextLevelXp.toLocaleString()} XP</Text>
            </Text>
            <Text style={[st.xpSub, { color: colors.muted }]}>
              {Math.max(0, nextLevelXp - xp).toLocaleString()} XP to Level {level + 1}
            </Text>

            <View style={[st.barTrack, { backgroundColor: colors.muted + '22' }]}>
              <View style={[st.barFill, { width: `${Math.round(xpProgress * 100)}%`, backgroundColor: colors.lime }]} />
            </View>

            <View style={st.streakChip}>
              <Text style={st.streakIcon}>🔥</Text>
              <Text style={[st.streakTxt, { color: colors.text.primary }]}>{streak}-day streak</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

const st = StyleSheet.create({
  card:        { marginHorizontal: 16 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 16 },
  ringContent: { alignItems: 'center' },
  levelLabel:  { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  levelNum:    { fontSize: 30, fontWeight: '800', letterSpacing: -1 },

  details:     { flex: 1 },
  xpHeading:   { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  xpSub:       { fontSize: 12, marginTop: 2, marginBottom: 10 },

  barTrack:    { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill:     { height: '100%', borderRadius: 4 },

  streakChip:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  streakIcon:  { fontSize: 14 },
  streakTxt:   { fontSize: 13, fontWeight: '700' },
});
