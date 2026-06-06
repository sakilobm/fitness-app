import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring,
  withSequence, withRepeat, withDelay, Easing,
} from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeColors } from '@/theme';
import { TIER_META } from '@/constants/rewards';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { triggerHaptic } from '@/utils/haptics';
import { CelebrationEvent } from '@/hooks/useRewardWatcher';

const PARTICLE_COUNT = 10;

interface Props {
  event:     CelebrationEvent | null;
  onDismiss: () => void;
  colors:    ThemeColors;
}

export function RewardCelebrationOverlay({ event, onDismiss, colors }: Props) {
  const scale   = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const [rendered, setRendered] = useState(false);
  const [content, setContent] = useState<CelebrationEvent | null>(null);

  const visible = event !== null;

  useEffect(() => {
    if (visible) {
      setContent(event);
      setRendered(true);
      opacity.value = withTiming(1, { duration: 220 });
      scale.value   = withSpring(1, { damping: 13, stiffness: 170, mass: 0.9 });
      triggerHaptic('success');
    } else {
      opacity.value = withTiming(0, { duration: 200 });
      scale.value   = withTiming(0.7, { duration: 200 });
      const t = setTimeout(() => { setRendered(false); setContent(null); }, 260);
      return () => clearTimeout(t);
    }
  }, [visible, event]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity:   opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!rendered || !content) return null;

  const isBadge = content.type === 'badge';
  const accent  = isBadge ? TIER_META[content.badge.tier].color : '#FBBF24';
  const glow    = isBadge ? TIER_META[content.badge.tier].glow  : 'rgba(251,191,36,0.40)';

  return (
    <Modal visible={true} transparent animationType="none" onRequestClose={onDismiss}>
      <Animated.View style={[st.backdrop, backdropStyle]}>
        <LinearGradient
          colors={[accent + '33', 'rgba(0,0,0,0.78)']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={st.center} pointerEvents="box-none">
        <Animated.View style={[st.card, cardStyle]}>
          <View style={st.badgeStage}>
            <GlowRing color={glow} size={180} delay={0} />
            <GlowRing color={glow} size={180} delay={500} />
            <ParticleBurst color={accent} />

            {isBadge ? (
              <BadgeReveal icon={content.badge.icon} color={accent} />
            ) : (
              <LevelReveal fromLevel={content.fromLevel} toLevel={content.toLevel} color={accent} />
            )}
          </View>

          <Text style={[st.kicker, { color: accent }]}>
            {isBadge ? 'BADGE UNLOCKED' : 'LEVEL UP!'}
          </Text>
          <Text style={[st.title, { color: '#FFFFFF' }]}>
            {isBadge ? content.badge.label : `You reached Level ${content.toLevel}`}
          </Text>
          {isBadge && (
            <Text style={st.subtitle}>{content.badge.description}</Text>
          )}

          {isBadge && (
            <View style={st.xpRow}>
              <Text style={st.xpPlus}>+</Text>
              <AnimatedNumber value={content.badge.xpReward} style={st.xpNum} duration={900} />
              <Text style={st.xpLabel}>XP</Text>
            </View>
          )}

          <TouchableOpacity onPress={onDismiss} style={[st.cta, { backgroundColor: accent }]} activeOpacity={0.85}>
            <Text style={st.ctaTxt}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ── Badge reveal: spring-scaled icon in a tier-glow ring ─────────────────────
function BadgeReveal({ icon, color }: { icon: { lib: 'Ionicons' | 'MCI'; name: string }; color: string }) {
  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withDelay(120, withSpring(1, { damping: 11, stiffness: 160, mass: 1 }));
  }, []);
  const style = useAnimatedStyle(() => ({
    transform: [
      { scale: reveal.value },
      { rotate: `${(1 - reveal.value) * -90}deg` },
    ],
  }));
  const Icon = icon.lib === 'MCI' ? MaterialCommunityIcons : Ionicons;
  return (
    <Animated.View style={[st.badgeRing, { borderColor: color, backgroundColor: color + '22' }, style]}>
      <Icon name={icon.name as never} size={48} color={color} />
    </Animated.View>
  );
}

// ── Level-up reveal: old level fades out, new level springs in ───────────────
function LevelReveal({ fromLevel, toLevel, color }: { fromLevel: number; toLevel: number; color: string }) {
  const reveal = useSharedValue(0);
  useEffect(() => {
    reveal.value = withDelay(120, withSpring(1, { damping: 12, stiffness: 160 }));
  }, []);
  const oldStyle = useAnimatedStyle(() => ({
    opacity:   1 - reveal.value,
    transform: [{ scale: 1 - reveal.value * 0.4 }, { translateY: -reveal.value * 14 }],
  }));
  const newStyle = useAnimatedStyle(() => ({
    opacity:   reveal.value,
    transform: [{ scale: 0.6 + reveal.value * 0.4 }],
  }));
  return (
    <View style={[st.badgeRing, { borderColor: color, backgroundColor: color + '22' }]}>
      <Animated.Text style={[st.levelOld, oldStyle]}>{fromLevel}</Animated.Text>
      <Animated.Text style={[st.levelNew, { color }, newStyle]}>{toLevel}</Animated.Text>
    </View>
  );
}

// ── Looping radial glow ring ──────────────────────────────────────────────────
function GlowRing({ color, size, delay }: { color: string; size: number; delay: number }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withDelay(
      delay,
      withRepeat(withSequence(
        withTiming(1, { duration: 1300, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 0 }),
      ), -1, false),
    );
  }, []);
  const style = useAnimatedStyle(() => ({
    opacity:   (1 - pulse.value) * 0.55,
    transform: [{ scale: 0.55 + pulse.value * 0.7 }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[st.glowRing, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }, style]}
    />
  );
}

