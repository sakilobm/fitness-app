import React, { createContext, useContext, useState } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFitnessStore } from '@/store/fitnessStore';
import { useThemeStore } from '@/store/themeStore';
import { ThemeColors, getColors } from '@/theme/tokens';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const { width: W, height: H } = Dimensions.get('window');

// Create ThemeContext with default null value to detect context loss
const ThemeContext = createContext<{
  colors: ThemeColors;
  isDark: boolean;
  setIsDarkMode: (value: boolean) => void;
} | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setIsDarkModeRaw = useThemeStore((state) => state.setIsDarkMode);
  const colors = getColors(isDarkMode);

  // Transition overlay states
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetDark, setTargetDark] = useState(isDarkMode);
  
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.3);
  const rotation = useSharedValue(0);

  const applyThemeChange = (val: boolean) => {
    setIsDarkModeRaw(val);
    // Background sync to fitnessStore for compatibility
    useFitnessStore.getState().setIsDarkMode(val);
    
    // Scale and spin transition icon
    scale.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.back(1.5)) });
    rotation.value = withTiming(360, { duration: 400, easing: Easing.out(Easing.cubic) }, () => {
      // Fade out the overlay
      opacity.value = withDelay(150, withTiming(0, { duration: 250 }, () => {
        scheduleOnRN(setIsTransitioning, false);
      }));
    });
  };

  const setIsDarkMode = (val: boolean) => {
    if (isTransitioning || val === isDarkMode) return;
    
    setTargetDark(val);
    setIsTransitioning(true);
    
    // Initialize animation values
    opacity.value = 0;
    scale.value = 0.3;
    rotation.value = 0;

    // 1. Fade in overlay mask quickly
    opacity.value = withTiming(0.96, { duration: 120 }, () => {
      // 2. Perform the state update and icon animation
      scheduleOnRN(applyThemeChange, val);
    });
  };

  // Animated styles for overlay and icon
  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  // Determine transition background colors dynamically
  const transitionBg = targetDark ? '#0D0F0E' : '#EDEBE5';
  const iconColor = targetDark ? '#34D399' : '#2E7D5E';
  const textColor = targetDark ? '#F0F0F8' : '#1C1C1E';

  return (
    <ThemeContext.Provider value={{ colors, isDark: isDarkMode, setIsDarkMode }}>
      {/* Dynamic Status Bar driven by the theme token */}
      <StatusBar style={colors.statusBar === 'dark-content' ? 'dark' : 'light'} />
      
      <View style={{ flex: 1 }}>
        {children}

        {/* Premium transition overlay portal */}
        {isTransitioning && (
          <Animated.View 
            pointerEvents="none" 
            style={[
              styles.overlay, 
              { backgroundColor: transitionBg }, 
              overlayAnimStyle
            ]}
          >
            <View style={styles.centerBlock}>
              <Animated.View style={[styles.iconBox, iconAnimStyle]}>
                <Ionicons 
                  name={targetDark ? 'moon' : 'sunny'} 
                  size={52} 
                  color={iconColor} 
                />
              </Animated.View>
              <Animated.Text style={[styles.labelText, { color: textColor }, overlayAnimStyle]}>
                {targetDark ? 'Entering Dark Mode' : 'Entering Light Mode'}
              </Animated.Text>
            </View>
          </Animated.View>
        )}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setIsDarkMode = useThemeStore((state) => state.setIsDarkMode);

  // If context is available and matches the store, use it.
  // Otherwise, fall back to the store directly (handles React Native Modal context loss)
  if (context && context.isDark === isDarkMode) {
    return context;
  }

  const colors = getColors(isDarkMode);
  return { colors, isDark: isDarkMode, setIsDarkMode };
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 8,
  },
});
