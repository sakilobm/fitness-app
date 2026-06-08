import React, { useRef, useEffect } from 'react';
import { Animated, Keyboard, Platform, StyleProp, ViewStyle } from 'react-native';

interface Props {
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export default function KeyboardSlideView({ style, children }: Props) {
  const slideY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS === 'ios') return;
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      Animated.timing(slideY, {
        toValue: -e.endCoordinates.height,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(slideY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
    return () => { show.remove(); hide.remove(); };
  }, []);

  return (
    <Animated.View style={[style, Platform.OS === 'android' && { transform: [{ translateY: slideY }] }]}>
      {children}
    </Animated.View>
  );
}
