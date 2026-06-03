import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  runOnJS,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { Colors, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';

const { width, height } = Dimensions.get('window');

interface Props {
  isAppReady: boolean;
}

export default function AnimatedSplashScreen({ isAppReady }: Props) {
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);

  // Animation values
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);
  const iconRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    // Phase 1: Entrance animation (while app is loading)
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withSpring(0, { damping: 12 }));
    
    // Continuous rotation for the icon
    iconRotate.value = withTiming(360, { duration: 2000, easing: Easing.linear });

    // Hide the native splash screen smoothly so our custom one is visible
    setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 100);
  }, []);

  useEffect(() => {
    if (isAppReady) {
      // Phase 2: Exit animation (when app finishes booting)
      // We give it a short delay so the user can enjoy the entrance if the app loads too fast
      opacity.value = withDelay(
        800, 
        withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) }, (finished) => {
          if (finished) {
            runOnJS(setIsAnimationComplete)(true);
          }
        })
      );
      
      scale.value = withDelay(
        800,
        withTiming(1.5, { duration: 600, easing: Easing.out(Easing.ease) })
      );
    }
  }, [isAppReady]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  if (isAnimationComplete) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Decorative Background Elements */}
      <Animated.View style={[styles.glowRing, { width: width * 1.5, height: width * 1.5, borderRadius: width }]} />
      
      <Animated.View style={[styles.iconContainer, iconStyle]}>
        <Ionicons name="flash" size={64} color={Colors.white} />
      </Animated.View>
      
      <Animated.Text style={[styles.title, textStyle]}>
        FitForge
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, textStyle]}>
        Calibrating your engine...
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.lime, // Deep forest teal background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Ensure it stays on top of the app
  },
  glowRing: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  title: {
    ...Typography.hero,
    color: Colors.white,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.h4,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
});