// ── Particle burst — small dots animating outward + fading ───────────────────
function ParticleBurst({ color }: { color: string }) {
  return (
    <View style={st.particleField} pointerEvents="none">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <Particle key={i} index={i} total={PARTICLE_COUNT} color={color} />
      ))}
    </View>
  );
}

function Particle({ index, total, color }: { index: number; total: number; color: string }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      index * 28,
      withTiming(1, { duration: 760, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const angle    = (index / total) * Math.PI * 2;
  const distance = 64 + (index % 3) * 14;

  const style = useAnimatedStyle(() => {
    const t = progress.value;
    return {
      opacity:   1 - t,
      transform: [
        { translateX: Math.cos(angle) * distance * t },
        { translateY: Math.sin(angle) * distance * t },
        { scale: 1 - t * 0.5 },
      ],
    };
  });

  return <Animated.View style={[st.particle, { backgroundColor: color }, style]} />;
}

const st = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28,
  },
  card: {
    width: '100%', maxWidth: 340,
    borderRadius: 28,
    paddingVertical: 28, paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,26,0.92)',
  },

  badgeStage: {
    width: 180, height: 180,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  glowRing: { position: 'absolute' },
  particleField: {
    position: 'absolute', width: 1, height: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  particle: { position: 'absolute', width: 7, height: 7, borderRadius: 3.5 },

  badgeRing: {
    width: 100, height: 100, borderRadius: 50,
    borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  levelOld: {
    position: 'absolute', fontSize: 30, fontWeight: '800', color: 'rgba(255,255,255,0.6)',
  },
  levelNew: {
    fontSize: 38, fontWeight: '800', letterSpacing: -1,
  },

  kicker:   { fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title:    { fontSize: 20, fontWeight: '800', marginTop: 4, textAlign: 'center', letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 6, textAlign: 'center', lineHeight: 18 },

  xpRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 4, marginTop: 16 },
  xpPlus:  { fontSize: 22, fontWeight: '800', color: '#A7F3D0' },
  xpNum:   { fontSize: 28, fontWeight: '800', color: '#A7F3D0', letterSpacing: -0.5 },
  xpLabel: { fontSize: 14, fontWeight: '700', color: '#A7F3D0', marginBottom: 4 },

  cta:    { marginTop: 22, paddingHorizontal: 36, paddingVertical: 13, borderRadius: 24 },
  ctaTxt: { fontSize: 15, fontWeight: '800', color: '#0B0B0F' },
});
