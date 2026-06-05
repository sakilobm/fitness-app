import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

const { width } = Dimensions.get('window');

interface Props {
  isAppReady: boolean;
  preview?: boolean;          // When true: skips native splash hide, auto-exits after 3.5s
  onPreviewDismiss?: () => void;
}

export default function AnimatedSplashScreen({ isAppReady, preview = false, onPreviewDismiss }: Props) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  const startTime = useRef(Date.now());

  // ── Container (overlay) — only opacity, NO scale so it stays full-bleed ──
  const overlayOpacity = useSharedValue(1);

  // ── Inner content animations ──────────────────────────────────────────────
  const logoScale = useSharedValue(0.72);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(24);

  // ── Subtle pulse on the icon ring ─────────────────────────────────────────
  const ringScale = useSharedValue(1);

  useEffect(() => {
    // Only hide the native expo splash when NOT in preview mode
    if (!preview) {
      SplashScreen.hideAsync().catch(() => { });
    }

    // Phase 1 — Entrance
    logoOpacity.value = withTiming(1, { duration: 280 });
    logoScale.value = withSpring(1, { damping: 13, stiffness: 140 });
    textOpacity.value = withDelay(320, withTiming(1, { duration: 420 }));
    textY.value = withDelay(320, withSpring(0, { damping: 14, stiffness: 120 }));

    // Idle breathing pulse on ring
    ringScale.value = withDelay(
      600,
      withRepeat(
        withSequence(
          withTiming(1.08, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      ),
    );

    // In preview mode: auto-exit after 2.2s
    if (preview) {
      const timer = setTimeout(() => triggerExit(), 2200);
      return () => clearTimeout(timer);
    }
  }, []);

  // Shared exit logic
  const triggerExit = () => {
    overlayOpacity.value = withDelay(
      200,
      withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) {
          runOnJS(setIsAnimationComplete)(true);
          if (onPreviewDismiss) runOnJS(onPreviewDismiss)();
        }
      }),
    );
  };

  useEffect(() => {
    if (!isAppReady || preview) return;
    // Entrance animation completes at ~750ms from mount (text delay 320 + spring 420).
    // Wait at least that long before fading so the logo is never interrupted.
    // On slow boots (>750ms) the extra delay collapses to the 200ms buffer.
    const elapsed = Date.now() - startTime.current;
    const minDelay = Math.max(200, 750 - elapsed);
    overlayOpacity.value = withDelay(
      minDelay,
      withTiming(0, { duration: 380, easing: Easing.out(Easing.ease) }, (finished) => {
        if (finished) runOnJS(setIsAnimationComplete)(true);
      }),
    );
  }, [isAppReady]);

  // ── Animated styles ───────────────────────────────────────────────────────
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  if (isAnimationComplete) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.overlay, overlayStyle]}>
      <StatusBar barStyle="light-content" backgroundColor="#0A1A10" />

      {/* Background radial glow */}
      <View style={[styles.glowBlob, { width: width * 1.6, height: width * 1.6, borderRadius: width }]} />

      {/* Pulsing outer ring */}
      <Animated.View style={[styles.outerRing, ringStyle]} />

      {/* Logo icon */}
      <Animated.View style={[styles.iconWrap, logoStyle]}>
        <View style={styles.iconInner}>
          <Ionicons name="flash" size={56} color="#FFFFFF" />
        </View>
      </Animated.View>

      {/* App name + tagline */}
      <Animated.View style={[styles.textBlock, textStyle]}>
        <Animated.Text style={styles.appName}>FitForge</Animated.Text>
        <Animated.Text style={styles.tagline}>Forge Your Best Self</Animated.Text>
      </Animated.View>

      {/* Bottom version dot */}
      <View style={styles.bottomDot}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    // absoluteFill handles top/left/right/bottom = 0
    // Using flex + backgroundColor ensures no gaps, even behind safe areas
    backgroundColor: '#0D1F12',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  glowBlob: {
    position: 'absolute',
    backgroundColor: 'rgba(46,125,94,0.18)',
    alignSelf: 'center',
    top: '-20%',
  },
  outerRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(46,125,94,0.35)',
  },
  iconWrap: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    // Glow shadow
    shadowColor: '#2E7D5E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  iconInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
  },
  bottomDot: {
    position: 'absolute',
    bottom: 52,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.20)',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#2E7D5E',
  },
});
